'use client';

import { useState, useCallback } from 'react';
import { Info, Link as LinkIcon, Type, FileText, Check, ChevronDown, X, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { createPostProcessJob, ApiError, SubtitleStyle } from '@/lib/api';
import { VideoSourceSelector } from '../VideoSourceSelector';
import { ResultSection } from '../ResultSection';
import { SectionProps, ResultStatus, SUBTITLE_STYLES } from '../types';

interface SubtitlesSectionProps extends SectionProps {}

export function SubtitlesSection({
  videoSource,
  onFileSelect,
  onClear,
  onOpenJobPicker,
  fileInputRef,
}: SubtitlesSectionProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResultStatus>('awaiting');
  const [error, setError] = useState<string | null>(null);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('simple');
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [scriptFileName, setScriptFileName] = useState<string | null>(null);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (videoSource.type !== 'job' || !videoSource.job) {
      setError('Please select a video from your jobs');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      await createPostProcessJob(videoSource.job.id, {
        post_process_type: 'subtitles',
        subtitle_style: subtitleStyle,
        ...(scriptContent && { script_content: scriptContent }),
      });
      router.push('/jobs');
    } catch (err) {
      console.error('Failed to create subtitles job:', err);
      setStatus('failed');
      setError(err instanceof ApiError ? err.message : 'Failed to create subtitles job. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [videoSource, subtitleStyle, scriptContent, router]);

  return (
    <TooltipProvider>
      <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
        <div className="flex items-start gap-3">
          <Checkbox
            id="subtitles"
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked as boolean)}
            className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="subtitles" className="text-[#F1F5F9] cursor-pointer font-medium">
                Auto Subtitles
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                  <div className="space-y-2">
                    <p className="mb-2">Automatically generate and burn-in subtitles to your video.</p>
                    <div className="space-y-1">
                      <p className="text-[#00F0D9]">Features:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>AI speech detection</li>
                        <li>Word-level timing accuracy</li>
                        <li>Multiple languages supported</li>
                        <li>Customizable styling (color, position, font)</li>
                      </ul>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-[#00F0D9]">Tips:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Works best with clear audio</li>
                        <li>Upload script for perfect accuracy</li>
                        <li>Always preview before final export</li>
                        <li>Great for accessibility and engagement</li>
                      </ul>
                    </div>
                    <p className="text-sm text-amber-400 mt-2">Note: Subtitles are burned-in (not removable after processing)</p>
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
                  sectionId="subtitles"
                  label="Select video for subtitles"
                  source={videoSource}
                  fileInputRef={fileInputRef}
                  onFileSelect={onFileSelect}
                  onClear={onClear}
                  onOpenJobPicker={onOpenJobPicker}
                />

                {/* Script File Upload */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[#94A3B8] text-sm">Upload Script File (Optional)</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                        <div className="space-y-2">
                          <p className="mb-2">Upload your video script for perfect subtitle accuracy</p>
                          <div className="space-y-1">
                            <p className="text-[#00F0D9]">What it does:</p>
                            <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                              <li>AI matches spoken words to your exact script</li>
                              <li>Ensures correct spelling of names, brands, technical terms</li>
                              <li>Improves timing and punctuation</li>
                            </ul>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-[#00F0D9]">When to use:</p>
                            <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                              <li>Poor audio quality or background noise</li>
                              <li>Multiple speakers or accents</li>
                              <li>Technical jargon or uncommon words</li>
                              <li>Names, brands, or specific terminology</li>
                            </ul>
                          </div>
                          <div className="text-sm text-[#94A3B8] mt-2 space-y-1">
                            <p>Accepted: Plain text (.txt) only</p>
                            <p>Max size: 5MB</p>
                            <p>Encoding: UTF-8</p>
                          </div>
                          <p className="text-sm text-amber-400 mt-2">Optional but recommended for best results</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="text-green-400">With script: 99% accuracy</div>
                            <div className="text-red-400">Without: 85-95% accuracy</div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".txt"
                      className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            setError('Script file must be under 5MB');
                            return;
                          }
                          try {
                            const content = await file.text();
                            setScriptContent(content);
                            setScriptFileName(file.name);
                            setError(null);
                          } catch {
                            setError('Failed to read script file');
                          }
                        }
                      }}
                    />
                    {scriptFileName && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-red-500 text-red-400 hover:bg-red-500/20 shrink-0"
                        onClick={() => {
                          setScriptContent(null);
                          setScriptFileName(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {scriptFileName && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <FileText className="w-4 h-4" />
                      <span>{scriptFileName}</span>
                      <span className="text-[#94A3B8]">({Math.round((scriptContent?.length || 0) / 1024)}KB)</span>
                    </div>
                  )}
                </div>

                {/* Style Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#94A3B8] text-sm">Style</label>
                  <div className="relative">
                    <button
                      onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                      className="w-full bg-[#1E293B] border border-[#334155] rounded-lg p-2 hover:border-[#00F0D9] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.image}
                          alt={SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.name}
                          className="h-10 w-auto rounded"
                        />
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.name}</p>
                          <p className="text-[#94A3B8] text-xs">{SUBTITLE_STYLES.find(s => s.id === subtitleStyle)?.description}</p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#94A3B8] ml-2 transition-transform ${styleDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {styleDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-[#1E293B] border border-[#334155] rounded-lg shadow-lg overflow-hidden">
                        {SUBTITLE_STYLES.map((style, index) => (
                          <button
                            key={style.id}
                            onClick={() => { setSubtitleStyle(style.id); setStyleDropdownOpen(false); }}
                            className={`w-full p-3 hover:bg-[#334155] flex items-center justify-between ${index < SUBTITLE_STYLES.length - 1 ? 'border-b border-[#334155]' : ''}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <img
                                src={style.image}
                                alt={style.name}
                                className="h-12 w-auto rounded"
                              />
                              <div className="text-left">
                                <p className="text-white text-sm font-medium">{style.name}</p>
                                <p className="text-[#94A3B8] text-xs">{style.description}</p>
                              </div>
                            </div>
                            {subtitleStyle === style.id && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>
                        ))}
                      </div>
                    )}
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
                    <Type className="w-4 h-4 mr-2" />
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
