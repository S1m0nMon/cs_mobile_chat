'use client';

import { useState } from 'react';
import SuppModal from './SuppModal';
import CloseModal from './CloseModal';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/computeStatus';
import { SEG_LABELS, SIM_LABELS } from '@/lib/segRequirements';
import { AuditLog, Case, CloseReason, Item, ItemCode, Message, Seg, SimType } from '@/lib/types';

interface Props {
  chatCase: Case;
  messages: Message[];
  auditLogs: AuditLog[];
  waitTimerActive: boolean;
  onActivate: () => void;
  onRequestSupplement: (code: ItemCode, category: string, detail?: string) => void;
  onApproveItem: (code: ItemCode) => void;
  onAddVisaConfirm: () => void;
  onChangeSeg: (seg: Seg, simType?: SimType) => void;
  onCloseChat: (reason: CloseReason, memo?: string) => void;
  onSendMessage: (text: string) => void;
}

const ITEM_STATE_LABELS: Record<Item['state'], string> = {
  empty: '미제출',
  submitted: '검토 대기',
  supp_requested: '학생 대기',
  resubmitted: '재검토 대기',
  approved: '✓ 승인',
};

const ITEM_STATE_COLORS: Record<Item['state'], string> = {
  empty: 'bg-gray-100 text-gray-500',
  submitted: 'bg-blue-100 text-blue-700',
  supp_requested: 'bg-amber-100 text-amber-700',
  resubmitted: 'bg-purple-100 text-purple-700',
  approved: 'bg-emerald-100 text-emerald-700',
};

const ITEM_ROW_BG: Record<Item['state'], string> = {
  empty: '',
  submitted: 'bg-blue-50/30',
  supp_requested: 'bg-amber-50/50',
  resubmitted: 'bg-purple-50/30',
  approved: 'bg-emerald-50/30',
};

export default function OperatorView({
  chatCase,
  messages,
  auditLogs,
  waitTimerActive,
  onActivate,
  onRequestSupplement,
  onApproveItem,
  onAddVisaConfirm,
  onChangeSeg,
  onCloseChat,
  onSendMessage,
}: Props) {
  const [suppItem, setSuppItem] = useState<Item | null>(null);
  const [showClose, setShowClose] = useState(false);
  const [opText, setOpText] = useState('');
  const handleSend = () => { if (!opText.trim() || chatCase.closed) return; onSendMessage(opText); setOpText(''); };

  const statusLabel = chatCase.status ? STATUS_LABELS[chatCase.status] : '—';
  const statusColor = chatCase.status ? STATUS_COLORS[chatCase.status] : 'bg-gray-100 text-gray-500';
  const approvedCount = chatCase.items.filter((i) => i.state === 'approved').length;
  const totalCount = chatCase.items.length;
  const hasVisaConfirm = chatCase.items.some((i) => i.code === 'visa_confirm');
  const isReady = chatCase.status === 'D' && !chatCase.closed;

  const handleSegChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [newSeg, newSim] = val.split('|') as [Seg, SimType];
    if (newSeg === chatCase.seg && newSim === chatCase.simType) return;
    if (!confirm(`Seg를 ${SEG_LABELS[chatCase.seg]} · ${SIM_LABELS[chatCase.simType]} → ${SEG_LABELS[newSeg]} · ${SIM_LABELS[newSim]}으로 변경하시겠습니까?\n여권 스캔본 등 공통 항목 데이터는 유지됩니다.`)) return;
    onChangeSeg(newSeg, newSim);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center flex-shrink-0">
        <div>
          <span className="text-sm font-semibold text-gray-700">💻 오퍼레이터 어드민</span>
          <span className="ml-3 text-xs text-gray-400">{chatCase.id}</span>
        </div>
        <div className="flex items-center gap-2">
          {waitTimerActive && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full animate-pulse font-medium">
              ⏱ 응답 대기 중
            </span>
          )}
          {isReady && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold animate-pulse">
              ✅ 개통 준비 완료
            </span>
          )}
          {chatCase.closed && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">채팅 종료됨</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* ── Waiting banner ── */}
        {!chatCase.applicationNumber && !chatCase.closed && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-amber-500 text-lg flex-shrink-0 animate-pulse">⏳</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">학생이 신청번호 입력 대기 중</p>
              <p className="text-xs text-amber-600 mt-0.5">
                학생이 신청번호를 입력하면 체크리스트가 활성화됩니다.
              </p>
            </div>
          </div>
        )}

        {/* ── Seg confirmation card ── */}
        {chatCase.applicationNumber && !chatCase.segConfirmed && !chatCase.closed && (
          <div className="bg-white border-2 border-[#1F4E79]/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-lg">🔢</span>
              <div>
                <p className="text-sm font-bold text-[#1F4E79]">Seg 확인 필요</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  신청번호 <span className="font-mono font-semibold">{chatCase.applicationNumber}</span>에 대한 Seg를 선택해주세요.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { seg: 'S1' as Seg, simType: 'esim' as SimType, label: 'S1 신규개통 · eSIM', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { seg: 'S1' as Seg, simType: 'usim' as SimType, label: 'S1 신규개통 · uSIM', color: 'border-blue-200 bg-blue-50/60 text-blue-600 hover:bg-blue-100' },
                { seg: 'S2' as Seg, simType: 'esim' as SimType, label: 'S2 MNP · eSIM', color: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { seg: 'S2' as Seg, simType: 'usim' as SimType, label: 'S2 MNP · uSIM', color: 'border-amber-200 bg-amber-50/60 text-amber-600 hover:bg-amber-100' },
              ] as const).map(({ seg, simType, label, color }) => (
                <button
                  key={label}
                  onClick={() => onChangeSeg(seg, simType)}
                  className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 개통 완료 Activation Block ── */}
        {isReady && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-bold text-emerald-800">개통 준비 완료</p>
                <p className="text-xs text-emerald-600">모든 서류 ({totalCount}/{totalCount})가 승인되었습니다.</p>
              </div>
            </div>
            <button
              onClick={onActivate}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-sm"
            >
              ✅ 개통 완료 처리
            </button>
          </div>
        )}

        {/* Case Info + Seg/Status */}
        <div className="grid grid-cols-2 gap-3">
          {/* Case Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">케이스 정보</h3>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-20 flex-shrink-0">신청번호</dt>
                <dd className={`font-mono font-semibold break-all ${chatCase.applicationNumber ? 'text-[#1F4E79]' : 'text-amber-500 italic'}`}>
                  {chatCase.applicationNumber || '입력 대기 중'}
                </dd>
              </div>
              {([
                ['학생', `${chatCase.studentName} (${chatCase.studentCountry})`],
                ['학교', chatCase.studentSchool],
                ['케이스 ID', chatCase.id],
                ['큐 진입', chatCase.queueEnteredAt],
                ['담당', chatCase.assignedOperator],
                ['보완 라운드', `${chatCase.rounds}회`],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="text-gray-400 w-20 flex-shrink-0">{label}</dt>
                  <dd className="font-medium text-gray-700 break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Seg / Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Seg / Status</h3>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 w-14">Seg</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chatCase.seg === 'S1' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {SEG_LABELS[chatCase.seg]}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chatCase.simType === 'esim' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                  {SIM_LABELS[chatCase.simType]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14">Status</span>
                {chatCase.closed ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">종료</span>
                ) : chatCase.status ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </div>
            </div>

            <label className="block text-xs text-gray-400 mb-1">Seg 수동 변경</label>
            <select
              onChange={handleSegChange}
              disabled={chatCase.closed}
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-[#1F4E79] disabled:opacity-50"
            >
              <option value="">— 변경 선택 —</option>
              <option value="S1|esim">S1 신규개통 · eSIM</option>
              <option value="S1|usim">S1 신규개통 · uSIM</option>
              <option value="S2|esim">S2 MNP · eSIM</option>
              <option value="S2|usim">S2 MNP · uSIM</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-2">Status는 항목 상태에서 자동 계산됩니다</p>
          </div>
        </div>

        {/* Item Checklist */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">📋 필요 항목 체크리스트</h3>
            {chatCase.applicationNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1F4E79]">
                  {totalCount > 0 ? `${approvedCount} / ${totalCount} 승인` : '—'}
                </span>
                {!hasVisaConfirm && !chatCase.closed && (
                  <button
                    onClick={onAddVisaConfirm}
                    className="text-[11px] px-2.5 py-1 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                    title="자사 미확보 시 사증발급확인서 요청"
                  >
                    🛂 사증발급확인서 요청
                  </button>
                )}
              </div>
            )}
          </div>

          {!chatCase.applicationNumber ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-2xl">🔒</span>
              <p className="text-sm text-gray-400 text-center">학생이 신청번호 입력 후 열람 가능합니다</p>
            </div>
          ) : !chatCase.segConfirmed ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-2xl">🔢</span>
              <p className="text-sm text-gray-400 text-center">Seg 확인 후 체크리스트가 활성화됩니다</p>
            </div>
          ) : chatCase.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">항목 없음</p>
          ) : (
            <div className="space-y-2">
              {chatCase.items.map((item) => (
                <div
                  key={item.code}
                  className={`flex items-start gap-3 p-3 rounded-lg border border-gray-100 ${ITEM_ROW_BG[item.state]} ${item.operatorAdded ? 'border-indigo-200' : ''}`}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                      {item.operatorAdded && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">오퍼레이터 추가</span>
                      )}
                    </div>

                    {item.state === 'supp_requested' && item.suppReason && (
                      <div className="mt-1 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 border-l-2 border-amber-400">
                        📨 {item.suppReason} (학생 재제출 대기)
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ITEM_STATE_COLORS[item.state]}`}>
                      {ITEM_STATE_LABELS[item.state]}
                    </span>
                    {!chatCase.closed && (item.state === 'submitted' || item.state === 'resubmitted') && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSuppItem(item)}
                          className="text-[11px] px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium whitespace-nowrap transition-colors"
                        >
                          📨 {item.state === 'resubmitted' ? '추가 보완' : '보완 요청'}
                        </button>
                        <button
                          onClick={() => onApproveItem(item.code)}
                          className="text-[11px] px-2 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium whitespace-nowrap transition-colors"
                        >
                          ✅ 승인
                        </button>
                      </div>
                    )}
                    {!chatCase.closed && item.state === 'empty' && (
                      <button disabled className="text-[11px] px-2 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed">제출 대기</button>
                    )}
                    {!chatCase.closed && item.state === 'supp_requested' && (
                      <button disabled className="text-[11px] px-2 py-1 rounded border border-amber-200 text-amber-400 cursor-not-allowed">학생 대기 중</button>
                    )}
                    {item.state === 'approved' && (
                      <button disabled className="text-[11px] px-2 py-1 rounded border border-emerald-200 text-emerald-400 cursor-not-allowed">✓ 승인됨</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Free chat — unlocked when student requests consultant */}
        {chatCase.consultantMode && !chatCase.closed && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-base">💬</span>
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide">상담사 직접 연결 중</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={opText}
                onChange={(e) => setOpText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="자유 채팅 입력..."
                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-blue-50/30"
              />
              <button
                onClick={handleSend}
                disabled={!opText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        )}

        {/* Consultant free chat — unlocked when student requests it */}
        {chatCase.consultantMode && !chatCase.closed && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-base">💬</span>
              <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide">상담사 직접 연결 중</h3>
              <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">학생 요청</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={opText}
                onChange={(e) => setOpText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="자유 채팅 입력..."
                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-blue-50/30"
              />
              <button
                onClick={handleSend}
                disabled={!opText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        )}

        {/* Cancellation — shown when chat is active and not yet at D */}
        {!chatCase.closed && chatCase.applicationNumber && !isReady && (
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <button
              onClick={() => setShowClose(true)}
              className="w-full py-2 rounded-lg border border-gray-300 text-gray-500 text-xs font-medium hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              🚫 개통 취소 처리
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5 text-center">
              모든 항목 승인 시 개통 완료 버튼이 활성화됩니다.
            </p>
          </div>
        )}

        {/* Cancellation after activation (edge case) */}
        {isReady && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowClose(true)}
              className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors"
            >
              취소 처리
            </button>
          </div>
        )}

        {/* Recent Chat */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">최근 채팅</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">메시지 없음</p>
            ) : (
              [...messages].reverse().slice(0, 20).reverse().map((msg) => (
                <div key={msg.id} className="flex gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400 flex-shrink-0 font-mono">{msg.createdAt}</span>
                  <span className={`flex-shrink-0 font-medium ${
                    msg.role === 'student' ? 'text-blue-600' : msg.role === 'operator' ? 'text-[#1F4E79]' : msg.role === 'bot' ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    [{msg.role === 'student' ? '학생' : msg.role === 'operator' ? '오퍼' : msg.role === 'bot' ? '봇' : '시스템'}]
                  </span>
                  <span className="text-gray-600 break-all">{msg.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">감사 로그</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">로그 없음</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex gap-2 text-xs p-1.5 rounded border-l-2 bg-gray-50 ${
                    log.action.startsWith('case.seg') ? 'border-l-purple-400'
                    : log.action.startsWith('case.status') ? 'border-l-blue-400'
                    : log.action === 'case.closed' ? 'border-l-red-400'
                    : log.action.startsWith('item.supp') ? 'border-l-amber-400'
                    : log.action === 'item.approved' ? 'border-l-emerald-400'
                    : log.action === 'wait_timer.fired' ? 'border-l-orange-400'
                    : log.action === 'case.item_added' ? 'border-l-indigo-400'
                    : 'border-l-gray-300'
                  }`}
                >
                  <span className="text-gray-400 font-mono flex-shrink-0">{log.createdAt}</span>
                  <span className={`flex-shrink-0 font-medium ${log.actorRole === 'system' ? 'text-gray-500' : 'text-[#1F4E79]'}`}>
                    [{log.actorRole === 'system' ? '시스템' : log.actorRole === 'operator' ? '오퍼레이터' : '학생'}]
                  </span>
                  <span className="text-gray-600">{log.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {suppItem && (
        <SuppModal
          item={suppItem}
          onClose={() => setSuppItem(null)}
          onSubmit={(category, detail) => {
            onRequestSupplement(suppItem.code, category, detail);
            setSuppItem(null);
          }}
        />
      )}
      {showClose && (
        <CloseModal
          onClose={() => setShowClose(false)}
          onConfirm={(reason, memo) => {
            onCloseChat(reason, memo);
            setShowClose(false);
          }}
        />
      )}
    </div>
  );
}
