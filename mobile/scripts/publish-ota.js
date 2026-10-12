#!/usr/bin/env node
/**
 * Build a release JS bundle, zip it, and update public/mobile-ota/manifest.json.
 *
 * Usage (from repo root):
 *   yarn mobile:ota --platform android --notes "Home screen polish"
 *   yarn mobile:ota --platform ios
 *   yarn mobile:ota --platform both --version 3
 *
 * Then deploy the website so phones can download the zip from /mobile-ota/...
 * JS/UI changes only — native/module changes still need a new APK/IPA.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const flag = `--${name}`;
  const index = args.indexOf(flag);
  if (index >= 0 && args[index + 1] && !args[index + 1].startsWith('--')) {
    return args[index + 1];
  }
  return fallback;
}

const platformArg = String(getArg('platform', 'android')).toLowerCase();
const notes = getArg('notes', '');
const versionOverride = getArg('version', null);

if (!['android', 'ios', 'both'].includes(platformArg)) {
  console.error('Invalid --platform. Use android | ios | both');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '../..');
const mobileRoot = path.resolve(__dirname, '..');
const publicOta = path.join(repoRoot, 'public', 'mobile-ota');
const workRoot = path.join(mobileRoot, '.ota-build');

fs.mkdirSync(publicOta, { recursive: true });

const manifestPath = path.join(publicOta, 'manifest.json');
/** @type {{ android: { version: number, url: string, notes?: string }, ios: { version: number, url: string, notes?: string } }} */
let manifest = {
  android: { version: 0, url: '', notes: '' },
  ios: { version: 0, url: '', notes: '' },
};

if (fs.existsSync(manifestPath)) {
  try {
    manifest = { ...manifest, ...JSON.parse(fs.readFileSync(manifestPath, 'utf8')) };
  } catch (error) {
    console.warn('Could not parse existing manifest, starting fresh.', error);
  }
}

function nextVersion(platformKey) {
  if (versionOverride != null) {
    const parsed = Number(versionOverride);
    if (!Number.isFinite(parsed) || parsed < 1) {
      console.error('--version must be a positive number');
      process.exit(1);
    }
    return parsed;
  }
  return (manifest[platformKey]?.version || 0) + 1;
}

function buildAndZip(platformKey) {
  const version = nextVersion(platformKey);
  const rnPlatform = platformKey === 'ios' ? 'ios' : 'android';
  const outDir = path.join(workRoot, platformKey);
  const bundleFolder = path.join(outDir, 'output');
  const bundleName = platformKey === 'ios' ? 'main.jsbundle' : 'index.android.bundle';
  const bundleOut = path.join(bundleFolder, bundleName);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(bundleFolder, { recursive: true });

  console.log(`\n→ Bundling ${platformKey} (OTA v${version})…`);
  execSync(
    [
      'npx',
      'react-native',
      'bundle',
      `--platform ${rnPlatform}`,
      '--dev false',
      '--entry-file index.js',
      `--bundle-output "${bundleOut}"`,
      `--assets-dest "${bundleFolder}"`,
    ].join(' '),
    { cwd: mobileRoot, stdio: 'inherit', shell: true },
  );

  if (!fs.existsSync(bundleOut)) {
    console.error(`Bundle missing: ${bundleOut}`);
    process.exit(1);
  }

  const zipName = `${platformKey}-v${version}.zip`;
  const zipPath = path.join(publicOta, zipName);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  execSync(`zip -r "${zipPath}" output`, {
    cwd: outDir,
    stdio: 'inherit',
    shell: true,
  });

  manifest[platformKey] = {
    version,
    url: `/mobile-ota/${zipName}`,
    notes: notes || '',
    publishedAt: new Date().toISOString(),
  };

  console.log(`✓ ${platformKey} OTA v${version} → public/mobile-ota/${zipName}`);
}

const targets = platformArg === 'both' ? ['android', 'ios'] : [platformArg];
for (const target of targets) {
  buildAndZip(target);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('\n✓ Updated public/mobile-ota/manifest.json');
console.log('Deploy the website, then reopen the release app — it will download the update.');
console.log('Native/module changes still need a new APK/IPA.\n');
