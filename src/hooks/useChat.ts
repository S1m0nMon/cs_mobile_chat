'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { computeCaseStatus } from '@/lib/computeStatus';
import { getItemsForSeg, VISA_CONFIRM_DEF, SEG_LABELS, SIM_LABELS } from '@/lib/segRequirements';
import {
  AuditLog,
  Case,
  CloseReason,
  FileMeta,
  Item,
  ItemCode,
  Message,
  Seg,
  SimType,
} from '@/lib/types';
import { DEMO_STUDENTS, generateId, nowStr } from '@/lib/utils';

const WAIT_TIMER_MS = 60 * 1000; // 1 minute

function buildInitialItems(seg: Seg, simType: SimType): Item[] {
  return getItemsForSeg(seg, simType).map((def) => ({
    ...def,
    state: 'empty' as const,
    value: null,
    file: null,
    suppReason: null,
  }));
}

function buildNewCase(seg: Seg, simType: SimType, counter: number): Case {
  // Use counter % length for deterministic student selection (no Math.random during SSR)
  const student = DEMO_STUDENTS[counter % DEMO_STUDENTS.length];
  return {
    id: `C-2026-${String(counter).padStart(5, '0')}`,
    applicationNumber: '',    // set when student enters it on the entry screen
    studentName: student.name,
    studentSchool: student.school,
    studentCountry: student.country,
    seg,
    simType,
    status: null,
    closed: false,
    rounds: 0,
    items: buildInitialItems(seg, simType),
    queueEnteredAt: '—',      // set on client via useEffect
    assignedOperator: 'OP-001 (김지수)',
    createdAt: '—',
  };
}

export function useChat(initialSeg: Seg = 'S1', initialSimType: SimType = 'esim') {
  // per-instance counter in ref — avoids module-level state mismatch between SSR/CSR
  const counterRef = useRef(1);

  const [chatCase, setChatCase] = useState<Case>(() => {
    // counter=1 here is deterministic — same value on server and client
    const c = buildNewCase(initialSeg, initialSimType, 1);
    return { ...c, status: computeCaseStatus(c.items) };
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [waitTimerActive, setWaitTimerActive] = useState(false);

  // ── Client-only init (fix SSR hydration mismatch) ─────────────────────────
  // Timestamps are set on the client after mount. Welcome messages are NOT sent
  // here — they fire when the student enters their application number.
  useEffect(() => {
    const t = nowStr();
    setChatCase((prev) => ({ ...prev, queueEnteredAt: t, createdAt: t }));
    setAuditLogs([
      { id: generateId('AL'), action: 'case.created', actorRole: 'system', text: `케이스 생성 · 신청번호 입력 대기`, createdAt: t },
    ]);
    // mounted — no welcome messages yet; fires when student submits application number
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addAudit = useCallback(
    (action: AuditLog['action'], text: string, actorRole: AuditLog['actorRole'] = 'operator', payload?: Record<string, unknown>) => {
      setAuditLogs((prev) => [
        { id: generateId('AL'), action, actorRole, text, payload, createdAt: nowStr() },
        ...prev,
      ]);
    },
    []
  );

  const pushMessage = useCallback((msg: Omit<Message, 'id' | 'createdAt'>) => {
    const full: Message = { ...msg, id: generateId('M'), createdAt: nowStr() };
    setMessages((prev) => [...prev, full]);
    return full;
  }, []);

  const pushSystemMessage = useCallback(
    (text: string, isWarn = false) => pushMessage({ role: 'system', type: 'system', text, isWarn }),
    [pushMessage]
  );

  // ── Wait timer ──────────────────────────────────────────────────────────────

  const stopWaitTimer = useCallback(() => {
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    waitTimerRef.current = null;
    setWaitTimerActive(false);
  }, []);

  const startWaitTimer = useCallback(() => {
    stopWaitTimer();
    setWaitTimerActive(true);
    waitTimerRef.current = setTimeout(() => {
      setWaitTimerActive(false);
      setChatCase((prev) => {
        if (prev.closed) return prev;
        setMessages((msgs) => [
          ...msgs,
          {
            id: generateId('M'),
            role: 'bot',
            type: 'text',
            text: '⏳ 곧 응대 예정입니다. 잠시만 기다려주세요.',
            createdAt: nowStr(),
          },
        ]);
        addAudit('wait_timer.fired', '1분 무응답 자동 안내 메시지 발송', 'system');
        return prev;
      });
    }, WAIT_TIMER_MS);
  }, [stopWaitTimer, addAudit]);

  // ── Case reset ──────────────────────────────────────────────────────────────

  const resetCase = useCallback(
    (seg: Seg, simType: SimType) => {
      stopWaitTimer();
      counterRef.current += 1;
      const t = nowStr();
      const fresh = buildNewCase(seg, simType, counterRef.current);
      const initStatus = computeCaseStatus(fresh.items);
      // applicationNumber is '' in fresh — student will enter it on the entry screen
      setChatCase({ ...fresh, status: initStatus, queueEnteredAt: t, createdAt: t });
      setMessages([]);
      setAuditLogs([
        { id: generateId('AL'), action: 'case.created', actorRole: 'system', text: `케이스 생성 · 신청번호 입력 대기 · ${fresh.id}`, createdAt: t },
      ]);
      // No welcome messages — fires when student enters application number
    },
    [stopWaitTimer]
  );

  // ── Student actions ─────────────────────────────────────────────────────────

  /** Called when the student submits their application number on the entry screen. */
  const studentEnterApplicationNumber = useCallback(
    (appNum: string) => {
      const trimmed = appNum.trim().toUpperCase();
      if (!trimmed) return;
      setChatCase((prev) => {
        if (prev.applicationNumber) return prev; // guard — already entered
        addAudit('case.application_entered', `신청번호 입력: ${trimmed} · 채팅 시작`, 'student', { applicationNumber: trimmed });
        setTimeout(() => {
          setMessages([
            {
              id: generateId('M'),
              role: 'bot',
              type: 'text',
              text: `안녕하세요! 👋\n신청번호 ${trimmed}가 확인되었습니다.\n잠시 후 담당 오퍼레이터가 필요 서류를 안내해드릴게요.`,
              createdAt: nowStr(),
            },
            {
              id: generateId('M'),
              role: 'system',
              type: 'system',
              text: `신청번호 ${trimmed} 인증 완료 · 오퍼레이터 배정 대기`,
              createdAt: nowStr(),
            },
          ]);
          startWaitTimer();
        }, 300);
        return { ...prev, applicationNumber: trimmed };
      });
    },
    [addAudit, startWaitTimer]
  );

  const studentSubmitItem = useCallback(
    (code: ItemCode, payload: { value?: string; file?: FileMeta }) => {
      setChatCase((prev) => {
        if (prev.closed) return prev;
        const items = prev.items.map((item) => {
          if (item.code !== code) return item;
          const wasSupp = item.state === 'supp_requested';
          return {
            ...item,
            state: (wasSupp ? 'resubmitted' : 'submitted') as Item['state'],
            value: payload.value !== undefined ? payload.value : item.value,
            file: payload.file !== undefined ? payload.file : item.file,
            suppReason: wasSupp ? null : item.suppReason,
            lastUpdatedAt: nowStr(),
            submittedAt: item.submittedAt ?? nowStr(),
          };
        });

        const updatedItem = items.find((i) => i.code === code)!;
        const isResubmit = updatedItem.state === 'resubmitted';

        setMessages((msgs) => [
          ...msgs,
          { id: generateId('M'), role: 'system', type: 'system', text: `📤 ${updatedItem.name} ${isResubmit ? '재제출됨' : '제출됨'}`, createdAt: nowStr() },
        ]);
        addAudit(isResubmit ? 'item.resubmitted' : 'item.submitted', `학생: ${updatedItem.name} ${isResubmit ? '재제출' : '제출'}`, 'student');

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          addAudit('case.status_changed', `Status ${prev.status ?? '초기'} → ${newStatus}`, 'system', { from: prev.status, to: newStatus });
        }
        return { ...prev, items, status: newStatus };
      });
      startWaitTimer();
    },
    [startWaitTimer, addAudit]
  );

  const studentSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushMessage({ role: 'student', type: 'text', text: text.trim() });
      addAudit('message.sent', '학생 메시지 전송', 'student');
      startWaitTimer();
    },
    [pushMessage, addAudit, startWaitTimer]
  );

  // ── Operator actions ────────────────────────────────────────────────────────

  const operatorSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushMessage({ role: 'operator', type: 'text', text: text.trim() });
      addAudit('message.sent', '오퍼레이터 메시지 전송');
      stopWaitTimer();
    },
    [pushMessage, addAudit, stopWaitTimer]
  );

  const operatorRequestSupplement = useCallback(
    (code: ItemCode, category: string, detail?: string) => {
      const reason = detail ? `${category} · ${detail}` : category;
      setChatCase((prev) => {
        if (prev.closed) return prev;
        const items = prev.items.map((item) =>
          item.code === code
            ? { ...item, state: 'supp_requested' as const, suppReason: reason, lastUpdatedAt: nowStr() }
            : item
        );
        const suppItem = items.find((i) => i.code === code)!;
        const newRounds = prev.rounds + 1;

        setMessages((msgs) => [
          ...msgs,
          {
            id: generateId('M'),
            role: 'operator',
            type: 'template',
            templateItemCode: code,
            templateCategory: category,
            templateDetail: detail,
            text: `[보완 요청] ${suppItem.name}\n${reason}`,
            createdAt: nowStr(),
          },
        ]);
        addAudit('item.supp_requested', `📨 보완 요청 (라운드 ${newRounds}): ${suppItem.name} · ${reason}`, 'operator', { itemCode: code, round: newRounds });

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          addAudit('case.status_changed', `Status ${prev.status} → ${newStatus}`, 'system');
        }
        return { ...prev, items, rounds: newRounds, status: newStatus };
      });
      stopWaitTimer();
    },
    [addAudit, stopWaitTimer]
  );

  const operatorApproveItem = useCallback(
    (code: ItemCode) => {
      setChatCase((prev) => {
        if (prev.closed) return prev;
        const items = prev.items.map((item) =>
          item.code === code ? { ...item, state: 'approved' as const, lastUpdatedAt: nowStr() } : item
        );
        const approvedItem = items.find((i) => i.code === code)!;

        setMessages((msgs) => [
          ...msgs,
          { id: generateId('M'), role: 'system', type: 'system', text: `✅ ${approvedItem.name} 승인됨`, createdAt: nowStr() },
        ]);
        addAudit('item.approved', `✅ 항목 승인: ${approvedItem.name}`);

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          addAudit('case.status_changed', `Status ${prev.status} → ${newStatus}`, 'system');
        }
        return { ...prev, items, status: newStatus };
      });
    },
    [addAudit]
  );

  /** Operator adds 사증발급확인서 to the case — only if not already present */
  const operatorAddVisaConfirm = useCallback(() => {
    setChatCase((prev) => {
      if (prev.closed) return prev;
      if (prev.items.some((i) => i.code === 'visa_confirm')) return prev; // already added

      const newItem: Item = {
        ...VISA_CONFIRM_DEF,
        state: 'empty',
        value: null,
        file: null,
        suppReason: null,
        operatorAdded: true,
      };
      const items = [...prev.items, newItem];

      setMessages((msgs) => [
        ...msgs,
        {
          id: generateId('M'),
          role: 'operator',
          type: 'template',
          templateItemCode: 'visa_confirm',
          templateCategory: '추가 서류 요청',
          text: `[추가 서류 요청] 사증발급확인서\n자사에서 확보하지 못한 관계로 사증발급확인서 제출을 요청드립니다.`,
          createdAt: nowStr(),
        },
      ]);
      addAudit('case.item_added', '오퍼레이터: 사증발급확인서 항목 추가 및 요청', 'operator');

      const newStatus = computeCaseStatus(items);
      return { ...prev, items, status: newStatus };
    });
    stopWaitTimer();
  }, [addAudit, stopWaitTimer]);

  const operatorChangeSeg = useCallback(
    (newSeg: Seg, newSimType?: SimType) => {
      setChatCase((prev) => {
        if (prev.closed || (prev.seg === newSeg && (!newSimType || prev.simType === newSimType))) return prev;
        const resolvedSimType = newSimType ?? prev.simType;
        const oldLabel = `${SEG_LABELS[prev.seg]} · ${SIM_LABELS[prev.simType]}`;
        const newLabel = `${SEG_LABELS[newSeg]} · ${SIM_LABELS[resolvedSimType]}`;

        const newDefs = getItemsForSeg(newSeg, resolvedSimType);
        const newItems: Item[] = newDefs.map((def) => {
          const existing = prev.items.find((i) => i.code === def.code);
          if (existing) return { ...def, state: existing.state, value: existing.value, file: existing.file, suppReason: existing.suppReason };
          return { ...def, state: 'empty' as const, value: null, file: null, suppReason: null };
        });

        // Preserve operator-added items (e.g. visa_confirm)
        const opAddedItems = prev.items.filter((i) => i.operatorAdded && !newItems.find((n) => n.code === i.code));
        const finalItems = [...newItems, ...opAddedItems];

        addAudit('case.seg_changed', `Seg 수동 변경: ${oldLabel} → ${newLabel}`, 'operator', { from: prev.seg, to: newSeg });
        const newStatus = computeCaseStatus(finalItems);
        return { ...prev, seg: newSeg, simType: resolvedSimType, items: finalItems, status: newStatus };
      });
    },
    [addAudit]
  );

  const operatorCloseChat = useCallback(
    (reason: CloseReason, memo?: string) => {
      setChatCase((prev) => {
        if (prev.closed || prev.status !== 'D') return prev;
        setMessages((msgs) => [
          ...msgs,
          {
            id: generateId('M'),
            role: 'system',
            type: 'system',
            text: `채팅이 종료되었습니다 (${reason}).${reason === '개통완료' ? ' 🎉' : ''}`,
            createdAt: nowStr(),
          },
        ]);
        addAudit('case.closed', `🔒 채팅 종료 · 사유: ${reason}${memo ? ' · ' + memo : ''}`, 'operator', { reason, memo });
        return { ...prev, closed: true, closeReason: reason, closeMemo: memo, closedAt: nowStr() };
      });
      stopWaitTimer();
    },
    [addAudit, stopWaitTimer]
  );

  return {
    chatCase,
    messages,
    auditLogs,
    waitTimerActive,
    resetCase,
    studentEnterApplicationNumber,
    studentSubmitItem,
    studentSendMessage,
    operatorSendMessage,
    operatorRequestSupplement,
    operatorApproveItem,
    operatorAddVisaConfirm,
    operatorChangeSeg,
    operatorCloseChat,
    stopWaitTimer,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
