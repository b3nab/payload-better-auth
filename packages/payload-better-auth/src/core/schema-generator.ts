import type {
  BetterAuthDBSchema,
  DBFieldAttribute,
  DBFieldType,
} from 'better-auth/db'
import type {
  CollectionConfig,
  CollectionSlug,
  Field as PayloadField,
  FieldTypes as PayloadFieldTypes,
} from 'payload'
import deepmerge from '@fastify/deepmerge'
import type { BetterAuthPluginOptions } from '../types.js'
import { getLogger } from '../singleton.logger.js'
import { isAdmin, isUser } from './access.js'
import { buildCascadeBeforeDelete } from './cascade-delete.js'
import { createBetterAuthStrategy } from '../strategy/better-auth.strategy.js'
import type { BetterAuthOptions } from 'better-auth/minimal'
import { payloadBetterAuthEndpoints } from '../endpoints/endpoints.payload-better-auth.js'

export const generatePayloadCollections = (
  authOptions: BetterAuthOptions,
  authTables: BetterAuthDBSchema,
  extendsCollections?: BetterAuthPluginOptions['extendsCollections'],
): CollectionConfig[] => {
  const collections: CollectionConfig[] = []

  const betterAuthStrategy = createBetterAuthStrategy()

  for (const [key, value] of Object.entries(authTables)) {
    const modelName = value.modelName as CollectionSlug
    let newCollection: CollectionConfig = {
      admin: {
        group: 'Better Auth',
      },
      // access: {
      //   create: isAdmin,
      //   read: isAdmin,
      //   update: isAdmin,
      //   delete: isAdmin,
      //   readVersions: isAdmin,
      // },
      slug: modelName,
      fields: convertToPayloadFields(modelName, value.fields, authTables),
    }
    if (key === 'user') {
      newCollection.auth = true
      newCollection.access = {
        ...newCollection.access,
        admin: isAdmin,
        unlock: isAdmin,
      }
      // Add 2FA UI field to user collection if twoFactor plugin is enabled
      const twoFactorEnabled = authOptions.plugins?.some(
        (p) => p.id === 'two-factor',
      )
      if (twoFactorEnabled) {
        newCollection.fields = [
          {
            name: 'twoFactorButton',
            type: 'ui',
            admin: {
              components: {
                Field:
                  '@b3nab/payload-better-auth/client#TwoFactorAccountButton',
              },
              position: 'sidebar',
            },
          },
          ...newCollection.fields,
        ]
      }
    }
    if (extendsCollections?.[modelName]) {
      newCollection = deepmerge()(newCollection, extendsCollections[modelName])
    }
    // payload hardcodes ON DELETE SET NULL on relationship columns: the
    // schema's references.onDelete semantics live in this hook instead.
    // Attached after the extendsCollections merge, preserving every hook the
    // consumer declared: theirs run first, the cascade runs last
    const cascadeBeforeDelete = buildCascadeBeforeDelete(authTables, key)
    if (cascadeBeforeDelete) {
      newCollection.hooks = {
        ...newCollection.hooks,
        beforeDelete: [
          ...(newCollection.hooks?.beforeDelete ?? []),
          cascadeBeforeDelete,
        ],
      }
    }
    if (newCollection.auth) {
      newCollection.auth = {
        // disableLocalStrategy: true,
        strategies: [
          betterAuthStrategy,
          ...(typeof newCollection.auth === 'object' &&
          newCollection.auth?.strategies
            ? newCollection.auth.strategies
            : []),
        ],
      }
      newCollection.fields = [
        ...newCollection.fields,
        {
          name: 'password',
          type: 'text',
          required: false,
          hidden: true,
        },
      ]
      newCollection.endpoints = payloadBetterAuthEndpoints
    }
    collections.push(newCollection)
  }

  // getLogger().trace(collections, 'output from generatePayloadCollections')

  return collections
}

/**
 * Convert the fields from the BetterAuth table.fields to the payload collection.fields
 * @param fields - The fields from the authTables
 * @returns The fields in payload format
 */
const convertToPayloadFields = (
  modelName: string,
  fields: Record<string, DBFieldAttribute<DBFieldType>>,
  authTables: BetterAuthDBSchema,
): PayloadField[] => {
  return Object.entries(fields)
    .filter(
      ([fieldKey]) => !['email', 'createdAt', 'updatedAt'].includes(fieldKey),
    )
    .map(
      ([fieldKey, fieldValue]) =>
        ({
          name: fieldKey,
          required: fieldValue.required,
          // access: {
          //   create: ({ req: { user } }) => false,
          //   read: ({ req: { user }, id }) => user?.id === id,
          //   update: ({ req: { user }, id }) => user?.id === id,
          // },
          // returned defaults to true: only an explicit false (secrets like
          // twoFactor.secret) must leave payload responses and the admin UI
          hidden: fieldValue.returned === false,
          // input defaults to true: an explicit false marks a system-owned
          // value (never user-provided). Field access blocks every payload
          // write surface; the adapter is immune (Local API overrideAccess).
          // admin.readOnly would not do: it has no effect on the API
          ...(fieldValue.input === false
            ? { access: { create: () => false, update: () => false } }
            : {}),
          defaultValue: fieldValue.defaultValue,
          unique: fieldValue.unique,
          // sortable is a storage hint (varchar vs text) payload does not
          // need; the index attribute is the real one since better-auth 1.6
          index: fieldValue.index,
          // type: convertToPayloadType(fieldValue.type),
          ...convertToPayloadType(modelName, fieldValue, fieldKey, authTables),
        }) as PayloadField,
    )
}

// BETTER AUTH DBFieldType
// "string" | "number" | "boolean" | "date" | `${"string" | "number"}[]`
// PAYLOAD FieldTypes
// "text" | "number" | "checkbox" | "date" | "array"
function convertToPayloadType(
  modelName: string,
  { type: fieldType, references }: DBFieldAttribute<DBFieldType>,
  fieldKey: string,
  authTables: BetterAuthDBSchema,
): Partial<PayloadField> {
  const defaultType: Partial<PayloadField> = {
    type: 'text',
  }
  const internalFieldMap: Record<string, Partial<PayloadField>> = {
    'number[]': {
      type: 'number',
      hasMany: true,
    },
    'string[]': {
      type: 'text',
      hasMany: true,
    },
    string: {
      type: 'text',
    },
    number: {
      type: 'number',
    },
    boolean: {
      type: 'checkbox',
    },
    date: {
      type: 'date',
    },
    json: {
      type: 'json',
    },
  }

  // Dynamic map better-auth DBFieldAttributeConfig . references
  if (references) {
    // getLogger().trace(
    //   references,
    //   `[convertToPayloadType] references for ${fieldKey} on ${modelName}`,
    // )
    // id references are payload's native relationship: the stored value IS
    // the target document id. references.model can be the default key OR
    // the renamed modelName (core reads options, plugin schemas hardcode
    // the default): the collection slug is always the target's modelName
    if (references.field === 'id') {
      const referencedTable = authTables[references.model]
      const relationTo =
        referencedTable?.modelName ??
        Object.values(authTables).find(
          (table) => table.modelName === references.model,
        )?.modelName ??
        references.model
      return {
        type: 'relationship',
        relationTo: relationTo as CollectionSlug,
      }
    }
    // references to any other field are a logical FK on a non-PK column,
    // which payload relationships cannot represent (id-only by
    // construction): the column stays a scalar of the field's own type —
    // the contract writes and reads the raw value — indexed because
    // references exist to be looked up. The declared onDelete semantics
    // run in the cascade-delete hook, the joins in the adapter
    return fieldType === 'number'
      ? { type: 'number', index: true }
      : { type: 'text', index: true }
  }

  // a literal list types ONE allowed value (InferDBValueType resolves
  // Array<LiteralString> to T[number]): payload's select enforces the same
  // domain on every write surface, admin included
  if (Array.isArray(fieldType)) {
    return { type: 'select', options: [...fieldType] }
  }

  return internalFieldMap[String(fieldType)] || defaultType
}
