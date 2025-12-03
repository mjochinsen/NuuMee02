'use client';

import { Loader2 } from 'lucide-react';

export interface ActionButtonsProps {
  primaryLabel: string;
  primaryVariant?: 'cyan' | 'red' | 'amber';
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}

const primaryStyles = {
  cyan: 'bg-[#00F0D9] hover:bg-[#00F0D9]/90 text-[#0F172A]',
  red: 'bg-red-600 hover:bg-red-700 text-white',
  amber: 'bg-amber-500 hover:bg-amber-600 text-[#0F172A]',
};

export function ActionButtons({
  primaryLabel,
  primaryVariant = 'cyan',
  onPrimary,
  secondaryLabel = 'Cancel',
  onSecondary,
  isLoading = false,
  loadingLabel = 'Processing...',
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-3 pt-2">
      {onSecondary && (
        <button
          onClick={onSecondary}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-xl border border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] transition-colors disabled:opacity-50"
        >
          {secondaryLabel}
        </button>
      )}
      <button
        onClick={onPrimary}
        disabled={isLoading || disabled}
        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${primaryStyles[primaryVariant]}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          primaryLabel
        )}
      </button>
    </div>
  );
}
