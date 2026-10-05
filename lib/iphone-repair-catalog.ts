export type RepairIssueId =
  | 'screen'
  | 'battery'
  | 'charging'
  | 'camera'
  | 'speaker'
  | 'back-glass'
  | 'water'
  | 'other';

export type RepairColor = {
  id: string;
  name: string;
  hex: string;
};

export type RepairModel = {
  id: string;
  name: string;
  series: string;
  imageUrl: string;
  cameraStyle: 'single' | 'dual-diagonal' | 'dual-vertical' | 'triple';
  screenStyle: 'notch' | 'island';
  colors: RepairColor[];
};

export type RepairIssue = {
  id: RepairIssueId;
  name: string;
  description: string;
};

export const REPAIR_ISSUES: RepairIssue[] = [
  { id: 'screen', name: 'Screen cracked / blank', description: 'Display, touch or glass damage' },
  { id: 'battery', name: 'Battery health / drain', description: 'Weak battery or unexpected shutdowns' },
  { id: 'charging', name: 'Charging port / no charge', description: 'Cable not detected or slow charge' },
  { id: 'camera', name: 'Camera / flash issue', description: 'Blurry lens, black screen or flash fault' },
  { id: 'speaker', name: 'Speaker / mic / audio', description: 'No sound, crackle or mic issues' },
  { id: 'back-glass', name: 'Back glass broken', description: 'Rear glass cracked or shattered' },
  { id: 'water', name: 'Liquid / water damage', description: 'Phone got wet or shows liquid alert' },
  { id: 'other', name: 'Other issue', description: 'Describe the problem in your notes' },
];

function c(id: string, name: string, hex: string): RepairColor {
  return { id, name, hex };
}

function model(
  id: string,
  name: string,
  series: string,
  imageSlug: string,
  colors: RepairColor[]
): RepairModel {
  const isPro = id.includes('-pro');
  const is16OrLater = /iphone-(?:1[678]|air)/.test(id);
  return {
    id,
    name,
    series,
    imageUrl: `/storefront/iphones/${imageSlug}.jpg`,
    cameraStyle: id.endsWith('16e') || id.endsWith('17e') ? 'single' : isPro ? 'triple' : is16OrLater ? 'dual-vertical' : 'dual-diagonal',
    screenStyle: id.startsWith('iphone-13') || id === 'iphone-14' || id === 'iphone-14-plus' || id.endsWith('16e') || id.endsWith('17e') ? 'notch' : 'island',
    colors,
  };
}

/**
 * Official Apple launch finishes only.
 * Colour lists match Apple product pages for each model — no shared generic palette.
 */
export const REPAIR_MODELS: RepairModel[] = [
  // iPhone 13
  model('iphone-13', 'iPhone 13', 'iPhone 13', 'apple-iphone-13', [
    c('midnight', 'Midnight', '#1f2124'),
    c('starlight', 'Starlight', '#f9f3ee'),
    c('blue', 'Blue', '#437691'),
    c('pink', 'Pink', '#faddd7'),
    c('red', 'PRODUCT(RED)', '#c82033'),
    c('green', 'Green', '#394c38'),
  ]),
  model('iphone-13-mini', 'iPhone 13 mini', 'iPhone 13', 'apple-iphone-13-mini', [
    c('midnight', 'Midnight', '#1f2124'),
    c('starlight', 'Starlight', '#f9f3ee'),
    c('blue', 'Blue', '#437691'),
    c('pink', 'Pink', '#faddd7'),
    c('red', 'PRODUCT(RED)', '#c82033'),
    c('green', 'Green', '#394c38'),
  ]),
  model('iphone-13-pro', 'iPhone 13 Pro', 'iPhone 13', 'apple-iphone-13-pro', [
    c('sierra-blue', 'Sierra Blue', '#a7c1d9'),
    c('silver', 'Silver', '#f1f2ed'),
    c('gold', 'Gold', '#fae7cf'),
    c('graphite', 'Graphite', '#54524f'),
    c('alpine-green', 'Alpine Green', '#576856'),
  ]),
  model('iphone-13-pro-max', 'iPhone 13 Pro Max', 'iPhone 13', 'apple-iphone-13-pro-max', [
    c('sierra-blue', 'Sierra Blue', '#a7c1d9'),
    c('silver', 'Silver', '#f1f2ed'),
    c('gold', 'Gold', '#fae7cf'),
    c('graphite', 'Graphite', '#54524f'),
    c('alpine-green', 'Alpine Green', '#576856'),
  ]),

  // iPhone 14
  model('iphone-14', 'iPhone 14', 'iPhone 14', 'apple-iphone-14', [
    c('midnight', 'Midnight', '#222930'),
    c('starlight', 'Starlight', '#f9f3ee'),
    c('blue', 'Blue', '#a0b4c7'),
    c('purple', 'Purple', '#e5ddea'),
    c('red', 'PRODUCT(RED)', '#bf0013'),
    c('yellow', 'Yellow', '#f9e479'),
  ]),
  model('iphone-14-plus', 'iPhone 14 Plus', 'iPhone 14', 'apple-iphone-14-plus', [
    c('midnight', 'Midnight', '#222930'),
    c('starlight', 'Starlight', '#f9f3ee'),
    c('blue', 'Blue', '#a0b4c7'),
    c('purple', 'Purple', '#e5ddea'),
    c('red', 'PRODUCT(RED)', '#bf0013'),
    c('yellow', 'Yellow', '#f9e479'),
  ]),
  model('iphone-14-pro', 'iPhone 14 Pro', 'iPhone 14', 'apple-iphone-14-pro', [
    c('deep-purple', 'Deep Purple', '#594f63'),
    c('gold', 'Gold', '#f4e8ce'),
    c('silver', 'Silver', '#f1f2ed'),
    c('space-black', 'Space Black', '#403e3d'),
  ]),
  model('iphone-14-pro-max', 'iPhone 14 Pro Max', 'iPhone 14', 'apple-iphone-14-pro-max', [
    c('deep-purple', 'Deep Purple', '#594f63'),
    c('gold', 'Gold', '#f4e8ce'),
    c('silver', 'Silver', '#f1f2ed'),
    c('space-black', 'Space Black', '#403e3d'),
  ]),

  // iPhone 15
  model('iphone-15', 'iPhone 15', 'iPhone 15', 'apple-iphone-15', [
    c('black', 'Black', '#3c4042'),
    c('blue', 'Blue', '#d5e0e6'),
    c('green', 'Green', '#d0dac7'),
    c('yellow', 'Yellow', '#ebe3c6'),
    c('pink', 'Pink', '#ead4d8'),
  ]),
  model('iphone-15-plus', 'iPhone 15 Plus', 'iPhone 15', 'apple-iphone-15-plus', [
    c('black', 'Black', '#3c4042'),
    c('blue', 'Blue', '#d5e0e6'),
    c('green', 'Green', '#d0dac7'),
    c('yellow', 'Yellow', '#ebe3c6'),
    c('pink', 'Pink', '#ead4d8'),
  ]),
  model('iphone-15-pro', 'iPhone 15 Pro', 'iPhone 15', 'apple-iphone-15-pro', [
    c('black-titanium', 'Black Titanium', '#1f1f21'),
    c('white-titanium', 'White Titanium', '#f5f5f2'),
    c('blue-titanium', 'Blue Titanium', '#4a5a70'),
    c('natural-titanium', 'Natural Titanium', '#a8a197'),
  ]),
  model('iphone-15-pro-max', 'iPhone 15 Pro Max', 'iPhone 15', 'apple-iphone-15-pro-max', [
    c('black-titanium', 'Black Titanium', '#1f1f21'),
    c('white-titanium', 'White Titanium', '#f5f5f2'),
    c('blue-titanium', 'Blue Titanium', '#4a5a70'),
    c('natural-titanium', 'Natural Titanium', '#a8a197'),
  ]),

  // iPhone 16
  model('iphone-16', 'iPhone 16', 'iPhone 16', 'apple-iphone-16', [
    c('black', 'Black', '#3c4042'),
    c('white', 'White', '#f5f5f5'),
    c('pink', 'Pink', '#f2adce'),
    c('teal', 'Teal', '#b0d4d2'),
    c('ultramarine', 'Ultramarine', '#9aafd2'),
  ]),
  model('iphone-16-plus', 'iPhone 16 Plus', 'iPhone 16', 'apple-iphone-16-plus', [
    c('black', 'Black', '#3c4042'),
    c('white', 'White', '#f5f5f5'),
    c('pink', 'Pink', '#f2adce'),
    c('teal', 'Teal', '#b0d4d2'),
    c('ultramarine', 'Ultramarine', '#9aafd2'),
  ]),
  model('iphone-16-pro', 'iPhone 16 Pro', 'iPhone 16', 'apple-iphone-16-pro', [
    c('black-titanium', 'Black Titanium', '#1f1f21'),
    c('white-titanium', 'White Titanium', '#f5f5f2'),
    c('natural-titanium', 'Natural Titanium', '#c4bdb0'),
    c('desert-titanium', 'Desert Titanium', '#c6a684'),
  ]),
  model('iphone-16-pro-max', 'iPhone 16 Pro Max', 'iPhone 16', 'apple-iphone-16-pro-max', [
    c('black-titanium', 'Black Titanium', '#1f1f21'),
    c('white-titanium', 'White Titanium', '#f5f5f2'),
    c('natural-titanium', 'Natural Titanium', '#c4bdb0'),
    c('desert-titanium', 'Desert Titanium', '#c6a684'),
  ]),
  model('iphone-16e', 'iPhone 16e', 'iPhone 16', 'apple-iphone-16e', [
    c('black', 'Black', '#3c4042'),
    c('white', 'White', '#f5f5f5'),
  ]),

  // iPhone 17 family
  model('iphone-17', 'iPhone 17', 'iPhone 17', 'apple-iphone-17', [
    c('black', 'Black', '#3c4042'),
    c('white', 'White', '#f5f5f5'),
    c('mist-blue', 'Mist Blue', '#a9c4d9'),
    c('sage', 'Sage', '#a8b59a'),
    c('lavender', 'Lavender', '#c9bdd6'),
  ]),
  model('iphone-17e', 'iPhone 17e', 'iPhone 17', 'apple-iphone-17e', [
    c('black', 'Black', '#3c4042'),
    c('white', 'White', '#f5f5f5'),
  ]),
  model('iphone-air', 'iPhone Air', 'iPhone 17', 'apple-iphone-air', [
    c('sky-blue', 'Sky Blue', '#9eb8d4'),
    c('light-gold', 'Light Gold', '#e8d9b8'),
    c('cloud-white', 'Cloud White', '#f4f4f2'),
    c('space-black', 'Space Black', '#2f3033'),
  ]),
  model('iphone-17-pro', 'iPhone 17 Pro', 'iPhone 17', 'apple-iphone-17-pro', [
    c('cosmic-orange', 'Cosmic Orange', '#c45a2c'),
    c('deep-blue', 'Deep Blue', '#2f4a6e'),
    c('silver', 'Silver', '#e8e8e6'),
  ]),
  model('iphone-17-pro-max', 'iPhone 17 Pro Max', 'iPhone 17', 'apple-iphone-17-pro-max', [
    c('cosmic-orange', 'Cosmic Orange', '#c45a2c'),
    c('deep-blue', 'Deep Blue', '#2f4a6e'),
    c('silver', 'Silver', '#e8e8e6'),
  ]),

  // iPhone 18 Pro family (base iPhone 18 omitted)
  model('iphone-18-pro', 'iPhone 18 Pro', 'iPhone 18', 'apple-iphone18-pro', [
    c('black', 'Black', '#1c1c1e'),
    c('silver', 'Silver', '#e8e8e6'),
    c('glacier', 'Glacier', '#b9cfe0'),
    c('burgundy', 'Burgundy', '#7a2438'),
  ]),
  model('iphone-18-pro-max', 'iPhone 18 Pro Max', 'iPhone 18', 'apple-iphone18-pro-max', [
    c('black', 'Black', '#1c1c1e'),
    c('silver', 'Silver', '#e8e8e6'),
    c('glacier', 'Glacier', '#b9cfe0'),
    c('burgundy', 'Burgundy', '#7a2438'),
  ]),
];

export const REPAIR_SIM_OPTIONS = [
  { id: 'dual-esim', name: 'Dual eSIM', description: 'Two active eSIM lines' },
  { id: 'esim-physical', name: 'eSIM + physical SIM', description: 'One eSIM and one Nano-SIM' },
  { id: 'dual-physical', name: 'Dual physical SIM', description: 'Two Nano-SIM slots (regional variant)' },
] as const;

export function getRepairCatalog() {
  return { models: REPAIR_MODELS, issues: REPAIR_ISSUES, simOptions: REPAIR_SIM_OPTIONS };
}

export function findRepairSimOption(simId: string) {
  return REPAIR_SIM_OPTIONS.find((entry) => entry.id === simId) ?? null;
}

export function findRepairModel(modelId: string) {
  return REPAIR_MODELS.find((entry) => entry.id === modelId) ?? null;
}

export function findRepairIssue(issueId: string) {
  return REPAIR_ISSUES.find((entry) => entry.id === issueId) ?? null;
}

export function findRepairColor(modelId: string, colorId: string) {
  const found = findRepairModel(modelId);
  return found?.colors.find((entry) => entry.id === colorId) ?? null;
}

export function getDevicePreview(modelId: string, colorId: string) {
  const foundModel = findRepairModel(modelId);
  const foundColor = findRepairColor(modelId, colorId);
  if (!foundModel || !foundColor) return null;
  return {
    modelId: foundModel.id,
    modelName: foundModel.name,
    series: foundModel.series,
    imageUrl: foundModel.imageUrl,
    colorId: foundColor.id,
    colorName: foundColor.name,
    colorHex: foundColor.hex,
    cameraStyle: foundModel.cameraStyle,
    screenStyle: foundModel.screenStyle,
  };
}
