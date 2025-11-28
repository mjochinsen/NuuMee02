'use client';

import { useState } from 'react';
import { Gift, Copy, Check, Users, DollarSign, Share2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'signed-up' | 'converted';
  date: string;
  reward: number;
}

export default function ReferralPage() {
  const [referrals] = useState<Referral[]>([
    { id: '1', email: 'john@example.com', status: 'converted', date: 'Nov 1, 2025', reward: 10 },
    { id: '2', email: 'jane@example.com', status: 'signed-up', date: 'Nov 10, 2025', reward: 5 },
    { id: '3', email: 'bob@example.com', status: 'pending', date: 'Nov 14, 2025', reward: 0 },
  ]);

  const [copied, setCopied] = useState(false);
  const referralCode = 'NUUMEE-ABC123';
  const referralLink = `https://nuumee.ai/signup?ref=${referralCode}`;

  const stats = {
    totalReferrals: referrals.length,
    signedUp: referrals.filter(r => r.status === 'signed-up' || r.status === 'converted').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    totalEarned: referrals.reduce((sum, r) => sum + r.reward, 0)
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'signed-up': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-[#334155] text-[#94A3B8] border-[#334155]';
    }
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center"><Gift className="w-6 h-6 text-[#00F0D9]" /></div>
          <div><h1 className="text-3xl font-bold text-[#F1F5F9]">Referral Program</h1><p className="text-[#94A3B8] text-sm">Earn credits by referring friends to NuuMee</p></div>
        </div>
        <div className="h-px bg-[#334155]"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-[#334155] rounded-xl p-4 bg-[#0F172A]"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-[#00F0D9]" /><div><p className="text-2xl font-bold text-[#F1F5F9]">{stats.totalReferrals}</p><p className="text-sm text-[#94A3B8]">Total Referrals</p></div></div></div>
        <div className="border border-[#334155] rounded-xl p-4 bg-[#0F172A]"><div className="flex items-center gap-3"><Check className="w-8 h-8 text-[#3B1FE2]" /><div><p className="text-2xl font-bold text-[#F1F5F9]">{stats.signedUp}</p><p className="text-sm text-[#94A3B8]">Signed Up</p></div></div></div>
        <div className="border border-[#334155] rounded-xl p-4 bg-[#0F172A]"><div className="flex items-center gap-3"><Gift className="w-8 h-8 text-[#00F0D9]" /><div><p className="text-2xl font-bold text-[#F1F5F9]">{stats.converted}</p><p className="text-sm text-[#94A3B8]">Converted</p></div></div></div>
        <div className="border border-[#334155] rounded-xl p-4 bg-[#0F172A]"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-[#00F0D9]" /><div><p className="text-2xl font-bold text-[#F1F5F9]">${stats.totalEarned}</p><p className="text-sm text-[#94A3B8]">Total Earned</p></div></div></div>
      </div>

      {/* Referral Link */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-4"><Share2 className="w-5 h-5 text-[#00F0D9]" /><h2 className="text-[#F1F5F9]">Your Referral Link</h2></div>
        <p className="text-[#94A3B8] text-sm mb-4">Share this link to earn rewards when friends sign up</p>
        <div className="flex gap-2 mb-6">
          <Input readOnly value={referralLink} className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] font-mono" />
          <Button onClick={copyToClipboard} className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-6">{copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}</Button>
        </div>
        <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
          <h3 className="text-[#F1F5F9] font-semibold mb-2">How it works:</h3>
          <ul className="space-y-2 text-[#94A3B8] text-sm">
            <li>• Share your unique referral link with friends</li>
            <li>• Earn $5 when they sign up</li>
            <li>• Earn $10 when they make their first purchase</li>
            <li>• No limit on the number of referrals</li>
          </ul>
        </div>
      </div>

      {/* Referral List */}
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-4">Referral History</h2>
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8]">No referrals yet. Start sharing your link!</div>
          ) : (
            referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
                <div><p className="text-[#F1F5F9] font-medium">{referral.email}</p><p className="text-[#94A3B8] text-sm">Referred on {referral.date}</p></div>
                <div className="flex items-center gap-4"><Badge className={getStatusColor(referral.status)}>{referral.status.replace('-', ' ')}</Badge>{referral.reward > 0 && <span className="text-[#00F0D9] font-semibold">+${referral.reward}</span>}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
