import { Info, ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Input } from './ui/input';

interface ConfigurationPanelProps {
  resolution: string;
  onResolutionChange: (value: string) => void;
  videoQuality: string;
  onVideoQualityChange: (value: string) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  inferenceSteps: number;
  onInferenceStepsChange: (value: number) => void;
  cfgScale: number;
  onCfgScaleChange: (value: number) => void;
  onResetDefaults: () => void;
}

export function ConfigurationPanel({
  resolution,
  onResolutionChange,
  videoQuality,
  onVideoQualityChange,
  seed,
  onSeedChange,
  inferenceSteps,
  onInferenceStepsChange,
  cfgScale,
  onCfgScaleChange,
  onResetDefaults,
}: ConfigurationPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#F1F5F9]">⚙️ Configuration</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-[#94A3B8] text-sm">Resolution</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                <div className="space-y-2">
                  <p className="mb-2">📺 Choose your output video resolution.</p>
                  <div className="space-y-1 text-sm text-[#94A3B8]">
                    <p>480p → Fast processing, good for tests</p>
                    <p>720p → Recommended for most uses (social media)</p>
                    <p>1080p → High quality, professional use</p>
                  </div>
                  <p className="text-sm text-amber-400 mt-2">⚠️ Note: Higher resolution = longer processing time + larger file size</p>
                  <p className="text-sm text-[#00F0D9] mt-2">💡 Tip: Start with 720p for the best balance of quality and speed.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={resolution} onValueChange={onResolutionChange}>
            <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="480p" className="text-[#F1F5F9] hover:bg-[#334155]">480p</SelectItem>
              <SelectItem value="720p" className="text-[#F1F5F9] hover:bg-[#334155]">720p</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-[#94A3B8] text-sm">Video Quality</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                <div className="space-y-2">
                  <p className="mb-2">✨ Controls the detail and fidelity of the generated video.</p>
                  <div className="space-y-1 text-sm text-[#94A3B8]">
                    <p>Low (1-3) → Fastest, less detail (good for drafts)</p>
                    <p>Medium (4-6) → Balanced, recommended for most projects</p>
                    <p>High (7-10) → Maximum detail (professional work)</p>
                  </div>
                  <p className="text-sm text-[#00F0D9] mt-2">💡 Recommended: Start with 5 for general use.</p>
                  <p className="text-sm text-amber-400 mt-2">⚠️ Higher quality = longer processing time</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={videoQuality} onValueChange={onVideoQualityChange}>
            <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="default" className="text-[#F1F5F9] hover:bg-[#334155]">Default</SelectItem>
              <SelectItem value="high" className="text-[#F1F5F9] hover:bg-[#334155]">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            <span>Additional Settings</span>
          </CollapsibleTrigger>
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-2 text-[#00F0D9] hover:text-[#00F0D9]/80 text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
        </div>

        <CollapsibleContent className="space-y-6">
          <div className="h-px bg-[#334155] mb-6" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[#94A3B8] text-sm">Seed</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                  <div className="space-y-2">
                    <p className="mb-2">🎲 Controls randomness in AI generation.</p>
                    <div className="space-y-1 text-sm text-[#94A3B8]">
                      <p>Random → Different result each time</p>
                      <p>Fixed number → Same result (reproducible)</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-[#00F0D9]">💡 Use cases:</p>
                      <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                        <li>Leave empty for random seed (variety)</li>
                        <li>Enter a specific number (e.g., 42) to recreate exact results</li>
                        <li>Useful for A/B testing or consistency across videos</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="number"
              value={seed}
              onChange={(e) => onSeedChange(e.target.value)}
              placeholder="Random"
              className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9] w-[140px] placeholder:text-[#94A3B8]"
              min="0"
              max="9999999999"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[#94A3B8] text-sm">Inference Steps: {inferenceSteps}</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="mb-2">🔄 Number of processing iterations the AI performs.</p>
                      <div className="space-y-1 text-sm text-[#94A3B8]">
                        <p>10-20 steps → Quick preview</p>
                        <p>20-30 steps → Balanced (recommended)</p>
                        <p>30-50 steps → Highest quality</p>
                      </div>
                      <p className="text-sm text-[#00F0D9] mt-2">💡 Recommended: 25 steps for most projects</p>
                      <p className="text-sm text-amber-400 mt-2">⚠️ More steps = better quality but longer processing time</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#94A3B8] text-sm min-w-[20px]">2</span>
              <Slider
                value={[inferenceSteps]}
                onValueChange={(values) => onInferenceStepsChange(values[0])}
                min={2}
                max={40}
                step={1}
                className="flex-1"
              />
              <span className="text-[#94A3B8] text-sm min-w-[20px]">40</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[#94A3B8] text-sm">Classifier-free guidance scale: {cfgScale.toFixed(1)}</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="mb-2">🎯 Controls how strictly the AI follows your reference image.</p>
                      <div className="space-y-1 text-sm text-[#94A3B8]">
                        <p>Low (1-5) → More creative interpretation</p>
                        <p>Medium (6-10) → Balanced, natural results</p>
                        <p>High (11-15) → Very strict adherence</p>
                      </div>
                      <p className="text-sm text-[#00F0D9] mt-2">💡 Recommended: 7.5 for most natural results</p>
                      <p className="text-sm text-amber-400 mt-2">⚠️ Avoid extremes (&lt;3 or &gt;15) as they can produce artifacts</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#94A3B8] text-sm min-w-[20px]">0.0</span>
              <Slider
                value={[cfgScale]}
                onValueChange={(values) => onCfgScaleChange(values[0])}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-[#94A3B8] text-sm min-w-[20px]">1.0</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
