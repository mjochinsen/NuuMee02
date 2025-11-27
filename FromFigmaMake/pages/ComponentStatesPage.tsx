import { useState } from 'react';
import {
  Check,
  X,
  Upload,
  Play,
  AlertCircle,
  Loader2,
  ChevronDown,
  Search,
  Bell,
  User,
  Settings,
  Home,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';

export default function ComponentStatesPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎨</span>
            <h1 className="text-[#F1F5F9]">Component States Documentation</h1>
          </div>
          <p className="text-[#94A3B8] max-w-3xl">
            All interactive component states displayed side-by-side for design documentation and Figma handoff. 
            Each row shows: Default → Hover → Active/Selected → Disabled/Error states.
          </p>
        </div>

        <div className="space-y-16">
          {/* ==================== BUTTONS ==================== */}
          <StateSection
            title="Buttons"
            icon="🔘"
            description="Primary, secondary, outline, and ghost button variants"
          >
            {/* Primary Gradient Button */}
            <StateRow label="Primary (Gradient)">
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white transition-all">
                Default
              </div>
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white opacity-90 transition-all shadow-lg shadow-[#00F0D9]/20">
                Hover
              </div>
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white opacity-90 transition-all scale-95">
                Active
              </div>
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9]/30 to-[#3B1FE2]/30 text-[#94A3B8] cursor-not-allowed">
                Disabled
              </div>
            </StateRow>

            {/* Outline Button */}
            <StateRow label="Outline">
              <div className="px-6 py-3 rounded-xl border border-[#334155] text-[#F1F5F9] transition-all">
                Default
              </div>
              <div className="px-6 py-3 rounded-xl border border-[#00F0D9] text-[#00F0D9] transition-all">
                Hover
              </div>
              <div className="px-6 py-3 rounded-xl border border-[#00F0D9] text-[#00F0D9] bg-[#00F0D9]/5 transition-all">
                Active
              </div>
              <div className="px-6 py-3 rounded-xl border border-[#334155]/50 text-[#64748B] cursor-not-allowed">
                Disabled
              </div>
            </StateRow>

            {/* Ghost Button */}
            <StateRow label="Ghost">
              <div className="px-6 py-3 rounded-xl text-[#F1F5F9] transition-all">
                Default
              </div>
              <div className="px-6 py-3 rounded-xl text-[#F1F5F9] bg-[#1E293B] transition-all">
                Hover
              </div>
              <div className="px-6 py-3 rounded-xl text-[#F1F5F9] bg-[#1E293B] transition-all scale-95">
                Active
              </div>
              <div className="px-6 py-3 rounded-xl text-[#64748B] cursor-not-allowed">
                Disabled
              </div>
            </StateRow>

            {/* Destructive Button */}
            <StateRow label="Destructive">
              <div className="px-6 py-3 rounded-xl bg-red-500 text-white transition-all">
                Default
              </div>
              <div className="px-6 py-3 rounded-xl bg-red-600 text-white transition-all shadow-lg shadow-red-500/20">
                Hover
              </div>
              <div className="px-6 py-3 rounded-xl bg-red-600 text-white transition-all scale-95">
                Active
              </div>
              <div className="px-6 py-3 rounded-xl bg-red-500/30 text-[#94A3B8] cursor-not-allowed">
                Disabled
              </div>
            </StateRow>

            {/* Icon Button */}
            <StateRow label="Icon Button">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center text-white opacity-90 shadow-lg shadow-[#00F0D9]/20">
                <Plus className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center text-white scale-95">
                <Plus className="w-5 h-5" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F0D9]/30 to-[#3B1FE2]/30 flex items-center justify-center text-[#94A3B8] cursor-not-allowed">
                <Plus className="w-5 h-5" />
              </div>
            </StateRow>

            {/* Loading Button */}
            <StateRow label="Loading State">
              <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white flex items-center gap-2 cursor-wait">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== INPUTS ==================== */}
          <StateSection
            title="Input Fields"
            icon="✍️"
            description="Text inputs, textareas, and search fields"
          >
            <StateRow label="Text Input">
              <input
                type="text"
                placeholder="Enter text..."
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] w-64"
                readOnly
              />
              <input
                type="text"
                placeholder="Enter text..."
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-[#00F0D9] text-[#F1F5F9] w-64 ring-2 ring-[#00F0D9]/20"
                readOnly
              />
              <input
                type="text"
                value="Filled input"
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] w-64"
                readOnly
              />
              <input
                type="text"
                placeholder="Disabled..."
                className="px-4 py-3 rounded-xl bg-[#1E293B]/30 border border-[#334155]/50 text-[#64748B] w-64 cursor-not-allowed"
                disabled
              />
            </StateRow>

            <StateRow label="Error Input">
              <input
                type="text"
                placeholder="Email..."
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-red-500 text-[#F1F5F9] w-64"
                readOnly
              />
              <div className="flex items-start gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>Invalid email address</span>
              </div>
            </StateRow>

            <StateRow label="Search Input">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-11 pr-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] w-full"
                  readOnly
                />
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00F0D9]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-11 pr-4 py-3 rounded-xl bg-[#1E293B] border border-[#00F0D9] text-[#F1F5F9] w-full ring-2 ring-[#00F0D9]/20"
                  readOnly
                />
              </div>
            </StateRow>

            <StateRow label="Textarea">
              <textarea
                placeholder="Enter description..."
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] w-80 h-24 resize-none"
                readOnly
              />
              <textarea
                placeholder="Enter description..."
                className="px-4 py-3 rounded-xl bg-[#1E293B] border border-[#00F0D9] text-[#F1F5F9] w-80 h-24 resize-none ring-2 ring-[#00F0D9]/20"
                readOnly
              />
            </StateRow>
          </StateSection>

          {/* ==================== BADGES ==================== */}
          <StateSection
            title="Badges & Tags"
            icon="🏷️"
            description="Status indicators and category tags"
          >
            <StateRow label="Primary Badge">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/20 text-[#00F0D9] text-sm">
                Primary
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-[#00F0D9]/20 to-[#3B1FE2]/20 border border-[#00F0D9]/40 text-[#00F0D9] text-sm">
                Hover
              </div>
            </StateRow>

            <StateRow label="Status Badges">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                <Check className="w-3 h-3" />
                Success
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                Warning
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <X className="w-3 h-3" />
                Error
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm">
                <AlertCircle className="w-3 h-3" />
                Info
              </div>
            </StateRow>

            <StateRow label="Secondary Badge">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1E293B] border border-[#334155] text-[#94A3B8] text-sm">
                Secondary
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#1E293B] border border-[#475569] text-[#F1F5F9] text-sm">
                Hover
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== CARDS ==================== */}
          <StateSection
            title="Cards"
            icon="🃏"
            description="Container cards with various states"
          >
            <StateRow label="Standard Card">
              <div className="w-80 border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
                <h3 className="text-[#F1F5F9] mb-2">Card Title</h3>
                <p className="text-[#94A3B8] text-sm">Card description goes here with some content.</p>
              </div>
              <div className="w-80 border border-[#00F0D9]/50 rounded-2xl p-6 bg-[#0F172A] shadow-lg shadow-[#00F0D9]/10">
                <h3 className="text-[#F1F5F9] mb-2">Card Title</h3>
                <p className="text-[#94A3B8] text-sm">Card description goes here with some content.</p>
              </div>
            </StateRow>

            <StateRow label="Selected Card">
              <div className="w-80 border border-[#00F0D9] rounded-2xl p-6 bg-gradient-to-br from-[#00F0D9]/5 to-[#3B1FE2]/5 relative">
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#00F0D9] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[#F1F5F9] mb-2">Selected Card</h3>
                <p className="text-[#94A3B8] text-sm">This card is currently selected.</p>
              </div>
            </StateRow>

            <StateRow label="Disabled Card">
              <div className="w-80 border border-[#334155]/50 rounded-2xl p-6 bg-[#0F172A]/50 opacity-50 cursor-not-allowed">
                <h3 className="text-[#94A3B8] mb-2">Disabled Card</h3>
                <p className="text-[#64748B] text-sm">This card is disabled and not interactive.</p>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== NAVIGATION ==================== */}
          <StateSection
            title="Navigation Items"
            icon="🧭"
            description="Navigation links and menu items"
          >
            <StateRow label="Nav Link">
              <div className="px-4 py-2 rounded-lg text-[#94A3B8] transition-all">
                Default
              </div>
              <div className="px-4 py-2 rounded-lg text-[#F1F5F9] bg-[#1E293B] transition-all">
                Hover
              </div>
              <div className="px-4 py-2 rounded-lg text-[#00F0D9] bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/20 transition-all">
                Active
              </div>
            </StateRow>

            <StateRow label="Sidebar Item">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#94A3B8] transition-all">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#F1F5F9] bg-[#1E293B] transition-all">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9] text-[#F1F5F9] transition-all">
                <Home className="w-5 h-5 text-[#00F0D9]" />
                <span>Dashboard</span>
              </div>
            </StateRow>

            <StateRow label="Icon Nav Button">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#94A3B8] transition-all">
                <Bell className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#F1F5F9] bg-[#1E293B] transition-all">
                <Bell className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[#00F0D9] bg-[#00F0D9]/10 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== TOGGLES & CHECKBOXES ==================== */}
          <StateSection
            title="Toggles & Checkboxes"
            icon="☑️"
            description="Boolean input controls"
          >
            <StateRow label="Switch">
              <div className="flex items-center gap-3">
                <div className="w-11 h-6 rounded-full bg-[#334155] relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                </div>
                <span className="text-[#94A3B8] text-sm">Off</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-6 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] relative">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                </div>
                <span className="text-[#F1F5F9] text-sm">On</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-6 rounded-full bg-[#334155]/50 relative opacity-50 cursor-not-allowed">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/50"></div>
                </div>
                <span className="text-[#64748B] text-sm">Disabled</span>
              </div>
            </StateRow>

            <StateRow label="Checkbox">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border-2 border-[#334155] bg-[#1E293B]"></div>
                <span className="text-[#94A3B8] text-sm">Unchecked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border-2 border-[#00F0D9] bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-[#F1F5F9] text-sm">Checked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border-2 border-[#334155]/50 bg-[#1E293B]/50 opacity-50 cursor-not-allowed"></div>
                <span className="text-[#64748B] text-sm">Disabled</span>
              </div>
            </StateRow>

            <StateRow label="Radio Button">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#334155] bg-[#1E293B]"></div>
                <span className="text-[#94A3B8] text-sm">Unselected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#00F0D9] bg-[#1E293B] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00F0D9]"></div>
                </div>
                <span className="text-[#F1F5F9] text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#334155]/50 bg-[#1E293B]/50 opacity-50 cursor-not-allowed"></div>
                <span className="text-[#64748B] text-sm">Disabled</span>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== UPLOAD ZONES ==================== */}
          <StateSection
            title="Upload Zones"
            icon="📤"
            description="Drag-and-drop file upload areas"
          >
            <StateRow label="Upload Zone - Default">
              <div className="w-80 h-48 border-2 border-dashed border-[#334155] rounded-2xl bg-[#0F172A] flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-[#1E293B] flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <div className="text-center">
                  <p className="text-[#F1F5F9] text-sm mb-1">Click to upload</p>
                  <p className="text-[#64748B] text-xs">or drag and drop</p>
                </div>
              </div>
            </StateRow>

            <StateRow label="Upload Zone - Hover">
              <div className="w-80 h-48 border-2 border-dashed border-[#00F0D9] rounded-2xl bg-gradient-to-br from-[#00F0D9]/5 to-[#3B1FE2]/5 flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#00F0D9]" />
                </div>
                <div className="text-center">
                  <p className="text-[#00F0D9] text-sm mb-1">Drop files here</p>
                  <p className="text-[#94A3B8] text-xs">Release to upload</p>
                </div>
              </div>
            </StateRow>

            <StateRow label="Upload Zone - Success">
              <div className="w-80 h-48 border-2 border-green-500 rounded-2xl bg-green-500/5 flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="text-green-500 text-sm mb-1">Upload successful</p>
                  <p className="text-[#94A3B8] text-xs">video.mp4 (24 MB)</p>
                </div>
              </div>
            </StateRow>

            <StateRow label="Upload Zone - Error">
              <div className="w-80 h-48 border-2 border-red-500 rounded-2xl bg-red-500/5 flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-red-500 text-sm mb-1">Upload failed</p>
                  <p className="text-[#94A3B8] text-xs">File too large (max 100MB)</p>
                </div>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== PROGRESS & SLIDERS ==================== */}
          <StateSection
            title="Progress & Sliders"
            icon="📊"
            description="Loading indicators and range controls"
          >
            <StateRow label="Progress Bar">
              <div className="w-80">
                <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"></div>
                </div>
                <p className="text-[#94A3B8] text-xs mt-2">0%</p>
              </div>
              <div className="w-80">
                <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"></div>
                </div>
                <p className="text-[#F1F5F9] text-xs mt-2">50%</p>
              </div>
              <div className="w-80">
                <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"></div>
                </div>
                <p className="text-green-500 text-xs mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  100% Complete
                </p>
              </div>
            </StateRow>

            <StateRow label="Slider">
              <div className="w-80">
                <div className="relative h-2 rounded-full bg-[#1E293B]">
                  <div className="absolute h-full w-1/3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg" style={{ left: '33.33%', transform: 'translate(-50%, -50%)' }}></div>
                </div>
                <p className="text-[#94A3B8] text-xs mt-2">Value: 33</p>
              </div>
              <div className="w-80">
                <div className="relative h-2 rounded-full bg-[#1E293B]/50 opacity-50 cursor-not-allowed">
                  <div className="absolute h-full w-1/3 bg-gradient-to-r from-[#00F0D9]/50 to-[#3B1FE2]/50 rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/50 shadow-lg" style={{ left: '33.33%', transform: 'translate(-50%, -50%)' }}></div>
                </div>
                <p className="text-[#64748B] text-xs mt-2">Disabled</p>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== LINKS & TEXT ==================== */}
          <StateSection
            title="Links & Text Elements"
            icon="🔗"
            description="Hyperlinks and text states"
          >
            <StateRow label="Text Link">
              <span className="text-[#00F0D9] cursor-pointer">Default link</span>
              <span className="text-[#00F0D9] underline cursor-pointer">Hover link</span>
              <span className="text-[#3B1FE2] underline cursor-pointer">Active link</span>
              <span className="text-[#64748B] cursor-not-allowed">Disabled link</span>
            </StateRow>

            <StateRow label="Secondary Link">
              <span className="text-[#94A3B8] cursor-pointer">Secondary</span>
              <span className="text-[#F1F5F9] cursor-pointer">Hover</span>
              <span className="text-[#F1F5F9] underline cursor-pointer">Active</span>
            </StateRow>
          </StateSection>

          {/* ==================== TABS ==================== */}
          <StateSection
            title="Tabs"
            icon="📑"
            description="Tab navigation states"
          >
            <StateRow label="Tab Items">
              <div className="px-4 py-2 text-[#94A3B8] border-b-2 border-transparent">
                Inactive
              </div>
              <div className="px-4 py-2 text-[#F1F5F9] border-b-2 border-transparent bg-[#1E293B]/50">
                Hover
              </div>
              <div className="px-4 py-2 text-[#00F0D9] border-b-2 border-[#00F0D9]">
                Active
              </div>
              <div className="px-4 py-2 text-[#64748B] border-b-2 border-transparent cursor-not-allowed">
                Disabled
              </div>
            </StateRow>

            <StateRow label="Pill Tabs">
              <div className="px-4 py-2 rounded-lg text-[#94A3B8] border border-transparent">
                Inactive
              </div>
              <div className="px-4 py-2 rounded-lg text-[#F1F5F9] bg-[#1E293B] border border-[#334155]">
                Hover
              </div>
              <div className="px-4 py-2 rounded-lg text-[#F1F5F9] bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]">
                Active
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== DROPDOWN & SELECT ==================== */}
          <StateSection
            title="Dropdowns & Selects"
            icon="🔽"
            description="Select menus and dropdowns"
          >
            <StateRow label="Select Input">
              <div className="w-64 px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] flex items-center justify-between">
                <span>Select option...</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
              </div>
              <div className="w-64 px-4 py-3 rounded-xl bg-[#1E293B] border border-[#00F0D9] text-[#F1F5F9] flex items-center justify-between ring-2 ring-[#00F0D9]/20">
                <span>Select option...</span>
                <ChevronDown className="w-4 h-4 text-[#00F0D9]" />
              </div>
              <div className="w-64 px-4 py-3 rounded-xl bg-[#1E293B] border border-[#334155] text-[#F1F5F9] flex items-center justify-between">
                <span>Option selected</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
              </div>
            </StateRow>

            <StateRow label="Dropdown Item">
              <div className="w-64 px-4 py-2 text-[#F1F5F9]">
                Normal item
              </div>
              <div className="w-64 px-4 py-2 text-[#F1F5F9] bg-[#1E293B]">
                Hover item
              </div>
              <div className="w-64 px-4 py-2 text-[#00F0D9] bg-[#00F0D9]/10 flex items-center justify-between">
                <span>Selected item</span>
                <Check className="w-4 h-4" />
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== TOOLTIPS & POPOVERS ==================== */}
          <StateSection
            title="Tooltips & Notifications"
            icon="💬"
            description="Helper text and notification states"
          >
            <StateRow label="Tooltip">
              <div className="px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-[#F1F5F9] text-sm shadow-lg">
                Tooltip text
              </div>
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm shadow-lg">
                Error tooltip
              </div>
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm shadow-lg">
                Success tooltip
              </div>
            </StateRow>

            <StateRow label="Toast Notification">
              <div className="w-80 p-4 rounded-xl bg-[#1E293B] border border-[#334155] flex items-start gap-3 shadow-xl">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F1F5F9] text-sm mb-1">Info notification</p>
                  <p className="text-[#94A3B8] text-xs">This is an informational message</p>
                </div>
                <button className="text-[#94A3B8] hover:text-[#F1F5F9]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </StateRow>

            <StateRow label="Success Toast">
              <div className="w-80 p-4 rounded-xl bg-[#1E293B] border border-green-500/50 flex items-start gap-3 shadow-xl">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[#F1F5F9] text-sm mb-1">Success!</p>
                  <p className="text-[#94A3B8] text-xs">Your changes have been saved</p>
                </div>
                <button className="text-[#94A3B8] hover:text-[#F1F5F9]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </StateRow>

            <StateRow label="Error Toast">
              <div className="w-80 p-4 rounded-xl bg-[#1E293B] border border-red-500/50 flex items-start gap-3 shadow-xl">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[#F1F5F9] text-sm mb-1">Error occurred</p>
                  <p className="text-[#94A3B8] text-xs">Failed to process request</p>
                </div>
                <button className="text-[#94A3B8] hover:text-[#F1F5F9]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </StateRow>
          </StateSection>

          {/* ==================== LOADING STATES ==================== */}
          <StateSection
            title="Loading States"
            icon="⏳"
            description="Loading indicators and skeletons"
          >
            <StateRow label="Spinner">
              <Loader2 className="w-8 h-8 text-[#00F0D9] animate-spin" />
              <Loader2 className="w-6 h-6 text-[#94A3B8] animate-spin" />
              <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" />
            </StateRow>

            <StateRow label="Skeleton">
              <div className="space-y-3 w-80">
                <div className="h-4 bg-[#1E293B] rounded animate-pulse"></div>
                <div className="h-4 bg-[#1E293B] rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-[#1E293B] rounded animate-pulse w-1/2"></div>
              </div>
            </StateRow>

            <StateRow label="Card Skeleton">
              <div className="w-80 border border-[#334155] rounded-2xl p-6 bg-[#0F172A] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E293B] animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1E293B] rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-[#1E293B] rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-[#1E293B] rounded animate-pulse"></div>
                  <div className="h-3 bg-[#1E293B] rounded animate-pulse w-5/6"></div>
                </div>
              </div>
            </StateRow>
          </StateSection>
        </div>

        {/* Footer Note */}
        <div className="mt-16 border-t border-[#334155] pt-8">
          <div className="bg-gradient-to-r from-[#00F0D9]/10 to-[#3B1FE2]/10 border border-[#00F0D9]/20 rounded-2xl p-6">
            <h3 className="text-[#F1F5F9] mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#00F0D9]" />
              Usage Instructions
            </h3>
            <ul className="text-[#94A3B8] text-sm space-y-2">
              <li>• All states are displayed simultaneously for easy comparison and Figma handoff</li>
              <li>• Copy this page into Figma Design to capture all component states at once</li>
              <li>• Interactive states (hover, focus) are simulated with static styling</li>
              <li>• Use this as a reference for design documentation and developer handoff</li>
              <li>• For interactive examples, visit <a href="/components-dev" className="text-[#00F0D9] hover:underline">/components-dev</a></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper Components
function StateSection({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-[#F1F5F9]">{title}</h2>
      </div>
      <p className="text-[#94A3B8] text-sm mb-8">{description}</p>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function StateRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#334155] pl-6">
      <div className="text-[#94A3B8] text-sm mb-4 uppercase tracking-wide">{label}</div>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </div>
  );
}
