'use client';

import { Message } from '@/lib/types';

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const { role, type, text, isWarn } = message;

  if (type === 'system') {
    return (
      <div className="flex justify-center my-1">
        <div
          className={`text-xs px-3 py-1.5 rounded-xl border max-w-[90%] text-center ${
            isWarn
              ? 'bg-amber-50 text-amber-700 border-amber-300 border-dashed'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300 border-dashed'
          }`}
        >
          {text}
        </div>
      </div>
    );
  }

  if (type === 'template') {
    // operator supplement request template
    return (
      <div className="flex justify-start gap-2 items-end my-1">
        <div className="max-w-[82%] px-3 py-2 rounded-xl rounded-bl-sm bg-amber-50 border border-amber-300 text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
          <div className="text-[10px] font-bold text-amber-700 mb-1">📨 보완 요청</div>
          {text}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{message.createdAt}</span>
      </div>
    );
  }

  if (role === 'bot') {
    return (
      <div className="flex justify-start gap-2 items-end my-1">
        <div className="max-w-[82%] px-3 py-2 rounded-xl rounded-bl-sm bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
          {text}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{message.createdAt}</span>
      </div>
    );
  }

  if (role === 'student') {
    return (
      <div className="flex justify-end gap-2 items-end my-1">
        <span className="text-[10px] text-gray-400 flex-shrink-0">{message.createdAt}</span>
        <div className="max-w-[82%] px-3 py-2 rounded-xl rounded-br-sm bg-[#1F4E79] text-white text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  if (role === 'operator') {
    return (
      <div className="flex justify-start gap-2 items-end my-1">
        <div className="max-w-[82%] px-3 py-2 rounded-xl rounded-bl-sm bg-white border border-[#1F4E79] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
          <div className="text-[10px] font-semibold text-[#1F4E79] mb-1">👤 오퍼레이터</div>
          {text}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{message.createdAt}</span>
      </div>
    );
  }

  return null;
}
