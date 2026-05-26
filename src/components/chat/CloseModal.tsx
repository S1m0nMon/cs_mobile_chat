'use client';

import { useState } from 'react';
import { CloseReason } from '@/lib/types';

interface Props {
  onClose: () => void;
  onConfirm: (reason: CloseReason, memo?: string) => void;
}

const REASONS: CloseReason[] = [
  '개통완료',
  '개통취소-고객요청',
  '개통취소-서류미비',
  '기타',
];

export default function CloseModal({ onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<CloseReason>('개통완료');
  const [memo, setMemo] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5">
          <h3 className="text-base font-semibold mb-4">🔒 채팅 종료</h3>

          <label className="block text-xs text-gray-500 mb-1">종료 사유 (필수)</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as CloseReason)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F4E79] mb-3"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="block text-xs text-gray-500 mb-1">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="추가 메모를 입력하세요 (선택 사항)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1F4E79]"
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onConfirm(reason, memo.trim() || undefined)}
              className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              종료 확정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
