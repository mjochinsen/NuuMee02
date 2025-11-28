'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Download, Calendar, Receipt, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function BillingPage() {
  const [currentPlan] = useState({ name: 'Creator', price: 29, credits: 400, usedCredits: 267, nextBilling: 'Dec 15, 2025' });

  const invoices = [
    { id: 'INV-2025-003', date: 'Nov 15, 2025', amount: 29, status: 'paid', description: 'Creator Plan - Monthly' },
    { id: 'INV-2025-002', date: 'Oct 15, 2025', amount: 29, status: 'paid', description: 'Creator Plan - Monthly' },
    { id: 'INV-2025-001', date: 'Sep 15, 2025', amount: 29, status: 'paid', description: 'Creator Plan - Monthly' },
  ];

  const creditHistory = [
    { date: 'Nov 14, 2025', description: 'Video Generation - job-abc-123', credits: -2 },
    { date: 'Nov 13, 2025', description: 'Video Generation - job-def-456', credits: -3 },
    { date: 'Nov 1, 2025', description: 'Monthly subscription renewal', credits: 400 },
    { date: 'Oct 31, 2025', description: 'Credit rollover (50%)', credits: 67 },
  ];

  const creditsRemaining = currentPlan.credits - currentPlan.usedCredits;
  const creditsPercentage = (creditsRemaining / currentPlan.credits) * 100;

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center"><Receipt className="w-6 h-6 text-[#00F0D9]" /></div>
          <div><h1 className="text-3xl font-bold text-[#F1F5F9]">Billing & Subscription</h1><p className="text-[#94A3B8] text-sm">Manage your plan, credits, and payment methods</p></div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Current Plan */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#00F0D9]" />
            <div><h2 className="text-[#F1F5F9] text-xl">{currentPlan.name} Plan</h2><p className="text-[#94A3B8] text-sm">${currentPlan.price}/month</p></div>
          </div>
          <div className="flex gap-2">
            <Link href="/pricing"><Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Change Plan</Button></Link>
            <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">Buy Credits</Button>
          </div>
        </div>

        {/* Credits Usage */}
        <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B] mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#F1F5F9]">Credits This Period</span>
            <span className="text-[#00F0D9] font-semibold">{creditsRemaining} / {currentPlan.credits}</span>
          </div>
          <Progress value={creditsPercentage} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-[#94A3B8]">
            <span>{currentPlan.usedCredits} used</span>
            <span>Resets on {currentPlan.nextBilling}</span>
          </div>
        </div>

        {creditsPercentage < 20 && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle className="w-5 h-5" /><span className="text-sm">Running low on credits! Consider upgrading or buying more.</span>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Payment Method</h2></div>
        <div className="flex items-center justify-between border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
            <div><p className="text-[#F1F5F9]">•••• •••• •••• 4242</p><p className="text-[#94A3B8] text-sm">Expires 12/26</p></div>
          </div>
          <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Update</Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Billing History</h2></div>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between border border-[#334155] rounded-xl p-4 bg-[#1E293B] hover:border-[#00F0D9]/50 transition-colors">
              <div>
                <p className="text-[#F1F5F9]">{invoice.description}</p>
                <p className="text-[#94A3B8] text-sm">{invoice.date} • {invoice.id}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{invoice.status}</Badge>
                <span className="text-[#F1F5F9] font-semibold">${invoice.amount}</span>
                <Button variant="ghost" size="sm" className="text-[#00F0D9] hover:text-[#00F0D9]/80"><Download className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit History */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
        <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Credit History</h2></div>
        <div className="space-y-2">
          {creditHistory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-[#334155] last:border-0">
              <div><p className="text-[#F1F5F9]">{item.description}</p><p className="text-[#94A3B8] text-sm">{item.date}</p></div>
              <span className={`font-semibold ${item.credits > 0 ? 'text-green-400' : 'text-[#94A3B8]'}`}>{item.credits > 0 ? '+' : ''}{item.credits}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
