import type {
  BetterAuthDbSchema,
  FieldAttribute,
  FieldType,
} from 'better-auth/db'
import type {
  CollectionConfig,
  Field as PayloadField,
  FieldTypes as PayloadFieldTypes,
} from 'payload'

export const generatePayloadCollections = (
  authTables: BetterAuthDbSchema,
): CollectionConfig[] => {
  const collections: CollectionConfig[] = []

  for (const [key, value] of Object.entries(authTables)) {
    collections.push({
      slug: key,
      fields: convertToPayloadFields(value.fields),
    })
  }

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
  return Object.entries(fields).map(
    ([fieldKey, fieldValue]) =>
      ({
        name: fieldKey,
        type: convertToPayloadType(fieldValue.type),
      }) as PayloadField,
  )
}

// BETTER AUTH TYPES
// "string" | "number" | "boolean" | "date" | `${"string" | "number"}[]`
// PAYLOAD TYPES
// "text" | "number" | "checkbox" | "date" | "array"
function convertToPayloadType(fieldType: FieldType): PayloadFieldTypes {
  return ({
    'number[]': 'array',
    'string[]': 'array',
    string: 'text',
    number: 'number',
    boolean: 'checkbox',
    date: 'date',
  }[String(fieldType)] || 'text') as PayloadFieldTypes
}
