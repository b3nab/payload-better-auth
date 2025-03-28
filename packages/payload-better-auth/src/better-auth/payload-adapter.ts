import type { Payload } from 'payload'
import type {
  Adapter,
  AdapterInstance,
  BetterAuthOptions,
  Where,
} from 'better-auth'
import { generateId, BetterAuthError } from 'better-auth'
import { getAuthTables } from 'better-auth/db'
import { getPayload } from '../singleton.payload.js'
import { getLogger } from '../singleton.logger.js'

export interface PayloadAdapterConfig {
  payload?: Payload
}

export const payloadAdapter = (config: PayloadAdapterConfig) => {
  const logger = getLogger()
  logger.trace('payloadAdapter')
  // console.log(`\n- payloadAdapter WRAPPER`)

  return (options: BetterAuthOptions): Adapter => {
    // console.log(`\n- - payloadAdapter CLOSURE`)
    const schema = getAuthTables(options)

    const resolvePayload = async () => {
      // const payloadPromise: Promise<Payload | undefined> = new Promise(
      //   (resolve) => {
      //     if (config.payload) {
      //       resolve(config.payload)
      //     } else {
      //       resolve(getPayload())
      //     }
      //   },
      // )
      const payload = config.payload || getPayload()
      if (!payload) {
        throw new Error('Payload is not initialized')
      }
      return payload
    }

    function getCollectionName(model: string) {
      return schema[model].modelName
    }

    return {
      id: 'payloadcms',

      async create(data: {
        model: string
        data: any
        select?: string[]
      }): Promise<any> {
        logger.trace(
          `\n- - payloadAdapter - create >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, data: values } = data

        try {
          const result = await payload.db.create({
            collection: getCollectionName(model),
            data: values,
          })

          return result
        } catch (error) {
          throw new BetterAuthError(
            `Failed to create record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      async findOne(data: {
        model: string
        where?: Where[]
        select?: string[]
      }): Promise<any | null> {
        logger.trace(
          `\n- - payloadAdapter - findOne >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
            limit: 1,
          })

          return docs[0] || null
        } catch (error) {
          throw new BetterAuthError(
            `Failed to find record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      async findMany(data: {
        model: string
        where?: Where[]
        limit?: number
        offset?: number
        sortBy?: { field: string; direction: 'asc' | 'desc' }
      }): Promise<any[]> {
        logger.trace(
          `\n- - payloadAdapter - findMany >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where, limit, offset, sortBy } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
            limit: limit || 100,
            // skip: offset || 0,
            sort: sortBy
              ? `${sortBy.direction === 'desc' ? '-' : ''}${sortBy.field}`
              : // { [sortBy.field]: sortBy.direction === 'desc' ? -1 : 1 }
                undefined,
          })

          return docs
        } catch (error) {
          throw new BetterAuthError(
            `Failed to find records in ${model}: ${(error as Error).message}`,
          )
        }
      },

      async update(data: {
        model: string
        where?: Where[]
        update: any
      }): Promise<any> {
        logger.trace(
          `\n- - payloadAdapter - update >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where, update: values } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
            limit: 1,
          })

          if (!docs.length) {
            throw new BetterAuthError(`Record not found in ${model}`)
          }

          const result = await payload.update({
            collection: getCollectionName(model),
            id: docs[0].id,
            data: values,
          })

          return result
        } catch (error) {
          throw new BetterAuthError(
            `Failed to update record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      async updateMany(data: {
        model: string
        where?: Where[]
        update: any
      }): Promise<number> {
        logger.trace(
          `\n- - payloadAdapter - updateMany >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where, update: values } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
          })

          await Promise.all(
            docs.map((doc) =>
              payload.update({
                collection: getCollectionName(model),
                id: doc.id,
                data: values,
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

      async delete(data: { model: string; where?: Where[] }): Promise<void> {
        logger.trace(
          `\n- - payloadAdapter - delete >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
            limit: 1,
          })

          if (docs.length) {
            await payload.delete({
              collection: getCollectionName(model),
              id: docs[0].id,
            })
          }
        } catch (error) {
          throw new BetterAuthError(
            `Failed to delete record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      async deleteMany(data: {
        model: string
        where?: Where[]
      }): Promise<number> {
        logger.trace(
          `\n- - payloadAdapter - deleteMany >> ${JSON.stringify(data, null, 2)}`,
        )
        const payload = await resolvePayload()
        const { model, where } = data

        try {
          const { docs } = await payload.find({
            collection: getCollectionName(model),
            where: where ? buildWhereClause(where) : {},
          })

          await Promise.all(
            docs.map((doc) =>
              payload.delete({
                collection: getCollectionName(model),
                id: doc.id,
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
    } satisfies Adapter
  }

  function buildWhereClause(where: Where[]) {
    if (where.length === 1) {
      const w = where[0]
      if (!w) return {}

      return {
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: w.value }
            : { [w.operator]: w.value },
      }
    }

    const and = where.filter((w) => w.connector === 'AND' || !w.connector)
    const or = where.filter((w) => w.connector === 'OR')

    return {
      and: and.map((w) => ({
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: w.value }
            : { [w.operator]: w.value },
      })),
      or: or.map((w) => ({
        [w.field]:
          w.operator === 'eq' || !w.operator
            ? { equals: w.value }
            : { [w.operator]: w.value },
      })),
    }
  }
}
