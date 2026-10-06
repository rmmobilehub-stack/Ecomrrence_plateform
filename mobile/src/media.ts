import { API_BASE_URL } from './config';

export function resolveMediaUrl(value?: string): string {
  if (!value) return '';
  const rewritten = value
    .replace('http://localhost:3001', API_BASE_URL)
    .replace('http://localhost:3000', API_BASE_URL)
    .replace('http://127.0.0.1:3001', API_BASE_URL)
    .replace('http://127.0.0.1:3000', API_BASE_URL);
  if (rewritten.startsWith('http://') || rewritten.startsWith('https://')) return rewritten;
  if (rewritten.startsWith('/')) return `${API_BASE_URL}${rewritten}`;
  return rewritten;
}
