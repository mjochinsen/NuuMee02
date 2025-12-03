'use client';

import { CreditCard, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentMethod } from '@/lib/api';

export interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  onRefresh: () => void;
  onManage: () => void;
}

export function PaymentMethodsSection({
  paymentMethods,
  isLoading,
  onRefresh,
  onManage,
}: PaymentMethodsSectionProps) {
  return (
    <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Payment Methods</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-[#94A3B8] hover:text-[#F1F5F9]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onManage}
            className="border-[#00F0D9]/50 text-[#00F0D9] hover:bg-[#00F0D9]/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manage in Stripe
          </Button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="border border-[#334155] bg-[#1E293B] rounded-xl p-4 mb-6">
        <p className="text-[#94A3B8] text-sm text-center">
          Payment methods are saved automatically. Click &quot;Manage in Stripe&quot; to add, remove, or update cards.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && paymentMethods.length === 0 && (
        <div className="text-center text-[#94A3B8] py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
          <p>Loading payment methods...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && paymentMethods.length === 0 && (
        <div className="text-center text-[#94A3B8] py-8">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved payment methods</p>
          <p className="text-sm mt-1">Your payment methods will appear here after your first purchase</p>
        </div>
      )}

      {/* Payment Methods List */}
      {paymentMethods.length > 0 && (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                method.is_default
                  ? 'border-[#00F0D9]/50 bg-[#00F0D9]/5'
                  : 'border-[#334155] bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Card Brand Icon */}
                <div className="w-12 h-8 rounded bg-white flex items-center justify-center">
                  {method.card?.brand === 'visa' && (
                    <span className="text-blue-600 font-bold text-sm">VISA</span>
                  )}
                  {method.card?.brand === 'mastercard' && (
                    <span className="text-red-500 font-bold text-sm">MC</span>
                  )}
                  {method.card?.brand === 'amex' && (
                    <span className="text-blue-500 font-bold text-sm">AMEX</span>
                  )}
                  {method.card?.brand === 'discover' && (
                    <span className="text-orange-500 font-bold text-sm">DISC</span>
                  )}
                  {!['visa', 'mastercard', 'amex', 'discover'].includes(method.card?.brand || '') && (
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-[#F1F5F9]">
                    {method.card?.brand?.charAt(0).toUpperCase()}{method.card?.brand?.slice(1)} •••• {method.card?.last4}
                  </p>
                  <p className="text-[#94A3B8] text-sm">
                    Expires {method.card?.exp_month}/{method.card?.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.is_default && (
                  <Badge className="bg-[#00F0D9]/20 text-[#00F0D9] border-[#00F0D9]/30">
                    Default
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
