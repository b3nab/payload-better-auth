import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
  type Where as PayloadWhere,
} from 'payload'
import type { BetterAuthOptions, Where } from 'better-auth'
import {
  createAdapterFactory,
  type DBAdapterDebugLogOption,
} from 'better-auth/adapters'
import { BetterAuthError } from 'better-auth'
import { getLogger } from '../singleton.logger.js'

interface IdCapabilities {
  /** the database generates auto-increment numeric ids (e.g. postgres idType 'serial') */
  numeric: boolean
  /** the database generates UUIDs itself (e.g. postgres idType 'uuid'/'uuidv7') */
  uuid: boolean
}

interface PayloadAdapterConfig {
  payload: Payload
  debugLogs?: DBAdapterDebugLogOption
}

const deriveIdCapabilities = (payload: Payload): IdCapabilities => {
  // `idType` is adapter-specific (db-postgres); probed structurally because
  // the db adapter packages are not dependencies of this package
  const idType: unknown = Reflect.get(payload.db, 'idType')
  return {
    numeric: payload.db.defaultIDType === 'number',
    uuid: idType === 'uuid' || idType === 'uuidv7',
  }
}

export const payloadAdapter = (config: PayloadAdapterConfig) => {
  const logger = getLogger()
  logger.trace('payloadAdapter')
  // console.log(`- payloadAdapter WRAPPER`)
  const idCapabilities = deriveIdCapabilities(config.payload)
  const factoryConfig = {
    adapterId: 'payloadcms',
    adapterName: 'PayloadCMS',
    supportsJSON: true, // Payload supports JSON fields
    supportsDates: false, // PayloadCMS returns an ISO string
    supportsBooleans: true, // Payload supports boolean fields
    supportsArrays: true, // hasMany text/number fields store real arrays
    supportsNumericIds: idCapabilities.numeric,
    supportsUUIDs: idCapabilities.uuid,
    debugLogs: config.debugLogs ?? false,
    disableIdGeneration: true,
    // mapKeysTransformInput: (() => {
    //   return {
    //     _id: 'id', // We want to replace `_id` (from MongoDB) to `id` (for Better-Auth)
    //   }
    // })(),
    // mapKeysTransformOutput: (() => {
    //   return {
    //     _id: 'id', // We want to replace `_id` (from MongoDB) to `id` (for Better-Auth)
    //   }
    // })(),
  }

  // every payload call joins transactionReq when present: payload manages
  // the transaction natively through the req (initTransaction & co.)
  type AdapterBuilder = Parameters<typeof createAdapterFactory>[0]['adapter']
  const buildAdapter =
    (transactionReq?: PayloadRequest): AdapterBuilder =>
    ({
      options,
      schema,
      debugLog,
      getModelName,
      getFieldName,
      getDefaultModelName,
      getDefaultFieldName,
      getFieldAttributes,
    }) => {
      // OVERRIDES getDefaultFieldName
      const getOriginalFieldName = ({
        model: unsafe_model,
        field,
      }: {
        model: string
        field: string
      }) => {
        // Plugin `schema`s can't define their own `id`. Better-auth auto provides `id` to every schema model.
        // Given this, we can't just check if the `field` (that being `id`) is within the schema's fields, since it is never defined.
        // So we check if the `field` is `id` and if so, we return `id` itself. Otherwise, we return the `field` from the schema.
        if (field === 'id') {
          return field
        }
        const model = getDefaultModelName(unsafe_model) // Just to make sure the model name is correct.

        let f = schema[model]?.fields[field]
        // console.log(`[getOriginalFieldName] model: ${model}, field: ${field} => ${f?.fieldName} -- getFieldName: ${getFieldName({ model, field })} -- getDefaultFieldName: ${getDefaultFieldName({ model, field })}`)
        if (!f) {
          // console.log(`Field ${field} not found in model ${model}`);
          // console.log(`Schema:`, schema);
          // console.log(`schema[${model}]?.fields:`, schema[model]?.fields)
          // console.log("return: ", Object.keys(schema[model]?.fields).find((key) => schema[model]?.fields[key].fieldName === field))
          // Need to pull in the key value from the user options.
          return (
            Object.keys(schema[model]?.fields).find(
              (key) => schema[model]?.fields[key].fieldName === field,
            ) || field
          )
        }
        return field
      }

      const getConvertedFieldName = ({
        model,
        field,
      }: {
        model: string
        field: string
      }) => {
        if (field === 'id') {
          return field
        }
        return schema[model]?.fields[field]?.fieldName || field
      }

      // payload is bound at adapter creation (plugin onInit): no lazy lookup
      const resolvePayload = async () => config.payload

      function getCollectionName(model: string) {
        // the factory already resolved the actual model name (options
        // renames included), and the plugin generates collection slugs from
        // that same modelName: the two coincide by construction
        return model
      }
      // Helper to get the actual field name for Payload
      const getPayloadFieldName = (model: string) => (field: string) => {
        // console.log(`[getPayloadFieldName] model: ${model}, field: ${field} => ${getDefaultFieldName({ model, field })}`)
        return getOriginalFieldName({ model, field })
      }

      // function to transform data object from better-auth to payload
      const transformDataToPayload = (
        model: string,
        data: Record<string, any>,
      ) => {
        return Object.fromEntries(
          Object.entries(data ?? {}).map(([key, value]) => [
            getOriginalFieldName({ model, field: key }),
            value,
          ]),
        )
      }
      // function to transform data object from payload to better-auth
      const transformDataToBetterAuth = (
        model: string,
        data: Record<string, any>,
      ) => {
        return Object.fromEntries(
          Object.entries(data ?? {}).map(([key, value]) => [
            getConvertedFieldName({ model, field: key }),
            value,
          ]),
        )
      }

      // better-auth select lists the contract field names; payload wants a
      // map of its own field names (id always included for the transforms)
      const transformSelectToPayload = (model: string, select?: string[]) => {
        if (!select || select.length === 0) return undefined
        const resolve = getPayloadFieldName(model)
        const fields = new Set(['id', ...select.map(resolve)])
        return Object.fromEntries([...fields].map((f) => [f, true as const]))
      }

      // residual paths fetch full documents (the js evaluation needs every
      // field): the select trim happens here, on the transformed document
      const transformSelectToBetterAuth = (
        select: string[] | undefined,
        doc: Record<string, any>,
      ) => {
        if (!select || select.length === 0) return doc
        const keys = new Set(['id', ...select])
        return Object.fromEntries(
          Object.entries(doc).filter(([key]) => keys.has(key)),
        )
      }

      // the JoinConfig speaks better-auth (model names, contract fields):
      // resolve each entry into the payload find args to run — pure, the
      // queries themselves run in the methods
      const transformJoinToPayload = (
        model: string,
        join:
          | Record<
              string,
              {
                on: { from: string; to: string }
                limit?: number
                relation?: 'one-to-one' | 'one-to-many' | 'many-to-many'
              }
            >
          | undefined,
        docs: Record<string, any>[],
      ) => {
        if (!join || docs.length === 0) return []
        return Object.entries(join).map(([joinModel, config]) => {
          const fromField = getPayloadFieldName(model)(config.on.from)
          const toField = getPayloadFieldName(joinModel)(config.on.to)
          const keys = [
            ...new Set(
              docs
                .map((doc) => doc[fromField])
                .filter((value) => value !== null && value !== undefined),
            ),
          ]
          return {
            joinModel,
            fromField,
            toField,
            relation: config.relation ?? 'one-to-many',
            limit: config.limit,
            find: {
              collection: getCollectionName(joinModel),
              where: { [toField]: { in: keys } } as PayloadWhere,
              pagination: false as const,
              req: transactionReq,
              depth: 0,
            },
          }
        })
      }

      // joined rows come back payload-shaped: match them to their base doc,
      // shape them per relation (object|null for one-to-one, array
      // otherwise, limit applied per doc) and attach under the join model name
      const transformJoinToBetterAuth = (
        doc: Record<string, any>,
        joins: Array<
          ReturnType<typeof transformJoinToPayload>[number] & {
            rows: Record<string, any>[]
          }
        >,
      ) =>
        Object.fromEntries(
          joins.map(
            ({ joinModel, fromField, toField, relation, limit, rows }) => {
              const matches = rows.filter(
                (row) => row[toField] === doc[fromField],
              )
              if (relation === 'one-to-one') {
                const match = matches[0]
                return [
                  joinModel,
                  match ? transformDataToBetterAuth(joinModel, match) : null,
                ]
              }
              return [
                joinModel,
                matches
                  .slice(0, limit)
                  .map((row) => transformDataToBetterAuth(joinModel, row)),
              ]
            },
          ),
        )

      return {
        async count({ model, where }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )

            if (compiled.residual) {
              const { docs } = await payload.find({
                collection: getCollectionName(model),
                where: compiled.where,
                pagination: false,
                req: transactionReq,
                depth: 0,
              })
              return docs.filter((doc) =>
                evaluateWhereClause(
                  doc,
                  where ?? [],
                  getPayloadFieldName(model),
                ),
              ).length
            }

            const { totalDocs } = await payload.count({
              collection: getCollectionName(model),
              where: compiled.where,
              req: transactionReq,
            })

            return totalDocs || 0
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to count records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async create({ model, data, select }) {
          const payload = await resolvePayload()

          const normalizedData = transformDataToPayload(model, data)
          data = normalizedData as any
          // normalize data keys to be compatible with Payload CMS
          // model carries the renamed form: compare on the canonical one
          if (getDefaultModelName(model) === 'user') {
            data = { ...data, password: generateRandomString(32) }
          }

          try {
            const result = await payload.create({
              collection: getCollectionName(model),
              data,
              req: transactionReq,
              depth: 0,
            })

            return transformDataToBetterAuth(model, result) as any
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to create record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findOne({ model, where, select, join }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: compiled.where,
              // totalDocs is never used and its pagination COUNT would cost
              // a second db roundtrip on every find
              pagination: false,
              // with a residual, the first db row is not necessarily the
              // first contract match: fetch the whole prefiltered set
              ...(compiled.residual
                ? {}
                : {
                    limit: 1,
                    select: transformSelectToPayload(model, select),
                  }),
              req: transactionReq,
              depth: 0,
            })
            const doc = compiled.residual
              ? docs.find((d) =>
                  evaluateWhereClause(
                    d,
                    where ?? [],
                    getPayloadFieldName(model),
                  ),
                )
              : docs[0]

            if (!doc) {
              return null
            }

            const joins: Parameters<typeof transformJoinToBetterAuth>[1] = []
            for (const joinQuery of transformJoinToPayload(model, join, [
              doc,
            ])) {
              const { docs: rows } = await payload.find(joinQuery.find)
              joins.push({ ...joinQuery, rows })
            }

            return {
              ...transformSelectToBetterAuth(
                select,
                transformDataToBetterAuth(model, doc),
              ),
              ...transformJoinToBetterAuth(doc, joins),
            } as any
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to find record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findMany({ model, where, limit, offset, sortBy, select, join }) {
          offset = offset ? offset : 0
          limit = limit ? limit : 0
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )
            const sort = sortBy
              ? `${sortBy.direction === 'desc' ? '-' : ''}${getPayloadFieldName(model)(sortBy.field)}`
              : undefined

            if (compiled.residual) {
              // sort stays native (order survives the js filter);
              // offset/limit must apply after the contract filter
              const { docs } = await payload.find({
                collection: getCollectionName(model),
                where: compiled.where,
                pagination: false,
                sort,
                req: transactionReq,
                depth: 0,
              })
              const filtered = docs.filter((doc) =>
                evaluateWhereClause(
                  doc,
                  where ?? [],
                  getPayloadFieldName(model),
                ),
              )
              const pageDocs = filtered.slice(
                offset,
                limit ? offset + limit : undefined,
              )
              const joins: Parameters<typeof transformJoinToBetterAuth>[1] = []
              for (const joinQuery of transformJoinToPayload(
                model,
                join,
                pageDocs,
              )) {
                const { docs: rows } = await payload.find(joinQuery.find)
                joins.push({ ...joinQuery, rows })
              }
              return pageDocs.map((doc) => ({
                ...transformSelectToBetterAuth(
                  select,
                  transformDataToBetterAuth(model, doc),
                ),
                ...transformJoinToBetterAuth(doc, joins),
              })) as any[]
            }

            // For offset, we need to fetch more records and manually slice
            const actualLimit = limit + offset

            const { docs: payloadDocs } = await payload.find({
              collection: getCollectionName(model),
              where: compiled.where,
              limit: actualLimit ? actualLimit : undefined,
              // totalDocs is never used and its pagination COUNT would cost
              // a second db roundtrip on every find
              pagination: false,
              sort,
              select: transformSelectToPayload(model, select),
              req: transactionReq,
              depth: 0,
            })

            const pageDocs = offset
              ? payloadDocs.slice(offset, actualLimit)
              : payloadDocs
            const joins: Parameters<typeof transformJoinToBetterAuth>[1] = []
            for (const joinQuery of transformJoinToPayload(
              model,
              join,
              pageDocs,
            )) {
              const { docs: rows } = await payload.find(joinQuery.find)
              joins.push({ ...joinQuery, rows })
            }

            return pageDocs.map((doc) => ({
              ...transformDataToBetterAuth(model, doc),
              ...transformJoinToBetterAuth(doc, joins),
            })) as any[]
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to find records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async update({ model, where, update }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )

            if (compiled.residual) {
              const { docs } = await payload.find({
                collection: getCollectionName(model),
                where: compiled.where,
                pagination: false,
                req: transactionReq,
                depth: 0,
              })
              const doc = docs.find((d) =>
                evaluateWhereClause(d, where ?? [], getPayloadFieldName(model)),
              )
              // contract: an update matching no row returns null, not an error
              if (!doc) {
                return null
              }
              const result = await payload.update({
                collection: getCollectionName(model),
                id: doc.id,
                data: update as any,
                req: transactionReq,
                depth: 0,
              })
              return transformDataToBetterAuth(model, result) as any
            }

            // existence probe: count is the cheapest read (no rows, no
            // transform) and a miss must cost as little as possible
            const { totalDocs } = await payload.count({
              collection: getCollectionName(model),
              where: compiled.where,
              req: transactionReq,
            })
            // contract: an update matching no row returns null, not an error
            if (totalDocs === 0) {
              return null
            }

            // bulk by-where, like the reference adapters: no document fetch,
            // hooks run for every matched doc
            const { docs: updatedDocs } = await payload.update({
              collection: getCollectionName(model),
              where: compiled.where,
              data: update as any,
              req: transactionReq,
              depth: 0,
            })
            const result = updatedDocs[0]
            return result
              ? (transformDataToBetterAuth(model, result) as any)
              : null
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to update record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async updateMany({ model, where, update }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )

            if (!compiled.residual) {
              // payload.update supports a where clause natively
              const { docs } = await payload.update({
                collection: getCollectionName(model),
                where: compiled.where,
                data: update as any,
                req: transactionReq,
                depth: 0,
              })
              return docs.length
            }

            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: compiled.where,
              pagination: false,
              req: transactionReq,
              depth: 0,
            })
            const targets = docs.filter((doc) =>
              evaluateWhereClause(doc, where ?? [], getPayloadFieldName(model)),
            )
            if (targets.length === 0) {
              return 0
            }

            const updated = await payload.update({
              collection: getCollectionName(model),
              where: { id: { in: targets.map((doc) => doc.id) } },
              data: update as any,
              req: transactionReq,
              depth: 0,
            })

            return updated.docs.length
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to update records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async delete({ model, where }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )

            if (compiled.residual) {
              const { docs } = await payload.find({
                collection: getCollectionName(model),
                where: compiled.where,
                pagination: false,
                req: transactionReq,
                depth: 0,
              })
              const doc = docs.find((d) =>
                evaluateWhereClause(d, where ?? [], getPayloadFieldName(model)),
              )
              if (doc) {
                await payload.delete({
                  collection: getCollectionName(model),
                  id: doc.id,
                  req: transactionReq,
                  depth: 0,
                })
              }
              return
            }

            // existence probe: count is the cheapest read (no rows, no
            // transform) and a miss is the common case for repeated deletes
            const { totalDocs } = await payload.count({
              collection: getCollectionName(model),
              where: compiled.where,
              req: transactionReq,
            })
            if (totalDocs === 0) {
              return
            }

            // bulk by-where, like the reference adapters: no document fetch,
            // hooks (cascade included) run for every matched doc
            await payload.delete({
              collection: getCollectionName(model),
              where: compiled.where,
              req: transactionReq,
              depth: 0,
            })
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to delete record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async deleteMany({ model, where }) {
          const payload = await resolvePayload()

          try {
            const compiled = buildWhereClause(
              where,
              model,
              getPayloadFieldName(model),
            )

            if (!compiled.residual) {
              // payload.delete supports a where clause natively
              const { docs } = await payload.delete({
                collection: getCollectionName(model),
                where: compiled.where,
                req: transactionReq,
                depth: 0,
              })
              return docs.length
            }

            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: compiled.where,
              pagination: false,
              req: transactionReq,
              depth: 0,
            })
            const targets = docs.filter((doc) =>
              evaluateWhereClause(doc, where ?? [], getPayloadFieldName(model)),
            )
            if (targets.length === 0) {
              return 0
            }

            const deleted = await payload.delete({
              collection: getCollectionName(model),
              where: { id: { in: targets.map((doc) => doc.id) } },
              req: transactionReq,
              depth: 0,
            })

            return deleted.docs.length
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to delete records in ${model}: ${(error as Error).message}`,
            )
          }
        },
      }
    }

  let lazyOptions: BetterAuthOptions | null = null
  const factory = createAdapterFactory({
    config: {
      ...factoryConfig,
      // one implementation, correct on every instance: initTransaction
      // resolves support at runtime — on adapters without transactions the
      // req simply carries no transactionID and every call runs
      // untransacted, exactly like payload's own operations
      transaction: async (cb) => {
        const req = await createLocalReq({}, config.payload)
        await initTransaction(req)
        try {
          const transactionAdapter = createAdapterFactory({
            config: { ...factoryConfig, transaction: false },
            adapter: buildAdapter(req),
          })(lazyOptions ?? {})
          const result = await cb(transactionAdapter)
          await commitTransaction(req)
          return result
        } catch (error) {
          await killTransaction(req)
          throw error
        }
      },
    },
    adapter: buildAdapter(),
  })

  return (options: BetterAuthOptions) => {
    lazyOptions = options
    return factory(options)
  }

  // compile one better-auth clause into the closest payload condition.
  // Where.mode: 'sensitive' is the contract default; payload's DSL offers
  // exact sensitive operators and the ILIKE family (insensitive, always
  // %-wrapped, unanchored). `condition` undefined = clause not expressible
  // (omitted from the prefilter); `residual` = the prefilter is a superset
  // and evaluateWhereClause must confirm the matches.
  function mapOperator(
    w: Where,
    getPayloadFieldName: (field: string) => string,
  ): { condition?: PayloadWhere; residual: boolean } {
    const field = getPayloadFieldName(w.field)
    const value = w.value
    const insensitive = w.mode === 'insensitive'

    switch (w.operator) {
      case 'eq':
      case undefined:
        if (value === null) {
          return { condition: { [field]: { exists: false } }, residual: false }
        }
        // no exact insensitive equality in payload: `like` (substring,
        // case-insensitive) is the closest superset
        return insensitive
          ? { condition: { [field]: { like: value } }, residual: true }
          : { condition: { [field]: { equals: value } }, residual: false }
      case 'ne':
        if (value === null) {
          return { condition: { [field]: { exists: true } }, residual: false }
        }
        // not_like would also exclude superstring matches the contract keeps
        return insensitive
          ? { residual: true }
          : { condition: { [field]: { not_equals: value } }, residual: false }
      case 'gt':
        return {
          condition: { [field]: { greater_than: value } },
          residual: false,
        }
      case 'gte':
        return {
          condition: { [field]: { greater_than_equal: value } },
          residual: false,
        }
      case 'lt':
        return { condition: { [field]: { less_than: value } }, residual: false }
      case 'lte':
        return {
          condition: { [field]: { less_than_equal: value } },
          residual: false,
        }
      case 'in':
      case 'not_in':
        // list membership has no insensitive variant in payload's DSL
        return insensitive
          ? { residual: true }
          : { condition: { [field]: { [w.operator]: value } }, residual: false }
      case 'contains':
        // payload contains is case-insensitive: exact for insensitive mode,
        // a superset prefilter for the sensitive default
        return {
          condition: { [field]: { contains: value } },
          residual: !insensitive,
        }
      case 'starts_with':
      case 'ends_with':
        // payload like is unanchored word matching: superset prefilter,
        // the anchoring happens in evaluateWhereClause
        return { condition: { [field]: { like: value } }, residual: true }
      default:
        // Fallback for any unmapped operators: payload validates them
        return {
          condition: { [field]: { [w.operator]: value } },
          residual: false,
        }
    }
  }

  function buildWhereClause(
    where: Where[] | undefined,
    model: string,
    getPayloadFieldName: (field: string) => string,
  ): { where: PayloadWhere; residual: boolean } {
    if (!where || where.length === 0) {
      return { where: {}, residual: false }
    }
    const compiled = where.map((w) => ({
      connector: w.connector,
      ...mapOperator(w, getPayloadFieldName),
    }))
    let residual = compiled.some((c) => c.residual)

    const ands = compiled.filter((c) => c.connector !== 'OR')
    const ors = compiled.filter((c) => c.connector === 'OR')

    // omitting an AND clause only widens the prefilter
    const parts: PayloadWhere[] = []
    for (const c of ands) {
      if (c.condition) {
        parts.push(c.condition)
      }
    }

    if (ors.length > 0) {
      if (ors.every((c) => c.condition)) {
        parts.push({
          or: ors.flatMap((c) => (c.condition ? [c.condition] : [])),
        })
      } else {
        // dropping a single OR branch would narrow the result: the whole
        // group moves to the js evaluation
        residual = true
      }
    }

    const payloadWhere: PayloadWhere =
      parts.length === 0 ? {} : parts.length === 1 ? parts[0] : { and: parts }
    return { where: payloadWhere, residual }
  }

  // dates come back from payload as ISO strings: ISO order = time order
  function toComparable(v: unknown): unknown {
    return v instanceof Date ? v.toISOString() : v
  }

  /**
   * Source of truth for the where contract: applied in js on the
   * prefiltered documents whenever the payload query is a superset
   * (residual clauses, widened OR groups).
   */
  function evaluateWhereClause(
    doc: Record<string, unknown>,
    where: Where[],
    getPayloadFieldName: (field: string) => string,
  ): boolean {
    const matches = (w: Where): boolean => {
      const insensitive = w.mode === 'insensitive'
      const norm = (v: unknown): unknown => {
        const comparable = toComparable(v)
        return insensitive && typeof comparable === 'string'
          ? comparable.toLowerCase()
          : comparable
      }
      const raw = doc[getPayloadFieldName(w.field)]
      const value = w.value

      switch (w.operator) {
        case 'eq':
        case undefined:
          if (value === null) return raw === null || raw === undefined
          return norm(raw) === norm(value)
        case 'ne':
          if (value === null) return raw !== null && raw !== undefined
          return norm(raw) !== norm(value)
        case 'gt':
        case 'gte':
        case 'lt':
        case 'lte': {
          const a = toComparable(raw)
          const b = toComparable(value)
          if (typeof a === 'number' && typeof b === 'number') {
            return w.operator === 'gt'
              ? a > b
              : w.operator === 'gte'
                ? a >= b
                : w.operator === 'lt'
                  ? a < b
                  : a <= b
          }
          if (typeof a === 'string' && typeof b === 'string') {
            return w.operator === 'gt'
              ? a > b
              : w.operator === 'gte'
                ? a >= b
                : w.operator === 'lt'
                  ? a < b
                  : a <= b
          }
          return false
        }
        case 'in':
          return (
            Array.isArray(value) && value.some((v) => norm(v) === norm(raw))
          )
        case 'not_in':
          return (
            Array.isArray(value) && !value.some((v) => norm(v) === norm(raw))
          )
        case 'contains': {
          const a = norm(raw)
          const b = norm(value)
          return typeof a === 'string' && typeof b === 'string' && a.includes(b)
        }
        case 'starts_with': {
          const a = norm(raw)
          const b = norm(value)
          return (
            typeof a === 'string' && typeof b === 'string' && a.startsWith(b)
          )
        }
        case 'ends_with': {
          const a = norm(raw)
          const b = norm(value)
          return typeof a === 'string' && typeof b === 'string' && a.endsWith(b)
        }
        default:
          // unmapped operators were pushed to payload verbatim: the
          // database already enforced them on the prefiltered set
          return true
      }
    }

    const ands = where.filter((w) => w.connector !== 'OR')
    const ors = where.filter((w) => w.connector === 'OR')
    return ands.every(matches) && (ors.length === 0 || ors.some(matches))
  }
}

const random = {
  read(bytes: Uint8Array) {
    crypto.getRandomValues(bytes)
  },
}

function generateRandomString(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += alphabet[generateRandomIntegerNumber(alphabet.length)]
  }
  return result
}

function bigIntFromBytes(bytes: Uint8Array): bigint {
  if (bytes.byteLength < 1) {
    throw new TypeError('Empty Uint8Array')
  }
  let decoded = 0n
  for (let i = 0; i < bytes.byteLength; i++) {
    decoded += BigInt(bytes[i]) << BigInt((bytes.byteLength - 1 - i) * 8)
  }
  return decoded
}

function generateRandomInteger(max: bigint): bigint {
  if (max < 2) {
    throw new Error("Argument 'max' must be a positive integer larger than 1")
  }
  const inclusiveMaxBitLength = (max - 1n).toString(2).length
  const shift = inclusiveMaxBitLength % 8
  const bytes = new Uint8Array(Math.ceil(inclusiveMaxBitLength / 8))

  try {
    random.read(bytes)
  } catch (e) {
    throw new Error('Failed to retrieve random bytes', {
      cause: e,
    })
  }

  // This zeroes bits that can be ignored to increase the chance `result` < `max`.
  // For example, if `max` can be represented with 10 bits, the leading 6 bits of the random 16 bits (2 bytes) can be ignored.
  if (shift !== 0) {
    bytes[0] &= (1 << shift) - 1
  }
  let result = bigIntFromBytes(bytes)
  while (result >= max) {
    try {
      random.read(bytes)
    } catch (e) {
      throw new Error('Failed to retrieve random bytes', {
        cause: e,
      })
    }
    if (shift !== 0) {
      bytes[0] &= (1 << shift) - 1
    }
    result = bigIntFromBytes(bytes)
  }
  return result
}

function generateRandomIntegerNumber(max: number): number {
  if (max < 2 || max > Number.MAX_SAFE_INTEGER) {
    throw new Error("Argument 'max' must be a positive integer larger than 1")
  }
  return Number(generateRandomInteger(BigInt(max)))
}
