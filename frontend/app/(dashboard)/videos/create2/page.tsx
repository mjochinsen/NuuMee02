'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Video, Image as ImageIcon, Upload, X, Loader2, AlertCircle, Info, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/AuthProvider';
import {
  getSignedUrl,
  uploadToGCS,
  createJob,
  Resolution as ApiResolution
} from '@/lib/api';
import { extractFrameAtTime, getFaceWarningMessage, FaceDetectionResult } from '@/lib/face-detection';

// Helper to convert data URL to File for upload
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// Credit rates from backend (credits per second)
const CREDIT_RATES = {
  '480p': 0.8,
  '720p': 1.6,
} as const;

type Resolution = keyof typeof CREDIT_RATES;

// Calculate max trim seconds based on user credits and resolution
function getMaxTrimSeconds(credits: number, resolution: Resolution): number {
  const rate = CREDIT_RATES[resolution];
  const maxFromCredits = Math.floor(credits / rate);
  return Math.min(120, Math.max(4, maxFromCredits)); // 4s min, 120s max
}

// Dev mode check - only allow access with ?dev=1 for now
const checkDevMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dev') === '1';
  } catch {
    return false;
  }
};

export default function Create2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();

  // Dev mode gate
  const [isDevMode, setIsDevMode] = useState(false);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Trim state
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Frame selection state (for face image)
  const [framePosition, setFramePosition] = useState<number>(0);

  // Face detection state
  const [extractedFrame, setExtractedFrame] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [faceWarning, setFaceWarning] = useState<string | null>(null);

  // Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiGeneratedImages, setAiGeneratedImages] = useState<string[]>([]);
  const [customImage, setCustomImage] = useState<File | null>(null);

  // Settings
  const [resolution, setResolution] = useState<Resolution>('720p');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    stage: 'idle' | 'uploading_video' | 'uploading_image' | 'creating_job' | 'done';
    videoProgress: number;
    imageProgress: number;
  }>({ stage: 'idle', videoProgress: 0, imageProgress: 0 });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check dev mode on mount
  useEffect(() => {
    setIsDevMode(checkDevMode());
  }, []);

  // Redirect non-logged-in users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/videos/create2');
    }
  }, [loading, user, router]);

  // Extract a frame when video is loaded for face preview
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);

  // Initialize frame position when video loads or trim changes
  useEffect(() => {
    if (videoDuration && videoDuration > 0) {
      // Default to 1 second into trim selection (or middle if too short)
      const defaultFrame = Math.min(trimStart + 1, trimStart + (trimEnd - trimStart) / 2);
      setFramePosition(Math.max(trimStart, Math.min(trimEnd, defaultFrame)));
    }
  }, [videoDuration, trimStart, trimEnd]);

  // Extract frame when framePosition changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoDuration || videoDuration <= 0) return;

    const extractFrame = async () => {
      setIsExtractingFrame(true);
      // Clamp frame position within trim bounds
      const clampedPosition = Math.max(trimStart, Math.min(trimEnd - 0.1, framePosition));
      const frame = await extractFrameAtTime(video, clampedPosition);

      if (frame) {
        setExtractedFrame(frame);
        // For now, we don't have face detection, so no warning
        setFaceWarning(null);
      }
      setIsExtractingFrame(false);
    };

    extractFrame();
  }, [videoDuration, framePosition, trimStart, trimEnd]);

  // Calculate available credits and max trim
  const userCredits = profile?.credits_balance ?? 0;
  const maxTrimSeconds = getMaxTrimSeconds(userCredits, resolution);
  const trimDuration = trimEnd - trimStart;
  const estimatedCredits = Math.ceil(trimDuration * CREDIT_RATES[resolution]);

  // Handle video generation
  const handleGenerate = async () => {
    if (!videoFile || !selectedImage) {
      setGenerateError('Please upload a video and select a face image');
      return;
    }

    if (trimDuration < 4) {
      setGenerateError('Video must be at least 4 seconds long');
      return;
    }

    if (estimatedCredits > userCredits) {
      setGenerateError(`Not enough credits. You need ${estimatedCredits} but have ${userCredits}.`);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setUploadProgress({ stage: 'uploading_video', videoProgress: 0, imageProgress: 0 });

    try {
      // Step 1: Upload video to GCS
      const videoSignedUrl = await getSignedUrl({
        file_type: 'video',
        file_name: videoFile.name,
        content_type: videoFile.type,
      });

      await uploadToGCS(
        videoFile,
        videoSignedUrl.upload_url,
        (progress) => setUploadProgress(prev => ({ ...prev, videoProgress: progress }))
      );

      setUploadProgress(prev => ({ ...prev, stage: 'uploading_image', videoProgress: 100 }));

      // Step 2: Upload face image to GCS
      // If it's a data URL (extracted frame), convert to File
      let imageFile: File;
      if (selectedImage.startsWith('data:')) {
        imageFile = dataURLtoFile(selectedImage, 'face-image.png');
      } else if (customImage) {
        imageFile = customImage;
      } else {
        // This shouldn't happen, but fallback to extracted frame
        if (extractedFrame) {
          imageFile = dataURLtoFile(extractedFrame, 'face-image.png');
        } else {
          throw new Error('No valid image selected');
        }
      }

      const imageSignedUrl = await getSignedUrl({
        file_type: 'image',
        file_name: imageFile.name,
        content_type: imageFile.type,
      });

      await uploadToGCS(
        imageFile,
        imageSignedUrl.upload_url,
        (progress) => setUploadProgress(prev => ({ ...prev, imageProgress: progress }))
      );

      setUploadProgress(prev => ({ ...prev, stage: 'creating_job', imageProgress: 100 }));

      // Step 3: Create the job
      const job = await createJob({
        job_type: 'animate',
        reference_image_path: imageSignedUrl.file_path,
        motion_video_path: videoSignedUrl.file_path,
        motion_video_duration_seconds: trimDuration,
        resolution: resolution as ApiResolution,
      });

      setUploadProgress(prev => ({ ...prev, stage: 'done' }));

      // Success! Navigate to job details or jobs list
      router.push(`/videos?highlight=${job.id}`);

    } catch (error) {
      console.error('[Create2] Generation failed:', error);
      setGenerateError(
        error instanceof Error
          ? error.message
          : 'Failed to create video. Please try again.'
      );
      setUploadProgress({ stage: 'idle', videoProgress: 0, imageProgress: 0 });
    } finally {
      setIsGenerating(false);
    }
  };

  // Dev mode gate - show access denied for non-dev users
  if (!isDevMode) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl text-[#F1F5F9] mb-2">Feature in Development</h1>
          <p className="text-[#94A3B8] mb-4">This page is currently under development.</p>
          <Button onClick={() => router.push('/videos/create')} variant="outline">
            Go to Current Create Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0D9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">
            Create AI Video <span className="text-amber-500 text-sm">(v2 Beta)</span>
          </h1>
          <p className="text-[#94A3B8]">
            Upload a video, trim it, and swap the character with AI
          </p>
        </div>

        {/* Pre-Education Banner */}
        <ValidationBanner />

        {/* Main Content */}
        <div className="space-y-8">
          {/* Step 1: Video Upload */}
          <section className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#3B1FE2] flex items-center justify-center text-white font-bold">1</div>
              <h2 className="text-xl text-[#F1F5F9]">Upload & Trim Video</h2>
            </div>

            {!videoFile ? (
              <VideoUploadZone
                onFileSelect={(file) => {
                  setVideoFile(file);
                  setVideoPreview(URL.createObjectURL(file));
                }}
                onError={setVideoError}
                inputRef={videoInputRef}
              />
            ) : (
              <div className="space-y-4">
                <VideoPreview
                  src={videoPreview!}
                  videoRef={videoRef}
                  onDurationLoad={(duration) => {
                    setVideoDuration(duration);
                    setTrimEnd(Math.min(duration, maxTrimSeconds));
                  }}
                  onRemove={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                    setVideoDuration(null);
                    setTrimStart(0);
                    setTrimEnd(0);
                    setFramePosition(0);
                    setExtractedFrame(null);
                    setFaceDetected(null);
                  }}
                />

                {videoDuration && (
                  <TrimControls
                    duration={videoDuration}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    maxTrimSeconds={maxTrimSeconds}
                    onTrimChange={(start, end) => {
                      setTrimStart(start);
                      setTrimEnd(end);
                    }}
                    estimatedCredits={estimatedCredits}
                    userCredits={userCredits}
                    videoRef={videoRef}
                  />
                )}
              </div>
            )}

            {videoError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {videoError}
              </div>
            )}
          </section>

          {/* Step 2: Face Image Selection */}
          <section className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#3B1FE2] flex items-center justify-center text-white font-bold">2</div>
              <h2 className="text-xl text-[#F1F5F9]">Select Face Image</h2>
            </div>

            {/* Face Warning */}
            {faceWarning && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {faceWarning}
              </div>
            )}

            <FaceImageSelector
              extractedFrame={extractedFrame}
              aiImages={aiGeneratedImages}
              selectedImage={selectedImage}
              onSelect={setSelectedImage}
              onCustomUpload={(file) => {
                setCustomImage(file);
                setSelectedImage(URL.createObjectURL(file));
              }}
              inputRef={imageInputRef}
              isLoading={isExtractingFrame}
              // Frame selection props
              videoRef={videoRef}
              trimStart={trimStart}
              trimEnd={trimEnd}
              framePosition={framePosition}
              onFramePositionChange={setFramePosition}
            />
          </section>

          {/* Step 3: Settings & Generate */}
          <section className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#3B1FE2] flex items-center justify-center text-white font-bold">3</div>
              <h2 className="text-xl text-[#F1F5F9]">Generate</h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Label className="text-[#94A3B8] mb-2 block">Resolution</Label>
                <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
                  <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="480p">480p (0.8 credits/sec)</SelectItem>
                    <SelectItem value="720p">720p (1.6 credits/sec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-right">
                <div className="text-[#94A3B8] text-sm">Estimated Cost</div>
                <div className="text-2xl font-bold text-[#00F0D9]">{estimatedCredits} credits</div>
                <div className="text-[#94A3B8] text-xs">You have {userCredits} credits</div>
              </div>
            </div>

            {/* Upload Progress */}
            {isGenerating && uploadProgress.stage !== 'idle' && (
              <div className="mb-4 p-4 bg-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[#F1F5F9]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00F0D9]" />
                  <span className="text-sm font-medium">
                    {uploadProgress.stage === 'uploading_video' && 'Uploading video...'}
                    {uploadProgress.stage === 'uploading_image' && 'Uploading face image...'}
                    {uploadProgress.stage === 'creating_job' && 'Starting generation...'}
                    {uploadProgress.stage === 'done' && 'Done! Redirecting...'}
                  </span>
                </div>

                {/* Video upload progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#94A3B8]">
                    <span>Video</span>
                    <span>{Math.round(uploadProgress.videoProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress.videoProgress} className="h-2" />
                </div>

                {/* Image upload progress */}
                {(uploadProgress.stage === 'uploading_image' || uploadProgress.stage === 'creating_job' || uploadProgress.stage === 'done') && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-[#94A3B8]">
                      <span>Face Image</span>
                      <span>{Math.round(uploadProgress.imageProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress.imageProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full h-14 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white text-lg font-semibold"
              disabled={!videoFile || !selectedImage || isGenerating || estimatedCredits > userCredits || trimDuration < 4}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploadProgress.stage === 'uploading_video' && 'Uploading Video...'}
                  {uploadProgress.stage === 'uploading_image' && 'Uploading Image...'}
                  {uploadProgress.stage === 'creating_job' && 'Starting Job...'}
                  {uploadProgress.stage === 'done' && 'Redirecting...'}
                  {uploadProgress.stage === 'idle' && 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Video ({estimatedCredits} credits)
                </>
              )}
            </Button>

            {generateError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {generateError}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ============ Sub-Components ============

function ValidationBanner() {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="mb-8 p-4 bg-[#1E293B] border border-[#334155] rounded-xl">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-[#00F0D9] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-[#F1F5F9] font-medium mb-2">For best results:</h3>
          <ul className="space-y-1 text-[#94A3B8] text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              One clear face visible in the video
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Video length: 4 seconds to 2 minutes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Good lighting and face visibility
            </li>
          </ul>
          <button
            onClick={() => setShowExamples(true)}
            className="mt-2 text-[#00F0D9] text-sm hover:underline"
          >
            Show examples →
          </button>
        </div>
      </div>

      {/* Examples Modal */}
      {showExamples && (
        <ExamplesModal onClose={() => setShowExamples(false)} />
      )}
    </div>
  );
}

function ExamplesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#0F172A] border border-[#334155] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F1F5F9]">What Works Best</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1E293B] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Video Examples */}
          <section>
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">📹 Video Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Good Video */}
              <div className="border border-green-500/30 rounded-xl p-4 bg-green-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-400 font-medium">Good Video</span>
                </div>
                <div className="aspect-video bg-[#1E293B] rounded-lg mb-3 flex items-center justify-center">
                  <Video className="w-12 h-12 text-[#334155]" />
                </div>
                <ul className="text-sm text-[#94A3B8] space-y-1">
                  <li>✓ Single person facing camera</li>
                  <li>✓ Well-lit face, no harsh shadows</li>
                  <li>✓ Steady camera, minimal motion blur</li>
                  <li>✓ Face visible most of the time</li>
                </ul>
              </div>

              {/* Bad Video */}
              <div className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-400 font-medium">Avoid</span>
                </div>
                <div className="aspect-video bg-[#1E293B] rounded-lg mb-3 flex items-center justify-center">
                  <Video className="w-12 h-12 text-[#334155]" />
                </div>
                <ul className="text-sm text-[#94A3B8] space-y-1">
                  <li>✗ Multiple people in frame</li>
                  <li>✗ Dark or backlit scenes</li>
                  <li>✗ Face blocked or turned away</li>
                  <li>✗ Rapid camera movement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Face Image Examples */}
          <section>
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">🖼️ Face Image Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Good Face */}
              <div className="border border-green-500/30 rounded-xl p-4 bg-green-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-400 font-medium">Good Face Image</span>
                </div>
                <div className="aspect-square bg-[#1E293B] rounded-lg mb-3 flex items-center justify-center max-w-[150px] mx-auto">
                  <ImageIcon className="w-10 h-10 text-[#334155]" />
                </div>
                <ul className="text-sm text-[#94A3B8] space-y-1">
                  <li>✓ Clear, front-facing portrait</li>
                  <li>✓ High resolution image</li>
                  <li>✓ Neutral expression</li>
                  <li>✓ No sunglasses or masks</li>
                </ul>
              </div>

              {/* Bad Face */}
              <div className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-400 font-medium">Avoid</span>
                </div>
                <div className="aspect-square bg-[#1E293B] rounded-lg mb-3 flex items-center justify-center max-w-[150px] mx-auto">
                  <ImageIcon className="w-10 h-10 text-[#334155]" />
                </div>
                <ul className="text-sm text-[#94A3B8] space-y-1">
                  <li>✗ Low resolution or blurry</li>
                  <li>✗ Face at extreme angle</li>
                  <li>✗ Partially covered face</li>
                  <li>✗ Heavy filters or editing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pro Tips */}
          <section className="bg-[#1E293B] rounded-xl p-4">
            <h3 className="text-lg font-semibold text-[#F1F5F9] mb-3">💡 Pro Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#94A3B8]">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00F0D9] mt-0.5 flex-shrink-0" />
                <span>The face in your video and replacement image should have similar poses for best results</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00F0D9] mt-0.5 flex-shrink-0" />
                <span>Shorter clips (10-30 seconds) often produce better quality than longer ones</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00F0D9] mt-0.5 flex-shrink-0" />
                <span>480p uses fewer credits and is great for testing ideas quickly</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#00F0D9] mt-0.5 flex-shrink-0" />
                <span>Use our AI-generated faces for stylized, creative results</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0F172A] border-t border-[#334155] p-4">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
          >
            Got it, let&apos;s create!
          </Button>
        </div>
      </div>
    </div>
  );
}

interface VideoUploadZoneProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function VideoUploadZone({ onFileSelect, onError, inputRef }: VideoUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      onError('Please upload a video file');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      onError('Video file must be under 500MB');
      return;
    }

    // Check duration via video element
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      if (video.duration > 240) { // 4 minutes max
        onError('Video must be under 4 minutes. Please trim it first or upload a shorter video.');
        return;
      }
      onFileSelect(file);
    };
    video.onerror = () => {
      onError('Could not read video file. Please try a different format.');
    };
    video.src = URL.createObjectURL(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragging
          ? 'border-[#00F0D9] bg-[#00F0D9]/5'
          : 'border-[#334155] hover:border-[#00F0D9]/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Video className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
      <p className="text-[#F1F5F9] font-medium mb-1">Drop your video here or click to browse</p>
      <p className="text-[#94A3B8] text-sm">MP4, MOV, WebM • Max 4 minutes • Max 500MB</p>
    </div>
  );
}

interface VideoPreviewProps {
  src: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDurationLoad: (duration: number) => void;
  onRemove: () => void;
}

function VideoPreview({ src, videoRef, onDurationLoad, onRemove }: VideoPreviewProps) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[400px] object-contain"
        controls
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          onDurationLoad(video.duration);
        }}
      />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

interface TrimControlsProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  maxTrimSeconds: number;
  onTrimChange: (start: number, end: number) => void;
  estimatedCredits: number;
  userCredits: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function TrimControls({
  duration,
  trimStart,
  trimEnd,
  maxTrimSeconds,
  onTrimChange,
  estimatedCredits,
  userCredits,
  videoRef
}: TrimControlsProps) {
  const trimDuration = trimEnd - trimStart;
  const isValid = trimDuration >= 4 && trimDuration <= 120 && estimatedCredits <= userCredits;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-[#1E293B] rounded-xl space-y-4">
      {/* Header with duration info */}
      <div className="flex items-center justify-between">
        <span className="text-[#F1F5F9] font-medium">Trim Selection</span>
        <span className={`text-sm ${isValid ? 'text-green-500' : 'text-amber-500'}`}>
          {formatTime(trimDuration)} selected (max {formatTime(maxTrimSeconds)})
        </span>
      </div>

      {/* Visual Timeline */}
      <VideoTimeline
        duration={duration}
        trimStart={trimStart}
        trimEnd={trimEnd}
        maxTrimSeconds={maxTrimSeconds}
        onTrimChange={onTrimChange}
        videoRef={videoRef}
      />

      {/* Time display */}
      <div className="flex justify-between text-sm text-[#94A3B8]">
        <span>Start: {formatTime(trimStart)}</span>
        <span>End: {formatTime(trimEnd)}</span>
      </div>

      {/* Warnings */}
      {trimDuration < 4 && (
        <p className="text-amber-500 text-sm">Minimum selection is 4 seconds</p>
      )}
      {estimatedCredits > userCredits && (
        <p className="text-red-400 text-sm">
          Not enough credits. You need {estimatedCredits} but have {userCredits}.
        </p>
      )}
    </div>
  );
}

interface VideoTimelineProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  maxTrimSeconds: number;
  onTrimChange: (start: number, end: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function VideoTimeline({
  duration,
  trimStart,
  trimEnd,
  maxTrimSeconds,
  onTrimChange,
  videoRef
}: VideoTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  // Number of thumbnails based on duration (1 per 2 seconds, max 30)
  const thumbnailCount = Math.min(30, Math.max(5, Math.ceil(duration / 2)));

  // Generate thumbnails from video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || duration <= 0) return;

    const generateThumbnails = async () => {
      setIsGeneratingThumbnails(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Small thumbnail size for performance
      canvas.width = 120;
      canvas.height = 68;

      const newThumbnails: string[] = [];
      const interval = duration / thumbnailCount;

      for (let i = 0; i < thumbnailCount; i++) {
        const time = i * interval;
        try {
          video.currentTime = time;
          await new Promise<void>((resolve) => {
            const handleSeeked = () => {
              video.removeEventListener('seeked', handleSeeked);
              resolve();
            };
            video.addEventListener('seeked', handleSeeked);
          });

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newThumbnails.push(canvas.toDataURL('image/jpeg', 0.6));
        } catch {
          // If frame extraction fails, use placeholder
          newThumbnails.push('');
        }
      }

      setThumbnails(newThumbnails);
      setIsGeneratingThumbnails(false);
      // Reset video to trim start
      video.currentTime = trimStart;
    };

    generateThumbnails();
  }, [videoRef, duration, thumbnailCount]);

  // Convert pixel position to time
  const positionToTime = useCallback((clientX: number): number => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * duration;
  }, [duration]);

  // Handle mouse/touch drag
  const handleDragStart = (handle: 'start' | 'end') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const time = positionToTime(clientX);

      if (isDragging === 'start') {
        // Enforce min 4s selection, can't go past end - 4s
        const newStart = Math.max(0, Math.min(trimEnd - 4, time));
        onTrimChange(newStart, trimEnd);
      } else {
        // Enforce min 4s selection, max trim seconds, can't go past start + 4s
        const maxEnd = Math.min(duration, trimStart + maxTrimSeconds);
        const newEnd = Math.max(trimStart + 4, Math.min(maxEnd, time));
        onTrimChange(trimStart, newEnd);
      }
    };

    const handleUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, trimStart, trimEnd, maxTrimSeconds, duration, positionToTime, onTrimChange]);

  // Handle hover for preview
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) return;
    const time = positionToTime(e.clientX);
    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    if (!isDragging) setHoverTime(null);
  };

  // Calculate positions as percentages
  const startPercent = (trimStart / duration) * 100;
  const endPercent = (trimEnd / duration) * 100;
  const hoverPercent = hoverTime !== null ? (hoverTime / duration) * 100 : null;

  return (
    <div className="space-y-2">
      {/* Timeline container */}
      <div
        ref={timelineRef}
        className="relative h-16 rounded-lg overflow-hidden cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail strip */}
        <div className="absolute inset-0 flex">
          {isGeneratingThumbnails ? (
            // Loading skeleton
            <div className="w-full h-full bg-[#0F172A] animate-pulse flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />
            </div>
          ) : thumbnails.length > 0 ? (
            thumbnails.map((thumb, i) => (
              <div
                key={i}
                className="flex-1 h-full bg-cover bg-center border-r border-[#0F172A]/50 last:border-r-0"
                style={{ backgroundImage: thumb ? `url(${thumb})` : undefined, backgroundColor: thumb ? undefined : '#1E293B' }}
              />
            ))
          ) : (
            <div className="w-full h-full bg-[#1E293B]" />
          )}
        </div>

        {/* Dimmed areas outside selection */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-black/60"
          style={{ width: `${startPercent}%` }}
        />
        <div
          className="absolute top-0 bottom-0 right-0 bg-black/60"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Selection highlight border */}
        <div
          className="absolute top-0 bottom-0 border-2 border-[#00F0D9]"
          style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
        />

        {/* Start handle */}
        <div
          className={`absolute top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center ${isDragging === 'start' ? 'z-20' : 'z-10'}`}
          style={{ left: `calc(${startPercent}% - 8px)` }}
          onMouseDown={handleDragStart('start')}
          onTouchStart={handleDragStart('start')}
        >
          <div className={`w-1.5 h-10 rounded-full ${isDragging === 'start' ? 'bg-white' : 'bg-[#00F0D9]'} shadow-lg`} />
        </div>

        {/* End handle */}
        <div
          className={`absolute top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center ${isDragging === 'end' ? 'z-20' : 'z-10'}`}
          style={{ left: `calc(${endPercent}% - 8px)` }}
          onMouseDown={handleDragStart('end')}
          onTouchStart={handleDragStart('end')}
        >
          <div className={`w-1.5 h-10 rounded-full ${isDragging === 'end' ? 'bg-white' : 'bg-[#00F0D9]'} shadow-lg`} />
        </div>

        {/* Hover indicator */}
        {hoverPercent !== null && !isDragging && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50 pointer-events-none z-5"
            style={{ left: `${hoverPercent}%` }}
          />
        )}
      </div>

      {/* Time markers */}
      <div className="flex justify-between text-xs text-[#64748B]">
        <span>0:00</span>
        <span>{formatTimeShort(duration / 2)}</span>
        <span>{formatTimeShort(duration)}</span>
      </div>
    </div>
  );
}

function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============ Frame Selector Component ============
interface FrameSelectorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trimStart: number;
  trimEnd: number;
  framePosition: number;
  onFramePositionChange: (position: number) => void;
}

function FrameSelector({
  videoRef,
  trimStart,
  trimEnd,
  framePosition,
  onFramePositionChange
}: FrameSelectorProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);

  const trimDuration = trimEnd - trimStart;
  const thumbnailCount = Math.min(10, Math.max(3, Math.ceil(trimDuration / 3)));

  // Generate thumbnails for the trim selection area
  useEffect(() => {
    const video = videoRef.current;
    if (!video || trimDuration <= 0) return;

    const generateThumbnails = async () => {
      setIsGeneratingThumbnails(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 80;
      canvas.height = 45;

      const newThumbnails: string[] = [];
      const interval = trimDuration / thumbnailCount;

      for (let i = 0; i < thumbnailCount; i++) {
        const time = trimStart + (i * interval);
        try {
          video.currentTime = time;
          await new Promise<void>((resolve) => {
            const handleSeeked = () => {
              video.removeEventListener('seeked', handleSeeked);
              resolve();
            };
            video.addEventListener('seeked', handleSeeked);
            setTimeout(() => {
              video.removeEventListener('seeked', handleSeeked);
              resolve();
            }, 500);
          });

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newThumbnails.push(canvas.toDataURL('image/jpeg', 0.5));
        } catch {
          newThumbnails.push('');
        }
      }

      setThumbnails(newThumbnails);
      setIsGeneratingThumbnails(false);
      video.currentTime = framePosition;
    };

    generateThumbnails();
  }, [videoRef, trimStart, trimEnd, trimDuration, thumbnailCount]);

  // Convert pixel position to time within trim bounds
  const positionToTime = useCallback((clientX: number): number => {
    if (!timelineRef.current) return trimStart;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return trimStart + (percentage * trimDuration);
  }, [trimStart, trimDuration]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    onFramePositionChange(positionToTime(clientX));
  };

  // Handle drag move and end
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      onFramePositionChange(positionToTime(clientX));
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, positionToTime, onFramePositionChange]);

  // Calculate indicator position as percentage within trim bounds
  const indicatorPercent = trimDuration > 0
    ? ((framePosition - trimStart) / trimDuration) * 100
    : 0;

  return (
    <div className="space-y-2">
      {/* Mini timeline with thumbnails */}
      <div
        ref={timelineRef}
        className="relative h-12 rounded-lg overflow-hidden cursor-pointer select-none bg-[#1E293B]"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Thumbnail strip */}
        <div className="absolute inset-0 flex">
          {isGeneratingThumbnails ? (
            <div className="w-full h-full animate-pulse flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" />
            </div>
          ) : thumbnails.length > 0 ? (
            thumbnails.map((thumb, i) => (
              <div
                key={i}
                className="flex-1 h-full bg-cover bg-center border-r border-[#0F172A]/30 last:border-r-0"
                style={{
                  backgroundImage: thumb ? `url(${thumb})` : undefined,
                  backgroundColor: thumb ? undefined : '#334155'
                }}
              />
            ))
          ) : (
            <div className="w-full h-full bg-[#334155]" />
          )}
        </div>

        {/* Position indicator */}
        <div
          className={`absolute top-0 bottom-0 w-1 transform -translate-x-1/2 transition-colors ${
            isDragging ? 'bg-white' : 'bg-[#00F0D9]'
          }`}
          style={{ left: `${Math.max(0, Math.min(100, indicatorPercent))}%` }}
        >
          {/* Handle */}
          <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full shadow-lg ${
            isDragging ? 'bg-white scale-125' : 'bg-[#00F0D9]'
          }`} />
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full shadow-lg ${
            isDragging ? 'bg-white scale-125' : 'bg-[#00F0D9]'
          }`} />
        </div>
      </div>

      {/* Time markers */}
      <div className="flex justify-between text-xs text-[#64748B]">
        <span>{formatTimeShort(trimStart)}</span>
        <span className="text-[#00F0D9] font-medium">{formatTimeShort(framePosition)}</span>
        <span>{formatTimeShort(trimEnd)}</span>
      </div>
    </div>
  );
}

interface FaceImageSelectorProps {
  extractedFrame: string | null;
  aiImages: string[];
  selectedImage: string | null;
  onSelect: (url: string) => void;
  onCustomUpload: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  // Frame selection props
  videoRef: React.RefObject<HTMLVideoElement | null>;
  trimStart: number;
  trimEnd: number;
  framePosition: number;
  onFramePositionChange: (position: number) => void;
}

function FaceImageSelector({
  extractedFrame,
  aiImages,
  selectedImage,
  onSelect,
  onCustomUpload,
  inputRef,
  isLoading,
  videoRef,
  trimStart,
  trimEnd,
  framePosition,
  onFramePositionChange
}: FaceImageSelectorProps) {
  const hasVideoFrame = !!extractedFrame;
  const isCustomSelected = selectedImage && !aiImages.includes(selectedImage) && selectedImage !== extractedFrame;
  const hasTrimSelection = trimEnd > trimStart;

  return (
    <div className="space-y-4">
      {/* Extracted Frame Preview with Selector */}
      {hasVideoFrame && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#94A3B8] text-sm">Frame from your video:</p>
            <span className="text-[#64748B] text-xs">
              {formatTimeShort(framePosition)}
            </span>
          </div>

          {/* Frame Preview + Selection Button */}
          <div className="flex gap-4 items-start">
            <button
              onClick={() => onSelect(extractedFrame)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedImage === extractedFrame
                  ? 'border-[#00F0D9] ring-2 ring-[#00F0D9]/30'
                  : 'border-[#334155] hover:border-[#00F0D9]/50'
              }`}
            >
              {isLoading ? (
                <div className="w-[200px] h-[120px] bg-[#1E293B] flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#00F0D9] animate-spin" />
                </div>
              ) : (
                <img
                  src={extractedFrame}
                  alt="Extracted frame from video"
                  className="w-[200px] h-auto object-cover"
                />
              )}
              {selectedImage === extractedFrame && !isLoading && (
                <div className="absolute top-2 right-2 bg-[#00F0D9] rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            {/* Frame Selector Timeline */}
            {hasTrimSelection && (
              <div className="flex-1 min-w-0">
                <p className="text-[#64748B] text-xs mb-2">Drag to select frame:</p>
                <FrameSelector
                  videoRef={videoRef}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  framePosition={framePosition}
                  onFramePositionChange={onFramePositionChange}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* AI Generated Options */}
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-[#1E293B] animate-pulse flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />
            </div>
          ))
        ) : aiImages.length > 0 ? (
          // AI images
          aiImages.map((url, i) => (
            <button
              key={i}
              onClick={() => onSelect(url)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                selectedImage === url
                  ? 'border-[#00F0D9] ring-2 ring-[#00F0D9]/30'
                  : 'border-[#334155] hover:border-[#00F0D9]/50'
              }`}
            >
              <img src={url} alt={`AI Option ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))
        ) : !hasVideoFrame ? (
          // Placeholder when no video yet
          <div className="col-span-3 aspect-[3/1] rounded-xl bg-[#1E293B] border border-dashed border-[#334155] flex items-center justify-center">
            <p className="text-[#94A3B8] text-sm text-center px-4">
              Upload a video first to see the extracted face
            </p>
          </div>
        ) : (
          // Placeholder for future AI options when we have a frame
          <div className="col-span-3 aspect-[3/1] rounded-xl bg-[#1E293B]/50 border border-dashed border-[#334155] flex items-center justify-center">
            <div className="text-center px-4">
              <Sparkles className="w-6 h-6 text-[#00F0D9] mx-auto mb-2" />
              <p className="text-[#94A3B8] text-sm">
                AI-enhanced face options coming soon
              </p>
            </div>
          </div>
        )}

        {/* Upload Custom Image */}
        <button
          onClick={() => inputRef.current?.click()}
          className={`aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
            isCustomSelected
              ? 'border-[#00F0D9] bg-[#00F0D9]/5'
              : 'border-[#334155] hover:border-[#00F0D9]/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCustomUpload(file);
            }}
          />
          <Upload className="w-6 h-6 text-[#94A3B8]" />
          <span className="text-[#94A3B8] text-sm">Upload Own</span>
        </button>
      </div>
    </div>
  );
}
