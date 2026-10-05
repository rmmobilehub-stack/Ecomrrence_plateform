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

/** Opens the WhatsApp app (mobile / desktop), not WhatsApp Web. */
export function createWhatsAppUrl(number: string | undefined, message: string): string {
  const phone = normalizeWhatsAppNumber(number);
  return isValidWhatsAppNumber(phone)
    ? `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`
    : '';
}

export function openWhatsAppApp(number: string | undefined, message: string): boolean {
  const url = createWhatsAppUrl(number, message);
  if (!url || typeof window === 'undefined') return false;
  window.location.href = url;
  return true;
}
