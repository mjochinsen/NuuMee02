'use client';

import { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';

interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credits: number;
  pricePerCredit: number;
  bonus?: string | null;
}

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: CreditPackage | null;
  onProceed: (packageId: string) => void;
  isProcessing?: boolean;
}

export function BuyCreditsModal({ isOpen, onClose, selectedPackage, onProceed, isProcessing = false }: BuyCreditsModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card-1');

  if (!selectedPackage) return null;

  const tax = 0; // Can be calculated based on location
  const total = selectedPackage.price + tax;

  const handleProceedToPayment = () => {
    onProceed(selectedPackage.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#F1F5F9] text-2xl">Confirm Purchase</DialogTitle>
            <button
              onClick={onClose}
              className="hidden text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="text-[#94A3B8]">
            Review your order and proceed to payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Package Display */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/30 text-center">
            <div className="mb-2">
              <Badge className="bg-[#00F0D9]/20 text-[#00F0D9] border-[#00F0D9]/30">
                {selectedPackage.name}
                {selectedPackage.bonus && ` • ${selectedPackage.bonus}`}
              </Badge>
            </div>
            <div className="text-4xl text-[#F1F5F9] mb-1">
              {selectedPackage.credits} Credits
            </div>
            <div className="text-3xl text-[#00F0D9] mb-3">
              ${selectedPackage.price}
            </div>
            <div className="text-sm text-[#94A3B8]">
              ${selectedPackage.pricePerCredit.toFixed(3)} per credit
            </div>
          </div>

          {/* Payment Method */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />

          {/* Summary */}
          <div className="border-t border-[#334155] pt-4">
            <h3 className="text-[#F1F5F9] mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[#94A3B8]">
                <span>{selectedPackage.credits} credits</span>
                <span>${selectedPackage.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Tax (if applicable)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[#334155] my-2"></div>
              <div className="flex justify-between text-[#F1F5F9] text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 p-4 rounded-lg bg-[#1E293B] border border-[#334155]">
            {[
              'Credits never expire',
              'Use across all features',
              'Instant access',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-[#94A3B8]">
                <Check className="w-4 h-4 text-[#00F0D9]" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
              onClick={handleProceedToPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
