# 💳 Buy Credits Modal - Next.js Conversion

## ✅ Good News!

**This component is already Next.js compatible!** 🎉

The `BuyCreditsModal` component doesn't use React Router, so it needs **minimal changes**.

---

## 🔧 What Needs Changing

### Only 1 Issue: Line 43 (Navigation)

**Problem:**
```typescript
window.location.href = `/payment-success?credits=${selectedPackage.credits}&amount=${selectedPackage.price}`;
```

This works but isn't the Next.js way.

---

## ✅ The Fix (2 Options)

### Option 1: Use Next.js Router (Recommended)

```typescript
'use client'; // Add at line 1

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Add this import
import { X, AlertTriangle, Check } from 'lucide-react';
// ... rest of imports

export function BuyCreditsModal({ isOpen, onClose, selectedPackage }: BuyCreditsModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter(); // Add this

  if (!selectedPackage) return null;

  const tax = 0;
  const total = selectedPackage.price + tax;

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    
    // Simulate redirect to Stripe Checkout
    setTimeout(() => {
      // ✅ NEXT.JS WAY
      router.push(`/payment-success?credits=${selectedPackage.credits}&amount=${selectedPackage.price}`);
    }, 1000);
  };

  // ... rest of component
}
```

---

### Option 2: Keep window.location (Quick Fix)

Just add the `'use client'` directive:

```typescript
'use client'; // Add at line 1

import { useState } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';
// ... rest stays the same
```

The `window.location.href` will still work in Next.js.

---

## 📋 Quick Conversion Steps

### Step 1: Add "use client"
```typescript
'use client';

import { useState } from 'react';
```

### Step 2 (Optional): Use Next.js Router
```typescript
import { useRouter } from 'next/navigation';

// Inside component
const router = useRouter();

// In handleProceedToPayment
router.push(`/payment-success?credits=${...}&amount=${...}`);
```

---

## ✅ Done!

That's it. The modal should work in Next.js now.

---

## 🧪 Test Checklist

- [ ] Modal opens when clicking "Buy Credits"
- [ ] Package info displays correctly
- [ ] Payment method selector works
- [ ] "Proceed to Payment" button redirects
- [ ] Modal closes properly
- [ ] No console errors

---

## 📍 Files to Change

| File | Changes Needed |
|------|----------------|
| `/components/BuyCreditsModal.tsx` | Add `'use client'` + optional router |
| `/components/PaymentMethodSelector.tsx` | Already has `'use client'` ✅ |
| `/components/ui/dialog.tsx` | No changes needed ✅ |

---

## 🎯 Complete Fixed Version

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface CreditPackage {
  name: string;
  price: number;
  credits: number;
  pricePerCredit: number;
  bonus: string | null;
}

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: CreditPackage | null;
}

export function BuyCreditsModal({ isOpen, onClose, selectedPackage }: BuyCreditsModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card-1');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (!selectedPackage) return null;

  const tax = 0;
  const total = selectedPackage.price + tax;

  const handleProceedToPayment = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      router.push(`/payment-success?credits=${selectedPackage.credits}&amount=${selectedPackage.price}`);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#F1F5F9] text-2xl">Confirm Purchase</DialogTitle>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
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
```

---

## 🎯 Summary

**Total Changes:** 2-3 lines
**Time:** 1 minute
**Difficulty:** ⭐☆☆☆☆ (Very Easy)

### Changes:
1. Line 1: Add `'use client';`
2. Line 3: Add `import { useRouter } from 'next/navigation';`
3. Line 30: Add `const router = useRouter();`
4. Line 43: Change `window.location.href` to `router.push(...)`

**That's it!** ✅
