import type { CollectionBeforeDeleteHook, CollectionSlug, Where } from 'payload'
import { APIError } from 'payload'
import type { BetterAuthDBSchema } from 'better-auth/db'

type OnDeleteAction = NonNullable<
  NonNullable<
    BetterAuthDBSchema[string]['fields'][string]['references']
  >['onDelete']
>

type IncomingReference = {
  /** payload collection slug of the dependent model (its modelName) */
  collection: CollectionSlug
  /** payload field name on the dependent (the generator names fields by their schema key) */
  field: string
  /** field on the referenced model whose value the dependent stores */
  referencedField: string
  onDelete: OnDeleteAction
  defaultValue?: unknown
}

/**
 * Payload hardcodes ON DELETE SET NULL on every relationship column
 * (@payloadcms/drizzle traverseFields), so the semantics declared by the
 * better-auth schema (`references.onDelete`) must be applied before the
 * delete reaches the database: on a NOT NULL column the hardcoded SET NULL
 * makes the parent delete fail outright.
 *
 * Returns a beforeDelete hook for the collection generated from `modelKey`,
 * or null when nothing in the schema references that model. Cascades are
 * transitive: payload.delete on dependents runs their own hooks.
 */
export const buildCascadeBeforeDelete = (
  authTables: BetterAuthDBSchema,
  modelKey: string,
): CollectionBeforeDeleteHook | null => {
  const referenced = authTables[modelKey]
  if (!referenced) {
    return null
  }

  const incoming: IncomingReference[] = []
  for (const table of Object.values(authTables)) {
    for (const [fieldKey, field] of Object.entries(table.fields)) {
      // schemas can point at either the default key or the renamed modelName
      // (core declares `model: options.user?.modelName || 'user'`)
      const target = field.references?.model
      if (target !== modelKey && target !== referenced.modelName) {
        continue
      }
      incoming.push({
        collection: table.modelName as CollectionSlug,
        field: fieldKey,
        referencedField: field.references?.field ?? 'id',
        // better-auth's own migration builder defaults to cascade
        // (get-migration.mjs: `.onDelete(references.onDelete || "cascade")`)
        onDelete: field.references?.onDelete ?? 'cascade',
        defaultValue: field.defaultValue,
      })
    }
  }

  if (incoming.length === 0) {
    return null
  }

  // blockers first: a restrict must fail the delete before any dependent is
  // touched (the shared req rolls mutations back anyway, but failing first
  // avoids the wasted work)
  const blocking: OnDeleteAction[] = ['restrict', 'no action']
  incoming.sort(
    (a, b) =>
      Number(blocking.includes(b.onDelete)) -
      Number(blocking.includes(a.onDelete)),
  )

  const collection = referenced.modelName as CollectionSlug
  const referencedFields = [
    ...new Set(
      incoming
        .filter((ref) => ref.referencedField !== 'id')
        .map((ref) => ref.referencedField),
    ),
  ]

  return async ({ id, req }) => {
    const { payload } = req

    // dependents can reference a non-id field (e.g. an email): read the
    // value from the document being deleted, fetching those fields only
    const doc =
      referencedFields.length > 0
        ? await payload.findByID({
            collection,
            id,
            select: Object.fromEntries(
              referencedFields.map((field) => [field, true as const]),
            ),
            req,
            depth: 0,
          })
        : null

    for (const ref of incoming) {
      const value =
        ref.referencedField === 'id' ? id : doc?.[ref.referencedField]
      if (value === undefined || value === null) {
        continue
      }
      const where: Where = { [ref.field]: { equals: value } }

      switch (ref.onDelete) {
        case 'cascade':
          await payload.delete({
            collection: ref.collection,
            where,
            req,
            depth: 0,
          })
          break
        case 'set null':
          await payload.update({
            collection: ref.collection,
            where,
            data: { [ref.field]: null },
            req,
            depth: 0,
          })
          break
        case 'set default': {
          const fallback =
            typeof ref.defaultValue === 'function'
              ? ref.defaultValue()
              : ref.defaultValue
          await payload.update({
            collection: ref.collection,
            where,
            data: { [ref.field]: fallback ?? null },
            req,
            depth: 0,
          })
          break
        }
        case 'restrict':
        case 'no action': {
          const { totalDocs } = await payload.count({
            collection: ref.collection,
            where,
            req,
          })
          if (totalDocs > 0) {
            throw new APIError(
              `Cannot delete ${collection} ${id}: referenced by ${totalDocs} ${ref.collection} record(s) (onDelete: ${ref.onDelete})`,
              400,
            )
          }
          break
        }
      }
    }
  }
}
