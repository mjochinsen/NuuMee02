'use client';

import { Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BalanceCardProps {
  credits: number | null;
  creditValue: number;
  onBuyCredits: () => void;
}

export function BalanceCard({ credits, creditValue, onBuyCredits }: BalanceCardProps) {
  return (
    <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
      <h3 className="text-[#94A3B8] mb-4">Current Balance</h3>
      <div className="flex items-center gap-3 mb-2">
        <Zap className="w-8 h-8 text-[#00F0D9]" />
        <span className="text-[#F1F5F9] text-4xl">{credits === null ? '...' : credits}</span>
        <span className="text-[#94A3B8] text-xl">Credits</span>
      </div>
      <div className="text-[#94A3B8] text-sm mb-6">
        Worth: ${creditValue.toFixed(2)}
      </div>
      <Button
        className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
        onClick={onBuyCredits}
      >
        <Plus className="w-4 h-4 mr-2" />
        Buy Credits
      </Button>
    </div>
  );
}
