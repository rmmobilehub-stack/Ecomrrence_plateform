import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import hotUpdate from 'react-native-ota-hot-update';
import { API_BASE_URL } from './config';

type OtaManifestPlatform = {
  version: number;
  url: string;
  notes?: string;
};

type OtaManifest = {
  android?: OtaManifestPlatform;
  ios?: OtaManifestPlatform;
};

function resolveUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Checks the hosted OTA manifest and installs a newer JS bundle when available.
 * Only runs in release builds — Metro debug ignores OTA.
 */
export async function checkForOtaUpdate(): Promise<void> {
  if (__DEV__) return;

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/mobile/ota`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return;

    const manifest = (await response.json()) as OtaManifest;
    const platformKey = Platform.OS === 'ios' ? 'ios' : 'android';
    const update = manifest[platformKey];
    if (!update?.url || !Number.isFinite(update.version)) return;

    const currentVersion = await hotUpdate.getCurrentVersion();
    if (update.version <= currentVersion) return;

    await hotUpdate.downloadBundleUri(ReactNativeBlobUtil, resolveUrl(update.url), update.version, {
      // Android default looks for *.bundle (index.android.bundle); iOS needs .jsbundle
      extensionBundle: Platform.OS === 'ios' ? '.jsbundle' : '.bundle',
      restartAfterInstall: true,
      restartDelay: 400,
      metadata: {
        notes: update.notes || '',
        platform: platformKey,
      },
      updateFail: message => {
        console.warn('[ota] update failed', message);
      },
    });
  } catch (error) {
    console.warn('[ota] check failed', error);
  }
}
