'use client';

import { useState } from 'react';
import StudentView from '@/components/chat/StudentView';
import OperatorView from '@/components/chat/OperatorView';
import { useChat } from '@/hooks/useChat';
import { Seg } from '@/lib/types';
import { SEG_LABELS } from '@/lib/segRequirements';

const SEGS: Seg[] = ['S1', 'S2'];

export default function ChatPage() {
  const [mobileFocus, setMobileFocus] = useState<'split' | 'student' | 'operator'>('split');
  const [initSeg, setInitSeg] = useState<Seg>('S1');

  const {
    chatCase,
    messages,
    auditLogs,
    waitTimerActive,
    resetCase,
    studentSubmitItem,
    studentSendMessage,
    operatorSendMessage,
    operatorRequestSupplement,
    operatorApproveItem,
    operatorChangeSeg,
    operatorCloseChat,
  } = useChat(initSeg);

  const handleNewCase = (seg: Seg) => {
    setInitSeg(seg);
    resetCase(seg);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top control bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div>
          <h1 className="text-[15px] font-bold text-gray-800">채팅 시스템 Beta</h1>
          <p className="text-[11px] text-gray-400">PRD v0.1 · 항목별 1:1 매칭 · Status A/B/C/D 자동 계산</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Seg selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">새 케이스 Seg:</span>
            {SEGS.map((seg) => (
              <button
                key={seg}
                onClick={() => handleNewCase(seg)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                  seg === 'S1'
                    ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {SEG_LABELS[seg]}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['split', 'student', 'operator'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setMobileFocus(view)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mobileFocus === view
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view === 'split' ? '양쪽 보기' : view === 'student' ? '📱 학생' : '💻 오퍼레이터'}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Case info badge */}
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

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {mobileFocus === 'split' && (
          <div className="h-full grid grid-cols-[1fr_1.4fr] gap-px bg-gray-200">
            {/* Left: student label + view */}
            <div className="bg-gray-50 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-500">📱 학생 시점</span>
                <span className="text-[11px] text-gray-400">{chatCase.studentName} · {chatCase.studentSchool}</span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden p-3">
                <StudentView
                  chatCase={chatCase}
                  messages={messages}
                  onSubmitItem={studentSubmitItem}
                  onSendMessage={studentSendMessage}
                  waitTimerActive={waitTimerActive}
                />
              </div>
            </div>

            {/* Right: operator */}
            <div className="bg-gray-50 flex flex-col overflow-hidden">
              <OperatorView
                chatCase={chatCase}
                messages={messages}
                auditLogs={auditLogs}
                waitTimerActive={waitTimerActive}
                onSendMessage={operatorSendMessage}
                onRequestSupplement={operatorRequestSupplement}
                onApproveItem={operatorApproveItem}
                onChangeSeg={operatorChangeSeg}
                onCloseChat={operatorCloseChat}
              />
            </div>
          </div>
        )}

        {mobileFocus === 'student' && (
          <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
              <span className="text-xs font-medium text-gray-500">
                📱 학생 시점 · {chatCase.studentName} · {chatCase.studentSchool}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden p-4">
              <StudentView
                chatCase={chatCase}
                messages={messages}
                onSubmitItem={studentSubmitItem}
                onSendMessage={studentSendMessage}
                waitTimerActive={waitTimerActive}
              />
            </div>
          </div>
        )}

        {mobileFocus === 'operator' && (
          <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            <OperatorView
              chatCase={chatCase}
              messages={messages}
              auditLogs={auditLogs}
              waitTimerActive={waitTimerActive}
              onSendMessage={operatorSendMessage}
              onRequestSupplement={operatorRequestSupplement}
              onApproveItem={operatorApproveItem}
              onChangeSeg={operatorChangeSeg}
              onCloseChat={operatorCloseChat}
            />
          </div>
        )}
      </main>
    </div>
  );
}
