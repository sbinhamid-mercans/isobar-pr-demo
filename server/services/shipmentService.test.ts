import { describe, expect, it } from 'vitest';
import { estimateDelivery } from './shipmentService';
import type { Zone } from '../../shared/types';

// [zone, weightKg, express days, standard days]
const cases: Array<[Zone, number, number, number]> = [
  ['local', 10, 1, 2],
  ['local', 30, 2, 3],
  ['local', 60, 2, 3],
  ['regional', 10, 2, 4],
  ['regional', 30, 3, 5],
  ['regional', 60, 4, 6],
  ['national', 10, 3, 6],
  ['national', 30, 5, 8],
  ['national', 60, 5, 8],
  ['eu', 10, 4, 8],
  ['eu', 30, 6, 10],
  ['eu', 60, 8, 12],
  ['world', 10, 6, 14],
  ['world', 30, 9, 17],
  ['world', 60, 12, 20],
];

describe('estimateDelivery', () => {
  it.each(cases)('%s at %d kg: %d days express, %d standard', (zone, weightKg, express, standard) => {
    expect(estimateDelivery(zone, weightKg, true)).toBe(express);
    expect(estimateDelivery(zone, weightKg, false)).toBe(standard);
  });
});
