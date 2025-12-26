'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCode, LayoutGrid, Video, Clock, DollarSign, Upload, X, Loader2, CheckCircle, AlertCircle, FlaskConical, Film, Info, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostProcessingOptions } from '@/components/PostProcessingOptions';
import { useAuth } from '@/components/AuthProvider';
import { getSignedUrl, uploadToGCS, createJob, ApiError, JobResponse, Resolution as ApiResolution } from '@/lib/api';
import { JobPickerModal } from '@/components/JobPickerModal';
import { WelcomeModal } from '@/components/WelcomeModal';
import { DemoStepIndicator } from '@/components/DemoStepIndicator';

// Test mode: Enable via ?test=1 query param or localStorage
const checkTestMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('test') === '1' || localStorage.getItem('nuumee_test_mode') === '1';
  } catch {
    return false;
  }
};

// Demo mode constants (must match backend paths)
// These are full GCS URIs that backend uses to detect demo mode
const DEMO_IMAGE_PATH = 'gs://nuumee-images/demo/REF.jpeg';
const DEMO_VIDEO_PATH = 'gs://nuumee-videos/demo/SRC.mp4';
// Public URLs for preview display (v=2 for cache busting after asset update)
const DEMO_IMAGE_PREVIEW_URL = 'https://storage.googleapis.com/nuumee-images/demo/REF.jpeg?v=2';
const DEMO_VIDEO_PREVIEW_URL = 'https://storage.googleapis.com/nuumee-videos/demo/SRC.mp4?v=2';

type ViewMode = 'form' | 'json';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  error?: string;
  filePath?: string;
}

export default function CreateVideoPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Redirect non-logged-in users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/videos/create');
    }
  }, [loading, user, router]);
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null);
  const [motionVideoDuration, setMotionVideoDuration] = useState<number | null>(null);
  const [resolution, setResolution] = useState('720p');
  const [seed, setSeed] = useState('-1');
  const [jsonContent, setJsonContent] = useState('');

  // Upload state
  const [imageUpload, setImageUpload] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [videoUpload, setVideoUpload] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [loadingTestFiles, setLoadingTestFiles] = useState(false);
  // Demo mode: uses pre-uploaded demo files (free, instant result)
  const [demoMode, setDemoMode] = useState(false);
  // Hide "Try Me" buttons after user completes their first demo
  // Use null as initial state to distinguish "not yet checked" from "checked and true/false"
  const [hasCompletedDemo, setHasCompletedDemo] = useState<boolean | null>(null);
  // Job picker state (for "From My Jobs" selection)
  const [jobPickerOpen, setJobPickerOpen] = useState(false);
  const [selectedJobForMotion, setSelectedJobForMotion] = useState<JobResponse | null>(null);
  const [selectedJobThumbnailUrl, setSelectedJobThumbnailUrl] = useState<string | null>(null);
  // Welcome modal state (shows on first visit)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Check for test mode and demo completion on mount
  useEffect(() => {
    const isTest = checkTestMode();
    console.log('Test mode check:', isTest, 'URL:', window.location.search);
    setTestModeEnabled(isTest);

    // Check if user has completed a demo before
    const rawValue = localStorage.getItem('nuumee_demo_completed');
    const demoCompleted = rawValue === '1';
    console.log('[Onboarding] localStorage nuumee_demo_completed:', rawValue, '→ hasCompletedDemo:', demoCompleted);
    setHasCompletedDemo(demoCompleted);

    // Show welcome modal for first-time users (never completed demo)
    if (!demoCompleted) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Load test files from public directory
  const loadTestFiles = useCallback(async () => {
    setLoadingTestFiles(true);
    setGenerateError(null);

    try {
      // Fetch test image
      const imageResponse = await fetch('/test-assets/test-image.png');
      if (!imageResponse.ok) throw new Error('Failed to load test image');
      const imageBlob = await imageResponse.blob();
      const testImage = new File([imageBlob], 'test-image.png', { type: 'image/png' });

      // Fetch test video
      const videoResponse = await fetch('/test-assets/test-video.mp4');
      if (!videoResponse.ok) throw new Error('Failed to load test video');
      const videoBlob = await videoResponse.blob();
      const testVideo = new File([videoBlob], 'test-video.mp4', { type: 'video/mp4' });

      // Set the files
      setReferenceImage(testImage);
      setReferenceImagePreview(URL.createObjectURL(testImage));
      setMotionVideo(testVideo);
      setMotionVideoPreview(URL.createObjectURL(testVideo));

      console.log('Test files loaded:', { image: testImage, video: testVideo });
    } catch (error) {
      console.error('Failed to load test files:', error);
      setGenerateError('Failed to load test files: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoadingTestFiles(false);
    }
  }, []);

  // Load demo image (step 1 of demo flow)
  const loadDemoImage = useCallback(() => {
    // Clear any existing image selection
    setReferenceImage(null);
    if (referenceImagePreview && !referenceImagePreview.startsWith('http')) {
      URL.revokeObjectURL(referenceImagePreview);
    }

    // Set demo mode and load image
    setDemoMode(true);
    setReferenceImagePreview(DEMO_IMAGE_PREVIEW_URL);
    setGenerateError(null);

    console.log('Demo: image loaded');
  }, [referenceImagePreview]);

  // Load demo video (step 2 of demo flow)
  const loadDemoVideo = useCallback(() => {
    // Clear any existing video selection
    setMotionVideo(null);
    setSelectedJobForMotion(null);
    setSelectedJobThumbnailUrl(null);
    if (motionVideoPreview && !motionVideoPreview.startsWith('http')) {
      URL.revokeObjectURL(motionVideoPreview);
    }

    // Ensure demo mode is on and load video
    setDemoMode(true);
    setMotionVideoPreview(DEMO_VIDEO_PREVIEW_URL);
    setGenerateError(null);

    console.log('Demo: video loaded');
  }, [motionVideoPreview]);

  // Clear demo mode when user uploads their own files
  const exitDemoMode = useCallback(() => {
    setDemoMode(false);
  }, []);

  // Cost calculation based on resolution and actual video duration
  // 480p: 0.8 credits/sec, 720p: 1.6 credits/sec - minimum 5 credits
  const estimatedTime = demoMode ? 'Instant' : '2 to 5 minutes';
  const durationForCost = motionVideoDuration || 10; // Default to 10s if not detected
  const ratePerSecond = resolution === '480p' ? 0.8 : 1.6;
  const creditCost = demoMode ? 0 : Math.max(5, Math.ceil(durationForCost * ratePerSecond));
  // Can generate if we have: demo mode with both previews loaded, OR (image AND either video file OR selected job)
  const hasMotionSource = motionVideo || selectedJobForMotion || (demoMode && motionVideoPreview);
  const canGenerate = (referenceImage || (demoMode && referenceImagePreview)) && hasMotionSource;

  // Calculate demo step: 1 = no selections, 2 = image selected, 3 = both selected
  const demoStep: 1 | 2 | 3 = (() => {
    if (!demoMode && !hasCompletedDemo) return 1; // Not started
    if (referenceImagePreview && hasMotionSource) return 3; // Ready to generate
    if (referenceImagePreview) return 2; // Image selected, need video
    return 1; // Need image
  })();

  // Check if we're in active demo mode (first-time user going through demo)
  const isInDemoFlow = hasCompletedDemo === false;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Image selected:', file?.name, file?.type, file?.size);
    if (file) {
      // Validate file type - be more permissive
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        console.log('Invalid image type:', file.type);
        alert(`Please select a valid image file (PNG, JPG, or WebP). Got: ${file.type}`);
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB');
        return;
      }
      console.log('Setting reference image');
      exitDemoMode(); // Exit demo mode when user uploads their own file
      setReferenceImage(file);
      setReferenceImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('Video selected:', file?.name, file?.type, file?.size);
    if (file) {
      // Validate file type - be more permissive
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mpeg'];
      if (!validTypes.includes(file.type)) {
        console.log('Invalid video type:', file.type);
        alert(`Please select a valid video file (MP4, MOV, AVI, or WebM). Got: ${file.type}`);
        return;
      }
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('Video must be less than 500MB');
        return;
      }
      console.log('Setting motion video');
      exitDemoMode(); // Exit demo mode when user uploads their own file
      setMotionVideo(file);
      const videoUrl = URL.createObjectURL(file);
      setMotionVideoPreview(videoUrl);

      // Get video duration using temporary video element
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        const duration = Math.ceil(tempVideo.duration);
        console.log('Video duration detected:', duration, 'seconds');
        setMotionVideoDuration(duration);
        URL.revokeObjectURL(tempVideo.src); // Clean up temp URL
      };
      tempVideo.onerror = () => {
        console.warn('Could not detect video duration, using default');
        setMotionVideoDuration(null);
      };
      tempVideo.src = videoUrl;

      // Clear selected job when uploading a file
      setSelectedJobForMotion(null);
      setSelectedJobThumbnailUrl(null);
    }
  };

  // Handle job selection from JobPickerModal
  const handleJobSelect = (job: JobResponse, thumbnailUrl: string) => {
    exitDemoMode(); // Exit demo mode when user selects a job
    setSelectedJobForMotion(job);
    setSelectedJobThumbnailUrl(thumbnailUrl);
    // Clear uploaded file when selecting a job
    setMotionVideo(null);
    if (motionVideoPreview) URL.revokeObjectURL(motionVideoPreview);
    setMotionVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Clear selected job
  const clearSelectedJob = () => {
    setSelectedJobForMotion(null);
    setSelectedJobThumbnailUrl(null);
  };

  const removeImage = useCallback(() => {
    setReferenceImage(null);
    if (referenceImagePreview) URL.revokeObjectURL(referenceImagePreview);
    setReferenceImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [referenceImagePreview]);

  const removeVideo = useCallback(() => {
    setMotionVideo(null);
    if (motionVideoPreview) URL.revokeObjectURL(motionVideoPreview);
    setMotionVideoPreview(null);
    setMotionVideoDuration(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [motionVideoPreview]);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setGenerateError('Please sign in to generate videos');
      return;
    }

    // Validation differs based on demo mode
    if (!demoMode) {
      if (!referenceImage) {
        setGenerateError('Please select a reference image');
        return;
      }

      if (!motionVideo && !selectedJobForMotion) {
        setGenerateError('Please select a motion source (upload or from your jobs)');
        return;
      }

      // Check credits (demo is free, so skip for demo mode)
      if (!profile || profile.credits_balance < creditCost) {
        setGenerateError(`Insufficient credits. You need ${creditCost} credits.`);
        return;
      }
    }

    setIsGenerating(true);
    setGenerateError(null);
    setImageUpload({ status: 'idle', progress: 0 });
    setVideoUpload({ status: 'idle', progress: 0 });

    try {
      let imagePath: string;
      let motionVideoPath: string;

      if (demoMode) {
        // Demo mode: use pre-uploaded demo files (no uploads needed)
        console.log('Demo mode: using pre-uploaded demo files');
        // Add small fake delay to simulate processing
        setImageUpload({ status: 'uploading', progress: 50 });
        await new Promise(resolve => setTimeout(resolve, 800));
        setImageUpload({ status: 'success', progress: 100 });
        setVideoUpload({ status: 'uploading', progress: 50 });
        await new Promise(resolve => setTimeout(resolve, 800));
        setVideoUpload({ status: 'success', progress: 100 });
        imagePath = DEMO_IMAGE_PATH;
        motionVideoPath = DEMO_VIDEO_PATH;
      } else {
        // Normal mode: upload files
        // Step 1: Upload reference image
        console.log('Step 1: Getting signed URL for image...');
        setImageUpload({ status: 'uploading', progress: 0 });

        const imageSignedUrl = await getSignedUrl({
          file_type: 'image',
          file_name: referenceImage!.name,
          content_type: referenceImage!.type,
        });
        console.log('Got image signed URL:', imageSignedUrl.file_path);

        console.log('Uploading image to GCS...');
        await uploadToGCS(
          referenceImage!,
          imageSignedUrl.upload_url,
          (progress) => setImageUpload({ status: 'uploading', progress })
        );
        setImageUpload({ status: 'success', progress: 100, filePath: imageSignedUrl.file_path });
        console.log('Image uploaded successfully');
        imagePath = imageSignedUrl.file_path;

        // Step 2: Get motion video path (either upload new file or use existing job output)
        if (selectedJobForMotion) {
          // Use output from previous job
          console.log('Step 2: Using video from previous job:', selectedJobForMotion.short_id || selectedJobForMotion.id);
          setVideoUpload({ status: 'success', progress: 100 });
          motionVideoPath = selectedJobForMotion.output_video_path!;
        } else if (motionVideo) {
          // Upload new file
          console.log('Step 2: Getting signed URL for video...');
          setVideoUpload({ status: 'uploading', progress: 0 });

          const videoSignedUrl = await getSignedUrl({
            file_type: 'video',
            file_name: motionVideo.name,
            content_type: motionVideo.type,
          });
          console.log('Got video signed URL:', videoSignedUrl.file_path);

          console.log('Uploading video to GCS...');
          await uploadToGCS(
            motionVideo,
            videoSignedUrl.upload_url,
            (progress) => setVideoUpload({ status: 'uploading', progress })
          );
          setVideoUpload({ status: 'success', progress: 100, filePath: videoSignedUrl.file_path });
          console.log('Video uploaded successfully');
          motionVideoPath = videoSignedUrl.file_path;
        } else {
          throw new Error('No motion source selected');
        }
      }

      // Step 3: Create job (backend detects demo by matching file paths)
      console.log('Step 3: Creating job...');

      const seedValue = seed === '-1' || seed === '' ? null : parseInt(seed, 10);
      const job = await createJob({
        job_type: 'animate',
        reference_image_path: imagePath,
        motion_video_path: motionVideoPath,
        motion_video_duration_seconds: motionVideoDuration || undefined,
        resolution: resolution as ApiResolution,
        seed: isNaN(seedValue as number) ? null : seedValue,
      });

      console.log('Job created:', job);

      // Refresh user profile to update credits balance immediately
      await refreshProfile();

      // Mark demo as completed (hide "Try Me" buttons in future)
      if (demoMode) {
        localStorage.setItem('nuumee_demo_completed', '1');
        setHasCompletedDemo(true);
      }

      // Clear form after successful submission
      removeImage();
      removeVideo();
      clearSelectedJob();
      setDemoMode(false);

      // Redirect to jobs page to see the new job
      router.push('/jobs');

    } catch (error) {
      console.error('Generation failed:', error);

      if (error instanceof ApiError) {
        if (error.status === 401) {
          setGenerateError('Please sign in to generate videos');
        } else if (error.status === 402) {
          setGenerateError('Insufficient credits. Please purchase more credits to continue.');
        } else if (error.status === 403) {
          setGenerateError('You cannot use this video. It may belong to another user or no longer exist.');
        } else {
          setGenerateError(error.message);
        }
      } else if (error instanceof Error) {
        setGenerateError(error.message);
      } else {
        setGenerateError('An unexpected error occurred');
      }

      // Mark failed upload
      if (imageUpload.status === 'uploading') {
        setImageUpload(prev => ({ ...prev, status: 'error', error: 'Upload failed' }));
      }
      if (videoUpload.status === 'uploading') {
        setVideoUpload(prev => ({ ...prev, status: 'error', error: 'Upload failed' }));
      }
    } finally {
      setIsGenerating(false);
    }
  }, [referenceImage, motionVideo, motionVideoDuration, selectedJobForMotion, user, profile, creditCost, resolution, seed, removeImage, removeVideo, demoMode, refreshProfile, router]);

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-[#F1F5F9] mb-3">AI Character Swap Studio</h1>
        <p className="text-[#94A3B8]">Swap the main character in any video with a new one from a single reference image.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        {/* Test Mode Button - only visible in test mode */}
        {testModeEnabled && (
          <Button
            onClick={loadTestFiles}
            disabled={loadingTestFiles}
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
            data-testid="load-test-files"
          >
            {loadingTestFiles ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
            ) : (
              <><FlaskConical className="w-4 h-4 mr-2" />Load Test Files</>
            )}
          </Button>
        )}
        {!testModeEnabled && <div />}

        {/* Hide Form/JSON toggle during demo flow */}
        {!isInDemoFlow && (
          <div className="inline-flex rounded-lg border border-[#334155] bg-[#0F172A] p-1">
            <button onClick={() => setViewMode('form')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'form' ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}>
              <LayoutGrid className="w-4 h-4" />Form
            </button>
            <button onClick={() => setViewMode('json')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'json' ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}>
              <FileCode className="w-4 h-4" />JSON
            </button>
          </div>
        )}
      </div>

      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Character Swap {viewMode === 'json' && '(JSON Mode)'}</h2>
        </div>

        {viewMode === 'form' ? (
          <>
            {/* Step indicator for first-time users */}
            {isInDemoFlow && (
              <DemoStepIndicator
                currentStep={demoStep}
                onSkip={() => {
                  setDemoMode(false);
                  setReferenceImagePreview(null);
                  setMotionVideoPreview(null);
                  setHasCompletedDemo(true);
                  localStorage.setItem('nuumee_demo_completed', '1');
                }}
              />
            )}

            {/* Demo Mode Active - show when demo files loaded but user has completed demo before */}
            {demoMode && hasCompletedDemo && (
              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#00F0D9]">
                  <FlaskConical className="w-4 h-4" />
                  <span>Demo ready!</span>
                </div>
                <button
                  onClick={() => {
                    setDemoMode(false);
                    setReferenceImagePreview(null);
                    setMotionVideoPreview(null);
                  }}
                  className="text-[#64748B] hover:text-[#94A3B8] text-xs underline"
                >
                  Use my own files instead
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Reference Image Upload */}
              <div className="border-2 border-dashed border-[#334155] rounded-xl p-6 hover:border-[#00F0D9] transition-colors relative">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {referenceImagePreview ? (
                  <div className="relative">
                    <img
                      src={referenceImagePreview}
                      alt="Reference"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-[#94A3B8] text-sm mt-2 truncate">{referenceImage?.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <p className="text-[#F1F5F9] font-medium">Your Actor Photo</p>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-[#64748B] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-[#94A3B8] w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          The character in this photo becomes the actor in your video.
                        </div>
                      </div>
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-1">Upload a photo with a face</p>
                    <p className="text-[#64748B] text-xs mb-4">PNG/JPG/WebP • Max 10MB</p>
                    {/* Hide Choose File button during demo flow */}
                    {!isInDemoFlow && (
                      <Button
                        variant="outline"
                        className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    )}
                    {!referenceImagePreview && hasCompletedDemo === false && (
                      <div className="mt-6 relative">
                        {/* Big bouncing arrow pointing down */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                          <div className="text-[#00F0D9] text-5xl font-bold drop-shadow-[0_0_15px_rgba(0,240,217,0.9)]">
                            ↓
                          </div>
                        </div>
                        {/* Glowing CTA button - Step 1 */}
                        <button
                          onClick={loadDemoImage}
                          className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-bold text-lg shadow-[0_0_20px_rgba(0,240,217,0.5)] hover:shadow-[0_0_30px_rgba(0,240,217,0.7)] hover:scale-105 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            Step 1: Choose a photo with a face
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </button>
                        <p className="text-[#64748B] text-xs mt-2">Click to use our demo actor</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Motion Video Upload / Job Selection */}
              <div className="border-2 border-dashed border-[#334155] rounded-xl p-6 hover:border-[#00F0D9] transition-colors relative">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                {motionVideoPreview ? (
                  // Show uploaded file
                  <div className="relative">
                    <video
                      src={motionVideoPreview}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-[#94A3B8] text-sm mt-2 truncate">{motionVideo?.name}</p>
                  </div>
                ) : selectedJobForMotion ? (
                  // Show selected job
                  <div className="relative">
                    {selectedJobThumbnailUrl ? (
                      <video
                        src={selectedJobThumbnailUrl}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-48 bg-[#0F172A] rounded-lg flex items-center justify-center">
                        <Video className="w-12 h-12 text-[#64748B]" />
                      </div>
                    )}
                    <button
                      onClick={clearSelectedJob}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="mt-2 flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#00F0D9]" />
                      <span className="text-[#00F0D9] text-sm font-medium">
                        From job {selectedJobForMotion.short_id || selectedJobForMotion.id.slice(0, 8)}
                      </span>
                      <span className="text-[#64748B] text-xs">
                        • {selectedJobForMotion.resolution.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Show empty state with two buttons
                  <div className="text-center relative">
                    <Video className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <p className="text-[#F1F5F9] font-medium">Target Video</p>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-[#64748B] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-[#94A3B8] w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          Your new actor will be inserted into this video, replacing the original character.
                        </div>
                      </div>
                    </div>
                    <p className="text-[#94A3B8] text-sm mb-1">Upload a video clip for character swap</p>
                    <p className="text-[#64748B] text-xs mb-4">MP4/MOV • Max 500MB • 120s max</p>
                    {/* Hide upload buttons during demo flow */}
                    {!isInDemoFlow && (
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#00F0D9] text-[#00F0D9] hover:bg-[#00F0D9]/10"
                          onClick={() => setJobPickerOpen(true)}
                        >
                          <Film className="w-4 h-4 mr-2" />
                          From My Jobs
                        </Button>
                      </div>
                    )}
                    {/* Step 2 CTA for demo flow - only show when image is selected */}
                    {!motionVideoPreview && !selectedJobForMotion && hasCompletedDemo === false && referenceImagePreview && (
                      <div className="mt-6 relative">
                        {/* Big bouncing arrow pointing down */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                          <div className="text-[#00F0D9] text-5xl font-bold drop-shadow-[0_0_15px_rgba(0,240,217,0.9)]">
                            ↓
                          </div>
                        </div>
                        {/* Glowing CTA button - Step 2 */}
                        <button
                          onClick={loadDemoVideo}
                          className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-bold text-lg shadow-[0_0_20px_rgba(0,240,217,0.5)] hover:shadow-[0_0_30px_rgba(0,240,217,0.7)] hover:scale-105 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            Step 2: Choose a video
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </button>
                        <p className="text-[#64748B] text-xs mt-2">Click to use our demo video</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Options - hide during demo flow */}
            {!isInDemoFlow && (
              <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[#94A3B8] mb-2 block">Resolution</Label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155]">
                        <SelectItem value="480p" className="text-[#F1F5F9]">480p (Faster, Lower Cost)</SelectItem>
                        <SelectItem value="720p" className="text-[#F1F5F9]">720p (Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[#64748B] text-xs mt-2">
                      {resolution === '480p' ? '$0.04/sec • Faster processing' : '$0.08/sec • Better quality'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[#94A3B8] mb-2 block">Seed (Optional)</Label>
                    <input
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="-1 for random"
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-[#F1F5F9] focus:border-[#00F0D9] focus:outline-none"
                    />
                    <p className="text-[#64748B] text-xs mt-2">Use -1 for random, or set a number for reproducible results</p>
                  </div>
                </div>
              </div>
            )}

            {/* Time/Cost info - simplified during demo flow */}
            {isInDemoFlow && demoMode ? (
              <div className="flex items-center justify-center gap-2 mt-6 mb-6 text-[#00F0D9]">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Demo ready — takes ~30 seconds</span>
              </div>
            ) : !isInDemoFlow && (
              <div className="flex items-center gap-6 mt-6 mb-6 text-[#94A3B8]">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Estimated time: {estimatedTime}</span></div>
                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /><span>Cost: {creditCost} credits</span></div>
              </div>
            )}

            {/* Upload Progress */}
            {isGenerating && (
              <div className="mb-4 space-y-3">
                {/* Image upload progress */}
                <div className="flex items-center gap-3">
                  {imageUpload.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-[#00F0D9]" />}
                  {imageUpload.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {imageUpload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-[#94A3B8] text-sm flex-1">
                    {imageUpload.status === 'idle' && 'Waiting to upload image...'}
                    {imageUpload.status === 'uploading' && `Uploading image... ${Math.round(imageUpload.progress)}%`}
                    {imageUpload.status === 'success' && 'Image uploaded'}
                    {imageUpload.status === 'error' && 'Image upload failed'}
                  </span>
                  {imageUpload.status === 'uploading' && (
                    <div className="w-32 h-2 bg-[#334155] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00F0D9] transition-all" style={{ width: `${imageUpload.progress}%` }} />
                    </div>
                  )}
                </div>

                {/* Video upload/selection progress */}
                <div className="flex items-center gap-3">
                  {videoUpload.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-[#00F0D9]" />}
                  {videoUpload.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {videoUpload.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-[#94A3B8] text-sm flex-1">
                    {videoUpload.status === 'idle' && (selectedJobForMotion ? 'Using video from previous job...' : 'Waiting to upload video...')}
                    {videoUpload.status === 'uploading' && `Uploading video... ${Math.round(videoUpload.progress)}%`}
                    {videoUpload.status === 'success' && (selectedJobForMotion ? 'Using video from previous job' : 'Video uploaded')}
                    {videoUpload.status === 'error' && 'Video upload failed'}
                  </span>
                  {videoUpload.status === 'uploading' && (
                    <div className="w-32 h-2 bg-[#334155] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00F0D9] transition-all" style={{ width: `${videoUpload.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error message */}
            {generateError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-400 text-sm">{generateError}</span>
              </div>
            )}

            {/* Generate Button with bouncing arrow for demo onboarding only */}
            <div className="relative">
              {/* Bouncing arrow for Generate button - only show during demo flow step 3 */}
              {canGenerate && !isGenerating && isInDemoFlow && demoMode && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce z-10">
                  <div className="text-[#00F0D9] text-5xl font-bold drop-shadow-[0_0_15px_rgba(0,240,217,0.9)]">
                    ↓
                  </div>
                </div>
              )}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className={`w-full h-14 text-white font-semibold text-lg ${
                  canGenerate && !isGenerating
                    ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 cursor-pointer shadow-[0_0_20px_rgba(0,240,217,0.4)]'
                    : 'bg-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {selectedJobForMotion ? 'Processing...' : 'Uploading files...'}
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    {canGenerate
                      ? demoMode && isInDemoFlow
                        ? 'Step 3: Generate Video!'
                        : demoMode
                        ? 'Generate Demo'
                        : `Generate Video — ${creditCost} credits`
                      : 'Select image and video to generate'}
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Textarea value={jsonContent} onChange={(e) => setJsonContent(e.target.value)} className="font-mono text-sm bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-[400px] mb-4 focus:border-[#00F0D9]" placeholder="Edit configuration JSON..." />
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Copy JSON</Button>
              <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Validate</Button>
              <Button onClick={handleGenerate} className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white ml-auto">Submit</Button>
            </div>
          </>
        )}
      </div>

      {/* Post-Processing Options - hide during demo flow */}
      {!isInDemoFlow && (
        <div className="mb-8">
          <h2 className="text-[#F1F5F9] text-xl font-semibold mb-4">Post-Processing Options</h2>
          <PostProcessingOptions />
        </div>
      )}

      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        open={showWelcomeModal}
        onClose={() => {
          // Skip demo: close modal and mark demo as completed
          setShowWelcomeModal(false);
          setHasCompletedDemo(true);
          localStorage.setItem('nuumee_demo_completed', '1');
        }}
        onStartDemo={() => {
          setShowWelcomeModal(false);
          // Demo flow is already active for first-time users
        }}
      />

      {/* Job Picker Modal */}
      <JobPickerModal
        open={jobPickerOpen}
        onClose={() => setJobPickerOpen(false)}
        onSelect={handleJobSelect}
      />
    </main>
  );
}
