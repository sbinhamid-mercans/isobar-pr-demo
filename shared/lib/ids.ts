export function newId(prefix: string): string {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return prefix ? `${prefix}_${random}` : random;
}

export function isId(value: unknown, prefix: string): value is string {
  return typeof value === 'string' && value.startsWith(`${prefix}_`) && value.length > prefix.length + 1;
}
