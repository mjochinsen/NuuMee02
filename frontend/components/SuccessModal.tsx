'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight, Sparkles, Crown, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'annual' | 'monthly' | 'founding';
  planName?: string;
  planIcon?: string;
  credits?: number;
  creditsAdded?: number;
  price?: number;
  annualSavings?: number;
  nextBillingDate?: string;
  message?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  type,
  planName = 'Creator',
  planIcon = '',
  credits = 400,
  creditsAdded = 0,
  price = 29,
  annualSavings = 72,
  nextBillingDate,
  message,
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true);
      // Celebrate!
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#00F0D9', '#3B1FE2', '#F59E0B', '#10B981'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#00F0D9', '#3B1FE2', '#F59E0B', '#10B981'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, showConfetti]);

  // Reset confetti state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false);
    }
  }, [isOpen]);

  const getContent = () => {
    switch (type) {
      case 'subscribe':
        return {
          emoji: '',
          title: `Welcome to ${planName}!`,
          subtitle: 'Your subscription is now active',
          highlights: [
            { icon: <Zap className="w-5 h-5 text-[#00F0D9]" />, text: `${credits} credits added to your account` },
            { icon: <Check className="w-5 h-5 text-[#00F0D9]" />, text: 'No watermarks on your videos' },
            { icon: <Sparkles className="w-5 h-5 text-[#00F0D9]" />, text: 'Priority processing enabled' },
          ],
        };
      case 'upgrade':
        return {
          emoji: '',
          title: `Upgraded to ${planName}!`,
          subtitle: 'Enjoy your enhanced features',
          highlights: [
            { icon: <Zap className="w-5 h-5 text-[#00F0D9]" />, text: creditsAdded > 0 ? `+${creditsAdded} bonus credits added!` : `${credits} credits per month` },
            { icon: <Sparkles className="w-5 h-5 text-[#00F0D9]" />, text: 'Priority processing unlocked' },
            { icon: <Check className="w-5 h-5 text-[#00F0D9]" />, text: 'All premium features enabled' },
          ],
        };
      case 'downgrade':
        return {
          emoji: '',
          title: `Switched to ${planName}`,
          subtitle: 'Your plan has been updated',
          highlights: [
            { icon: <Check className="w-5 h-5 text-[#00F0D9]" />, text: `${credits} credits per month` },
            { icon: <Zap className="w-5 h-5 text-[#00F0D9]" />, text: 'Your current credits are preserved' },
            { icon: <Sparkles className="w-5 h-5 text-[#00F0D9]" />, text: 'You can upgrade anytime' },
          ],
        };
      case 'cancel':
        return {
          emoji: '',
          title: 'Subscription Canceled',
          subtitle: 'We hope to see you again soon',
          highlights: [
            { icon: <Check className="w-5 h-5 text-amber-500" />, text: `Access continues until ${nextBillingDate || 'end of period'}` },
            { icon: <Zap className="w-5 h-5 text-amber-500" />, text: 'Your credits remain available' },
            { icon: <Sparkles className="w-5 h-5 text-amber-500" />, text: 'Resubscribe anytime to regain benefits' },
          ],
        };
      case 'annual':
        return {
          emoji: '',
          title: 'Switched to Annual!',
          subtitle: `You're saving $${annualSavings}/year`,
          highlights: [
            { icon: <Sparkles className="w-5 h-5 text-green-500" />, text: '20% savings locked in' },
            { icon: <Check className="w-5 h-5 text-[#00F0D9]" />, text: 'Same great features' },
            { icon: <Zap className="w-5 h-5 text-[#00F0D9]" />, text: 'Prorated credit applied' },
          ],
        };
      case 'monthly':
        return {
          emoji: '',
          title: 'Switched to Monthly!',
          subtitle: 'Your billing cycle has been updated',
          highlights: [
            { icon: <Check className="w-5 h-5 text-blue-400" />, text: 'Switched to monthly billing' },
            { icon: <Zap className="w-5 h-5 text-blue-400" />, text: 'Same great features' },
            { icon: <Sparkles className="w-5 h-5 text-blue-400" />, text: 'Switch back to annual anytime' },
          ],
        };
      case 'founding':
        return {
          emoji: '',
          title: 'Welcome, Founding Member!',
          subtitle: 'You are subscriber #78',
          highlights: [
            { icon: <Crown className="w-5 h-5 text-amber-500" />, text: '20% lifetime discount locked in' },
            { icon: <Sparkles className="w-5 h-5 text-amber-500" />, text: 'Exclusive Founding Member badge' },
            { icon: <Zap className="w-5 h-5 text-[#00F0D9]" />, text: `${credits} credits added` },
          ],
        };
      default:
        return {
          emoji: '',
          title: 'Success!',
          subtitle: 'Your changes have been saved',
          highlights: [],
        };
    }
  };

  const content = getContent();
  const isCancelType = type === 'cancel';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] max-w-md p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gradient header */}
        <div className={`p-8 text-center ${
          type === 'founding'
            ? 'bg-gradient-to-br from-amber-500/20 to-[#3B1FE2]/20'
            : type === 'annual'
            ? 'bg-gradient-to-br from-green-500/20 to-[#00F0D9]/20'
            : type === 'monthly'
            ? 'bg-gradient-to-br from-blue-500/20 to-[#3B1FE2]/20'
            : isCancelType
            ? 'bg-gradient-to-br from-amber-500/10 to-[#334155]/20'
            : 'bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20'
        }`}>
          <div className="text-6xl mb-4">{content.emoji}</div>
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">{content.title}</h2>
          <p className="text-[#94A3B8]">{content.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Custom message if provided */}
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              isCancelType
                ? 'bg-amber-500/10 border border-amber-500/30'
                : 'bg-[#00F0D9]/10 border border-[#00F0D9]/30'
            }`}>
              <p className={isCancelType ? 'text-amber-400 text-sm' : 'text-[#00F0D9] text-sm'}>{message}</p>
            </div>
          )}

          {/* Highlights */}
          <div className="space-y-3 mb-6">
            {content.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B] border border-[#334155]">
                {highlight.icon}
                <span className="text-[#F1F5F9]">{highlight.text}</span>
              </div>
            ))}
          </div>

          {/* Billing info */}
          {!isCancelType && price > 0 && (
            <div className="text-center text-[#94A3B8] text-sm mb-6">
              {type === 'annual'
                ? `Next billing: ${nextBillingDate || 'in 1 year'}`
                : `${planName} Plan - $${price}/month`
              }
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/jobs/create" className="block">
              <Button className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white py-6">
                Start Creating Videos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <div className="flex justify-center gap-4">
              <Link href="/billing" className="text-[#00F0D9] hover:underline text-sm">
                Manage Subscription
              </Link>
              <button onClick={onClose} className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
