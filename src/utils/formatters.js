/**
 * Utilidades para convertir objetos entre camelCase y snake_case
 * Se usa para adaptar los datos de la UI (camelCase) al backend de Sequelize (snake_case).
 */

export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function snakeToCamel(str) {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  })
}

export function toSnakeCase(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase)
  }

  const result = {}
  for (const key of Object.keys(obj)) {
    const snakeKey = camelToSnake(key)
    result[snakeKey] = toSnakeCase(obj[key])
  }
  return result
}

export function toCamelCase(obj) {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  const result = {}
  for (const key of Object.keys(obj)) {
    const camelKey = snakeToCamel(key)
    result[camelKey] = toCamelCase(obj[key])
  }
  return result
}
