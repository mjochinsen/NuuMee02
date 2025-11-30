'use client';

import { CreditCard, Lock } from 'lucide-react';
import Image from 'next/image';

interface PaymentMethodSelectorProps {
  selectedMethod?: string;
  onMethodChange?: (methodId: string) => void;
  onAddNew?: () => void;
  showAddNew?: boolean;
}

// Payment method icons using SVG data URIs from datatrans/payment-logos
const PaymentIcons = {
  visa: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#fff" width="38" height="24" rx="3"/>
      <path fill="#142688" d="M15.578 7.672l-2.344 8.656h-1.906l2.344-8.656h1.906zm9.484 5.594l1-2.766.578 2.766h-1.578zm2.125 3.062h1.766l-1.547-8.656h-1.625a.797.797 0 0 0-.75.5l-2.625 8.156h1.844l.375-1.016h2.234l.328 1.016zm-4.781-2.828c0-2.281-3.156-2.406-3.156-3.422 0-.313.313-.625.969-.703.328-.047 1.219-.094 2.234.469l.391-1.875a6.034 6.034 0 0 0-2.109-.391c-1.75 0-3 .938-3.016 2.281-.016 1 .891 1.547 1.563 1.875.688.344 .922.563.922.875-.016.469-.563.688-1.078.688-.906.016-1.438-.25-1.844-.438l-.328 1.531c.422.188 1.188.359 2 .375 1.875 0 3.094-.922 3.109-2.359l-.656.094zm-7.391-5.828l-2.906 8.656H10.25l-1.438-6.922c-.078-.328-.156-.453-.422-.594-.422-.219-1.125-.438-1.75-.563l.047-.219h3.031c.391 0 .75.266.828.719l.75 3.984 1.844-4.703h1.875v-.358z"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#fff" width="38" height="24" rx="3"/>
      <circle fill="#EB001B" cx="15" cy="12" r="7"/>
      <circle fill="#F79E1B" cx="23" cy="12" r="7"/>
      <path fill="#FF5F00" d="M19 6.5a7 7 0 0 0-2.5 5.5 7 7 0 0 0 2.5 5.5 7 7 0 0 0 2.5-5.5 7 7 0 0 0-2.5-5.5z"/>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#006FCF" width="38" height="24" rx="3"/>
      <text fill="#fff" fontSize="6" fontWeight="bold" x="19" y="14" textAnchor="middle">AMEX</text>
    </svg>
  ),
  googlepay: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#fff" width="38" height="24" rx="3" stroke="#ddd" strokeWidth="0.5"/>
      <path fill="#4285F4" d="M19.2 12.3c0-.4 0-.8-.1-1.2h-4.6v2.2h2.7c-.1.6-.5 1.1-1 1.4v1.2h1.6c.9-.9 1.4-2.2 1.4-3.6z"/>
      <path fill="#34A853" d="M14.5 16.5c1.4 0 2.5-.5 3.3-1.2l-1.6-1.2c-.5.3-1 .5-1.7.5-1.3 0-2.4-.9-2.8-2h-1.6v1.3c.8 1.6 2.4 2.6 4.4 2.6z"/>
      <path fill="#FBBC05" d="M11.7 12.5c-.1-.3-.2-.6-.2-1s.1-.7.2-1V9.2h-1.6c-.3.7-.5 1.4-.5 2.2s.2 1.5.5 2.2l1.6-1.1z"/>
      <path fill="#EA4335" d="M14.5 9.5c.7 0 1.4.2 1.9.7l1.4-1.4c-.9-.8-2-1.3-3.3-1.3-2 0-3.6 1-4.4 2.6l1.6 1.3c.4-1.2 1.5-1.9 2.8-1.9z"/>
      <text fill="#5f6368" fontSize="4" x="22" y="13" fontFamily="Arial">Pay</text>
    </svg>
  ),
  applepay: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#000" width="38" height="24" rx="3"/>
      <path fill="#fff" d="M12.5 8c-.5 0-1 .2-1.3.5-.3.4-.5.8-.4 1.3.5 0 1-.2 1.3-.5.3-.4.5-.8.4-1.3zm-.4 1.8c-.7 0-1.4.4-1.8.4s-1-.4-1.6-.4c-.8 0-1.6.5-2 1.3-.9 1.5-.2 3.7.6 5 .4.6.9 1.3 1.6 1.3s1-.4 1.6-.4c.7 0 .9.4 1.7.4.7 0 1.1-.6 1.5-1.2.5-.7.7-1.4.7-1.4s-1.3-.5-1.3-2c0-1.3 1.1-1.9 1.1-2-.6-.9-1.5-1-1.9-1-.5 0-1 .3-1.2.3z"/>
      <text fill="#fff" fontSize="6" fontWeight="600" x="19" y="14.5">Pay</text>
    </svg>
  ),
  paypal: (
    <svg viewBox="0 0 38 24" className="w-10 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#fff" width="38" height="24" rx="3" stroke="#ddd" strokeWidth="0.5"/>
      <path fill="#003087" d="M13.5 7h3c1.6 0 2.7.8 2.5 2.5-.2 2.1-1.6 3.2-3.4 3.2h-.9c-.2 0-.4.2-.5.5l-.4 2.5c0 .2-.2.3-.4.3h-1.5c-.2 0-.3-.1-.3-.3l1.2-8.3c0-.2.2-.4.4-.4z"/>
      <path fill="#009cde" d="M24.5 7h-3c-.2 0-.4.2-.4.4l-1.2 8.3c0 .2.1.3.3.3h1.6c.1 0 .2-.1.2-.2l.3-2c0-.2.2-.4.4-.4h1c2.1 0 3.4-1 3.7-3 .1-.8 0-1.5-.4-1.9-.5-.5-1.3-.8-2.5-.8z"/>
    </svg>
  ),
};

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  onAddNew,
  showAddNew = true,
}: PaymentMethodSelectorProps) {
  return (
    <div>
      <h4 className="text-[#F1F5F9] mb-3">Payment</h4>

      {/* Stripe Secure Payment Notice */}
      <div className="p-4 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="w-5 h-5 text-[#00F0D9]" />
          <span className="text-[#F1F5F9]">Secure checkout powered by Stripe</span>
        </div>

        <p className="text-[#94A3B8] text-sm mb-4">
          You'll be redirected to Stripe's secure payment page where you can pay with:
        </p>

        {/* Accepted Payment Methods */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1.5 bg-white rounded">{PaymentIcons.visa}</div>
          <div className="p-1.5 bg-white rounded">{PaymentIcons.mastercard}</div>
          <div className="p-1.5 bg-white rounded">{PaymentIcons.amex}</div>
          <div className="p-1.5 bg-white rounded">{PaymentIcons.googlepay}</div>
          <div className="p-1.5 bg-white rounded">{PaymentIcons.applepay}</div>
          <div className="p-1.5 bg-white rounded">{PaymentIcons.paypal}</div>
        </div>
      </div>
    </div>
  );
}

export function PaymentMethodSelectorCompact({
  selectedMethod = 'card-1',
}: {
  selectedMethod?: string;
}) {
  return (
    <div className="mb-6">
      <h4 className="text-[#F1F5F9] mb-3">Payment</h4>
      <div className="p-3 rounded-lg border border-[#334155] bg-[#1E293B]">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#00F0D9]" />
          <span className="text-[#F1F5F9] text-sm">Secure checkout via Stripe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white rounded">{PaymentIcons.visa}</div>
          <div className="p-1 bg-white rounded">{PaymentIcons.mastercard}</div>
          <div className="p-1 bg-white rounded">{PaymentIcons.googlepay}</div>
          <div className="p-1 bg-white rounded">{PaymentIcons.applepay}</div>
        </div>
      </div>
    </div>
  );
}
