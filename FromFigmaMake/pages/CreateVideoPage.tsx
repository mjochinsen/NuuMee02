import { useState } from 'react';
import { FileCode, LayoutGrid, Video, Clock, DollarSign } from 'lucide-react';
import { UploadZone } from '../components/UploadZone';
import { ConfigurationPanel } from '../components/ConfigurationPanel';
import { ResultSection } from '../components/ResultSection';
import { PostProcessingOptions } from '../components/PostProcessingOptions';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

type ViewMode = 'form' | 'json';
type ResultStatus = 'awaiting' | 'processing' | 'completed' | 'failed';

export default function CreateVideoPage() {
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('form');

  // Upload state
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [imageSafetyChecker, setImageSafetyChecker] = useState(true);
  const [videoSafetyChecker, setVideoSafetyChecker] = useState(true);

  // Configuration state
  const [resolution, setResolution] = useState('720p');
  const [videoQuality, setVideoQuality] = useState('high');
  const [seed, setSeed] = useState('random');
  const [inferenceSteps, setInferenceSteps] = useState(20);
  const [cfgScale, setCfgScale] = useState(1.0);

  // Result state
  const [resultStatus, setResultStatus] = useState<ResultStatus>('awaiting');
  const [jobId, setJobId] = useState<string>();

  // JSON state
  const [jsonContent, setJsonContent] = useState('');

  // Generate JSON from form state
  const generateJSON = () => {
    const config = {
      reference_image: referenceImage ? `https://storage.nuumee.ai/uploads/${referenceImage.name}` : null,
      motion_video: motionVideo ? `https://storage.nuumee.ai/uploads/${motionVideo.name}` : null,
      safety_checker_image: imageSafetyChecker,
      safety_checker_video: videoSafetyChecker,
      resolution: resolution,
      video_quality: videoQuality,
      advanced: {
        seed: seed === 'random' ? null : seed === 'auto' ? 'auto' : parseInt(seed),
        inference_steps: inferenceSteps,
        cfg_scale: cfgScale,
      },
    };
    return JSON.stringify(config, null, 2);
  };

  // Update JSON when switching to JSON view
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'json') {
      setJsonContent(generateJSON());
    }
    setViewMode(mode);
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    setResolution('720p');
    setVideoQuality('high');
    setSeed('random');
    setInferenceSteps(20);
    setCfgScale(1.0);
  };

  // Handle generation
  const handleGenerate = () => {
    // Simulate job creation
    const newJobId = `job_${Math.random().toString(36).substring(2, 15)}`;
    setJobId(newJobId);
    setResultStatus('processing');

    // Simulate processing (in real app, this would be an API call)
    setTimeout(() => {
      setResultStatus('completed');
    }, 3000);
  };

  const estimatedTime = '1 to 3 hours';
  const creditCost = 2;
  const canGenerate = referenceImage && motionVideo;

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Page Title & Description */}
      <div className="mb-8">
        <h1 className="text-[#F1F5F9] mb-3">AI Character Replacement Studio</h1>
        <p className="text-[#94A3B8]">
          Replace the main character in any video with a new one from a single reference image.
        </p>
      </div>

      {/* Form/JSON Toggle - Outside Container */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-[#334155] bg-[#0F172A] p-1">
          <button
            onClick={() => handleViewModeChange('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'form'
                ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Form
          </button>
          <button
            onClick={() => handleViewModeChange('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'json'
                ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Video Generation Container */}
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A] mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-[#F1F5F9]" />
          <h2 className="text-[#F1F5F9]">
            Video Generation {viewMode === 'json' && '(JSON Mode)'}
          </h2>
        </div>

        {viewMode === 'form' ? (
          <>
            {/* Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <UploadZone
                title="📸 Reference Image"
                accept="image/png,image/jpeg,image/webp"
                maxSize="10MB"
                allowedFormats="PNG, JPG, WebP"
                onFileSelect={setReferenceImage}
                safetyCheckerEnabled={imageSafetyChecker}
                onSafetyCheckerChange={setImageSafetyChecker}
              />
              <UploadZone
                title="🎬 Motion Source Video"
                accept="video/mp4,video/quicktime"
                maxSize="500MB"
                maxDuration="120s"
                allowedFormats="MP4, MOV"
                onFileSelect={setMotionVideo}
                safetyCheckerEnabled={videoSafetyChecker}
                onSafetyCheckerChange={setVideoSafetyChecker}
              />
            </div>

            {/* Configuration Panel */}
            <ConfigurationPanel
              resolution={resolution}
              onResolutionChange={setResolution}
              videoQuality={videoQuality}
              onVideoQualityChange={setVideoQuality}
              seed={seed}
              onSeedChange={setSeed}
              inferenceSteps={inferenceSteps}
              onInferenceStepsChange={setInferenceSteps}
              cfgScale={cfgScale}
              onCfgScaleChange={setCfgScale}
              onResetDefaults={handleResetDefaults}
            />

            {/* Estimated Time & Cost */}
            <div className="flex items-center gap-6 mt-6 mb-6 text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {estimatedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Cost: {creditCost} credits</span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full h-14 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-5 h-5 mr-2" />
              Generate Video — Cost {creditCost} credits
            </Button>
          </>
        ) : (
          <>
            {/* JSON View */}
            <Textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="font-mono text-sm bg-[#1E293B] border-[#334155] text-[#F1F5F9] min-h-[400px] mb-4 focus:border-[#00F0D9]"
              placeholder="Edit configuration JSON..."
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(jsonContent);
                  } catch (err) {
                    // Fallback for when clipboard API is not available
                    const textArea = document.createElement('textarea');
                    textArea.value = jsonContent;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand('copy');
                    } catch (e) {
                      console.error('Failed to copy:', e);
                    }
                    document.body.removeChild(textArea);
                  }
                }}
              >
                Copy JSON
              </Button>
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                Validate
              </Button>
              <Button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white ml-auto"
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Result Section */}
      <ResultSection status={resultStatus} jobId={jobId} />

      {/* Post-Processing Options */}
      <div className="mt-8">
        <h2 className="text-[#F1F5F9] mb-4">Post-Processing Options</h2>
        <PostProcessingOptions />
      </div>
    </main>
  );
}
