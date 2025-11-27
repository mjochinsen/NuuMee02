import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Zap, Mail, Download, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const creditsAdded = parseInt(searchParams.get('credits') || '400');
  const previousBalance = 25;
  const newBalance = previousBalance + creditsAdded;

  return (
    <main className="container mx-auto px-6 py-20 max-w-4xl">
      <div className="text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#F1F5F9] mb-4">Payment Successful!</h1>

        {/* Subheading */}
        <p className="text-[#94A3B8] text-lg mb-12">
          {creditsAdded} credits added to your account
        </p>

        {/* Credit Balance Card */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#1E293B] p-8 mb-10">
          <p className="text-[#94A3B8] mb-4">Your Credit Balance</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-[#00F0D9]" />
            <span className="text-[#00F0D9] text-5xl">{newBalance}</span>
            <span className="text-[#94A3B8] text-xl">credits</span>
          </div>
          <p className="text-[#94A3B8] text-sm">
            Previous: {previousBalance} • Added: {creditsAdded}
          </p>
        </Card>

        {/* Primary CTA */}
        <Link to="/create">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-12 py-6 text-lg mb-6">
            🎬 Start Creating Videos
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>

        {/* Secondary Links */}
        <div className="flex justify-center gap-6 mb-12">
          <button className="text-[#00F0D9] hover:underline flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Receipt
          </button>
          <Link to="/billing" className="text-[#00F0D9] hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {/* Receipt Details */}
        <Card className="max-w-md mx-auto border-[#334155] bg-[#0F172A] p-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📄</span>
            <h2 className="text-[#F1F5F9] text-xl">Receipt Details</h2>
          </div>
          <div className="h-px bg-[#334155] mb-4"></div>
          <div className="space-y-3 text-[#94A3B8]">
            <div className="flex justify-between">
              <span>Package:</span>
              <span className="text-[#F1F5F9]">
                {creditsAdded === 120
                  ? 'Starter (120 credits)'
                  : creditsAdded === 400
                  ? 'Popular (400 credits)'
                  : creditsAdded === 1100
                  ? 'Pro (1,100 credits)'
                  : 'Mega (2,500 credits)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="text-[#F1F5F9]">
                $
                {creditsAdded === 120
                  ? '10.00'
                  : creditsAdded === 400
                  ? '30.00'
                  : creditsAdded === 1100
                  ? '75.00'
                  : '150.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment method:</span>
              <span className="text-[#F1F5F9]">•••• 4242</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-[#F1F5F9]">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="text-[#F1F5F9] font-mono text-sm">ch_3abc123def</span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Receipt
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
