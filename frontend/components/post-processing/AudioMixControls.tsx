'use client';

import { Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from './InfoTooltip';

export interface AudioMixControlsProps {
  volume: number[];
  onVolumeChange: (value: number[]) => void;
  fadeIn: string;
  onFadeInChange: (value: string) => void;
  fadeOut: string;
  onFadeOutChange: (value: string) => void;
  startTime: string;
  onStartTimeChange: (value: string) => void;
}

export function AudioMixControls({
  volume,
  onVolumeChange,
  fadeIn,
  onFadeInChange,
  fadeOut,
  onFadeOutChange,
  startTime,
  onStartTimeChange,
}: AudioMixControlsProps) {
  return (
    <div className="space-y-4 p-4 border border-[#334155] rounded-lg bg-[#1E293B]">
      {/* Audio File Upload */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-[#94A3B8] text-sm">Audio File</Label>
          <InfoTooltip
            maxWidth="max-w-md"
            content={
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
            }
          />
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
          <Slider value={volume} onValueChange={onVolumeChange} min={0} max={100} step={1} className="flex-1" />
          <span className="text-[#F1F5F9] text-sm min-w-[48px] text-right">{volume[0]}%</span>
        </div>
      </div>

      {/* Fade In */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-[#94A3B8] text-sm">Fade In (seconds)</Label>
          <InfoTooltip
            maxWidth="max-w-md"
            content={
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
            }
          />
        </div>
        <Input
          type="number"
          value={fadeIn}
          onChange={(e) => onFadeInChange(e.target.value)}
          min="0"
          placeholder="0"
          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
        />
      </div>

      {/* Fade Out */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-[#94A3B8] text-sm">Fade Out (seconds)</Label>
          <InfoTooltip
            maxWidth="max-w-md"
            content={
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
            }
          />
        </div>
        <Input
          type="number"
          value={fadeOut}
          onChange={(e) => onFadeOutChange(e.target.value)}
          min="0"
          placeholder="0"
          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
        />
      </div>

      {/* Start Time */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-[#94A3B8] text-sm">Start Time (seconds)</Label>
          <InfoTooltip
            maxWidth="max-w-md"
            content={
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
            }
          />
        </div>
        <Input
          type="number"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          min="0"
          placeholder="0"
          className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] focus:border-[#00F0D9]"
        />
      </div>
    </div>
  );
}
