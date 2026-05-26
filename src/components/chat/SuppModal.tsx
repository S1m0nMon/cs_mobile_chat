'use client';

import { useState } from 'react';
import { SUPP_CATEGORIES } from '@/lib/suppCategories';
import { Item, ItemCode } from '@/lib/types';

interface Props {
  item: Item;
  onClose: () => void;
  onSubmit: (category: string, detail?: string) => void;
}

const CUSTOM_KEY = '__custom__';

export default function SuppModal({ item, onClose, onSubmit }: Props) {
  const cats = SUPP_CATEGORIES[item.code as ItemCode] ?? [];
  const [category, setCategory] = useState(cats[0] ?? CUSTOM_KEY);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (category === CUSTOM_KEY) {
      if (!detail.trim()) {
        setError('기타 사유는 추가 안내에 내용을 입력해주세요.');
        return;
      }
      onSubmit('기타', detail.trim());
    } else {
      onSubmit(category, detail.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5">
          <h3 className="text-base font-semibold mb-2">📨 보완 요청</h3>
          <div className="bg-blue-50 text-[#1F4E79] text-sm font-semibold px-3 py-2 rounded-lg mb-4">
            {item.icon} {item.name}
          </div>

          <label className="block text-xs text-gray-500 mb-1">보완 사유 (필수)</label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setError(''); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F4E79] mb-3"
          >
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value={CUSTOM_KEY}>기타 (직접 입력)</option>
          </select>

          <label className="block text-xs text-gray-500 mb-1">추가 안내 (선택)</label>
          <textarea
            value={detail}
            onChange={(e) => { setDetail(e.target.value); setError(''); }}
            placeholder="예: 만료일이 보이도록 정면에서 다시 촬영 부탁드립니다."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1F4E79]"
          />

          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 rounded-lg bg-[#1F4E79] text-white text-sm font-medium hover:bg-[#163a5c] transition-colors"
            >
              보완 요청 보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
