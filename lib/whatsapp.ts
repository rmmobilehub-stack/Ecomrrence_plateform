export function normalizeWhatsAppNumber(value?: string): string {
  let digits = (value ?? '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = `92${digits.slice(1)}`;
  return digits;
}

export function isValidWhatsAppNumber(value?: string): boolean {
  const digits = normalizeWhatsAppNumber(value);
  return digits.length >= 8 && digits.length <= 15;
}

export function createWhatsAppUrl(number: string | undefined, message: string): string {
  const phone = normalizeWhatsAppNumber(number);
  return isValidWhatsAppNumber(phone) ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '';
}
