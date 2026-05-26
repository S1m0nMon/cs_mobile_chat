import { CaseStatus, Item } from './types';

/**
 * PRD §6.2 — deterministic derivation of CaseStatus from item states.
 * Priority: D > B > C > A
 */
export function computeCaseStatus(items: Item[]): CaseStatus | null {
  if (items.length === 0) return null;
  if (items.every((i) => i.state === 'approved')) return 'D';
  if (items.some((i) => i.state === 'supp_requested')) return 'B';
  if (items.some((i) => i.state === 'resubmitted')) return 'C';
  return 'A';
}

export const STATUS_LABELS: Record<string, string> = {
  A: '검토 중',
  B: '보완 요청 중',
  C: '재제출됨',
  D: '서류 승인 완료',
};

export const STATUS_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-amber-100 text-amber-700',
  C: 'bg-purple-100 text-purple-700',
  D: 'bg-emerald-100 text-emerald-700',
};
