'use client';

import { LucideIcon, Sparkles, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface InfoBannerProps {
  text: string;
  variant?: 'cyan' | 'amber' | 'blue' | 'red';
  icon?: LucideIcon;
}

const variantStyles = {
  cyan: {
    bg: 'bg-[#00F0D9]/10',
    border: 'border-[#00F0D9]/30',
    text: 'text-[#00F0D9]',
    defaultIcon: Sparkles,
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    defaultIcon: AlertTriangle,
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    defaultIcon: Info,
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    defaultIcon: AlertCircle,
  },
};

export function InfoBanner({ text, variant = 'cyan', icon }: InfoBannerProps) {
  const styles = variantStyles[variant];
  const Icon = icon || styles.defaultIcon;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${styles.bg} border ${styles.border} mb-6`}>
      <Icon className={`w-4 h-4 ${styles.text} flex-shrink-0`} />
      <span className={`${styles.text} text-sm`}>{text}</span>
    </div>
  );
}
