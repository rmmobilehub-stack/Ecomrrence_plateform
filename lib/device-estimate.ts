export type ScreenCondition = 'all_neat' | 'some_scratches' | 'many_scratches';
export type OwnershipStatus = 'first_owner' | 'box_pack' | 'used' | 'non_active';
export type BodyFlag = 'scratches' | 'side_rough' | 'body_changed' | 'back_glass_changed';
export type ChangedPart = 'glass' | 'battery' | 'front_camera' | 'back_camera';

export type DeviceConditionInput = {
  screenCondition: ScreenCondition;
  bodyFlags: BodyFlag[];
  partsChanged: ChangedPart[];
  overallOutOf10: number;
  batteryHealthPercent: number;
  ageYears: number;
  ownership: OwnershipStatus;
  additionalNote: string;
};

/** @deprecated kept for older imports; prefer ScreenCondition */
export type DeviceConditionLevel = 'excellent' | 'good' | 'fair' | 'poor';

export type DeviceEstimate = {
  score: number;
  scoreLabel: string;
  marketValueMinPkr: number;
  marketValueMaxPkr: number;
  currency: 'PKR';
  summary: string;
  suggestions: string[];
  buySuggestions: string[];
  source: 'rules';
};

export const DEFAULT_DEVICE_CONDITION: DeviceConditionInput = {
  screenCondition: 'all_neat',
  bodyFlags: [],
  partsChanged: [],
  overallOutOf10: 8,
  batteryHealthPercent: 85,
  ageYears: 1,
  ownership: 'used',
  additionalNote: '',
};

export const SCREEN_CONDITION_OPTIONS: { id: ScreenCondition; label: string }[] = [
  { id: 'all_neat', label: 'All neat / clean' },
  { id: 'some_scratches', label: 'Some scratches' },
  { id: 'many_scratches', label: 'Many scratches' },
];

export const BODY_FLAG_OPTIONS: { id: BodyFlag; label: string }[] = [
  { id: 'scratches', label: 'Body scratches' },
  { id: 'side_rough', label: 'Side rough' },
  { id: 'body_changed', label: 'Body changed' },
  { id: 'back_glass_changed', label: 'Back glass changed' },
];

export const PARTS_CHANGED_OPTIONS: { id: ChangedPart; label: string }[] = [
  { id: 'glass', label: 'Glass change' },
  { id: 'battery', label: 'Battery change' },
  { id: 'front_camera', label: 'Front camera change' },
  { id: 'back_camera', label: 'Back camera change' },
];

export const OWNERSHIP_OPTIONS: { id: OwnershipStatus; label: string }[] = [
  { id: 'first_owner', label: 'First owner' },
  { id: 'box_pack', label: 'Box pack' },
  { id: 'used', label: 'Used' },
  { id: 'non_active', label: 'Non-active' },
];

const SCREEN_SCORE: Record<ScreenCondition, number> = {
  all_neat: 95,
  some_scratches: 72,
  many_scratches: 42,
};

const OWNERSHIP_BOOST: Record<OwnershipStatus, number> = {
  first_owner: 6,
  box_pack: 8,
  used: 0,
  non_active: -10,
};

const MODEL_BASE_PKR: Array<{ match: RegExp; min: number; max: number }> = [
  { match: /iphone\s*18\s*pro\s*max/i, min: 420000, max: 520000 },
  { match: /iphone\s*18\s*pro/i, min: 360000, max: 450000 },
  { match: /iphone\s*17\s*pro\s*max/i, min: 340000, max: 430000 },
  { match: /iphone\s*17\s*pro/i, min: 290000, max: 370000 },
  { match: /iphone\s*17/i, min: 230000, max: 300000 },
  { match: /iphone\s*16\s*pro\s*max/i, min: 280000, max: 360000 },
  { match: /iphone\s*16\s*pro/i, min: 240000, max: 310000 },
  { match: /iphone\s*16/i, min: 180000, max: 250000 },
  { match: /iphone\s*15\s*pro\s*max/i, min: 220000, max: 290000 },
  { match: /iphone\s*15\s*pro/i, min: 180000, max: 240000 },
  { match: /iphone\s*15/i, min: 140000, max: 190000 },
  { match: /iphone\s*14\s*pro\s*max/i, min: 160000, max: 220000 },
  { match: /iphone\s*14\s*pro/i, min: 130000, max: 180000 },
  { match: /iphone\s*14/i, min: 100000, max: 145000 },
  { match: /iphone\s*13\s*pro\s*max/i, min: 120000, max: 165000 },
  { match: /iphone\s*13\s*pro/i, min: 95000, max: 135000 },
  { match: /iphone\s*13/i, min: 75000, max: 110000 },
  { match: /iphone\s*12/i, min: 45000, max: 80000 },
  { match: /iphone\s*11/i, min: 30000, max: 55000 },
  { match: /iphone\s*x/i, min: 18000, max: 40000 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToThousand(value: number) {
  return Math.max(5000, Math.round(value / 1000) * 1000);
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent health';
  if (score >= 70) return 'Good overall condition';
  if (score >= 50) return 'Fair — service may help';
  if (score >= 35) return 'Weak — repair recommended';
  return 'Low market attractiveness';
}

function baseMarketForModel(modelName: string): { min: number; max: number } {
  const hit = MODEL_BASE_PKR.find((entry) => entry.match.test(modelName));
  return hit ? { min: hit.min, max: hit.max } : { min: 40000, max: 90000 };
}

function toggleListItem<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id];
}

export function toggleBodyFlag(flags: BodyFlag[], id: BodyFlag): BodyFlag[] {
  return toggleListItem(flags, id);
}

export function toggleChangedPart(parts: ChangedPart[], id: ChangedPart): ChangedPart[] {
  return toggleListItem(parts, id);
}

export function buildRuleBasedEstimate(input: {
  modelName: string;
  issueName?: string;
  issueDetail?: string;
  condition: DeviceConditionInput;
}): DeviceEstimate {
  const c = input.condition;
  const screen = SCREEN_SCORE[c.screenCondition];
  const battery = clamp(c.batteryHealthPercent, 0, 100);
  const overall = clamp(c.overallOutOf10, 1, 10) * 10;
  let score = Math.round(screen * 0.28 + battery * 0.32 + overall * 0.3 + 10);
  score += OWNERSHIP_BOOST[c.ownership];
  score -= Math.min(20, Math.max(0, c.ageYears) * 3);
  if (c.bodyFlags.includes('scratches')) score -= 4;
  if (c.bodyFlags.includes('side_rough')) score -= 5;
  if (c.bodyFlags.includes('body_changed')) score -= 6;
  if (c.bodyFlags.includes('back_glass_changed')) score -= 5;
  score -= Math.min(18, c.partsChanged.length * 4);
  if (input.issueName && /screen|display|glass/i.test(input.issueName)) score -= 10;
  if (input.issueName && /battery/i.test(input.issueName)) score -= 8;
  if (input.issueName && /board|logic|dead|water/i.test(`${input.issueName} ${input.issueDetail || ''}`)) {
    score -= 14;
  }
  score = clamp(score, 8, 98);

  const base = baseMarketForModel(input.modelName);
  const factor = 0.35 + (score / 100) * 0.65;
  let min = roundToThousand(base.min * factor);
  let max = roundToThousand(base.max * factor);
  if (c.ownership === 'box_pack') {
    min = roundToThousand(min * 1.06);
    max = roundToThousand(max * 1.08);
  }
  if (c.ownership === 'non_active') {
    min = roundToThousand(min * 0.82);
    max = roundToThousand(max * 0.88);
  }
  if (max < min) max = min + 5000;

  const suggestions: string[] = [];
  const buySuggestions: string[] = [];

  if (c.screenCondition !== 'all_neat') {
    suggestions.push('Screen wear is reducing resale confidence — a clean display or stronger protector helps.');
    buySuggestions.push('Tempered glass / screen protector');
  }
  if (c.bodyFlags.includes('scratches') || c.bodyFlags.includes('side_rough')) {
    suggestions.push('Body wear is visible — a clean case and polish can help presentation for buyers.');
    buySuggestions.push('Protective case');
  }
  if (battery < 85 || c.partsChanged.includes('battery')) {
    suggestions.push(`Battery story matters — health at ${battery}% should be shared honestly with buyers.`);
    buySuggestions.push('Battery service / power bank');
  }
  if (c.partsChanged.length) {
    suggestions.push('Replaced parts are fine if disclosed — keep service proof for glass/body/camera/battery.');
  }
  if (c.ownership === 'non_active') {
    suggestions.push('Non-active status lowers market trust — verify IMEI / network status before selling.');
  }
  if (score < 55) {
    suggestions.push('Repair before selling usually recovers more value than selling as-is.');
    buySuggestions.push('Doorstep repair booking');
  } else {
    suggestions.push('Keep box, charger and bill notes ready — complete set helps Pakistan market offers.');
    buySuggestions.push('Original-style charger / cable');
  }
  return {
    score,
    scoreLabel: scoreLabel(score),
    marketValueMinPkr: min,
    marketValueMaxPkr: max,
    currency: 'PKR',
    summary: `${input.modelName} looks around ${score}/100 for current resale health in Pakistan used-phone market.`,
    suggestions: suggestions.slice(0, 4),
    buySuggestions: buySuggestions.slice(0, 4),
    source: 'rules',
  };
}

export async function estimateDeviceWorth(input: {
  modelName: string;
  colorName?: string;
  issueName?: string;
  issueDetail?: string;
  condition: DeviceConditionInput;
}): Promise<DeviceEstimate> {
  return buildRuleBasedEstimate(input);
}

export function parseConditionPayload(body: unknown): DeviceConditionInput | null {
  if (!body || typeof body !== 'object') return null;
  const raw = body as Record<string, unknown>;
  const screens: ScreenCondition[] = ['all_neat', 'some_scratches', 'many_scratches'];
  const ownerships: OwnershipStatus[] = ['first_owner', 'box_pack', 'used', 'non_active'];
  const bodyIds: BodyFlag[] = ['scratches', 'side_rough', 'body_changed', 'back_glass_changed'];
  const partIds: ChangedPart[] = ['glass', 'battery', 'front_camera', 'back_camera'];
  const screenCondition = String(raw.screenCondition || '');
  const ownership = String(raw.ownership || '');
  if (!screens.includes(screenCondition as ScreenCondition)) return null;
  if (!ownerships.includes(ownership as OwnershipStatus)) return null;
  const overallOutOf10 = Number(raw.overallOutOf10);
  const batteryHealthPercent = Number(raw.batteryHealthPercent);
  const ageYears = Number(raw.ageYears);
  if (!Number.isFinite(overallOutOf10) || !Number.isFinite(batteryHealthPercent)) return null;

  const bodyFlags = Array.isArray(raw.bodyFlags)
    ? raw.bodyFlags.map((entry) => String(entry)).filter((entry): entry is BodyFlag => bodyIds.includes(entry as BodyFlag))
    : [];
  const partsChanged = Array.isArray(raw.partsChanged)
    ? raw.partsChanged
        .map((entry) => String(entry))
        .filter((entry): entry is ChangedPart => partIds.includes(entry as ChangedPart))
    : [];

  return {
    screenCondition: screenCondition as ScreenCondition,
    bodyFlags,
    partsChanged,
    overallOutOf10: clamp(Math.round(overallOutOf10), 1, 10),
    batteryHealthPercent: clamp(Math.round(batteryHealthPercent), 0, 100),
    ageYears: Number.isFinite(ageYears) ? clamp(ageYears, 0, 12) : 1,
    ownership: ownership as OwnershipStatus,
    additionalNote: String(raw.additionalNote || '').trim().slice(0, 500),
  };
}
