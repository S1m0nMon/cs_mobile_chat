'use client';

import { useState } from 'react';
import StudentView from '@/components/chat/StudentView';
import OperatorView from '@/components/chat/OperatorView';
import ApplicationEntryView from '@/components/chat/ApplicationEntryView';
import { useChat } from '@/hooks/useChat';
import { Seg, SimType } from '@/lib/types';
import { SEG_LABELS, SIM_LABELS } from '@/lib/segRequirements';

const SEGS: Seg[] = ['S1', 'S2'];
const SIM_TYPES: SimType[] = ['esim', 'usim'];

export default function ChatPage() {
  const [view, setView] = useState<'split' | 'student' | 'operator'>('split');
  const [pendingSeg, setPendingSeg] = useState<Seg>('S1');
  const [pendingSimType, setPendingSimType] = useState<SimType>('esim');

  const {
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
  } = useChat('S1', 'esim');

  const handleNewCase = () => {
    resetCase(pendingSeg, pendingSimType);
  };

  const segColor = (seg: Seg) =>
    seg === 'S1'
      ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
      : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100';
  const segActiveColor = (seg: Seg) =>
    seg === pendingSeg
      ? seg === 'S1' ? 'ring-2 ring-blue-400' : 'ring-2 ring-amber-400'
      : '';
  const simColor = (sim: SimType) =>
    sim === 'esim'
      ? 'border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100'
      : 'border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100';
  const simActiveColor = (sim: SimType) =>
    sim === pendingSimType
      ? sim === 'esim' ? 'ring-2 ring-violet-400' : 'ring-2 ring-teal-400'
      : '';

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-[15px] font-bold text-gray-800">채팅 시스템 Beta</h1>
          <p className="text-[11px] text-gray-400">PRD Chat Feature v0.1 · 항목별 1:1 매칭 · Status A/B/C/D 자동 계산</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* New case controls */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-400 font-medium">새 케이스</span>
            <div className="flex gap-1">
              {SEGS.map((seg) => (
                <button
                  key={seg}
                  onClick={() => setPendingSeg(seg)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${segColor(seg)} ${segActiveColor(seg)}`}
                >
                  {SEG_LABELS[seg]}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex gap-1">
              {SIM_TYPES.map((sim) => (
                <button
                  key={sim}
                  onClick={() => setPendingSimType(sim)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${simColor(sim)} ${simActiveColor(sim)}`}
                >
                  {SIM_LABELS[sim]}
                </button>
              ))}
            </div>
            <button
              onClick={handleNewCase}
              className="text-xs px-3 py-1 rounded-lg bg-[#1F4E79] text-white font-semibold hover:bg-[#163a5c] transition-colors ml-1"
            >
              시작
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['split', 'student', 'operator'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'split' ? '양쪽 보기' : v === 'student' ? '📱 학생' : '💻 오퍼레이터'}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Active case badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-mono">{chatCase.id}</span>
            {chatCase.closed ? (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">종료</span>
            ) : chatCase.status ? (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Status {chatCase.status}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {view === 'split' && (
          <div className="h-full grid grid-cols-[1fr_1.4fr] gap-px bg-gray-200">
            {/* Student panel */}
            <div className="bg-gray-50 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-500">📱 학생 시점</span>
                {chatCase.applicationNumber ? (
                  <span className="text-[11px] text-gray-400 font-mono">{chatCase.applicationNumber}</span>
                ) : (
                  <span className="text-[11px] text-amber-500 font-medium">신청번호 입력 대기</span>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {chatCase.applicationNumber ? (
                  <div className="h-full p-3">
                    <StudentView
                      chatCase={chatCase}
                      messages={messages}
                      onSubmitItem={studentSubmitItem}
                      onSendMessage={studentSendMessage}
                      waitTimerActive={waitTimerActive}
                    />
                  </div>
                ) : (
                  <ApplicationEntryView onSubmit={studentEnterApplicationNumber} />
                )}
              </div>
            </div>
            {/* Operator panel */}
            <div className="bg-gray-50 flex flex-col overflow-hidden">
              <OperatorView
                chatCase={chatCase}
                messages={messages}
                auditLogs={auditLogs}
                waitTimerActive={waitTimerActive}
                onSendMessage={operatorSendMessage}
                onRequestSupplement={operatorRequestSupplement}
                onApproveItem={operatorApproveItem}
                onAddVisaConfirm={operatorAddVisaConfirm}
                onChangeSeg={operatorChangeSeg}
                onCloseChat={operatorCloseChat}
              />
            </div>
          </div>
        )}

        {view === 'student' && (
          <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">📱 학생 시점</span>
              {chatCase.applicationNumber && (
                <span className="text-[11px] text-gray-400 font-mono">{chatCase.applicationNumber}</span>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {chatCase.applicationNumber ? (
                <div className="h-full p-4">
                  <StudentView
                    chatCase={chatCase}
                    messages={messages}
                    onSubmitItem={studentSubmitItem}
                    onSendMessage={studentSendMessage}
                    waitTimerActive={waitTimerActive}
                  />
                </div>
              ) : (
                <ApplicationEntryView onSubmit={studentEnterApplicationNumber} />
              )}
            </div>
          </div>
        )}

        {view === 'operator' && (
          <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            <OperatorView
              chatCase={chatCase}
              messages={messages}
              auditLogs={auditLogs}
              waitTimerActive={waitTimerActive}
              onSendMessage={operatorSendMessage}
              onRequestSupplement={operatorRequestSupplement}
              onApproveItem={operatorApproveItem}
              onAddVisaConfirm={operatorAddVisaConfirm}
              onChangeSeg={operatorChangeSeg}
              onCloseChat={operatorCloseChat}
            />
          </div>
        )}
      </main>
    </div>
  );
}
