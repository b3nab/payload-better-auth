import type { Payload } from 'payload'
import type { Where } from 'better-auth'
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

    adapter: ({ options, schema, debugLog }) => {
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
        return schema[model]?.modelName || model
      }

      return {
        async count({ model, where }) {
          // debugLog('count', { model, where })
          // logger.trace({ model, where }, '[payloadAdapter] count')
          // console.log('count', { model, where })

          const payload = await resolvePayload()

          try {
            const { totalDocs } = await payload.count({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
              depth: 0
            })

            return totalDocs || 0
          } catch (error) {
            throw new BetterAuthError(
              `Failed to count records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async create({ model, data, select }) {
          // debugLog('create', { model, data, select })
          // logger.trace({ model, data, select }, '[payloadAdapter] create')
          // console.log('create', { model, data, select })

          const payload = await resolvePayload()

          if(model === "user") {
            data = {...data, password: generateRandomString(32)}
          }

          try {
            const result = await payload.create({
              collection: getCollectionName(model),
              data,
              depth: 0
            })

            return result as any
          } catch (error) {
            throw new BetterAuthError(
              `Failed to create record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findOne({ model, where, select }) {
          // debugLog('findOne', { model, where, select })
          // logger.trace({ model, where, select }, '[payloadAdapter] findOne')
          // console.log('findOne', { model, where, select })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
              limit: 1,
              depth: 0
            })

            return (docs[0] as any) || null
          } catch (error) {
            throw new BetterAuthError(
              `Failed to find record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async findMany({ model, where, limit, offset, sortBy }) {
          // debugLog('findMany', { model, where, limit, offset, sortBy })
          // logger.trace(
          //   { model, where, limit, offset, sortBy },
          //   '[payloadAdapter] findMany',
          // )
          // console.log('findMany', { model, where, limit, offset, sortBy })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
              limit: limit || 100,
              // skip: offset || 0,
              sort: sortBy
                ? `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`
                : undefined,
                depth: 0
            })

            return docs as any[]
          } catch (error) {
            throw new BetterAuthError(
              `Failed to find records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async update({ model, where, update }) {
          // debugLog('update', { model, where, update })
          // logger.trace({ model, where, update }, '[payloadAdapter] update')
          // console.log('update', { model, where, update })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
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

            return result as any
          } catch (error) {
            throw new BetterAuthError(
              `Failed to update record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async updateMany({ model, where, update }) {
          // debugLog('updateMany', { model, where, update })
          // logger.trace({ model, where, update }, '[payloadAdapter] updateMany')
          // console.log('updateMany', { model, where, update })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
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
            throw new BetterAuthError(
              `Failed to update records in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async delete({ model, where }) {
          // debugLog('delete', { model, where })
          // logger.trace({ model, where }, '[payloadAdapter] delete')
          // console.log('delete', { model, where })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
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
            throw new BetterAuthError(
              `Failed to delete record in ${model}: ${(error as Error).message}`,
            )
          }
        },

        async deleteMany({ model, where }) {
          // debugLog('deleteMany', { model, where })
          // logger.trace({ model, where }, '[payloadAdapter] deleteMany')
          // console.log('deleteMany', { model, where })

          const payload = await resolvePayload()

          try {
            const { docs } = await payload.find({
              collection: getCollectionName(model),
              where: where ? buildWhereClause(where) : {},
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
            throw new BetterAuthError(
              `Failed to delete records in ${model}: ${(error as Error).message}`,
            )
          }
        },
      }
    },
  })

  function buildWhereClause(where: Where[]) {
    if (where.length === 1) {
      const w = where[0]
      if (!w) return {}

      return {
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: extractWhereValue(w) }
            : { [w.operator]: extractWhereValue(w) },
      }
    }

    const and = where.filter((w) => w.connector === 'AND' || !w.connector)
    const or = where.filter((w) => w.connector === 'OR')

    return {
      and: and.map((w) => ({
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: extractWhereValue(w) }
            : { [w.operator]: extractWhereValue(w) },
      })),
      or: or.map((w) => ({
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: extractWhereValue(w) }
            : { [w.operator]: extractWhereValue(w) },
      })),
    }
  }

  function extractWhereValue(where: Where): Where['value'] {
    if (typeof where.value === 'object') {
      // @ts-ignore
      return where.value?.[where.field]
    }
    return where.value
  }
}


const random = {
  read(bytes: Uint8Array) {
    crypto.getRandomValues(bytes);
  }
};

export function generateRandomString(
	length: number
): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	let result = "";
	for (let i = 0; i < length; i++) {
		result += alphabet[generateRandomIntegerNumber(alphabet.length)];
	}
	return result;
}

export function bigIntFromBytes(bytes: Uint8Array): bigint {
	if (bytes.byteLength < 1) {
		throw new TypeError("Empty Uint8Array");
	}
	let decoded = 0n;
	for (let i = 0; i < bytes.byteLength; i++) {
		decoded += BigInt(bytes[i]) << BigInt((bytes.byteLength - 1 - i) * 8);
	}
	return decoded;
}


export function generateRandomInteger(max: bigint): bigint {
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

export function generateRandomIntegerNumber(max: number): number {
	if (max < 2 || max > Number.MAX_SAFE_INTEGER) {
		throw new Error("Argument 'max' must be a positive integer larger than 1");
	}
	return Number(generateRandomInteger(BigInt(max)));
}
