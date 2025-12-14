'use client';

import { useState, useRef, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { JobPickerModal } from '@/components/JobPickerModal';
import { JobResponse } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import {
  VideoExtenderSection,
  VideoUpscalerSection,
  SubtitlesSection,
  WatermarkSection,
  SectionId,
  VideoSource,
} from '@/components/post-processing';

export function PostProcessingOptions() {
  const { profile } = useAuth();
  const isFreeTier = !profile?.subscription_tier || profile.subscription_tier === 'free';

  // Video source state for each section
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
    if (fileInputRefs.current[sectionId]) {
      fileInputRefs.current[sectionId]!.value = '';
    }
  }, []);

  // Create props for a section
  const createSectionProps = useCallback((sectionId: SectionId) => ({
    videoSource: videoSources[sectionId],
    onFileSelect: (file: File) => handleFileSelect(sectionId, file),
    onClear: () => clearVideoSource(sectionId),
    onOpenJobPicker: () => openJobPicker(sectionId),
    fileInputRef: (el: HTMLInputElement | null) => { fileInputRefs.current[sectionId] = el; },
  }), [videoSources, handleFileSelect, clearVideoSource, openJobPicker]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <VideoExtenderSection {...createSectionProps('extender')} />
        <VideoUpscalerSection {...createSectionProps('upscaler')} />
        <SubtitlesSection {...createSectionProps('subtitles')} />
        <WatermarkSection {...createSectionProps('watermark')} isFreeTier={isFreeTier} />
      </div>

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
