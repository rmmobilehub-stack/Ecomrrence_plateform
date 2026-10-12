import { Platform } from 'react-native';

/**
 * Live backend — same as NEXT_PUBLIC_SITE_URL in root .env.
 * Release builds also poll `${API_BASE_URL}/api/mobile/ota` for JS OTA updates.
 */
export const LIVE_API_BASE_URL = 'https://ecomrrence-plateform.vercel.app';

/** Must match DEFAULT_STORE_SLUG in .env / live DB. */
export const STORE_SLUG = 'demo';

/**
 * Debug (Metro / emulator): talk to local website.
 *   - Android emulator → http://10.0.2.2:3001
 *   - iOS simulator → http://localhost:3001
 *   - Physical device on LAN → http://YOUR_PC_IP:3001 + adb reverse if needed
 *
 * Release APK (live): uses LIVE_API_BASE_URL. Local yarn/npm must NOT be running
 * for the phone — the app calls the hosted website over the internet.
 */
const LOCAL_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://10.0.2.2:3001',
}) as string;

export const API_BASE_URL = __DEV__ ? LOCAL_API_BASE_URL : LIVE_API_BASE_URL;
