/** Shared email / phone checks for the mobile app. */

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

/**
 * Accepts Pakistan mobiles (03XXXXXXXXX / +923XXXXXXXXX) or other numbers with 10–15 digits.
 */
export function isValidPhone(value: string): boolean {
  const raw = String(value || '').trim();
  if (!raw) return false;
  const digits = raw.replace(/[^\d]/g, '');
  if (/^03\d{9}$/.test(digits)) return true;
  if (/^923\d{9}$/.test(digits)) return true;
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmailOrPhone(value: string): boolean {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  if (trimmed.includes('@')) return isValidEmail(trimmed);
  return isValidPhone(trimmed);
}

export function emailValidationMessage(value: string): string | null {
  if (!String(value || '').trim()) return 'Enter your email address';
  if (!isValidEmail(value)) return 'Enter a valid email address (e.g. name@email.com)';
  return null;
}

export function phoneValidationMessage(value: string, required = true): string | null {
  const trimmed = String(value || '').trim();
  if (!trimmed) return required ? 'Enter your phone number' : null;
  if (!isValidPhone(trimmed)) {
    return 'Enter a valid phone number (e.g. 03XXXXXXXXX or +92…)';
  }
  return null;
}

export function contactValidationMessage(value: string): string | null {
  const trimmed = String(value || '').trim();
  if (!trimmed) return 'Enter a phone number or email';
  if (!isValidEmailOrPhone(trimmed)) {
    return 'Enter a valid phone number or email address';
  }
  return null;
}
