import { Platform } from 'react-native';

/**
 * Live backend (Next.js website). Release / production APK uses this.
 * Example: https://your-domain.com  (no trailing slash)
 *
 * Local `yarn dev` on port 3001 is ONLY for debug builds.
 */
export const LIVE_API_BASE_URL = 'https://YOUR-LIVE-DOMAIN.com';

/** Must match DEFAULT_STORE_SLUG / store slug in the live database. */
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
