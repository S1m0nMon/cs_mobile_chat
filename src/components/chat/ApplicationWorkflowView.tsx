'use client';

import { useState } from 'react';
import { Seg, SimType } from '@/lib/types';

interface Props {
  onCancel: () => void;
  onComplete: (seg: Seg, simType: SimType) => void;
}

type Step = 'plan' | 'sim' | 'review';

export default function ApplicationWorkflowView({ onCancel, onComplete }: Props) {
  const [step, setStep] = useState<Step>('plan');
  const [seg, setSeg] = useState<Seg | null>(null);
  const [simType, setSimType] = useState<SimType | null>(null);

  const selectPlan = (s: Seg) => {
    setSeg(s);
    setStep('sim');
  };
  const selectSim = (s: SimType) => {
    setSimType(s);
    setStep('review');
  };
  const submit = () => {
    if (!seg || !simType) return;
    onComplete(seg, simType);
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1F4E79]/10 rounded-2xl mb-2">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-lg font-bold text-[#1F4E79]">간편 신청</h2>
          <p className="text-xs text-gray-400 mt-0.5">몇 가지만 답해주시면 바로 상담으로 연결됩니다.</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center items-center gap-1.5 mb-6">
          {(['plan', 'sim', 'review'] as Step[]).map((s, i) => {
            const isActive = step === s;
            const isPast =
              (step === 'sim' && i === 0) ||
              (step === 'review' && i < 2);
            return (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  isActive ? 'w-10 bg-[#1F4E79]' : isPast ? 'w-6 bg-[#1F4E79]/40' : 'w-6 bg-gray-200'
                }`}
              />
            );
          })}
        </div>

        {step === 'plan' && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              <span className="text-[#1F4E79] mr-1.5">Q1.</span>어떤 개통을 원하시나요?
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => selectPlan('S1')}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/60 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🆕</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">신규 번호 개통</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">한국에서 새 번호를 발급받습니다.</div>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              </button>
              <button
                onClick={() => selectPlan('S2')}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50/60 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">기존 번호 이동 (MNP)</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">사용 중인 번호를 그대로 가져옵니다.</div>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'sim' && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              <span className="text-[#1F4E79] mr-1.5">Q2.</span>어떤 SIM을 사용하시나요?
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => selectSim('esim')}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50/60 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📲</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">eSIM (디지털 SIM)</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">기기에 내장된 SIM. 기기정보 캡처본이 필요해요.</div>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              </button>
              <button
                onClick={() => selectSim('usim')}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/60 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">uSIM (실물 SIM)</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">물리 SIM 카드. 유심 사진이 필요해요.</div>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              </button>
            </div>
            <button
              onClick={() => setStep('plan')}
              className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 이전 단계
            </button>
          </div>
        )}

        {step === 'review' && seg && simType && (
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              <span className="text-[#1F4E79] mr-1.5">Q3.</span>신청 내용을 확인해주세요
            </p>
            <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-4 space-y-2.5 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">개통 유형</span>
                <span className="font-semibold text-gray-800">
                  {seg === 'S1' ? '🆕 신규 번호 개통' : '🔄 기존 번호 이동 (MNP)'}
                </span>
              </div>
              <div className="h-px bg-blue-100" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">SIM 유형</span>
                <span className="font-semibold text-gray-800">
                  {simType === 'esim' ? '📲 eSIM' : '💳 uSIM'}
                </span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-[11px] text-amber-800 leading-relaxed">
                💡 다음 단계에서 여권 스캔 등 필요 서류를 채팅으로 안내해드립니다.
              </p>
            </div>
            <button
              onClick={submit}
              className="w-full py-3 rounded-xl bg-[#1F4E79] text-white text-sm font-semibold hover:bg-[#163a5c] active:scale-[0.98] transition-all"
            >
              신청 완료 · 채팅 시작 →
            </button>
            <button
              onClick={() => setStep('sim')}
              className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 이전 단계
            </button>
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full mt-5 py-2 text-[11px] text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          이미 신청번호가 있어요
        </button>
      </div>
    </div>
  );
}
