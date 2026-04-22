export const required = (v: unknown): true | string =>
  (v !== '' && v !== null && v !== undefined) || 'Required'

export const positiveNumber = (v: unknown): true | string =>
  (v !== null && Number(v) > 0) || 'Must be greater than 0'
