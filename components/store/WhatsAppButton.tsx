'use client';

import { createWhatsAppUrl } from '@/lib/whatsapp';

type Props = { number?: string; message: string; label: string; className?: string };

export function WhatsAppMark() {
  return <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3a12.7 12.7 0 0 0-10.9 19.2L3.5 28.5l6.5-1.7A12.7 12.7 0 1 0 16 3Zm0 22.8c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.8 1 1-3.7-.3-.4a10.7 10.7 0 1 1 8.9 4.8Zm5.9-8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a8.8 8.8 0 0 1-2.6-1.6 9.8 9.8 0 0 1-1.8-2.3c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6l-1-2.2c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.5s-1.2 1.2-1.2 3 .1 3.1 1.3 4.8a11.2 11.2 0 0 0 4.3 3.8c.6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.9-.8 2.2-1.5s.3-1.4.2-1.5-.2-.2-.5-.4Z"/></svg>;
}

export default function WhatsAppButton({ number, message, label, className = '' }: Props) {
  const url = createWhatsAppUrl(number, message);
  if (!url) return null;
  return <a className={`whatsapp-btn ${className}`} href={url} target="_blank" rel="noreferrer"><WhatsAppMark/>{label}</a>;
}
