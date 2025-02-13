import type { Payload } from 'payload'
import type {
  Adapter,
  AdapterInstance,
  BetterAuthOptions,
  Where,
} from 'better-auth'
import { generateId, BetterAuthError } from 'better-auth'
import { getAuthTables } from 'better-auth/db'
import { withApplyDefault } from './utils.js'
// import { withApplyDefault } from "better-auth";

// Configurazione per l'adapter
export interface PayloadAdapterConfig {
  /**
   * Nome della collection per gli utenti
   */
  collection?: string
  /**
   * Istanza di Payload
   */
  payload: Payload
}

// Funzioni di trasformazione per convertire tra formati Payload e Better Auth
const createTransform = (
  config: PayloadAdapterConfig,
  options: BetterAuthOptions,
) => {
  const schema = getAuthTables(options)

  // Ottiene il nome del campo dal modello
  function getField(model: string, field: string) {
    if (field === 'id') {
      return field
    }
    const f = schema[model].fields[field]
    return f.fieldName || field
  }

  // Ottiene il nome del modello
  function getModelName(model: string) {
    return schema[model].modelName
  }

  // Flag per l'ID generato dal database
  const useDatabaseGeneratedId = options?.advanced?.generateId === false

  return {
    // Trasforma i dati in input per Payload
    transformInput(
      data: Record<string, any>,
      model: string,
      action: 'create' | 'update',
    ) {
      const transformedData: Record<string, any> =
        useDatabaseGeneratedId || action === 'update'
          ? {}
          : {
              id: options.advanced?.generateId
                ? options.advanced.generateId({
                    model,
                  })
                : data.id || generateId(),
            }

      const fields = schema[model].fields
      for (const field in fields) {
        const value = data[field]
        if (
          value === undefined &&
          (!fields[field].defaultValue || action === 'update')
        ) {
          continue
        }
        transformedData[fields[field].fieldName || field] = withApplyDefault(
          value,
          fields[field],
          action,
        )
      }
      return transformedData
    },

    // Trasforma i dati in output da Payload
    transformOutput(
      data: Record<string, any>,
      model: string,
      select: string[] = [],
    ) {
      if (!data) return null
      const transformedData: Record<string, any> = data.id
        ? select.length === 0 || select.includes('id')
          ? { id: data.id }
          : {}
        : {}

      const tableSchema = schema[model].fields
      for (const key in tableSchema) {
        if (select.length && !select.includes(key)) {
          continue
        }
        const field = tableSchema[key]
        if (field) {
          transformedData[key] = data[field.fieldName || key]
        }
      }
      return transformedData
    },

    // Converte le clausole where per Payload
    convertWhereClause(model: string, where?: Where[]) {
      if (!where) return {}

      if (where.length === 1) {
        const w = where[0]
        if (!w) return {}

        const field = getField(model, w.field)
        return {
          [field]:
            w.operator === 'eq' || !w.operator
              ? { equals: w.value }
              : { [w.operator]: w.value },
        }
      }

      const and = where.filter((w) => w.connector === 'AND' || !w.connector)
      const or = where.filter((w) => w.connector === 'OR')

      return {
        and: and.map((w) => ({
          [getField(model, w.field)]:
            w.operator === 'eq' || !w.operator
              ? { equals: w.value }
              : { [w.operator]: w.value },
        })),
        or: or.map((w) => ({
          [getField(model, w.field)]:
            w.operator === 'eq' || !w.operator
              ? { equals: w.value }
              : { [w.operator]: w.value },
        })),
      }
    },

    getModelName,
    getField,
  }
}

// Payload Adapter for Better Auth
export const payloadAdapter: (config: PayloadAdapterConfig) => AdapterInstance =
  (config: PayloadAdapterConfig) => (options: BetterAuthOptions) => {
    const {
      transformInput,
      transformOutput,
      convertWhereClause,
      getModelName,
    } = createTransform(config, options)

    const payload = config.payload

    return {
      id: 'payloadcms',
      // Crea un nuovo record
      async create<T extends Record<string, any>, R = T>(data: {
        model: string
        data: T
        select?: string[]
      }): Promise<R> {
        const { model, data: values, select } = data
        const transformed = transformInput(values, model, 'create')

        try {
          const result = await payload.create({
            collection: getModelName(model),
            data: transformed,
          })

          const transformed_result = transformOutput<T>(result, model, select)
          if (!transformed_result) {
            throw new BetterAuthError('Failed to transform created record')
          }
          return transformed_result
        } catch (error) {
          throw new BetterAuthError(
            `Failed to create record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Trova un singolo record
      async findOne<T extends Record<string, any>>(data: {
        model: string
        where?: Where[]
        select?: string[]
      }): Promise<T | null> {
        const { model, where, select } = data
        const whereClause = convertWhereClause(model, where)

        try {
          const { docs } = await payload.find({
            collection: getModelName(model),
            where: whereClause,
            limit: 1,
          })

          if (!docs.length) return null
          return transformOutput<T>(docs[0], model, select)
        } catch (error) {
          throw new BetterAuthError(
            `Failed to find record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Trova più record
      async findMany<T extends Record<string, any>>(data: {
        model: string
        where?: Where[]
        limit?: number
        offset?: number
        sortBy?: { field: string; direction: 'asc' | 'desc' }
      }): Promise<T[]> {
        const { model, where, limit, offset, sortBy } = data
        const whereClause = convertWhereClause(model, where)

        try {
          const { docs } = await payload.find({
            collection: getModelName(model),
            where: whereClause,
            limit: limit || 100,
            skip: offset || 0,
            sort: sortBy
              ? { [sortBy.field]: sortBy.direction === 'desc' ? -1 : 1 }
              : undefined,
          })

          return docs.map((doc) => transformOutput<T>(doc, model))
        } catch (error) {
          throw new BetterAuthError(
            `Failed to find records in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Aggiorna un record
      async update<T extends Record<string, any>>(data: {
        model: string
        where?: Where[]
        update: Partial<T>
      }): Promise<T> {
        const { model, where, update: values } = data
        const whereClause = convertWhereClause(model, where)
        const transformed = transformInput(values, model, 'update')

        try {
          const { docs } = await payload.find({
            collection: getModelName(model),
            where: whereClause,
            limit: 1,
          })

          if (!docs.length) {
            throw new BetterAuthError(`Record not found in ${model}`)
          }

          const result = await payload.update({
            collection: getModelName(model),
            id: docs[0].id,
            data: transformed,
          })

          const transformed_result = transformOutput<T>(result, model)
          if (!transformed_result) {
            throw new BetterAuthError('Failed to transform updated record')
          }
          return transformed_result
        } catch (error) {
          throw new BetterAuthError(
            `Failed to update record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Aggiorna più record
      async updateMany(data) {
        const { model, where, update: values } = data
        const whereClause = convertWhereClause(model, where)
        const transformed = transformInput(values, model, 'update')

        try {
          const existing = await payload.find({
            collection: getModelName(model),
            where: whereClause,
          })

          const updates = await Promise.all(
            existing.docs.map((doc) =>
              payload.update({
                collection: getModelName(model),
                id: doc.id,
                data: transformed,
              }),
            ),
          )

          return updates.length
        } catch (error) {
          throw new BetterAuthError(
            `Failed to update records in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Elimina un record
      async delete(data) {
        const { model, where } = data
        const whereClause = convertWhereClause(model, where)

        try {
          const existing = await payload.find({
            collection: getModelName(model),
            where: whereClause,
            limit: 1,
          })

          if (existing.docs.length) {
            await payload.delete({
              collection: getModelName(model),
              id: existing.docs[0].id,
            })
          }
        } catch (error) {
          throw new BetterAuthError(
            `Failed to delete record in ${model}: ${(error as Error).message}`,
          )
        }
      },

      // Elimina più record
      async deleteMany(data) {
        const { model, where } = data
        const whereClause = convertWhereClause(model, where)

        try {
          const existing = await payload.find({
            collection: getModelName(model),
            where: whereClause,
          })

          await Promise.all(
            existing.docs.map((doc) =>
              payload.delete({
                collection: getModelName(model),
                id: doc.id,
              }),
            ),
          )

          return existing.docs.length
        } catch (error) {
          throw new BetterAuthError(
            `Failed to delete records in ${model}: ${(error as Error).message}`,
          )
        }
      },

      options: config,
    } satisfies Adapter
  }
