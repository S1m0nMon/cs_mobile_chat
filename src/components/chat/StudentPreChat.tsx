'use client';

import { useState } from 'react';
import ApplicationEntryView from './ApplicationEntryView';
import ApplicationWorkflowView from './ApplicationWorkflowView';
import { Seg, SimType } from '@/lib/types';

interface Props {
  onEnterNumber: (applicationNumber: string) => void;
  onApplyAndStart: (seg: Seg, simType: SimType) => void;
}

export default function StudentPreChat({ onEnterNumber, onApplyAndStart }: Props) {
  const [mode, setMode] = useState<'entry' | 'workflow'>('entry');

  if (mode === 'workflow') {
    return (
      <ApplicationWorkflowView
        onCancel={() => setMode('entry')}
        onComplete={onApplyAndStart}
      />
    );
  }

  return (
    <ApplicationEntryView
      onSubmit={onEnterNumber}
      onStartApplication={() => setMode('workflow')}
    />
  );
}
