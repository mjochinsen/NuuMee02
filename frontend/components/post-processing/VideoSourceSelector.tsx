'use client';

import { Video, Film, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { VideoSource, SectionId } from './types';

export interface VideoSourceSelectorProps {
  sectionId: SectionId;
  label: string;
  source: VideoSource;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onOpenJobPicker: () => void;
}

export function VideoSourceSelector({
  sectionId,
  label,
  source,
  fileInputRef,
  onFileSelect,
  onClear,
  onOpenJobPicker,
}: VideoSourceSelectorProps) {
  return (
    <div className="border border-[#334155] rounded-lg p-4 bg-[#1E293B] mb-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />

      {source.type === 'file' && source.filePreview ? (
        <div className="relative">
          <video
            src={source.filePreview}
            className="w-full aspect-video object-contain rounded-lg bg-black"
            controls
          />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          <p className="text-[#94A3B8] text-xs mt-2 truncate">{source.file?.name}</p>
        </div>
      ) : source.type === 'job' && source.job ? (
        <div className="relative">
          {source.jobThumbnailUrl ? (
            <video
              src={source.jobThumbnailUrl}
              className="w-full aspect-video object-contain rounded-lg bg-black"
              controls
              muted
              playsInline
            />
          ) : (
            <div className="w-full aspect-video bg-[#0F172A] rounded-lg flex items-center justify-center">
              <Video className="w-8 h-8 text-[#64748B]" />
            </div>
          )}
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          <div className="mt-2 flex items-center gap-2">
            <Film className="w-3 h-3 text-[#00F0D9]" />
            <span className="text-[#00F0D9] text-xs font-medium">
              From job {source.job.short_id || source.job.id.slice(0, 8)}
            </span>
            <span className="text-[#64748B] text-xs">
              • {source.job.resolution.toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <Video className="w-4 h-4 text-[#94A3B8]" />
            <span className="text-[#94A3B8] text-sm">{label}</span>
          </div>
          <div className="flex gap-2 justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-[#334155] text-[#64748B] cursor-not-allowed opacity-50"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload File
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Coming soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              className="border-[#00F0D9] text-[#00F0D9] hover:bg-[#00F0D9]/10"
              onClick={onOpenJobPicker}
            >
              <Film className="w-3 h-3 mr-1" />
              From My Jobs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
