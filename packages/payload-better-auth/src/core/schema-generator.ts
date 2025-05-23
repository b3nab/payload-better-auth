import type {
  BetterAuthDbSchema,
  FieldAttribute,
  FieldType,
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

export const generatePayloadCollections = (
  authTables: BetterAuthDbSchema,
  extendsCollections?: BetterAuthPluginOptions['extendsCollections'],
): CollectionConfig[] => {
  const collections: CollectionConfig[] = []

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
      fields: convertToPayloadFields(modelName, value.fields),
    }
    if (key === 'user') {
      newCollection.auth = true
      newCollection.access = {
        ...newCollection.access,
        admin: isAdmin,
        unlock: isAdmin,
      }
    }
    if (extendsCollections?.[modelName]) {
      newCollection = deepmerge()(newCollection, extendsCollections[modelName])
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
  fields: Record<string, FieldAttribute<FieldType>>,
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
          hidden: fieldValue.returned ?? false,
          // TODO: how to map better-auth FieldAttributeConfig . input ??
          defaultValue: fieldValue.defaultValue,
          unique: fieldValue.unique,
          // TODO: better-auth FieldAttributeConfig . sortable has the same "reason to exists" as the payload FieldBase . index ??
          index: fieldValue.sortable,
          // type: convertToPayloadType(fieldValue.type),
          ...convertToPayloadType(modelName, fieldValue, fieldKey),
        }) as PayloadField,
    )
}

// BETTER AUTH FieldType
// "string" | "number" | "boolean" | "date" | `${"string" | "number"}[]`
// PAYLOAD FieldTypes
// "text" | "number" | "checkbox" | "date" | "array"
function convertToPayloadType(
  modelName: string,
  { type: fieldType, references }: FieldAttribute<FieldType>,
  fieldKey: string,
): Partial<PayloadField> {
  // Dynamic map better-auth FieldAttributeConfig . references
  if (references) {
    getLogger().trace(
      references,
      `[convertToPayloadType] references for ${fieldKey} on ${modelName}`,
    )
    return {
      type: 'relationship',
      relationTo: references.model,
    }
  }

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
  }
  return internalFieldMap[String(fieldType)] || defaultType
}
