'use client';

import { useState, useCallback } from 'react';
import { Info, Link as LinkIcon, Video, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { createJob, ApiError } from '@/lib/api';
import { VideoSourceSelector } from '../VideoSourceSelector';
import { ResultSection } from '../ResultSection';
import { SectionProps, ResultStatus } from '../types';

interface VideoExtenderSectionProps extends SectionProps {}

export function VideoExtenderSection({
  videoSource,
  onFileSelect,
  onClear,
  onOpenJobPicker,
  fileInputRef,
}: VideoExtenderSectionProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResultStatus>('awaiting');
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

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
        job_type: 'extend',
        source_job_id: videoSource.job.id,
        extension_prompt: prompt || undefined,
        resolution: videoSource.job.resolution,
      });
      router.push('/jobs');
    } catch (err) {
      console.error('Failed to create extend job:', err);
      setStatus('failed');
      setError(err instanceof ApiError ? err.message : 'Failed to create extend job. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [videoSource, prompt, router]);

  return (
    <TooltipProvider>
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
        <div className="flex items-start gap-3 mb-4">
          <Checkbox
            id="video-extender"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked as boolean)}
            className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="video-extender" className="text-[#F1F5F9] cursor-pointer font-medium">
                Video Extender
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                  <div className="space-y-2">
                    <p className="mb-2">Extend your video by generating smooth AI continuation beyond the original clip.</p>
                    <div className="space-y-1">
                      <p className="text-[#00F0D9]">What it does:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Analyzes motion patterns</li>
                        <li>Generates natural continuation (3-10 seconds)</li>
                        <li>Maintains visual consistency</li>
                      </ul>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-[#00F0D9]">Great for:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Creating seamless loops</li>
                        <li>Extending dance/action clips</li>
                        <li>Building longer storytelling sequences</li>
                      </ul>
                    </div>
                    <div className="text-sm text-[#94A3B8] mt-2">
                      <p>Supports prompts in English or Chinese</p>
                      <p>Optional: Add audio for better motion sync</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              <button className="flex items-center gap-1 text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors text-sm">
                <LinkIcon className="w-3 h-3" />
                <span>Example</span>
              </button>
            </div>
            {enabled && (
              <div className="space-y-3">
                <VideoSourceSelector
                  sectionId="extender"
                  label="Select video to extend"
                  source={videoSource}
                  fileInputRef={fileInputRef}
                  onFileSelect={onFileSelect}
                  onClear={onClear}
                  onOpenJobPicker={onOpenJobPicker}
                />
                <Textarea
                  placeholder="Enter extension prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] min-h-[80px]"
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
                    <Video className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Creating job...' : `Generate (${videoSource.job?.resolution === '720p' ? '10' : '5'} credits)`}
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
