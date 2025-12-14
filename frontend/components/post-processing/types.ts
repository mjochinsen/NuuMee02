import { JobResponse, SubtitleStyle } from '@/lib/api';

export type SectionId = 'extender' | 'upscaler' | 'sound' | 'subtitles' | 'watermark';

export interface VideoSource {
  type: 'file' | 'job' | null;
  file?: File;
  filePreview?: string;
  job?: JobResponse;
  jobThumbnailUrl?: string;
}

export type ResultStatus = 'awaiting' | 'processing' | 'completed' | 'failed';

export interface SectionProps {
  videoSource: VideoSource;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onOpenJobPicker: () => void;
  fileInputRef: (el: HTMLInputElement | null) => void;
}

export const SUBTITLE_STYLES = [
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
