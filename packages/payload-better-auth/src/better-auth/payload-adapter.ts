import type { Payload } from 'payload'
import type { BetterAuthOptions, Where } from 'better-auth'
import { createAdapter, type AdapterDebugLogs } from 'better-auth/adapters'
import { BetterAuthError } from 'better-auth'
import { getPayload } from '../singleton.payload.js'
import { getLogger } from '../singleton.logger.js'

interface PayloadAdapterConfig {
  payload?: Payload
  debugLogs?: AdapterDebugLogs
}

export const payloadAdapter = (config: PayloadAdapterConfig = {}) => {
  const logger = getLogger()
  logger.trace('payloadAdapter')
  // console.log(`- payloadAdapter WRAPPER`)
  return createAdapter({
    config: {
      adapterId: 'payloadcms',
      adapterName: 'Payload CMS',
      supportsJSON: true, // Payload supports JSON fields
      supportsDates: true, // Payload handles dates natively
      supportsBooleans: true, // Payload supports boolean fields
      supportsNumericIds: false, // Payload uses string IDs by default
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
    },

    adapter: ({
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
        }: { model: string; field: string }) => {
          // Plugin `schema`s can't define their own `id`. Better-auth auto provides `id` to every schema model.
          // Given this, we can't just check if the `field` (that being `id`) is within the schema's fields, since it is never defined.
          // So we check if the `field` is `id` and if so, we return `id` itself. Otherwise, we return the `field` from the schema.
          if (field === "id") {
            return field;
          }
          const model = getDefaultModelName(unsafe_model); // Just to make sure the model name is correct.

          let f = schema[model]?.fields[field];
          // console.log(`[getOriginalFieldName] model: ${model}, field: ${field} => ${f?.fieldName} -- getFieldName: ${getFieldName({ model, field })} -- getDefaultFieldName: ${getDefaultFieldName({ model, field })}`)
          if (!f) {
            // console.log(`Field ${field} not found in model ${model}`);
            // console.log(`Schema:`, schema);
            // console.log(`schema[${model}]?.fields:`, schema[model]?.fields)
            // console.log("return: ", Object.keys(schema[model]?.fields).find((key) => schema[model]?.fields[key].fieldName === field))
            // Need to pull in the key value from the user options.
            return Object.keys(schema[model]?.fields).find((key) => schema[model]?.fields[key].fieldName === field) || field
          }
          return field;
        }

      const getConvertedFieldName = ({ model, field }: { model: string; field: string }) => {
        if (field === "id") {
          return field
        }
        return schema[model]?.fields[field]?.fieldName || field
      }


      const resolvePayload = async () => {
        const payload = config.payload || getPayload()
        if (!payload) {
          throw new Error(
            '[payloadAdapter - resolvePayload] Payload is not initialized',
          )
        }
        return payload
      }

      function getCollectionName(model: string) {
        // console.log(`[getCollectionName] model: ${model} => ${getDefaultModelName(model)}`)
        return getDefaultModelName(model)
      }
      // Helper to get the actual field name for Payload
      const getPayloadFieldName = (model: string) => (field: string) => {
        // console.log(`[getPayloadFieldName] model: ${model}, field: ${field} => ${getDefaultFieldName({ model, field })}`)
        return getOriginalFieldName({ model, field })
      }

      // function to transform data object from better-auth to payload
      const transformDataToPayload = (model: string, data: Record<string, any>) => {
        return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [getOriginalFieldName({ model, field: key }), value]))
      }
      // function to transform data object from payload to better-auth
      const transformDataToBetterAuth = (model: string, data: Record<string, any>) => {
        return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [getConvertedFieldName({ model, field: key }), value]))
      }

      return {
        async count({ model, where }) {
          const payload = await resolvePayload()

          try {
            const { totalDocs } = await payload.count({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              depth: 0
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
          if(model === "user") {
            data = {...data, password: generateRandomString(32)}
          }


          try {
             const result = await payload.create({
              collection: getCollectionName(model),
              data,
              depth: 0
            })

            return transformDataToBetterAuth(model, result) as any
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to create record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findOne({ model, where, select }) {
          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              limit: 1,
              depth: 0
            })

            return docs[0] ? transformDataToBetterAuth(model, docs[0]) as any : null
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to find record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findMany({ model, where, limit, offset, sortBy }) {
          offset = offset ? offset : 0
          limit = limit ? limit : 0
          const payload = await resolvePayload()

          try {
            const whereClause = where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {}

            // For offset, we need to fetch more records and manually slice
            const actualLimit = limit + offset

            const { docs: payloadDocs } = await payload.find({
              collection: getCollectionName(model),
              where: whereClause,
              limit: actualLimit ? actualLimit : undefined,
              sort: sortBy
                ? `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`
                : undefined,
              depth: 0
            })

            const docs = payloadDocs.map((doc) => transformDataToBetterAuth(model, doc))

            return offset ? docs.slice(offset, actualLimit) as any[] : docs as any[]
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
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              limit: 1,
              depth: 0
            })

            if (!docs.length) {
              throw new BetterAuthError(`Record not found in ${model}`)
            }

            const result = await payload.update({
              collection: getCollectionName(model),
              id: docs[0].id,
              data: update as any,
              depth: 0
            })

            return transformDataToBetterAuth(model, result) as any
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
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              depth: 0
            })

            await Promise.all(
              docs.map((doc) =>
                payload.update({
                  collection: getCollectionName(model),
                  id: doc.id,
                  data: update as any,
                  depth: 0
                }),
              ),
            )

            return docs.length
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
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              limit: 1,
              depth: 0
            })

            if (docs.length) {
              await payload.delete({
                collection: getCollectionName(model),
                id: docs[0].id,
                depth: 0
              })
            }
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
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where, model, getPayloadFieldName(model)) : {},
              depth: 0
            })

            await Promise.all(
              docs.map((doc) =>
                payload.delete({
                  collection: getCollectionName(model),
                  id: doc.id,
                  depth: 0
                }),
              ),
            )

            return docs.length
          } catch (error) {
            console.error(error)
            throw new BetterAuthError(
              `Failed to delete records in ${model}: ${(error as Error).message}`,
            )
          }
        },
      }
    },
  })

  function buildWhereClause(
    where: Where[],
    model: string,
    getPayloadFieldName: (field: string) => string
  ) {
    function mapOperator(w: Where) {
      const value = w.value

      switch (w.operator) {
        case 'eq':
        case undefined:
          return { equals: value }
        case 'ne':
          return { not_equals: value }
        case 'in':
          return { in: value }
        case 'not_in':
          return { not_in: value }
        case 'starts_with':
          // Payload CMS wildcard pattern for starts with
          return { like: `${value}%` }
        case 'ends_with':
          // Payload CMS wildcard pattern for ends with
          return { like: `%${value}` }
        case 'contains':
          return { contains: value }
        case 'gt':
          return { greater_than: value }
        case 'gte':
          return { greater_than_equal: value }
        case 'lt':
          return { less_than: value }
        case 'lte':
          return { less_than_equal: value }
        default:
          // Fallback for any unmapped operators
          return { [w.operator]: value }
      }
    }

    // Simple case - single condition
    if (where.length === 1) {
      const w = where[0]
      if (!w) return {}
      return { [getPayloadFieldName(w.field)]: mapOperator(w) }
    }

    // Group conditions by connector
    const andConditions = where.filter((w) => w.connector === 'AND' || !w.connector)
    const orConditions = where.filter((w) => w.connector === 'OR')

    // Simple AND conditions only - no wrapper needed
    if (orConditions.length === 0 && andConditions.length > 1) {
      const conditions: Record<string, any> = {}
      andConditions.forEach((w) => {
        conditions[getPayloadFieldName(w.field)] = mapOperator(w)
      })
      return conditions
    }

    // Simple OR conditions only
    if (andConditions.length === 0 && orConditions.length > 0) {
      return {
        or: orConditions.map((w) => ({
          [getPayloadFieldName(w.field)]: mapOperator(w)
        }))
      }
    }

    // Mixed AND/OR conditions
    if (andConditions.length > 0 && orConditions.length > 0) {
      return {
        and: [
          ...andConditions.map((w) => ({ [getPayloadFieldName(w.field)]: mapOperator(w) })),
          {
            or: orConditions.map((w) => ({ [getPayloadFieldName(w.field)]: mapOperator(w) }))
          }
        ]
      }
    }

    // Fallback - shouldn't reach here
    return {}
  }
}


const random = {
  read(bytes: Uint8Array) {
    crypto.getRandomValues(bytes);
  }
};

function generateRandomString(
	length: number
): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let result = "";
	for (let i = 0; i < length; i++) {
		result += alphabet[generateRandomIntegerNumber(alphabet.length)];
	}
	return result;
}

 function bigIntFromBytes(bytes: Uint8Array): bigint {
	if (bytes.byteLength < 1) {
		throw new TypeError("Empty Uint8Array");
	}
	let decoded = 0n;
	for (let i = 0; i < bytes.byteLength; i++) {
		decoded += BigInt(bytes[i]) << BigInt((bytes.byteLength - 1 - i) * 8);
	}
	return decoded;
}


function generateRandomInteger(max: bigint): bigint {
	if (max < 2) {
		throw new Error("Argument 'max' must be a positive integer larger than 1");
	}
	const inclusiveMaxBitLength = (max - 1n).toString(2).length;
	const shift = inclusiveMaxBitLength % 8;
	const bytes = new Uint8Array(Math.ceil(inclusiveMaxBitLength / 8));

	try {
		random.read(bytes);
	} catch (e) {
		throw new Error("Failed to retrieve random bytes", {
			cause: e
		});
	}

	// This zeroes bits that can be ignored to increase the chance `result` < `max`.
	// For example, if `max` can be represented with 10 bits, the leading 6 bits of the random 16 bits (2 bytes) can be ignored.
	if (shift !== 0) {
		bytes[0] &= (1 << shift) - 1;
	}
	let result = bigIntFromBytes(bytes);
	while (result >= max) {
		try {
			random.read(bytes);
		} catch (e) {
			throw new Error("Failed to retrieve random bytes", {
				cause: e
			});
		}
		if (shift !== 0) {
			bytes[0] &= (1 << shift) - 1;
		}
		result = bigIntFromBytes(bytes);
	}
	return result;
}

function generateRandomIntegerNumber(max: number): number {
	if (max < 2 || max > Number.MAX_SAFE_INTEGER) {
		throw new Error("Argument 'max' must be a positive integer larger than 1");
	}
	return Number(generateRandomInteger(BigInt(max)));
}
