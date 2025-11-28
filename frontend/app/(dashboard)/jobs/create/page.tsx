'use client';

import { useState } from 'react';
import { FileCode, LayoutGrid, Video, Clock, DollarSign, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type ViewMode = 'form' | 'json';

export default function CreateVideoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);
  const [imageSafetyChecker, setImageSafetyChecker] = useState(true);
  const [videoSafetyChecker, setVideoSafetyChecker] = useState(true);
  const [resolution, setResolution] = useState('720p');
  const [videoQuality, setVideoQuality] = useState('high');
  const [seed, setSeed] = useState('random');
  const [inferenceSteps, setInferenceSteps] = useState([20]);
  const [cfgScale, setCfgScale] = useState([1.0]);
  const [jsonContent, setJsonContent] = useState('');

  const estimatedTime = '1 to 3 hours';
  const creditCost = 2;
  const canGenerate = referenceImage && motionVideo;

  const handleGenerate = () => {
    console.log('Generating video...');
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-[#F1F5F9] mb-3">AI Character Replacement Studio</h1>
        <p className="text-[#94A3B8]">Replace the main character in any video with a new one from a single reference image.</p>
      </div>

      <div className="flex justify-end mb-4">
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
              <div className="border-2 border-dashed border-[#334155] rounded-xl p-6 hover:border-[#00F0D9] transition-colors">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-[#F1F5F9] mb-1">📸 Reference Image</p>
                  <p className="text-[#94A3B8] text-sm mb-4">PNG, JPG, WebP • Max 10MB</p>
                  <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]">Choose File</Button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#334155]">
                  <Label className="text-[#94A3B8] text-sm">Safety Checker</Label>
                  <Switch checked={imageSafetyChecker} onCheckedChange={setImageSafetyChecker} />
                </div>
              </div>

              {/* Motion Video Upload */}
              <div className="border-2 border-dashed border-[#334155] rounded-xl p-6 hover:border-[#00F0D9] transition-colors">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-[#F1F5F9] mb-1">🎬 Motion Source Video</p>
                  <p className="text-[#94A3B8] text-sm mb-4">MP4, MOV • Max 500MB • 120s</p>
                  <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]">Choose File</Button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#334155]">
                  <Label className="text-[#94A3B8] text-sm">Safety Checker</Label>
                  <Switch checked={videoSafetyChecker} onCheckedChange={setVideoSafetyChecker} />
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
                      <SelectItem value="480p" className="text-[#F1F5F9]">480p</SelectItem>
                      <SelectItem value="720p" className="text-[#F1F5F9]">720p (Recommended)</SelectItem>
                      <SelectItem value="1080p" className="text-[#F1F5F9]">1080p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#94A3B8] mb-2 block">Quality</Label>
                  <Select value={videoQuality} onValueChange={setVideoQuality}>
                    <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="standard" className="text-[#F1F5F9]">Standard</SelectItem>
                      <SelectItem value="high" className="text-[#F1F5F9]">High</SelectItem>
                      <SelectItem value="ultra" className="text-[#F1F5F9]">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6">
                <Label className="text-[#94A3B8] mb-2 block">Inference Steps: {inferenceSteps[0]}</Label>
                <Slider value={inferenceSteps} onValueChange={setInferenceSteps} min={10} max={50} step={1} className="w-full" />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6 mb-6 text-[#94A3B8]">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Estimated time: {estimatedTime}</span></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /><span>Cost: {creditCost} credits</span></div>
            </div>

            <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full h-14 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              <Video className="w-5 h-5 mr-2" />Generate Video — Cost {creditCost} credits
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
      <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
        <h2 className="text-[#F1F5F9] mb-4">📤 Result</h2>
        <div className="text-center py-12 text-[#94A3B8]">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Upload files and generate to see your result here</p>
        </div>
      </div>
    </main>
  );
}
