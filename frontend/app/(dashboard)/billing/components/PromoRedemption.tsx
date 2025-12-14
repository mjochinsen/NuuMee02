'use client';

import { useState } from 'react';
import { Gift, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redeemPromoCode, ApiError } from '@/lib/api';

interface PromoRedemptionProps {
  onSuccess?: (creditsAdded: number, newBalance: number) => void;
}

export function PromoRedemption({ onSuccess }: PromoRedemptionProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter a promo code' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await redeemPromoCode(code.trim());
      setMessage({ type: 'success', text: response.message });
      setCode('');
      onSuccess?.(response.credits_added, response.new_balance);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to redeem code. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRedeem();
    }
  };

  return (
    <div className="border border-[#334155] rounded-xl p-4 bg-[#0F172A]">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-[#00F0D9]" />
        <span className="text-[#F1F5F9] text-sm font-medium">Have a promo code?</span>
      </div>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setMessage(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter code"
          disabled={isLoading}
          className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] uppercase"
        />
        <Button
          onClick={handleRedeem}
          disabled={isLoading || !code.trim()}
          className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-6"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 mt-3 text-sm ${
          message.type === 'success' ? 'text-green-400' : 'text-red-400'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
