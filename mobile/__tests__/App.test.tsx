/**
 * @format
 */

import { formatMoney } from '../src/money';
import { calculateProductPrice, calculateDeliveryFee } from '../src/pricing';

test('formats PKR without decimals', () => {
  expect(formatMoney(1500, 'PKR')).toContain('1,500');
});

test('applies product discount', () => {
  expect(calculateProductPrice(1000, 10)).toBe(900);
});

test('waives delivery above threshold', () => {
  expect(calculateDeliveryFee(200, 2000, 2500)).toBe(0);
  expect(calculateDeliveryFee(200, 2000, 500)).toBe(200);
});
