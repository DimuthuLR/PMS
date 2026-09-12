// Converts snake_case → camelCase
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Converts camelCase → snake_case (only affects uppercase letters)
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// Recursively transforms all keys of an object/array
export function deepConvertKeys(obj, converter) {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepConvertKeys(item, converter))
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        converter(key),
        deepConvertKeys(value, converter),
      ]),
    )
  }
  return obj
}
