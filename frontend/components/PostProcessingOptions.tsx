'use client';

import { Info, Link as LinkIcon, Video, Maximize, Volume2, Type, Droplet, FileText, Check, ChevronDown, Upload, Film, X } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import {
  ResultSection,
  AudioMixControls,
  type ResultStatus,
} from '@/components/post-processing';
import { JobPickerModal } from '@/components/JobPickerModal';
import { JobResponse, createJob, createPostProcessJob, ApiError, SubtitleStyle } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Subtitle style definitions with image previews
const SUBTITLE_STYLES = [
  {
    id: 'simple' as SubtitleStyle,
    name: 'Simple',
    description: 'Clean white text with subtle glow',
    image: '/images/subtitle-styles/simple.jpg',
  },
  {
    id: 'rainbow_bounce' as SubtitleStyle,
    name: 'Rainbow + Bounce',
    description: 'Colorful cycling with pop animation',
    image: '/images/subtitle-styles/rainbow_bounce.jpg',
  },
  {
    id: 'bold_shine' as SubtitleStyle,
    name: 'Bold Shine',
    description: 'Yellow text with glow effect',
    image: '/images/subtitle-styles/bold_shine.jpg',
  },
];

// Type for section-specific video source
type SectionId = 'extender' | 'upscaler' | 'sound' | 'subtitles' | 'watermark';

interface VideoSource {
  type: 'file' | 'job' | null;
  file?: File;
  filePreview?: string;
  job?: JobResponse;
  jobThumbnailUrl?: string;
}

// Moved OUTSIDE component to prevent re-renders on every state change
interface VideoSourceSelectorProps {
  sectionId: SectionId;
  label: string;
  source: VideoSource;
  fileInputRef: (el: HTMLInputElement | null) => void;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onOpenJobPicker: () => void;
}

function VideoSourceSelector({
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
        // Show uploaded file
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
        // Show selected job - use aspect-video and object-contain for proper sizing
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
        // Show empty state with two buttons
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

export function PostProcessingOptions() {
  const router = useRouter();

  const [videoExtenderEnabled, setVideoExtenderEnabled] = useState(false);
  const [upscalerEnabled, setUpscalerEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  // const [formatEnabled, setFormatEnabled] = useState(false); // Hidden for now
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  // Loading states for API calls
  const [extenderLoading, setExtenderLoading] = useState(false);
  const [upscalerLoading, setUpscalerLoading] = useState(false);
  const [subtitlesLoading, setSubtitlesLoading] = useState(false);
  const [watermarkLoading, setWatermarkLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [audioOption, setAudioOption] = useState('mix');
  // const [formatOption, setFormatOption] = useState('crop'); // Hidden for now
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('simple');
  const [watermarkType, setWatermarkType] = useState('logo');
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [volume, setVolume] = useState([30]);
  const [fadeIn, setFadeIn] = useState('0');
  const [fadeOut, setFadeOut] = useState('0');
  const [startTime, setStartTime] = useState('0');

  const [extenderStatus, setExtenderStatus] = useState<ResultStatus>('awaiting');
  const [upscalerStatus, setUpscalerStatus] = useState<ResultStatus>('awaiting');
  const [soundStatus, setSoundStatus] = useState<ResultStatus>('awaiting');
  // const [formatStatus, setFormatStatus] = useState<ResultStatus>('awaiting'); // Hidden for now
  const [subtitlesStatus, setSubtitlesStatus] = useState<ResultStatus>('awaiting');
  const [watermarkStatus, setWatermarkStatus] = useState<ResultStatus>('awaiting');

  // Video source state for each section (A, B, C, E, F)
  const [videoSources, setVideoSources] = useState<Record<SectionId, VideoSource>>({
    extender: { type: null },
    upscaler: { type: null },
    sound: { type: null },
    subtitles: { type: null },
    watermark: { type: null },
  });

  // Job picker state
  const [jobPickerOpen, setJobPickerOpen] = useState(false);
  const [jobPickerSection, setJobPickerSection] = useState<SectionId | null>(null);

  // File input refs for each section
  const fileInputRefs = useRef<Record<SectionId, HTMLInputElement | null>>({
    extender: null,
    upscaler: null,
    sound: null,
    subtitles: null,
    watermark: null,
  });

  // Handle file selection for a section
  const handleFileSelect = useCallback((sectionId: SectionId, file: File) => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert(`Please select a valid video file (MP4, MOV, AVI, or WebM). Got: ${file.type}`);
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('Video must be less than 500MB');
      return;
    }
    const preview = URL.createObjectURL(file);
    setVideoSources(prev => ({
      ...prev,
      [sectionId]: { type: 'file', file, filePreview: preview },
    }));
  }, []);

  // Handle job selection from JobPickerModal
  const handleJobSelect = useCallback((job: JobResponse, thumbnailUrl: string) => {
    if (!jobPickerSection) return;
    setVideoSources(prev => ({
      ...prev,
      [jobPickerSection]: { type: 'job', job, jobThumbnailUrl: thumbnailUrl },
    }));
    setJobPickerOpen(false);
    setJobPickerSection(null);
  }, [jobPickerSection]);

  // Open job picker for a section
  const openJobPicker = useCallback((sectionId: SectionId) => {
    setJobPickerSection(sectionId);
    setJobPickerOpen(true);
  }, []);

  // Clear video source for a section
  const clearVideoSource = useCallback((sectionId: SectionId) => {
    setVideoSources(prev => {
      const current = prev[sectionId];
      if (current.filePreview) {
        URL.revokeObjectURL(current.filePreview);
      }
      return { ...prev, [sectionId]: { type: null } };
    });
    // Reset file input
    if (fileInputRefs.current[sectionId]) {
      fileInputRefs.current[sectionId]!.value = '';
    }
  }, []);

  // Get extension prompt from textarea (need ref for this)
  const [extenderPrompt, setExtenderPrompt] = useState('');

  // Handle extend job creation
  const handleExtendJob = useCallback(async () => {
    const source = videoSources.extender;
    if (source.type !== 'job' || !source.job) {
      setApiError('Please select a video from your jobs');
      return;
    }

    setExtenderLoading(true);
    setApiError(null);
    setExtenderStatus('processing');

    try {
      await createJob({
        job_type: 'extend',
        source_job_id: source.job.id,
        extension_prompt: extenderPrompt || undefined,
        resolution: source.job.resolution,
      });

      // Success - navigate to jobs page
      router.push('/jobs');
    } catch (error) {
      console.error('Failed to create extend job:', error);
      setExtenderStatus('failed');
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to create extend job. Please try again.');
      }
    } finally {
      setExtenderLoading(false);
    }
  }, [videoSources.extender, extenderPrompt, router]);

  // Handle upscale job creation
  const handleUpscaleJob = useCallback(async () => {
    const source = videoSources.upscaler;
    if (source.type !== 'job' || !source.job) {
      setApiError('Please select a video from your jobs');
      return;
    }

    setUpscalerLoading(true);
    setApiError(null);
    setUpscalerStatus('processing');

    try {
      await createJob({
        job_type: 'upscale',
        source_job_id: source.job.id,
        resolution: source.job.resolution,
      });

      // Success - navigate to jobs page
      router.push('/jobs');
    } catch (error) {
      console.error('Failed to create upscale job:', error);
      setUpscalerStatus('failed');
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to create upscale job. Please try again.');
      }
    } finally {
      setUpscalerLoading(false);
    }
  }, [videoSources.upscaler, router]);

  // Handle subtitles job creation
  const handleSubtitlesJob = useCallback(async () => {
    const source = videoSources.subtitles;
    if (source.type !== 'job' || !source.job) {
      setApiError('Please select a video from your jobs');
      return;
    }

    setSubtitlesLoading(true);
    setApiError(null);
    setSubtitlesStatus('processing');

    try {
      await createPostProcessJob(source.job.id, {
        post_process_type: 'subtitles',
        subtitle_style: subtitleStyle,
      });

      // Success - navigate to jobs page
      router.push('/jobs');
    } catch (error) {
      console.error('Failed to create subtitles job:', error);
      setSubtitlesStatus('failed');
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to create subtitles job. Please try again.');
      }
    } finally {
      setSubtitlesLoading(false);
    }
  }, [videoSources.subtitles, subtitleStyle, router]);

  // Handle watermark job creation
  const handleWatermarkJob = useCallback(async () => {
    const source = videoSources.watermark;
    if (source.type !== 'job' || !source.job) {
      setApiError('Please select a video from your jobs');
      return;
    }

    setWatermarkLoading(true);
    setApiError(null);
    setWatermarkStatus('processing');

    try {
      await createPostProcessJob(source.job.id, {
        post_process_type: 'watermark',
        watermark_enabled: true,
      });

      // Success - navigate to jobs page
      router.push('/jobs');
    } catch (error) {
      console.error('Failed to create watermark job:', error);
      setWatermarkStatus('failed');
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to create watermark job. Please try again.');
      }
    } finally {
      setWatermarkLoading(false);
    }
  }, [videoSources.watermark, router]);

  // Helper to create props for VideoSourceSelector
  const createSelectorProps = useCallback((sectionId: SectionId, label: string): VideoSourceSelectorProps => ({
    sectionId,
    label,
    source: videoSources[sectionId],
    fileInputRef: (el) => { fileInputRefs.current[sectionId] = el; },
    onFileSelect: (file) => handleFileSelect(sectionId, file),
    onClear: () => clearVideoSource(sectionId),
    onOpenJobPicker: () => openJobPicker(sectionId),
  }), [videoSources, handleFileSelect, clearVideoSource, openJobPicker]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* A. Video Extender */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3 mb-4">
            <Checkbox
              id="video-extender"
              checked={videoExtenderEnabled}
              onCheckedChange={(checked) => setVideoExtenderEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="video-extender" className="text-[#F1F5F9] cursor-pointer font-medium">
                  A. Video Extender
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
              {videoExtenderEnabled && (
                <div className="space-y-3">
                  <VideoSourceSelector {...createSelectorProps('extender', 'Select video to extend')} />
                  <Textarea
                    placeholder="Enter extension prompt..."
                    value={extenderPrompt}
                    onChange={(e) => setExtenderPrompt(e.target.value)}
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] min-h-[80px]"
                  />
                  {apiError && extenderStatus === 'failed' && (
                    <p className="text-red-400 text-sm">{apiError}</p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={handleExtendJob}
                    disabled={!videoSources.extender.type || extenderLoading}
                  >
                    {extenderLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4 mr-2" />
                    )}
                    {extenderLoading ? 'Creating job...' : `Generate (${videoSources.extender.job?.resolution === '720p' ? '10' : '5'} credits)`}
                  </Button>
                  <ResultSection status={extenderStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* B. Video Upscaler */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="upscaler"
              checked={upscalerEnabled}
              onCheckedChange={(checked) => setUpscalerEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="upscaler" className="text-[#F1F5F9] cursor-pointer font-medium">
                  B. Video Upscaler (1080p)
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
              {upscalerEnabled && (
                <div className="space-y-3">
                  <VideoSourceSelector {...createSelectorProps('upscaler', 'Select video to upscale')} />
                  {apiError && upscalerStatus === 'failed' && (
                    <p className="text-red-400 text-sm">{apiError}</p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={handleUpscaleJob}
                    disabled={!videoSources.upscaler.type || upscalerLoading}
                  >
                    {upscalerLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Maximize className="w-4 h-4 mr-2" />
                    )}
                    {upscalerLoading ? 'Creating job...' : `Generate (${videoSources.upscaler.job?.credits_charged?.toFixed(1) || '5'} credits)`}
                  </Button>
                  <ResultSection status={upscalerStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* C. Add Sound */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="sound"
              checked={soundEnabled}
              onCheckedChange={(checked) => setSoundEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="sound" className="text-[#F1F5F9] cursor-pointer font-medium">
                  C. Add Sound
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="mb-2">Add, mix, or replace audio in your video.</p>
                      <div className="space-y-1">
                        <p className="text-[#00F0D9]">Options:</p>
                        <ul className="list-none text-sm text-[#94A3B8]">
                          <li>Mix Background Music - Add music with volume control</li>
                          <li>Replace Audio - Swap video audio completely</li>
                          <li>AI Sound Generation - Generate realistic sound effects (Foley)</li>
                        </ul>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-[#00F0D9]">Tips:</p>
                        <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                          <li>Keep background music at 20-40% volume</li>
                          <li>Use fade in/out for smooth transitions</li>
                          <li>Match audio length to video duration</li>
                        </ul>
                      </div>
                      <div className="text-sm text-[#94A3B8] mt-2">
                        <p>Supported: MP3, WAV, AAC</p>
                        <p>Max size: 20MB</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <button className="flex items-center gap-1 text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors text-sm">
                  <LinkIcon className="w-3 h-3" />
                  <span>Example</span>
                </button>
              </div>
              {soundEnabled && (
                <div className="space-y-4">
                  <VideoSourceSelector {...createSelectorProps('sound', 'Select video to add sound')} />
                  <RadioGroup value={audioOption} onValueChange={setAudioOption}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mix" id="mix" className="border-[#334155] text-[#00F0D9]" />
                      <label htmlFor="mix" className="text-[#94A3B8] cursor-pointer">Mix Background Music</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" className="border-[#334155] text-[#00F0D9]" />
                      <label htmlFor="replace" className="text-[#94A3B8] cursor-pointer">Replace Audio</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai" id="ai" className="border-[#334155] text-[#00F0D9]" />
                      <label htmlFor="ai" className="text-[#94A3B8] cursor-pointer">AI Sound Generation</label>
                    </div>
                  </RadioGroup>

                  {/* Mix Background Music Controls */}
                  {audioOption === 'mix' && (
                    <AudioMixControls
                      volume={volume}
                      onVolumeChange={setVolume}
                      fadeIn={fadeIn}
                      onFadeInChange={setFadeIn}
                      fadeOut={fadeOut}
                      onFadeOutChange={setFadeOut}
                      startTime={startTime}
                      onStartTimeChange={setStartTime}
                    />
                  )}

                  {/* Replace Audio Controls */}
                  {audioOption === 'replace' && (
                    <div className="p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#94A3B8] text-sm">Audio File</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                              <div className="space-y-2">
                                <p className="mb-2">Completely replace the video's audio track</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">What it does:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Removes original video audio entirely</li>
                                    <li>Replaces with your uploaded audio file</li>
                                    <li>Perfect sync from start to end</li>
                                  </ul>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-[#00F0D9]">Use cases:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Add voiceover narration</li>
                                    <li>Replace with different language audio</li>
                                    <li>Use studio-quality audio recording</li>
                                    <li>Add music-only tracks</li>
                                  </ul>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-amber-400 text-sm">Important:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Original audio will be deleted</li>
                                    <li>Audio length should match video duration</li>
                                    <li>Mismatched length will be trimmed or looped</li>
                                  </ul>
                                </div>
                                <div className="text-sm text-[#94A3B8] mt-2 space-y-1">
                                  <p>Accepted: MP3, WAV, AAC, M4A</p>
                                  <p>Max size: 20MB</p>
                                  <p>Max duration: 120 seconds</p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <Input type="file" accept=".mp3,.wav,.aac,.m4a" className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]" />
                          <Button variant="outline" size="icon" className="border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#00F0D9] shrink-0">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Sound Generation Controls */}
                  {audioOption === 'ai' && (
                    <div className="p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#94A3B8] text-sm">Sound Description</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                              <div className="space-y-2">
                                <p className="mb-2">Describe sounds you want AI to generate for your video</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">What it does:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Analyzes your video content</li>
                                    <li>Generates realistic sound effects (Foley)</li>
                                    <li>Syncs audio to motion and actions</li>
                                    <li>Creates ambient soundscapes</li>
                                  </ul>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-[#00F0D9]">Example prompts:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>"Footsteps on wooden floor, door opening"</li>
                                    <li>"Ocean waves, seagulls, gentle wind"</li>
                                    <li>"City traffic, car horns, people talking"</li>
                                    <li>"Rain on window, thunder in distance"</li>
                                  </ul>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-[#00F0D9]">Tips for best results:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Be specific about sounds and their timing</li>
                                    <li>Mention intensity (soft, loud, gentle, harsh)</li>
                                    <li>Describe environment/context</li>
                                    <li>List multiple sounds separated by commas</li>
                                  </ul>
                                </div>
                                <div className="text-sm text-[#94A3B8] mt-2 space-y-1">
                                  <p>Supports: English and Chinese prompts</p>
                                  <p>Max length: 500 characters</p>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          placeholder="Describe the sounds you want to generate..."
                          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] min-h-[100px]"
                          maxLength={500}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setSoundStatus('processing')}
                    disabled={!videoSources.sound.type}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Generate (0 credits)
                  </Button>
                  <ResultSection status={soundStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* D. Change Format to 16:9 - Hidden for now, may implement in future */}

        {/* E. Auto Subtitles */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="subtitles"
              checked={subtitlesEnabled}
              onCheckedChange={(checked) => setSubtitlesEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="subtitles" className="text-[#F1F5F9] cursor-pointer font-medium">
                  E. Auto Subtitles
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
              {subtitlesEnabled && (
                <div className="space-y-3">
                  <VideoSourceSelector {...createSelectorProps('subtitles', 'Select video for subtitles')} />
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
                      <Input type="file" accept=".txt" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" />
                      <Button variant="outline" size="icon" className="border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#00F0D9] shrink-0">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Style Selector - Image-based previews */}
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

                  {apiError && subtitlesStatus === 'failed' && (
                    <p className="text-red-400 text-sm">{apiError}</p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={handleSubtitlesJob}
                    disabled={!videoSources.subtitles.type || subtitlesLoading}
                  >
                    {subtitlesLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Type className="w-4 h-4 mr-2" />
                    )}
                    {subtitlesLoading ? 'Creating job...' : 'Generate (0 credits)'}
                  </Button>
                  <ResultSection status={subtitlesStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* F. Add Watermark */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="watermark"
              checked={watermarkEnabled}
              onCheckedChange={(checked) => setWatermarkEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="watermark" className="text-[#F1F5F9] cursor-pointer font-medium">
                  F. Add Watermark
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
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
                          <li>Place in corners to avoid key content</li>
                          <li>Use 30-50% opacity for subtle branding</li>
                          <li>Keep size small (10-15% of frame)</li>
                        </ul>
                      </div>
                      <div className="text-sm text-[#94A3B8] mt-2">
                        <p className="text-amber-400">Free plan includes default NuuMee.AI watermark</p>
                        <p>Custom watermarks available on Creator & Studio plans</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              {watermarkEnabled && (
                <div className="space-y-3">
                  <VideoSourceSelector {...createSelectorProps('watermark', 'Select video for watermark')} />
                  <RadioGroup value={watermarkType} onValueChange={setWatermarkType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="logo" id="logo" className="border-[#334155] text-[#00F0D9]" />
                      <label htmlFor="logo" className="text-[#94A3B8] cursor-pointer">Upload Logo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" className="border-[#334155] text-[#00F0D9]" />
                      <label htmlFor="text" className="text-[#94A3B8] cursor-pointer">Add Text Overlay</label>
                    </div>
                  </RadioGroup>

                  {watermarkType === 'logo' ? (
                    <Input type="file" accept="image/png" className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]" />
                  ) : (
                    <Input placeholder="Enter watermark text..." className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8]" />
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#94A3B8] text-sm mb-2 block">Position</label>
                      <Select defaultValue="bottom-right">
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
                      <Select defaultValue="50">
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

                  {apiError && watermarkStatus === 'failed' && (
                    <p className="text-red-400 text-sm">{apiError}</p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={handleWatermarkJob}
                    disabled={!videoSources.watermark.type || watermarkLoading}
                  >
                    {watermarkLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Droplet className="w-4 h-4 mr-2" />
                    )}
                    {watermarkLoading ? 'Creating job...' : 'Generate (0 credits)'}
                  </Button>
                  <ResultSection status={watermarkStatus} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Picker Modal */}
      <JobPickerModal
        open={jobPickerOpen}
        onClose={() => {
          setJobPickerOpen(false);
          setJobPickerSection(null);
        }}
        onSelect={handleJobSelect}
      />
    </TooltipProvider>
  );
}
