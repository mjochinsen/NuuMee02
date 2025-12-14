'use client';

import { useState, useCallback } from 'react';
import { Info, Maximize, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { createJob, ApiError } from '@/lib/api';
import { VideoSourceSelector } from '../VideoSourceSelector';
import { ResultSection } from '../ResultSection';
import { SectionProps, ResultStatus } from '../types';

interface VideoUpscalerSectionProps extends SectionProps {}

export function VideoUpscalerSection({
  videoSource,
  onFileSelect,
  onClear,
  onOpenJobPicker,
  fileInputRef,
}: VideoUpscalerSectionProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResultStatus>('awaiting');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (videoSource.type !== 'job' || !videoSource.job) {
      setError('Please select a video from your jobs');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      await createJob({
        job_type: 'upscale',
        source_job_id: videoSource.job.id,
        resolution: videoSource.job.resolution,
      });
      router.push('/jobs');
    } catch (err) {
      console.error('Failed to create upscale job:', err);
      setStatus('failed');
      setError(err instanceof ApiError ? err.message : 'Failed to create upscale job. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [videoSource, router]);

  return (
    <TooltipProvider>
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
        <div className="flex items-start gap-3">
          <Checkbox
            id="upscaler"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked as boolean)}
            className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="upscaler" className="text-[#F1F5F9] cursor-pointer font-medium">
                Video Upscaler (1080p)
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                  <div className="space-y-2">
                    <p className="mb-2">Enhance your completed video to crisp 1080p Full HD resolution.</p>
                    <div className="space-y-1">
                      <p className="text-[#00F0D9]">What it does:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Upscales resolution with AI enhancement</li>
                        <li>Sharpens details and edges</li>
                        <li>Reduces compression artifacts</li>
                      </ul>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-[#00F0D9]">Best for:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Professional/commercial content</li>
                        <li>Large displays or cinema</li>
                        <li>High-quality final deliverables</li>
                      </ul>
                    </div>
                    <div className="space-y-1 text-sm text-amber-400 mt-2">
                      <p>Note:</p>
                      <ul className="list-disc list-inside text-[#94A3B8]">
                        <li>Only works on completed videos</li>
                        <li>Creates 5-10x larger files</li>
                        <li>Processing: 30-60 minutes</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            {enabled && (
              <div className="space-y-3">
                <VideoSourceSelector
                  sectionId="upscaler"
                  label="Select video to upscale"
                  source={videoSource}
                  fileInputRef={fileInputRef}
                  onFileSelect={onFileSelect}
                  onClear={onClear}
                  onOpenJobPicker={onOpenJobPicker}
                />
                {error && status === 'failed' && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <Button
                  className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                  onClick={handleSubmit}
                  disabled={!videoSource.type || loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Maximize className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Creating job...' : `Generate (${videoSource.job?.credits_charged?.toFixed(1) || '5'} credits)`}
                </Button>
                <ResultSection status={status} />
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
