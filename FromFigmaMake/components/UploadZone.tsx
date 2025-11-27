import { Upload, X, Info, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface UploadZoneProps {
  title: string;
  accept: string;
  maxSize: string;
  maxDuration?: string;
  allowedFormats: string;
  showExamples?: boolean;
  onFileSelect: (file: File | null) => void;
  safetyCheckerEnabled: boolean;
  onSafetyCheckerChange: (enabled: boolean) => void;
}

export function UploadZone({
  title,
  accept,
  maxSize,
  maxDuration,
  allowedFormats,
  showExamples = true,
  onFileSelect,
  safetyCheckerEnabled,
  onSafetyCheckerChange,
}: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    onFileSelect(selectedFile);
    
    // Create preview for images and videos
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[#F1F5F9]">{title}</span>
        {showExamples && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                {title.includes('Reference Image') ? (
                  <div className="space-y-2">
                    <p className="mb-2">📸 Upload a clear, front-facing photo of the person whose face you want in the video.</p>
                    <div className="space-y-1">
                      <p className="text-[#00F0D9]">✓ Best practices:</p>
                      <ul className="list-disc list-inside text-sm space-y-0.5 text-[#94A3B8]">
                        <li>Front-facing view (not profile)</li>
                        <li>Even lighting, no harsh shadows</li>
                        <li>Face clearly visible (no sunglasses/hats)</li>
                        <li>High resolution (1080p+ recommended)</li>
                        <li>Simple background</li>
                      </ul>
                    </div>
                    <div className="text-sm text-[#94A3B8] mt-2">
                      <p>Accepted: JPG, PNG, WebP</p>
                      <p>Max size: 50MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="mb-2">🎥 The video where the original person will be replaced with your reference image.</p>
                    <div className="space-y-1">
                      <p className="text-[#00F0D9]">✓ Best practices:</p>
                      <ul className="list-disc list-inside text-sm space-y-0.5 text-[#94A3B8]">
                        <li>Subject centered and clearly visible</li>
                        <li>Face visible in most frames</li>
                        <li>Consistent lighting throughout</li>
                        <li>Smooth, steady footage</li>
                        <li>Clear, focused video</li>
                      </ul>
                    </div>
                    <div className="text-sm text-[#94A3B8] mt-2">
                      <p>Accepted: MP4, MOV, AVI</p>
                      <p>Max length: 120 seconds</p>
                      <p>Max size: 50MB</p>
                    </div>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
            <button className="flex items-center gap-1 text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors">
              <LinkIcon className="w-3 h-3" />
              <span className="text-sm">Examples</span>
            </button>
          </>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
          isDragging
            ? 'border-[#00F0D9] bg-[#00F0D9]/5'
            : file
            ? 'border-[#334155] bg-[#1E293B]'
            : 'border-[#334155] bg-[#0F172A] hover:border-[#00F0D9]/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file && preview ? (
          <div className="relative">
            {file.type.startsWith('image/') ? (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            ) : (
              <video src={preview} className="w-full h-48 object-cover rounded-lg" controls />
            )}
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-[#0F172A] rounded-full hover:bg-[#1E293B] transition-colors"
            >
              <X className="w-4 h-4 text-[#F1F5F9]" />
            </button>
            <div className="mt-3 text-[#94A3B8] text-sm">{file.name}</div>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-4 cursor-pointer">
            <Upload className="w-12 h-12 text-[#94A3B8]" />
            <div className="text-center">
              <p className="text-[#F1F5F9]">Drag & drop or click to browse</p>
              <p className="text-[#94A3B8] text-sm mt-2">
                Max {maxSize}
                {maxDuration && `, ${maxDuration}`}
              </p>
              <p className="text-[#94A3B8] text-sm">{allowedFormats}</p>
            </div>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`safety-${title}`}
          checked={safetyCheckerEnabled}
          onCheckedChange={(checked) => onSafetyCheckerChange(checked as boolean)}
          className="border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
        />
        <label htmlFor={`safety-${title}`} className="text-[#94A3B8] text-sm cursor-pointer">
          Safety Checker
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
            <div className="space-y-2">
              <p className="mb-2">🛡️ Verify your reference image before processing to avoid wasted credits.</p>
              <div className="space-y-1">
                <p className="text-[#00F0D9]">What it checks:</p>
                <ul className="list-none text-sm space-y-0.5 text-[#94A3B8]">
                  <li>✓ Face is detectable</li>
                  <li>✓ Image quality is adequate</li>
                  <li>✓ Angle is suitable</li>
                  <li>✓ Lighting is sufficient</li>
                </ul>
              </div>
              <p className="text-sm text-[#00F0D9] mt-2">💡 Tip: Always run this first! It's free and saves you from processing videos that won't work.</p>
            </div>
          </TooltipContent>
        </Tooltip>
        <button className="flex items-center gap-1 text-[#00F0D9] hover:text-[#00F0D9]/80 transition-colors">
          <LinkIcon className="w-3 h-3" />
          <span className="text-sm">Examples</span>
        </button>
      </div>
    </div>
  );
}
