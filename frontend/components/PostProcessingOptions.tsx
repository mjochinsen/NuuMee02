'use client';

import { Info, Link as LinkIcon, Video, Maximize, Volume2, Crop, Type, Droplet, FileText, Check, ChevronDown, Upload } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type ResultStatus = 'awaiting' | 'processing' | 'completed' | 'failed';

function ResultSection({ status }: { status: ResultStatus }) {
  if (status === 'awaiting') return null;

  return (
    <div className="mt-4 p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
      {status === 'processing' && (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#00F0D9] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94A3B8]">Processing...</span>
        </div>
      )}
      {status === 'completed' && (
        <div className="flex items-center gap-3 text-green-400">
          <Check className="w-4 h-4" />
          <span>Completed!</span>
        </div>
      )}
      {status === 'failed' && (
        <div className="flex items-center gap-3 text-red-400">
          <span>Failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}

export function PostProcessingOptions() {
  const [videoExtenderEnabled, setVideoExtenderEnabled] = useState(false);
  const [upscalerEnabled, setUpscalerEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [formatEnabled, setFormatEnabled] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  const [audioOption, setAudioOption] = useState('mix');
  const [formatOption, setFormatOption] = useState('crop');
  const [subtitleStyle, setSubtitleStyle] = useState('bold-modern');
  const [watermarkType, setWatermarkType] = useState('logo');
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [volume, setVolume] = useState([30]);
  const [fadeIn, setFadeIn] = useState('0');
  const [fadeOut, setFadeOut] = useState('0');
  const [startTime, setStartTime] = useState('0');

  const [extenderStatus, setExtenderStatus] = useState<ResultStatus>('awaiting');
  const [upscalerStatus, setUpscalerStatus] = useState<ResultStatus>('awaiting');
  const [soundStatus, setSoundStatus] = useState<ResultStatus>('awaiting');
  const [formatStatus, setFormatStatus] = useState<ResultStatus>('awaiting');
  const [subtitlesStatus, setSubtitlesStatus] = useState<ResultStatus>('awaiting');
  const [watermarkStatus, setWatermarkStatus] = useState<ResultStatus>('awaiting');

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
                  <Textarea
                    placeholder="Enter extension prompt..."
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] min-h-[80px]"
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setExtenderStatus('processing')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Generate (2 credits)
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
                  B. Video Upscaler (4K)
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="mb-2">Enhance your completed video to stunning 4K resolution (3840x2160).</p>
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
                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setUpscalerStatus('processing')}
                  >
                    <Maximize className="w-4 h-4 mr-2" />
                    Generate (2 credits)
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
                    <div className="space-y-4 p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
                      {/* Audio File Upload */}
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
                                <p className="mb-2">Upload background music to mix with your video audio</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">What it does:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Overlays music onto existing video audio</li>
                                    <li>Preserves original audio (voices, sounds)</li>
                                    <li>Adjustable volume balance</li>
                                  </ul>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm text-[#00F0D9]">Best practices:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>Use instrumental tracks (no vocals)</li>
                                    <li>Keep volume at 20-40% to not overpower speech</li>
                                    <li>Match music length to video duration</li>
                                    <li>Use fade in/out for smooth transitions</li>
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
                          <Input type="file" accept=".mp3,.wav,.aac,.m4a" className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]" />
                          <Button variant="outline" size="icon" className="border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#00F0D9] shrink-0">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Volume Slider */}
                      <div className="flex flex-col gap-2">
                        <Label className="text-[#94A3B8] text-sm">Volume</Label>
                        <div className="flex items-center gap-4">
                          <Slider value={volume} onValueChange={setVolume} min={0} max={100} step={1} className="flex-1" />
                          <span className="text-[#F1F5F9] text-sm min-w-[48px] text-right">{volume[0]}%</span>
                        </div>
                      </div>

                      {/* Fade In */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#94A3B8] text-sm">Fade In (seconds)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                              <div className="space-y-2">
                                <p className="mb-2">Gradually increase volume from 0% to full over X seconds</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">Examples:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>0 seconds = Music starts at full volume</li>
                                    <li>2 seconds = Smooth 2-second fade-in</li>
                                    <li>5 seconds = Gentle 5-second fade-in</li>
                                  </ul>
                                </div>
                                <p className="text-sm text-[#00F0D9] mt-2">Recommended: 2-3 seconds for natural transitions</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={fadeIn}
                          onChange={(e) => setFadeIn(e.target.value)}
                          min="0"
                          placeholder="0"
                          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
                        />
                      </div>

                      {/* Fade Out */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#94A3B8] text-sm">Fade Out (seconds)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                              <div className="space-y-2">
                                <p className="mb-2">Gradually decrease volume from full to 0% over X seconds at the end</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">Examples:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>0 seconds = Music stops abruptly</li>
                                    <li>2 seconds = Smooth 2-second fade-out</li>
                                    <li>5 seconds = Gentle 5-second fade-out</li>
                                  </ul>
                                </div>
                                <p className="text-sm text-[#00F0D9] mt-2">Recommended: 2-3 seconds for natural ending</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={fadeOut}
                          onChange={(e) => setFadeOut(e.target.value)}
                          min="0"
                          placeholder="0"
                          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
                        />
                      </div>

                      {/* Start Time */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-[#94A3B8] text-sm">Start Time (seconds)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                                <Info className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-md p-4">
                              <div className="space-y-2">
                                <p className="mb-2">Delay when music begins in the video</p>
                                <div className="space-y-1">
                                  <p className="text-[#00F0D9]">Examples:</p>
                                  <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                                    <li>0 seconds = Music starts immediately</li>
                                    <li>5 seconds = Music starts 5 seconds into video</li>
                                    <li>10 seconds = Music starts 10 seconds into video</li>
                                  </ul>
                                </div>
                                <p className="text-sm text-[#00F0D9] mt-2">Use to sync music with specific moments</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          min="0"
                          placeholder="0"
                          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
                        />
                      </div>
                    </div>
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

        {/* D. Change Format */}
        <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="format"
              checked={formatEnabled}
              onCheckedChange={(checked) => setFormatEnabled(checked as boolean)}
              className="mt-1 border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <label htmlFor="format" className="text-[#F1F5F9] cursor-pointer font-medium">
                  D. Change Format to 16:9
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9] max-w-sm p-4">
                    <div className="space-y-2">
                      <p className="mb-2">Convert vertical (9:16) videos to horizontal (16:9) format.</p>
                      <div className="space-y-1">
                        <p className="text-[#00F0D9]">Methods:</p>
                        <ul className="list-none text-sm text-[#94A3B8]">
                          <li>Crop - Removes top/bottom (tight framing)</li>
                          <li>Letterbox - Adds black bars (preserves all content)</li>
                          <li>Blur Sides - Fills sides with blurred video (natural look)</li>
                        </ul>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-[#00F0D9]">Best for:</p>
                        <ul className="list-disc list-inside text-sm text-[#94A3B8]">
                          <li>Repurposing TikTok/Instagram Reels for YouTube</li>
                          <li>Cross-platform content distribution</li>
                          <li>Desktop viewing optimization</li>
                        </ul>
                      </div>
                      <p className="text-sm text-amber-400 mt-2">Works best with centered subjects</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              {formatEnabled && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={formatOption === 'crop' ? 'default' : 'outline'}
                      onClick={() => setFormatOption('crop')}
                      className={formatOption === 'crop' ? 'bg-[#00F0D9] text-[#0F172A]' : 'border-[#334155] text-[#94A3B8] hover:border-[#00F0D9]'}
                    >
                      Crop
                    </Button>
                    <Button
                      variant={formatOption === 'letterbox' ? 'default' : 'outline'}
                      onClick={() => setFormatOption('letterbox')}
                      className={formatOption === 'letterbox' ? 'bg-[#00F0D9] text-[#0F172A]' : 'border-[#334155] text-[#94A3B8] hover:border-[#00F0D9]'}
                    >
                      Letterbox
                    </Button>
                    <Button
                      variant={formatOption === 'hybrid' ? 'default' : 'outline'}
                      onClick={() => setFormatOption('hybrid')}
                      className={formatOption === 'hybrid' ? 'bg-[#00F0D9] text-[#0F172A]' : 'border-[#334155] text-[#94A3B8] hover:border-[#00F0D9]'}
                    >
                      Hybrid
                    </Button>
                  </div>

                  {/* Visual Preview Section */}
                  <div className="border border-[#334155] rounded-xl p-6 bg-[#1E293B]">
                    <div className="text-[#94A3B8] text-sm mb-4">Visual Preview:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Original 9:16 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg border-2 border-[#334155] overflow-hidden flex items-center justify-center">
                          <div className="w-6 h-14 bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 rounded border border-[#334155]"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#94A3B8] text-xs">9:16</div>
                          <div className="text-[#F1F5F9] text-sm">Original</div>
                        </div>
                      </div>

                      {/* Crop 16:9 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#334155] to-[#1E293B] rounded-lg border-2 border-[#00F0D9]/50 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-12 bg-gradient-to-br from-[#00F0D9]/30 to-[#3B1FE2]/30 rounded"></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#94A3B8] text-xs">16:9</div>
                          <div className="text-[#F1F5F9] text-sm">Crop</div>
                        </div>
                      </div>

                      {/* Letterbox 16:9 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-full aspect-[16/9] bg-[#0A0F1E] rounded-lg border-2 border-[#334155] overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-12 bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 rounded"></div>
                          </div>
                          <div className="absolute inset-y-0 left-0 w-[30%] bg-black"></div>
                          <div className="absolute inset-y-0 right-0 w-[30%] bg-black"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#94A3B8] text-xs">16:9</div>
                          <div className="text-[#F1F5F9] text-sm">Letterbox</div>
                        </div>
                      </div>

                      {/* Hybrid 16:9 */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#334155] to-[#1E293B] rounded-lg border-2 border-[#334155] overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-12 bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 rounded"></div>
                          </div>
                          <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#00F0D9]/5 to-transparent backdrop-blur-sm"></div>
                          <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#3B1FE2]/5 to-transparent backdrop-blur-sm"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#94A3B8] text-xs">16:9</div>
                          <div className="text-[#F1F5F9] text-sm">Hybrid</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setFormatStatus('processing')}
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    Generate (0 credits)
                  </Button>
                  <ResultSection status={formatStatus} />
                </div>
              )}
            </div>
          </div>
        </div>

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

                  {/* Style Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#94A3B8] text-sm">Style</label>
                    <div className="relative">
                      <button
                        onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg p-3 hover:border-[#00F0D9] transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                          {subtitleStyle === 'bold-modern' && <span className="text-white font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>HELLO WORLD</span>}
                          {subtitleStyle === 'classic' && <div className="bg-yellow-400 px-3 py-1 rounded"><span className="text-black">Hello World</span></div>}
                          {subtitleStyle === 'minimal' && <span className="text-white">Hello World</span>}
                          {subtitleStyle === 'boxed' && <div className="bg-black/70 px-4 py-1.5 rounded-lg"><span className="text-white">Hello World</span></div>}
                          {subtitleStyle === 'outlined' && <span className="text-white font-bold" style={{ textShadow: '3px 3px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>HELLO WORLD</span>}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#94A3B8] ml-2 ${styleDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {styleDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-[#1E293B] border border-[#334155] rounded-lg shadow-lg">
                          {/* Bold Modern */}
                          <button
                            onClick={() => { setSubtitleStyle('bold-modern'); setStyleDropdownOpen(false); }}
                            className="w-full p-3 hover:bg-[#334155] flex items-center justify-between border-b border-[#334155]"
                          >
                            <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                              <span className="text-white font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>HELLO WORLD</span>
                            </div>
                            {subtitleStyle === 'bold-modern' && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>

                          {/* Classic */}
                          <button
                            onClick={() => { setSubtitleStyle('classic'); setStyleDropdownOpen(false); }}
                            className="w-full p-3 hover:bg-[#334155] flex items-center justify-between border-b border-[#334155]"
                          >
                            <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                              <div className="bg-yellow-400 px-3 py-1 rounded"><span className="text-black">Hello World</span></div>
                            </div>
                            {subtitleStyle === 'classic' && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>

                          {/* Minimal */}
                          <button
                            onClick={() => { setSubtitleStyle('minimal'); setStyleDropdownOpen(false); }}
                            className="w-full p-3 hover:bg-[#334155] flex items-center justify-between border-b border-[#334155]"
                          >
                            <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                              <span className="text-white">Hello World</span>
                            </div>
                            {subtitleStyle === 'minimal' && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>

                          {/* Boxed */}
                          <button
                            onClick={() => { setSubtitleStyle('boxed'); setStyleDropdownOpen(false); }}
                            className="w-full p-3 hover:bg-[#334155] flex items-center justify-between border-b border-[#334155]"
                          >
                            <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                              <div className="bg-black/70 px-4 py-1.5 rounded-lg"><span className="text-white">Hello World</span></div>
                            </div>
                            {subtitleStyle === 'boxed' && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>

                          {/* Outlined */}
                          <button
                            onClick={() => { setSubtitleStyle('outlined'); setStyleDropdownOpen(false); }}
                            className="w-full p-3 hover:bg-[#334155] flex items-center justify-between"
                          >
                            <div className="flex-1 bg-[#0F172A] p-2 rounded flex items-center justify-center">
                              <span className="text-white font-bold" style={{ textShadow: '3px 3px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000' }}>HELLO WORLD</span>
                            </div>
                            {subtitleStyle === 'outlined' && <Check className="w-4 h-4 text-[#00F0D9] ml-2" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setSubtitlesStatus('processing')}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Generate (0 credits)
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

                  <Button
                    className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => setWatermarkStatus('processing')}
                  >
                    <Droplet className="w-4 h-4 mr-2" />
                    Generate (0 credits)
                  </Button>
                  <ResultSection status={watermarkStatus} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
