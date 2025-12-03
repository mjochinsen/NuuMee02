'use client';

import { ReactNode } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { InfoTooltip } from './InfoTooltip';

export interface FeatureCardProps {
  id: string;
  label: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  tooltip: ReactNode;
  exampleUrl?: string;
  children?: ReactNode;
}

export function FeatureCard({
  id,
  label,
  enabled,
  onEnabledChange,
  tooltip,
  exampleUrl,
  children,
}: FeatureCardProps) {
  return (
    <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
      <div className="flex items-start gap-3 mb-4">
        <Checkbox
          id={id}
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked as boolean)}
          className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <label htmlFor={id} className="text-[#F1F5F9] cursor-pointer font-medium">
              {label}
            </label>
            <InfoTooltip content={tooltip} maxWidth="max-w-sm" />
            {exampleUrl && (
              <a
                href={exampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors text-sm"
              >
                <LinkIcon className="w-3 h-3" />
                <span>Example</span>
              </a>
            )}
          </div>
          {enabled && children && (
            <div className="space-y-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
