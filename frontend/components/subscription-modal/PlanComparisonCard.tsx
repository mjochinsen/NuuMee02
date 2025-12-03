'use client';

import { ArrowRight } from 'lucide-react';

export interface PlanInfo {
  name?: string;
  price?: number;
  credits?: number;
}

export interface PlanComparisonCardProps {
  currentPlan: PlanInfo;
  newPlan: PlanInfo;
  showCredits?: boolean;
  arrowColor?: string;
}

export function PlanComparisonCard({
  currentPlan,
  newPlan,
  showCredits = true,
  arrowColor = 'text-[#00F0D9]',
}: PlanComparisonCardProps) {
  return (
    <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] mb-6">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="text-sm text-[#94A3B8] mb-1">Current Plan</div>
          <div className="text-xl text-[#F1F5F9] mb-1">{currentPlan.name}</div>
          <div className="text-[#94A3B8]">${currentPlan.price}/mo</div>
          {showCredits && (
            <div className="text-sm text-[#00F0D9]">{currentPlan.credits} credits</div>
          )}
        </div>
        <ArrowRight className={`w-6 h-6 ${arrowColor} flex-shrink-0`} />
        <div className="text-center flex-1">
          <div className="text-sm text-[#94A3B8] mb-1">New Plan</div>
          <div className="text-xl text-[#F1F5F9] mb-1">{newPlan.name}</div>
          <div className="text-[#94A3B8]">${newPlan.price}/mo</div>
          {showCredits && (
            <div className="text-sm text-[#00F0D9]">{newPlan.credits} credits</div>
          )}
        </div>
      </div>
    </div>
  );
}
