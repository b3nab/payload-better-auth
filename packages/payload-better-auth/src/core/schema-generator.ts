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
import type { BetterAuthPluginOptions } from '../index.js'
import { getLogger } from '../logger.js'

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
      slug: modelName,
      fields: convertToPayloadFields(value.fields),
    }
    if (key === 'user') {
      newCollection.auth = true
    }
    if (extendsCollections?.[modelName]) {
      newCollection = deepmerge()(newCollection, extendsCollections[modelName])
    }
    collections.push(newCollection)
  }

  getLogger().trace(collections, 'output from generatePayloadCollections')

  return collections
}

/**
 * Convert the fields from the BetterAuth table.fields to the payload collection.fields
 * @param fields - The fields from the authTables
 * @returns The fields in payload format
 */
const convertToPayloadFields = (
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
          type: convertToPayloadType(fieldValue.type),
          required: fieldValue.required,
          // TODO: better-auth FieldAttributeConfig . returned has the same "reason to exists" as the payload FieldBase . hidden ??
          hidden: fieldValue.returned,
          // TODO: how to map better-auth FieldAttributeConfig . input ??
          defaultValue: fieldValue.defaultValue,
          // TODO: how to map better-auth FieldAttributeConfig . references ??
          unique: fieldValue.unique,
          // TODO: better-auth FieldAttributeConfig . sortable has the same "reason to exists" as the payload FieldBase . index ??
          index: fieldValue.sortable,
        }) as PayloadField,
    )
}

// BETTER AUTH FieldType
// "string" | "number" | "boolean" | "date" | `${"string" | "number"}[]`
// PAYLOAD FieldTypes
// "text" | "number" | "checkbox" | "date" | "array"
function convertToPayloadType(fieldType: FieldType): PayloadFieldTypes {
  return ({
    // TODO: better-auth FieldType "number[]" or "string[]" are not mapped strictly to payload FieldTypes "array"
    'number[]': 'array',
    'string[]': 'array',
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    date: 'date',
  }[String(fieldType)] || 'text') as PayloadFieldTypes
}
