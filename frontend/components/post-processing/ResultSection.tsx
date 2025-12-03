'use client';

import { Check } from 'lucide-react';

export type ResultStatus = 'awaiting' | 'processing' | 'completed' | 'failed';

export interface ResultSectionProps {
  status: ResultStatus;
}

export function ResultSection({ status }: ResultSectionProps) {
  if (status === 'awaiting') return null;

  return (
    <div className="mt-4 p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
      {status === 'processing' && (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#00F0D9] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94A3B8]">Processing...</span>
        </div>
      )}
      {status === 'completed' && (
        <div className="flex items-center gap-3 text-green-400">
          <Check className="w-4 h-4" />
          <span>Completed!</span>
        </div>
      )}
      {status === 'failed' && (
        <div className="flex items-center gap-3 text-red-400">
          <span>Failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}
