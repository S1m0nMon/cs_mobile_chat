'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  onSubmit: (applicationNumber: string) => void;
}

export default function ApplicationEntryView({ onSubmit }: Props) {
  const [appNum, setAppNum] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = appNum.trim();
    if (!trimmed) {
      setError('신청 번호를 입력해주세요.');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-white">
      {/* Brand header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1F4E79]/10 rounded-2xl mb-3">
          <span className="text-3xl">📱</span>
        </div>
        <h2 className="text-xl font-bold text-[#1F4E79]">HireVisa Mobile</h2>
        <p className="text-sm text-gray-400 mt-0.5">모바일 개통 CS 채팅</p>
      </div>

      {/* Entry card */}
      <div className="w-full max-w-sm">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-[15px] font-semibold text-gray-800 mb-1">신청 번호 입력</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-5">
            <a
              href="https://mobile.hirevisa.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1F4E79] font-medium underline underline-offset-2"
            >
              mobile.hirevisa.com/en
            </a>
            에서 신청을 완료하신 후<br />
            발급받은 신청 번호를 입력해주세요.
          </p>

          <label className="block text-xs font-medium text-gray-500 mb-1.5">신청 번호</label>
          <input
            ref={inputRef}
            type="text"
            value={appNum}
            onChange={(e) => {
              setAppNum(e.target.value.toUpperCase());
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            placeholder="예: HV2026-00001"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:border-[#1F4E79] focus:ring-1 focus:ring-[#1F4E79]/30 bg-white placeholder:text-gray-300 mb-1"
          />

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full mt-3 py-3 rounded-xl bg-[#1F4E79] text-white text-sm font-semibold hover:bg-[#163a5c] active:scale-[0.98] transition-all"
          >
            채팅 시작하기 →
          </button>
        </div>

        {/* Help text */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-semibold">신청 번호를 모르시나요?</span><br />
            신청 완료 후 이메일로 발송된 확인서 또는 신청 페이지에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
