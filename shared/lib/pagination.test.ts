import { describe, expect, it } from 'vitest';
import { paginate } from './pagination';

const items = [1, 2, 3, 4, 5];

describe('paginate', () => {
  it('slices the requested page', () => {
    expect(paginate(items, 1, 2)).toEqual({ items: [1, 2], page: 1, size: 2, pages: 3, total: 5 });
    expect(paginate(items, 3, 2).items).toEqual([5]);
  });

  it('returns an empty page when the page is out of range', () => {
    expect(paginate(items, 4, 2).items).toEqual([]);
    expect(paginate(items, 0, 2).items).toEqual([]);
  });

  it('rejects a page size below one', () => {
    expect(() => paginate(items, 1, 0)).toThrow(RangeError);
  });
});
