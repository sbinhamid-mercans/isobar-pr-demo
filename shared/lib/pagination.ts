export function paginate<T>(items: T[], page: number, size: number) {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`page size must be a positive integer, got ${size}`);
  }
  const pages = Math.max(1, Math.ceil(items.length / size));
  if (!Number.isInteger(page) || page < 1 || page > pages) {
    return { items: [] as T[], page, size, pages, total: items.length };
  }
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), page, size, pages, total: items.length };
}
