'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FileCode, LayoutGrid, Video, Clock, DollarSign, Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, FlaskConical, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostProcessingOptions } from '@/components/PostProcessingOptions';
import { useAuth } from '@/components/AuthProvider';
import { getSignedUrl, uploadToGCS, createJob, ApiError, JobResponse, Resolution as ApiResolution } from '@/lib/api';
import { JobPickerModal } from '@/components/JobPickerModal';

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

type ViewMode = 'form' | 'json';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  error?: string;
  filePath?: string;
}

export default function CreateVideoPage() {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null);
  const [imageFormatChecker, setImageFormatChecker] = useState(true);
  const [videoFormatChecker, setVideoFormatChecker] = useState(true);
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
  const [createdJob, setCreatedJob] = useState<JobResponse | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);

  // Job picker state (for "From My Jobs" selection)
  const [jobPickerOpen, setJobPickerOpen] = useState(false);
  const [selectedJobForMotion, setSelectedJobForMotion] = useState<JobResponse | null>(null);
  const [selectedJobThumbnailUrl, setSelectedJobThumbnailUrl] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Check for test mode on mount (must run client-side after hydration)
  useEffect(() => {
    const isTest = checkTestMode();
    console.log('Test mode check:', isTest, 'URL:', window.location.search);
    setTestModeEnabled(isTest);
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

  // Cost calculation based on resolution (per second of video)
  // 480p: $0.04/sec, 720p: $0.08/sec - minimum 5 seconds
  const estimatedTime = '2 to 5 minutes';
  const creditCost = resolution === '480p' ? 10 : 20; // Simplified credit cost
  // Can generate if we have an image AND either a video file OR a selected job
  const hasMotionSource = motionVideo || selectedJobForMotion;
  const canGenerate = referenceImage && hasMotionSource;

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
      setMotionVideo(file);
      setMotionVideoPreview(URL.createObjectURL(file));
      // Clear selected job when uploading a file
      setSelectedJobForMotion(null);
      setSelectedJobThumbnailUrl(null);
    }
  };

  // Handle job selection from JobPickerModal
  const handleJobSelect = (job: JobResponse, thumbnailUrl: string) => {
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
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [motionVideoPreview]);

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setGenerateError('Please sign in to generate videos');
      return;
    }

    if (!referenceImage) {
      setGenerateError('Please select a reference image');
      return;
    }

    if (!motionVideo && !selectedJobForMotion) {
      setGenerateError('Please select a motion source (upload or from your jobs)');
      return;
    }

    // Check credits
    if (!profile || profile.credits_balance < creditCost) {
      setGenerateError(`Insufficient credits. You need ${creditCost} credits.`);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setImageUpload({ status: 'idle', progress: 0 });
    setVideoUpload({ status: 'idle', progress: 0 });

    try {
      // Step 1: Upload reference image
      console.log('Step 1: Getting signed URL for image...');
      setImageUpload({ status: 'uploading', progress: 0 });

      const imageSignedUrl = await getSignedUrl({
        file_type: 'image',
        file_name: referenceImage.name,
        content_type: referenceImage.type,
      });
      console.log('Got image signed URL:', imageSignedUrl.file_path);

      console.log('Uploading image to GCS...');
      await uploadToGCS(
        referenceImage,
        imageSignedUrl.upload_url,
        (progress) => setImageUpload({ status: 'uploading', progress })
      );
      setImageUpload({ status: 'success', progress: 100, filePath: imageSignedUrl.file_path });
      console.log('Image uploaded successfully');

      // Step 2: Get motion video path (either upload new file or use existing job output)
      let motionVideoPath: string;

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

      // Step 3: Create job
      console.log('Step 3: Creating job...');
      setIsCreatingJob(true);

      const seedValue = seed === '-1' || seed === '' ? null : parseInt(seed, 10);
      const job = await createJob({
        job_type: 'animate',
        reference_image_path: imageSignedUrl.file_path,
        motion_video_path: motionVideoPath,
        resolution: resolution as ApiResolution,
        seed: isNaN(seedValue as number) ? null : seedValue,
      });

      console.log('Job created:', job);
      setCreatedJob(job);
      setIsCreatingJob(false);

      // Clear form after successful submission
      removeImage();
      removeVideo();
      clearSelectedJob();

    } catch (error) {
      console.error('Generation failed:', error);
      setIsCreatingJob(false);

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
  }, [referenceImage, motionVideo, selectedJobForMotion, user, profile, creditCost, resolution, seed, removeImage, removeVideo]);

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-[#F1F5F9] mb-3">AI Character Replacement Studio</h1>
        <p className="text-[#94A3B8]">Replace the main character in any video with a new one from a single reference image.</p>
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

        <div className="inline-flex rounded-lg border border-[#334155] bg-[#0F172A] p-1">
          <button onClick={() => setViewMode('form')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'form' ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}>
            <LayoutGrid className="w-4 h-4" />Form
          </button>
          <button onClick={() => setViewMode('json')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'json' ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}>
            <FileCode className="w-4 h-4" />JSON
          </button>
        </div>
      </div>

      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-[#F1F5F9]" />
          <h2 className="text-[#F1F5F9]">Video Generation {viewMode === 'json' && '(JSON Mode)'}</h2>
        </div>

        {viewMode === 'form' ? (
          <>
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
                    <p className="text-[#F1F5F9] mb-1">📸 Reference Image</p>
                    <p className="text-[#94A3B8] text-sm mb-4">PNG, JPG, WebP • Max 10MB • 9:16 portrait</p>
                    <Button
                      variant="outline"
                      className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#334155]">
                  <Label className="text-[#94A3B8] text-sm">Format Checker</Label>
                  <Switch checked={imageFormatChecker} onCheckedChange={setImageFormatChecker} />
                </div>
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
                  <div className="text-center">
                    <Video className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                    <p className="text-[#F1F5F9] mb-1">🎬 Motion Source Video</p>
                    <p className="text-[#94A3B8] text-sm mb-4">Upload a new video or use output from your previous jobs</p>
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
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#334155]">
                  <Label className="text-[#94A3B8] text-sm">Format Checker</Label>
                  <Switch checked={videoFormatChecker} onCheckedChange={setVideoFormatChecker} />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B] mb-6">
              <h3 className="text-[#F1F5F9] mb-4">⚙️ Configuration</h3>
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

            <div className="flex items-center gap-6 mt-6 mb-6 text-[#94A3B8]">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Estimated time: {estimatedTime}</span></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /><span>Cost: {creditCost} credits</span></div>
            </div>

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

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className={`w-full h-14 text-white ${
                canGenerate && !isGenerating
                  ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 cursor-pointer'
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
                  {canGenerate ? `Generate Video — Cost ${creditCost} credits` : 'Select image and video to generate'}
                </>
              )}
            </Button>
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

      {/* Result Section */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <h2 className="text-[#F1F5F9] mb-4">📤 Result</h2>
        {createdJob ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm ${
                createdJob.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                createdJob.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                createdJob.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                createdJob.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {createdJob.status.charAt(0).toUpperCase() + createdJob.status.slice(1)}
              </div>
              <span className="text-[#94A3B8] text-sm">Job ID: {createdJob.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#64748B]">Resolution</p>
                <p className="text-[#F1F5F9]">{createdJob.resolution}</p>
              </div>
              <div>
                <p className="text-[#64748B]">Credits Charged</p>
                <p className="text-[#F1F5F9]">{createdJob.credits_charged}</p>
              </div>
              <div>
                <p className="text-[#64748B]">Created At</p>
                <p className="text-[#F1F5F9]">{new Date(createdJob.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[#64748B]">Seed</p>
                <p className="text-[#F1F5F9]">{createdJob.seed ?? 'Random'}</p>
              </div>
            </div>
            {createdJob.status === 'pending' && (
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Your job is queued. Processing will begin shortly...</span>
              </div>
            )}
            {createdJob.status === 'completed' && createdJob.output_video_path && (
              <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]">
                Download Video
              </Button>
            )}
            {createdJob.status === 'failed' && createdJob.error_message && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{createdJob.error_message}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                onClick={() => window.location.href = '/jobs'}
              >
                View All Jobs
              </Button>
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
                onClick={() => setCreatedJob(null)}
              >
                Create Another
              </Button>
            </div>
          </div>
        ) : isCreatingJob ? (
          <div className="text-center py-12 text-[#94A3B8]">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#00F0D9]" />
            <p>Creating job...</p>
          </div>
        ) : (
          <div className="text-center py-12 text-[#94A3B8]">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Upload files and generate to see your result here</p>
          </div>
        )}
      </div>

      {/* Post-Processing Options (A. B. C. D. E. F.) */}
      <div className="mb-8">
        <h2 className="text-[#F1F5F9] text-xl font-semibold mb-4">Post-Processing Options</h2>
        <PostProcessingOptions />
      </div>

      {/* Job Picker Modal */}
      <JobPickerModal
        open={jobPickerOpen}
        onClose={() => setJobPickerOpen(false)}
        onSelect={handleJobSelect}
      />
    </main>
  );
}
