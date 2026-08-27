export function calculateProductPrice(price: number, discount = 0, variantModifier = 0): number {
  const base = Math.max(0, Number(price) || 0) + (Number(variantModifier) || 0);
  const percentage = Math.min(100, Math.max(0, Number(discount) || 0));
  return Math.round((base * (1 - percentage / 100) + Number.EPSILON) * 100) / 100;
}

export function getReferencePrice(price: number, comparePrice: number, discount = 0): number {
  if (discount > 0) return Math.max(0, Number(price) || 0);
  const comparison = Number(comparePrice) || 0;
  return comparison > price ? comparison : 0;
}

export function calculateDeliveryFee(deliveryFee = 0, freeDeliveryThreshold = 0, orderAmount = 0): number {
  const fee = Math.max(0, Number(deliveryFee) || 0);
  const threshold = Math.max(0, Number(freeDeliveryThreshold) || 0);
  if (fee === 0 || (threshold > 0 && orderAmount >= threshold)) return 0;
  return fee;
}
