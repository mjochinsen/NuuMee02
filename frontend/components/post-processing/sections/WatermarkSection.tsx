'use client';

import { useState, useCallback } from 'react';
import { Info, Droplet, X, Loader2, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { createWatermarkJob, ApiError } from '@/lib/api';
import { VideoSourceSelector } from '../VideoSourceSelector';
import { ResultSection } from '../ResultSection';
import { SectionProps, ResultStatus } from '../types';

interface WatermarkSectionProps extends SectionProps {
  isFreeTier: boolean;
}

export function WatermarkSection({
  videoSource,
  onFileSelect,
  onClear,
  onOpenJobPicker,
  fileInputRef,
  isFreeTier,
}: WatermarkSectionProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResultStatus>('awaiting');
  const [error, setError] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState('70');

  const handleSubmit = useCallback(async () => {
    if (videoSource.type !== 'job' || !videoSource.job) {
      setError('Please select a video from your jobs');
      return;
    }

    if (!watermarkImage) {
      setError('Please upload a watermark image');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      await createWatermarkJob(
        videoSource.job.id,
        watermarkImage,
        watermarkPosition,
        parseInt(watermarkOpacity) / 100
      );
      router.push('/jobs');
    } catch (err) {
      console.error('Failed to create watermark job:', err);
      setStatus('failed');
      setError(err instanceof ApiError ? err.message : 'Failed to create watermark job. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [videoSource, watermarkImage, watermarkPosition, watermarkOpacity, router]);

  return (
    <TooltipProvider>
      <div className={`border rounded-2xl p-6 bg-[#0F172A] ${isFreeTier ? 'border-[#334155] opacity-60' : 'border-[#334155]'}`}>
        <div className="flex items-start gap-3">
          {isFreeTier ? (
            <div className="mt-1 w-4 h-4 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#64748B]" />
            </div>
          ) : (
            <Checkbox
              id="watermark"
              checked={enabled}
              onCheckedChange={(checked) => setEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="watermark" className={`font-medium ${isFreeTier ? 'text-[#64748B] cursor-not-allowed' : 'text-[#F1F5F9] cursor-pointer'}`}>
                Add Watermark
              </label>
              {isFreeTier && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                  Upgrade to remove
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                  <div className="space-y-2">
                    {isFreeTier ? (
                      <>
                        <p className="mb-2 text-amber-400">Free plan videos include NuuMee.AI watermark</p>
                        <p className="text-sm text-[#94A3B8]">Upgrade to Creator or Studio plan to:</p>
                        <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                          <li>Remove NuuMee watermark completely</li>
                          <li>Add your own custom logo watermark</li>
                          <li>Control position and opacity</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">Add your custom logo or text watermark to protect your content.</p>
                        <div className="space-y-1">
                          <p className="text-[#00F0D9]">Options:</p>
                          <ul className="list-none text-sm text-[#94A3B8]">
                            <li>Logo - Upload PNG with transparency</li>
                            <li>Text - Add custom text overlay</li>
                            <li>Position - Place anywhere on video</li>
                            <li>Opacity - Adjust transparency (10-100%)</li>
                          </ul>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-[#00F0D9]">Best practices:</p>
                          <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                            <li>Recommended size: ~100x50 pixels</li>
                            <li>Use PNG with transparent background</li>
                            <li>Place in corners to avoid key content</li>
                            <li>Use 30-50% opacity for subtle branding</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            {isFreeTier ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/nuumee-watermark-preview.png"
                    alt="NuuMee.AI watermark"
                    className="h-8 w-auto opacity-70"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-amber-400 text-sm font-medium">NuuMee.AI watermark will be added</p>
                    <p className="text-[#94A3B8] text-xs">All Free plan videos include our watermark (bottom-right, 70% opacity)</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade to Remove Watermark
                </Button>
              </div>
            ) : enabled && (
              <div className="space-y-3">
                <VideoSourceSelector
                  sectionId="watermark"
                  label="Select video for watermark"
                  source={videoSource}
                  fileInputRef={fileInputRef}
                  onFileSelect={onFileSelect}
                  onClear={onClear}
                  onOpenJobPicker={onOpenJobPicker}
                />

                {/* Watermark Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#94A3B8] text-sm">Upload Watermark Image (PNG with transparency recommended)</label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Watermark image must be under 5MB');
                            return;
                          }
                          setWatermarkImage(file);
                          setWatermarkImagePreview(URL.createObjectURL(file));
                          setError(null);
                        }
                      }}
                    />
                    {watermarkImage && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-500 text-red-400 hover:bg-red-500/20 shrink-0"
                        onClick={() => {
                          setWatermarkImage(null);
                          setWatermarkImagePreview(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {watermarkImagePreview && (
                    <div className="flex items-center gap-3 p-2 bg-[#0F172A] rounded-lg">
                      <img
                        src={watermarkImagePreview}
                        alt="Watermark preview"
                        className="h-12 w-auto object-contain bg-[#1E293B] rounded"
                      />
                      <span className="text-sm text-green-400">{watermarkImage?.name}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#94A3B8] text-sm mb-2 block">Position</label>
                    <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                      <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155]">
                        <SelectItem value="top-left" className="text-[#F1F5F9]">Top Left</SelectItem>
                        <SelectItem value="top-right" className="text-[#F1F5F9]">Top Right</SelectItem>
                        <SelectItem value="bottom-left" className="text-[#F1F5F9]">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right" className="text-[#F1F5F9]">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[#94A3B8] text-sm mb-2 block">Opacity</label>
                    <Select value={watermarkOpacity} onValueChange={setWatermarkOpacity}>
                      <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155]">
                        <SelectItem value="30" className="text-[#F1F5F9]">30%</SelectItem>
                        <SelectItem value="50" className="text-[#F1F5F9]">50%</SelectItem>
                        <SelectItem value="70" className="text-[#F1F5F9]">70%</SelectItem>
                        <SelectItem value="100" className="text-[#F1F5F9]">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                    <Droplet className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Creating job...' : 'Generate (0 credits)'}
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
