'use client';

import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

export function WelcomeModal({ open, onClose, onStartDemo }: WelcomeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0F172A] border border-[#334155] rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#64748B] hover:text-[#94A3B8] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#00F0D9]" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-3">
            Welcome to NuuMee!
          </h2>

          {/* Description */}
          <p className="text-[#94A3B8] mb-6 leading-relaxed">
            Create your first AI video in <span className="text-[#00F0D9] font-medium">30 seconds</span>.<br />
            Follow our quick 3-step demo to see the magic!
          </p>

          {/* Steps preview */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm text-[#64748B]">
            <span className="px-3 py-1 bg-[#1E293B] rounded-full">1. Choose photo</span>
            <ArrowRight className="w-4 h-4" />
            <span className="px-3 py-1 bg-[#1E293B] rounded-full">2. Choose video</span>
            <ArrowRight className="w-4 h-4" />
            <span className="px-3 py-1 bg-[#1E293B] rounded-full">3. Generate!</span>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onStartDemo}
              className="w-full h-12 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white font-semibold shadow-[0_0_20px_rgba(0,240,217,0.3)]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Quick Demo
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-10 border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#F1F5F9]"
            >
              Skip and explore on my own
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
