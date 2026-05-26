import { ItemCode } from './types';
import segmentsJson from '../../config/segments.json';

type JsonItemDef = { suppCategories?: string[] };

const allDefs: Record<string, JsonItemDef> = {
  ...segmentsJson.itemDefinitions,
  ...segmentsJson.supplementOnlyItems,
};

/**
 * Returns supplement request categories for the given item code.
 * Falls back to an empty array if none defined.
 */
export function getSuppCategories(code: ItemCode): string[] {
  return allDefs[code]?.suppCategories ?? [];
}
