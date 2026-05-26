import { ItemDefinition, ItemCode, Seg, SimType } from './types';
import segmentsJson from '../../config/segments.json';

// ── Type helpers ──────────────────────────────────────────────────────────────

type JsonItemDef = {
  code: string;
  name: string;
  icon: string;
  type: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  validate?: string;
  validateMsg?: string;
  suppCategories?: string[];
};

type SegmentsJson = typeof segmentsJson;

// Built-in validators referenced by key in JSON
const VALIDATORS: Record<string, (v: string) => boolean> = {
  phone_kr: (v) => /^01[0-9]-?\d{3,4}-?\d{4}$/.test(v),
};

function jsonToItemDef(raw: JsonItemDef): ItemDefinition {
  const def: ItemDefinition = {
    code: raw.code as ItemCode,
    name: raw.name,
    icon: raw.icon,
    type: raw.type as ItemDefinition['type'],
    hint: raw.hint,
    placeholder: raw.placeholder,
    options: raw.options,
    suppCategories: raw.suppCategories,
  };
  if (raw.validate && VALIDATORS[raw.validate]) {
    def.validate = VALIDATORS[raw.validate];
    def.validateMsg = raw.validateMsg;
  }
  return def;
}

const allDefs = segmentsJson.itemDefinitions as Record<string, JsonItemDef>;
const supplementDefs = segmentsJson.supplementOnlyItems as Record<string, JsonItemDef>;

// ── Public API ─────────────────────────────────────────────────────────────────

export function getItemsForSeg(seg: Seg, simType: SimType): ItemDefinition[] {
  const segConfig = segmentsJson.segments[seg];
  const itemCodes = [
    ...segConfig.commonItems,
    ...(simType === 'esim' ? segConfig.esimItems : segConfig.usimItems),
  ];
  return itemCodes.map((code) => jsonToItemDef(allDefs[code]));
}

export function getSupplementOnlyItem(code: string): ItemDefinition {
  return jsonToItemDef(supplementDefs[code]);
}

export const VISA_CONFIRM_DEF = getSupplementOnlyItem('visa_confirm');

export const SEG_LABELS: Record<Seg, string> = {
  S1: segmentsJson.segments.S1.label,
  S2: segmentsJson.segments.S2.label,
};

export const SIM_LABELS: Record<SimType, string> = {
  esim: 'eSIM (디지털 SIM)',
  usim: 'uSIM (실물 SIM)',
};
