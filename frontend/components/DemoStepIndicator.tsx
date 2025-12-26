'use client';

import { Check } from 'lucide-react';

interface DemoStepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onSkip: () => void;
}

export function DemoStepIndicator({ currentStep, onSkip }: DemoStepIndicatorProps) {
  const steps = [
    { num: 1, label: 'Choose Photo' },
    { num: 2, label: 'Choose Video' },
    { num: 3, label: 'Generate!' },
  ];

  return (
    <div className="mb-6 p-4 bg-[#1E293B]/50 border border-[#334155] rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#00F0D9] text-lg">📍</span>
          <span className="text-[#F1F5F9] font-medium">
            Quick Demo (Step {currentStep} of 3)
          </span>
        </div>
        <button
          onClick={onSkip}
          className="text-[#64748B] hover:text-[#94A3B8] text-sm transition-colors"
        >
          Skip demo →
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step.num < currentStep
                  ? 'bg-[#00F0D9] text-[#0F172A]'
                  : step.num === currentStep
                  ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white shadow-[0_0_10px_rgba(0,240,217,0.5)]'
                  : 'bg-[#334155] text-[#64748B]'
              }`}
            >
              {step.num < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.num
              )}
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                  step.num < currentStep ? 'bg-[#00F0D9]' : 'bg-[#334155]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs">
        {steps.map((step) => (
          <span
            key={step.num}
            className={`${
              step.num === currentStep
                ? 'text-[#00F0D9] font-medium'
                : step.num < currentStep
                ? 'text-[#94A3B8]'
                : 'text-[#64748B]'
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
