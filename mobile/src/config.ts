import { Platform } from 'react-native';

/**
 * Live backend — same as NEXT_PUBLIC_SITE_URL in root .env
 * (https://ecomrrence-plateform.vercel.app). No trailing slash.
 */
export const LIVE_API_BASE_URL = 'https://ecomrrence-plateform.vercel.app';

/** Must match DEFAULT_STORE_SLUG in .env / live DB. */
export const STORE_SLUG = 'demo';

/**
 * Debug: local Next.js (`npm run dev` / `yarn dev` on port 3001).
 * Release APK: LIVE_API_BASE_URL (Vercel) — local PC not required.
 */
const LOCAL_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://10.0.2.2:3001',
}) as string;

export const API_BASE_URL = __DEV__ ? LOCAL_API_BASE_URL : LIVE_API_BASE_URL;
