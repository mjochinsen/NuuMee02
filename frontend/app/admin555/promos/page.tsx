'use client';

import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Gift } from 'lucide-react';

function PromosPageContent() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#334155]">
        <Gift className="w-8 h-8 text-[#00F0D9]" />
      </div>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Promo Codes</h1>
      <p className="text-[#94A3B8]">Promo code management page coming soon...</p>
    </div>
  );
}

export default function PromosPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load promo codes">
      <PromosPageContent />
    </AdminErrorBoundary>
  );
}
