'use client';

import { useEffect, useRef, useState } from 'react';
import { FileMeta, Item } from '@/lib/types';
import { generateId, formatFileSize } from '@/lib/utils';

interface Props {
  item: Item;
  onClose: () => void;
  onSubmit: (payload: { value?: string; file?: FileMeta }) => void;
}

export default function ItemInputModal({ item, onClose, onSubmit }: Props) {
  const [textVal, setTextVal] = useState(item.value ?? '');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    setTimeout(() => (firstInputRef.current as HTMLElement | null)?.focus(), 50);
  }, []);

  const handleFile = (file: File) => {
    const kind = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'file';
    const url = URL.createObjectURL(file);
    const fileMeta: FileMeta = {
      id: generateId('F'),
      name: file.name,
      kind,
      size: formatFileSize(file.size),
      url,
      uploadedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    onSubmit({ file: fileMeta });
  };

  const handleTextSubmit = () => {
    if (!textVal.trim()) {
      setError('값을 입력해주세요.');
      return;
    }
    if (item.validate && !item.validate(textVal)) {
      setError(item.validateMsg ?? '입력값이 올바르지 않습니다.');
      return;
    }
    onSubmit({ value: textVal.trim() });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <h3 className="text-base font-semibold mb-1">
            {item.icon} {item.name}
          </h3>
          {item.hint && <p className="text-xs text-gray-500 mb-3">{item.hint}</p>}

          {/* FILE */}
          {item.type === 'file' && (
            <>
              {item.file && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg border text-sm">
                  <div className="text-xs text-gray-500 mb-1">현재 첨부 파일</div>
                  <div className="flex items-center gap-2">
                    {item.file.kind === 'image' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.file.url} alt="preview" className="w-12 h-12 object-cover rounded border" />
                    )}
                    <span className="text-xs">{item.file.name} ({item.file.size})</span>
                  </div>
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-[#1F4E79] bg-blue-50' : 'border-gray-300 hover:border-[#1F4E79]'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleFile(f);
                }}
              >
                <div className="text-2xl mb-2">📎</div>
                <p className="text-sm text-gray-600">클릭하거나 파일을 드래그하여 업로드</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, HEIC, PDF (최대 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = '';
                }}
              />
            </>
          )}

          {/* SELECT */}
          {item.type === 'select' && (
            <select
              ref={firstInputRef as React.RefObject<HTMLSelectElement>}
              value={textVal}
              onChange={(e) => { setTextVal(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F4E79]"
            >
              <option value="">— 선택해주세요 —</option>
              {item.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {/* DATE */}
          {item.type === 'date' && (
            <input
              ref={firstInputRef as React.RefObject<HTMLInputElement>}
              type="date"
              min={today}
              value={textVal}
              onChange={(e) => { setTextVal(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F4E79]"
            />
          )}

          {/* TEXT */}
          {item.type === 'text' && (
            <input
              ref={firstInputRef as React.RefObject<HTMLInputElement>}
              type="text"
              placeholder={item.placeholder ?? ''}
              value={textVal}
              onChange={(e) => { setTextVal(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F4E79]"
            />
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          {item.type !== 'file' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleTextSubmit}
                className="flex-1 py-2 rounded-lg bg-[#1F4E79] text-white text-sm font-medium hover:bg-[#163a5c] transition-colors"
              >
                제출
              </button>
            </div>
          )}
          {item.type === 'file' && (
            <button
              onClick={onClose}
              className="w-full mt-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
