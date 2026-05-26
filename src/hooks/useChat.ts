'use client';

import { useCallback, useRef, useState } from 'react';
import { computeCaseStatus } from '@/lib/computeStatus';
import { SEG_REQUIREMENTS } from '@/lib/segRequirements';
import { SUPP_CATEGORIES } from '@/lib/suppCategories';
import {
  AuditLog,
  Case,
  CaseStatus,
  CloseReason,
  FileMeta,
  Item,
  ItemCode,
  Message,
  Seg,
} from '@/lib/types';
import { DEMO_STUDENTS, generateId, nowStr } from '@/lib/utils';

const WAIT_TIMER_MS = 60 * 1000; // 1 minute

let caseCounter = 0;

function buildInitialItems(seg: Seg): Item[] {
  return SEG_REQUIREMENTS[seg].map((def) => ({
    ...def,
    state: 'empty' as const,
    value: null,
    file: null,
    suppReason: null,
  }));
}

function buildNewCase(seg: Seg): Case {
  caseCounter++;
  const student = DEMO_STUDENTS[Math.floor(Math.random() * DEMO_STUDENTS.length)];
  return {
    id: `C-2026-${String(caseCounter).padStart(5, '0')}`,
    studentName: student.name,
    studentSchool: student.school,
    studentCountry: student.country,
    seg,
    status: null,
    closed: false,
    rounds: 0,
    items: buildInitialItems(seg),
    queueEnteredAt: nowStr(),
    assignedOperator: 'OP-001 (김지수)',
    createdAt: nowStr(),
  };
}

export function useChat(initialSeg: Seg = 'S1') {
  const [chatCase, setChatCase] = useState<Case>(() => buildNewCase(initialSeg));
  const [messages, setMessages] = useState<Message[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [waitTimerActive, setWaitTimerActive] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addAudit = useCallback(
    (action: AuditLog['action'], text: string, payload?: Record<string, unknown>) => {
      setAuditLogs((prev) => [
        {
          id: generateId('AL'),
          action,
          actorRole: 'operator',
          text,
          payload,
          createdAt: nowStr(),
        },
        ...prev,
      ]);
    },
    []
  );

  const addSystemAudit = useCallback(
    (action: AuditLog['action'], text: string, payload?: Record<string, unknown>) => {
      setAuditLogs((prev) => [
        {
          id: generateId('AL'),
          action,
          actorRole: 'system',
          text,
          payload,
          createdAt: nowStr(),
        },
        ...prev,
      ]);
    },
    []
  );

  const pushMessage = useCallback(
    (msg: Omit<Message, 'id' | 'createdAt'>) => {
      const full: Message = { ...msg, id: generateId('M'), createdAt: nowStr() };
      setMessages((prev) => [...prev, full]);
      return full;
    },
    []
  );

  const pushSystemMessage = useCallback(
    (text: string, isWarn = false) => {
      return pushMessage({ role: 'system', type: 'system', text, isWarn });
    },
    [pushMessage]
  );

  // ── Wait timer ──────────────────────────────────────────────────────────────

  const stopWaitTimer = useCallback(() => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
    setWaitTimerActive(false);
  }, []);

  const startWaitTimer = useCallback(() => {
    stopWaitTimer();
    setWaitTimerActive(true);
    waitTimerRef.current = setTimeout(() => {
      setWaitTimerActive(false);
      setChatCase((prev) => {
        if (prev.closed) return prev;
        // fire timer — push auto message
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
        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: 'wait_timer.fired',
            actorRole: 'system',
            text: '1분 무응답 자동 안내 메시지 발송',
            createdAt: nowStr(),
          },
          ...logs,
        ]);
        return prev;
      });
    }, WAIT_TIMER_MS);
  }, [stopWaitTimer]);

  // ── Status recompute ────────────────────────────────────────────────────────

  const recomputeStatus = useCallback(
    (items: Item[], currentStatus: CaseStatus | null, triggerLabel: string) => {
      const newStatus = computeCaseStatus(items);
      if (newStatus !== currentStatus) {
        addSystemAudit('case.status_changed', `Status ${currentStatus ?? '초기'} → ${newStatus} (${triggerLabel})`, {
          from: currentStatus,
          to: newStatus,
          trigger: triggerLabel,
        });
      }
      return newStatus;
    },
    [addSystemAudit]
  );

  // ── Case reset ──────────────────────────────────────────────────────────────

  const resetCase = useCallback(
    (seg: Seg) => {
      stopWaitTimer();
      const fresh = buildNewCase(seg);
      setChatCase(fresh);
      setMessages([]);
      setAuditLogs([
        {
          id: generateId('AL'),
          action: 'case.created',
          actorRole: 'system',
          text: `케이스 생성 · Seg ${seg} 자동 부여`,
          createdAt: nowStr(),
        },
        {
          id: generateId('AL'),
          action: 'case.seg_assigned',
          actorRole: 'system',
          text: `Seg 자동 부여: ${seg} (신청 완료 시 자동)`,
          createdAt: nowStr(),
        },
      ]);
      // Initial status
      const initItems = buildInitialItems(seg);
      const initStatus = computeCaseStatus(initItems);
      setChatCase((prev) => ({ ...prev, status: initStatus }));

      // Welcome bot message
      setTimeout(() => {
        setMessages([
          {
            id: generateId('M'),
            role: 'bot',
            type: 'text',
            text: `안녕하세요 ${fresh.studentName}님! 👋\n모바일 개통 신청이 접수되었습니다.\n담당 오퍼레이터가 서류를 검토 중입니다. 잠시만 기다려주세요.`,
            createdAt: nowStr(),
          },
          {
            id: generateId('M'),
            role: 'system',
            type: 'system',
            text: `Seg ${seg} 자동 분류 완료 · 큐 진입`,
            createdAt: nowStr(),
          },
        ]);
        startWaitTimer();
      }, 300);
    },
    [stopWaitTimer, startWaitTimer]
  );

  // ── Student actions ─────────────────────────────────────────────────────────

  const studentSubmitItem = useCallback(
    (code: ItemCode, payload: { value?: string; file?: FileMeta }) => {
      setChatCase((prev) => {
        if (prev.closed) return prev;
        const items = prev.items.map((item) => {
          if (item.code !== code) return item;
          const wasSupp = item.state === 'supp_requested';
          const newState = wasSupp ? ('resubmitted' as const) : ('submitted' as const);
          return {
            ...item,
            state: newState,
            value: payload.value !== undefined ? payload.value : item.value,
            file: payload.file !== undefined ? payload.file : item.file,
            suppReason: wasSupp ? null : item.suppReason,
            lastUpdatedAt: nowStr(),
            submittedAt: item.submittedAt ?? nowStr(),
          };
        });

        const updatedItem = items.find((i) => i.code === code)!;
        const isResubmit = updatedItem.state === 'resubmitted';

        // push system message
        setMessages((msgs) => [
          ...msgs,
          {
            id: generateId('M'),
            role: 'system',
            type: 'system',
            text: `📤 ${updatedItem.name} ${isResubmit ? '재제출됨' : '제출됨'}`,
            createdAt: nowStr(),
          },
        ]);

        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: isResubmit ? 'item.resubmitted' : 'item.submitted',
            actorRole: 'student',
            text: `학생: ${updatedItem.name} ${isResubmit ? '재제출' : '제출'}`,
            createdAt: nowStr(),
          },
          ...logs,
        ]);

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          setAuditLogs((logs) => [
            {
              id: generateId('AL'),
              action: 'case.status_changed',
              actorRole: 'system',
              text: `Status ${prev.status ?? '초기'} → ${newStatus}`,
              createdAt: nowStr(),
            },
            ...logs,
          ]);
        }
        return { ...prev, items, status: newStatus };
      });
      startWaitTimer();
    },
    [startWaitTimer]
  );

  const studentSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushMessage({ role: 'student', type: 'text', text: text.trim() });
      addAudit('message.sent', `학생 메시지 전송 (자유 채팅)`);
      startWaitTimer();
    },
    [pushMessage, addAudit, startWaitTimer]
  );

  // ── Operator actions ────────────────────────────────────────────────────────

  const operatorSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      pushMessage({ role: 'operator', type: 'text', text: text.trim() });
      addAudit('message.sent', `오퍼레이터 메시지 전송`);
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

        // template message
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

        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: 'item.supp_requested',
            actorRole: 'operator',
            text: `📨 보완 요청 (라운드 ${newRounds}): ${suppItem.name} · ${reason}`,
            payload: { itemCode: code, category, detail, round: newRounds },
            createdAt: nowStr(),
          },
          ...logs,
        ]);

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          setAuditLogs((logs) => [
            {
              id: generateId('AL'),
              action: 'case.status_changed',
              actorRole: 'system',
              text: `Status ${prev.status} → ${newStatus}`,
              createdAt: nowStr(),
            },
            ...logs,
          ]);
        }
        return { ...prev, items, rounds: newRounds, status: newStatus };
      });
      stopWaitTimer();
    },
    [stopWaitTimer]
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
          {
            id: generateId('M'),
            role: 'system',
            type: 'system',
            text: `✅ ${approvedItem.name} 승인됨`,
            createdAt: nowStr(),
          },
        ]);

        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: 'item.approved',
            actorRole: 'operator',
            text: `✅ 항목 승인: ${approvedItem.name}`,
            createdAt: nowStr(),
          },
          ...logs,
        ]);

        const newStatus = computeCaseStatus(items);
        if (newStatus !== prev.status) {
          setAuditLogs((logs) => [
            {
              id: generateId('AL'),
              action: 'case.status_changed',
              actorRole: 'system',
              text: `Status ${prev.status} → ${newStatus}`,
              createdAt: nowStr(),
            },
            ...logs,
          ]);
        }
        return { ...prev, items, status: newStatus };
      });
    },
    []
  );

  const operatorChangeSeg = useCallback(
    (newSeg: Seg, reason?: string) => {
      setChatCase((prev) => {
        if (prev.closed || prev.seg === newSeg) return prev;
        const oldSeg = prev.seg;
        const newDefs = SEG_REQUIREMENTS[newSeg];
        const newItems: Item[] = newDefs.map((def) => {
          const existing = prev.items.find((i) => i.code === def.code);
          if (existing) {
            return { ...def, state: existing.state, value: existing.value, file: existing.file, suppReason: existing.suppReason };
          }
          return { ...def, state: 'empty' as const, value: null, file: null, suppReason: null };
        });

        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: 'case.seg_changed',
            actorRole: 'operator',
            text: `Seg 수동 변경: ${oldSeg} → ${newSeg}${reason ? ' · ' + reason : ''}`,
            payload: { from: oldSeg, to: newSeg, reason },
            createdAt: nowStr(),
          },
          ...logs,
        ]);

        const newStatus = computeCaseStatus(newItems);
        return { ...prev, seg: newSeg, items: newItems, status: newStatus };
      });
    },
    []
  );

  const operatorCloseChat = useCallback(
    (reason: CloseReason, memo?: string) => {
      setChatCase((prev) => {
        if (prev.closed || prev.status !== 'D') return prev;
        const updated = { ...prev, closed: true, closeReason: reason, closeMemo: memo, closedAt: nowStr() };
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
        setAuditLogs((logs) => [
          {
            id: generateId('AL'),
            action: 'case.closed',
            actorRole: 'operator',
            text: `🔒 채팅 종료 · 사유: ${reason}${memo ? ' · ' + memo : ''}`,
            payload: { reason, memo },
            createdAt: nowStr(),
          },
          ...logs,
        ]);
        return updated;
      });
      stopWaitTimer();
    },
    [stopWaitTimer]
  );

  return {
    chatCase,
    messages,
    auditLogs,
    waitTimerActive,
    // actions
    resetCase,
    studentSubmitItem,
    studentSendMessage,
    operatorSendMessage,
    operatorRequestSupplement,
    operatorApproveItem,
    operatorChangeSeg,
    operatorCloseChat,
    stopWaitTimer,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
