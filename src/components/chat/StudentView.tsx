'use client';

import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ItemInputModal from './ItemInputModal';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/computeStatus';
import { Case, FileMeta, Item, ItemCode, Message } from '@/lib/types';
import { SEG_LABELS } from '@/lib/segRequirements';

interface Props {
  chatCase: Case;
  messages: Message[];
  onSubmitItem: (code: ItemCode, payload: { value?: string; file?: FileMeta }) => void;
  onSendMessage: (text: string) => void;
  onQuickReply: (text: string, requestConsultant?: boolean) => void;
  waitTimerActive: boolean;
}

const STATE_LABELS: Record<Item['state'], string> = {
  empty: '미제출',
  submitted: '제출됨',
  supp_requested: '보완 요청',
  resubmitted: '재제출됨',
  approved: '✓ 승인',
};

const STATE_COLORS: Record<Item['state'], string> = {
  empty: 'bg-gray-100 text-gray-500',
  submitted: 'bg-blue-100 text-blue-700',
  supp_requested: 'bg-amber-100 text-amber-700 border border-amber-300',
  resubmitted: 'bg-purple-100 text-purple-700',
  approved: 'bg-emerald-100 text-emerald-700',
};

const ITEM_ROW_COLORS: Record<Item['state'], string> = {
  empty: 'border-l-4 border-l-gray-300',
  submitted: 'border-l-4 border-l-blue-400 bg-blue-50/40',
  supp_requested: 'border-l-4 border-l-amber-400 bg-amber-50/60',
  resubmitted: 'border-l-4 border-l-purple-400 bg-purple-50/40',
  approved: 'border-l-4 border-l-emerald-400 bg-emerald-50/40',
};

export default function StudentView({
  chatCase,
  messages,
  onSubmitItem,
  onSendMessage,
  onQuickReply,
  waitTimerActive,
}: Props) {
  const [inputText, setInputText] = useState('');
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || chatCase.closed) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const approvedCount = chatCase.items.filter((i) => i.state === 'approved').length;
  const totalCount = chatCase.items.length;
  const statusLabel = chatCase.status ? STATUS_LABELS[chatCase.status] : '대기';
  const statusColor = chatCase.status ? STATUS_COLORS[chatCase.status] : 'bg-gray-100 text-gray-500';

  return (
    <div className="flex flex-col h-full max-w-[420px] mx-auto bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-lg">
      {/* Phone Header */}
      <div className="bg-[#1F4E79] text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div>
          <div className="font-semibold text-sm">하이어비자 고객센터</div>
          <div className="text-xs opacity-80 mt-0.5">{SEG_LABELS[chatCase.seg]}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>
            {chatCase.closed ? '종료' : chatCase.status ? `${chatCase.status} · ${statusLabel}` : '검토대기'}
          </span>
          {waitTimerActive && (
            <span className="text-[10px] bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">
              응대 대기 중...
            </span>
          )}
        </div>
      </div>

      {/* Chat Zone */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-gray-50/80 flex flex-col">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Items Zone */}
      <div className="border-t-2 border-gray-100 bg-white flex-shrink-0 max-h-[280px] overflow-y-auto">
        <div className="px-3 pt-2.5 pb-1 flex justify-between items-center">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">📋 제출 현황</span>
          <span className="text-xs font-bold text-[#1F4E79]">
            {totalCount > 0 ? `${approvedCount} / ${totalCount} 승인` : '—'}
          </span>
        </div>

        {chatCase.items.length === 0 ? (
          <div className="px-3 pb-3 text-xs text-gray-400 text-center py-4">항목 없음</div>
        ) : (
          <div className="px-2 pb-2 space-y-1.5">
            {chatCase.items.map((item) => (
              <div
                key={item.code}
                className={`flex items-start gap-2 p-2 rounded-lg border border-gray-100 bg-white ${ITEM_ROW_COLORS[item.state]}`}
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800">{item.name}</div>
                  {item.state === 'supp_requested' && item.suppReason && (
                    <div className="mt-1 text-[11px] text-amber-700 bg-white/70 rounded px-1.5 py-1 border-l-2 border-amber-400">
                      ⚠️ {item.suppReason}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATE_COLORS[item.state]}`}>
                    {STATE_LABELS[item.state]}
                  </span>
                  {item.state !== 'approved' && !chatCase.closed && (
                    <button
                      onClick={() => setActiveItem(item)}
                      className={`text-[11px] px-2 py-1 rounded border font-medium whitespace-nowrap transition-colors ${
                        item.state === 'supp_requested'
                          ? 'bg-[#1F4E79] text-white border-[#1F4E79] hover:bg-[#163a5c]'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item.state === 'empty' ? '제출' : item.state === 'supp_requested' ? '재제출' : '수정'}
                    </button>
                  )}
                  {item.state === 'approved' && (
                    <button disabled className="text-[11px] px-2 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed">
                      잠금
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplement summary + quick replies (shown when status B and not in consultant mode) */}
      {chatCase.status === 'B' && !chatCase.consultantMode && !chatCase.closed && (
        <div className="border-t-2 border-amber-200 bg-amber-50/90 flex-shrink-0 px-3 py-3 space-y-2.5">
          {/* Summary header */}
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide mb-1.5">⚠️ 보완 요청 항목</p>
            <div className="space-y-1">
              {chatCase.items
                .filter((i) => i.state === 'supp_requested')
                .map((item) => (
                  <div key={item.code} className="text-xs bg-white/80 rounded-xl px-3 py-2 border-l-2 border-amber-400">
                    <span className="font-semibold text-amber-900">{item.icon} {item.name}</span>
                    {item.suppReason && (
                      <p className="text-amber-700 mt-0.5">{item.suppReason}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
          {/* Quick reply buttons */}
          <div>
            <p className="text-[10px] text-amber-600 mb-1">궁금한 사항이 있으신가요?</p>
            <div className="flex flex-col gap-1.5">
              {[
                { text: '어떤 부분이 부족한 건지 모르겠어요', consultant: false },
                { text: '어떻게 제출해야 하는지 모르겠어요', consultant: false },
                { text: '상담사 연결이 필요해요', consultant: true },
              ].map(({ text, consultant }) => (
                <button
                  key={text}
                  onClick={() => onQuickReply(text, consultant)}
                  className={`text-xs px-3 py-2 rounded-xl border text-left font-medium transition-colors ${
                    consultant
                      ? 'border-[#1F4E79]/40 bg-white text-[#1F4E79] hover:bg-[#1F4E79]/10'
                      : 'border-amber-300 bg-white text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  {consultant ? '💬 ' : '❓ '}{text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Consultant mode indicator */}
      {chatCase.consultantMode && !chatCase.closed && (
        <div className="px-3 pb-1 flex-shrink-0">
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            💬 상담사 연결 중
          </span>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-2 bg-white flex gap-2 items-center flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder={chatCase.closed ? '채팅이 종료되었습니다.' : '문의 사항을 입력하세요...'}
          disabled={chatCase.closed}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#1F4E79] disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={chatCase.closed || !inputText.trim()}
          className="bg-[#1F4E79] text-white text-sm font-medium px-4 py-2 rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#163a5c] transition-colors"
        >
          전송
        </button>
      </div>

      {/* Item Input Modal */}
      {activeItem && (
        <ItemInputModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onSubmit={(payload) => {
            onSubmitItem(activeItem.code, payload);
            setActiveItem(null);
          }}
        />
      )}
    </div>
  );
}
