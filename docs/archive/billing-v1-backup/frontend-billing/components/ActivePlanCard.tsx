'use client';

import { Button } from '@/components/ui/button';

export interface ActivePlanCardProps {
  currentPlan: string;
  nextBillingDate: string;
  isAnnual?: boolean;
  onUpgrade: () => void;
  onCancel: () => void;
}

const planConfig: Record<string, { icon: string; monthlyPrice: number; annualPrice: number }> = {
  free: { icon: '⭐', monthlyPrice: 0, annualPrice: 0 },
  creator: { icon: '🏆', monthlyPrice: 29, annualPrice: 23 },  // $23/mo when billed annually (20% off)
  studio: { icon: '💎', monthlyPrice: 99, annualPrice: 79 },   // $79/mo when billed annually (20% off)
};

export function ActivePlanCard({
  currentPlan,
  nextBillingDate,
  isAnnual = false,
  onUpgrade,
  onCancel,
}: ActivePlanCardProps) {
  const config = planConfig[currentPlan] || planConfig.free;
  const displayPrice = currentPlan === 'free'
    ? 'Free'
    : isAnnual
      ? `$${config.annualPrice}/mo (billed annually)`
      : `$${config.monthlyPrice}/month`;
  const isPaidPlan = currentPlan !== 'free';
  const isHighestPlan = currentPlan === 'studio';

  return (
    <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
      <h3 className="text-[#94A3B8] mb-4">Active Plan</h3>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">{config.icon}</span>
        <span className="text-[#F1F5F9] text-2xl capitalize">{currentPlan}</span>
      </div>
      <div className="text-[#94A3B8] text-sm mb-1">{displayPrice}</div>
      <div className="text-[#94A3B8] text-sm mb-6">Next billing: {nextBillingDate}</div>

      {!isHighestPlan && (
        <Button
          variant="outline"
          className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          onClick={onUpgrade}
        >
          {currentPlan === 'free' ? 'Subscribe to Creator' : 'Upgrade to Studio'}
        </Button>
      )}

      {isHighestPlan && (
        <div className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30">
          <span className="text-[#00F0D9] text-sm">You&apos;re on the highest plan</span>
        </div>
      )}

      {isPaidPlan && (
        <button
          className="text-[#94A3B8] text-sm hover:text-[#F1F5F9] mt-3 w-full text-center"
          onClick={onCancel}
        >
          Cancel Subscription
        </button>
      )}
    </div>
  );
}
