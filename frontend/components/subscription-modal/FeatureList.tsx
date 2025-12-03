'use client';

import { Check, X } from 'lucide-react';

export interface FeatureListProps {
  features: string[];
  iconType?: 'check' | 'x';
  iconColor?: string;
  maxItems?: number;
  title?: string;
}

export function FeatureList({
  features,
  iconType = 'check',
  iconColor = 'text-[#00F0D9]',
  maxItems,
  title,
}: FeatureListProps) {
  const Icon = iconType === 'check' ? Check : X;
  const displayFeatures = maxItems ? features.slice(0, maxItems) : features;

  return (
    <div className="mb-6">
      {title && <h4 className="text-[#F1F5F9] mb-3">{title}</h4>}
      <div className="space-y-2">
        {displayFeatures.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2 text-[#94A3B8]">
            <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
