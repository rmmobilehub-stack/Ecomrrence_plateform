import { Linking } from 'react-native';

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

export async function openWhatsApp(number: string | undefined, message: string) {
  const phone = normalizeWhatsAppNumber(number);
  if (!isValidWhatsAppNumber(phone)) {
    throw new Error('WhatsApp number is not configured');
  }
  const text = encodeURIComponent(message);
  const appUrl = `whatsapp://send?phone=${phone}&text=${text}`;
  const webUrl = `https://wa.me/${phone}?text=${text}`;
  const canOpen = await Linking.canOpenURL(appUrl);
  await Linking.openURL(canOpen ? appUrl : webUrl);
}
