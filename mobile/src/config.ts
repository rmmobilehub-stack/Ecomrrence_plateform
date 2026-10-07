import { Platform } from 'react-native';

/**
 * Android emulator reaches the host machine at 10.0.2.2.
 * Physical device: run `adb reverse tcp:3001 tcp:3001` and keep this URL,
 * or set API_BASE_URL to http://YOUR_LAN_IP:3001
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3001',
  ios: 'http://localhost:3001',
  default: 'http://10.0.2.2:3001',
}) as string;

export const STORE_SLUG = 'demo';
