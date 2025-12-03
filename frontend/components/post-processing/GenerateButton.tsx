'use client';

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface GenerateButtonProps {
  icon: ReactNode;
  label: string;
  creditCost: number;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function GenerateButton({
  icon,
  label,
  creditCost,
  onClick,
  disabled = false,
  isLoading = false,
}: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
          <span className="ml-auto bg-white/20 px-2 py-0.5 rounded text-sm">
            {creditCost} {creditCost === 1 ? 'credit' : 'credits'}
          </span>
        </>
      )}
    </button>
  );
}
