'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface InfoTooltipProps {
  content: React.ReactNode;
  maxWidth?: string;
}

export function InfoTooltip({ content, maxWidth = 'max-w-sm' }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center text-[#94A3B8] hover:text-[#00F0D9] transition-colors"
            aria-label="More information"
          >
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className={`${maxWidth} bg-[#1E293B] border-[#334155] text-[#94A3B8] text-sm p-3`}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
