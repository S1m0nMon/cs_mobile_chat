// ===================================================
// Chat System Types — PRD Chat Feature v0.1
// ===================================================

export type Seg = 'S1' | 'S2';
export type SimType = 'esim' | 'usim';

/** A/B/C/D — derived from item states (never stored as truth) */
export type CaseStatus = 'A' | 'B' | 'C' | 'D';

export type CloseReason =
  | '개통완료'
  | '개통취소-고객요청'
  | '개통취소-서류미비'
  | '기타';

export type ItemType = 'file' | 'text' | 'date' | 'select';

export type ItemState =
  | 'empty'           // 미제출
  | 'submitted'       // 제출됨 (검토 대기)
  | 'supp_requested'  // 보완 요청 중 (학생 재제출 대기)
  | 'resubmitted'     // 재제출됨 (재검토 대기)
  | 'approved';       // 승인 완료 (잠금)

export type ItemCode =
  | 'passport_scan'     // 여권 양면 평판 스캔본
  | 'device_info'       // 기기정보 캡처본 (eSIM)
  | 'sim_photo'         // 유심 사진 (uSIM)
  | 'current_carrier'   // 기존 통신사 (S2)
  | 'current_number'    // 기존 전화번호 (S2)
  | 'visa_confirm';     // 사증발급확인서 (오퍼레이터 요청 시만)

export interface ItemDefinition {
  code: ItemCode;
  name: string;
  icon: string;
  type: ItemType;
  hint?: string;
  placeholder?: string;
  options?: string[];
  validate?: (v: string) => boolean;
  validateMsg?: string;
  suppCategories?: string[];
}

export interface FileMeta {
  id: string;
  name: string;
  kind: 'image' | 'pdf' | 'file';
  size: string;
  url: string;
  uploadedAt: string;
}

export interface Item extends ItemDefinition {
  state: ItemState;
  value: string | null;
  file: FileMeta | null;
  suppReason: string | null;
  submittedAt?: string;
  lastUpdatedAt?: string;
  /** true = added by operator (e.g. visa_confirm), not part of initial Seg requirements */
  operatorAdded?: boolean;
}

export type MessageType = 'text' | 'system' | 'template' | 'file';
export type MessageRole = 'student' | 'operator' | 'bot' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  text?: string;
  file?: FileMeta;
  templateItemCode?: ItemCode;
  templateCategory?: string;
  templateDetail?: string;
  isWarn?: boolean;
  createdAt: string;
}

export type AuditAction =
  | 'case.created'
  | 'case.seg_assigned'
  | 'case.seg_changed'
  | 'case.status_changed'
  | 'case.closed'
  | 'case.item_added'
  | 'item.submitted'
  | 'item.resubmitted'
  | 'item.supp_requested'
  | 'item.approved'
  | 'message.sent'
  | 'wait_timer.fired';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actorRole: 'student' | 'operator' | 'system' | 'supervisor';
  text: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface Case {
  id: string;
  studentName: string;
  studentSchool: string;
  studentCountry: string;
  seg: Seg;
  simType: SimType;
  status: CaseStatus | null;
  closed: boolean;
  closeReason?: CloseReason;
  closeMemo?: string;
  closedAt?: string;
  rounds: number;
  items: Item[];
  queueEnteredAt: string;
  assignedOperator: string;
  createdAt: string;
}
