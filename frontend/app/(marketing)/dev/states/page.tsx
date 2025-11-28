'use client';

import {
  Search,
  Upload,
  Check,
  X,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  Play,
  Pause,
  Volume2,
  Settings,
  Star,
  Heart,
  Share2,
  Download,
  ExternalLink,
  Plus,
  Home,
  Bell,
} from 'lucide-react';

function StateSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">{title}</h2>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

function StateRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wide">
        {label}
      </h3>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </div>
  );
}

function StateDemo({
  state,
  children,
}: {
  state: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="min-w-[160px] flex items-center justify-center">
        {children}
      </div>
      <span className="text-xs text-[#94A3B8]">{state}</span>
    </div>
  );
}

export default function ComponentStatesPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#F1F5F9] mb-3">
            Component States Reference
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Visual documentation of all interactive component states for design handoff
          </p>
        </div>

        {/* Buttons Section */}
        <StateSection title="Buttons">
          <StateRow label="Primary Gradient">
            <StateDemo state="Default">
              <button className="px-6 py-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-semibold rounded-lg">
                Generate Video
              </button>
            </StateDemo>
            <StateDemo state="Hover">
              <button className="px-6 py-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-semibold rounded-lg shadow-lg shadow-[#00F0D9]/20 scale-105">
                Generate Video
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="px-6 py-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-semibold rounded-lg scale-95">
                Generate Video
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="px-6 py-3 bg-gradient-to-r from-[#334155] to-[#1E293B] text-[#64748B] font-semibold rounded-lg cursor-not-allowed opacity-50" disabled>
                Generate Video
              </button>
            </StateDemo>
            <StateDemo state="Loading">
              <button className="px-6 py-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white font-semibold rounded-lg flex items-center gap-2 cursor-wait">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="Outline">
            <StateDemo state="Default">
              <button className="px-6 py-3 border border-[#334155] text-[#F1F5F9] font-medium rounded-lg">
                Learn More
              </button>
            </StateDemo>
            <StateDemo state="Hover">
              <button className="px-6 py-3 border border-[#00F0D9] text-[#00F0D9] font-medium rounded-lg">
                Learn More
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="px-6 py-3 border border-[#00F0D9] bg-[#00F0D9]/10 text-[#00F0D9] font-medium rounded-lg">
                Learn More
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="px-6 py-3 border border-[#1E293B] text-[#64748B] font-medium rounded-lg cursor-not-allowed opacity-50" disabled>
                Learn More
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="Ghost">
            <StateDemo state="Default">
              <button className="px-6 py-3 text-[#F1F5F9] font-medium rounded-lg">
                Cancel
              </button>
            </StateDemo>
            <StateDemo state="Hover">
              <button className="px-6 py-3 bg-[#1E293B] text-[#F1F5F9] font-medium rounded-lg">
                Cancel
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="px-6 py-3 bg-[#334155] text-[#F1F5F9] font-medium rounded-lg">
                Cancel
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="px-6 py-3 text-[#64748B] font-medium rounded-lg cursor-not-allowed opacity-50" disabled>
                Cancel
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="Destructive">
            <StateDemo state="Default">
              <button className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg">
                Delete
              </button>
            </StateDemo>
            <StateDemo state="Hover">
              <button className="px-6 py-3 bg-red-700 text-white font-semibold rounded-lg">
                Delete
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="px-6 py-3 bg-red-800 text-white font-semibold rounded-lg">
                Delete
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="px-6 py-3 bg-[#334155] text-[#64748B] font-semibold rounded-lg cursor-not-allowed opacity-50" disabled>
                Delete
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="Icon Buttons">
            <StateDemo state="Default">
              <button className="p-3 border border-[#334155] text-[#F1F5F9] rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </StateDemo>
            <StateDemo state="Hover">
              <button className="p-3 border border-[#00F0D9] bg-[#00F0D9]/10 text-[#00F0D9] rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="p-3 border border-[#00F0D9] bg-[#00F0D9]/20 text-[#00F0D9] rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="p-3 border border-[#1E293B] text-[#64748B] rounded-lg cursor-not-allowed opacity-50" disabled>
                <Settings className="w-5 h-5" />
              </button>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Input Fields Section */}
        <StateSection title="Input Fields">
          <StateRow label="Text Input">
            <StateDemo state="Default">
              <input
                type="text"
                placeholder="Enter your email"
                className="px-4 py-3 bg-[#0F172A] border border-[#334155] text-[#F1F5F9] rounded-lg w-64 focus:outline-none"
              />
            </StateDemo>
            <StateDemo state="Focus">
              <input
                type="text"
                placeholder="Enter your email"
                className="px-4 py-3 bg-[#0F172A] border border-[#00F0D9] text-[#F1F5F9] rounded-lg w-64 focus:outline-none ring-2 ring-[#00F0D9]/20"
              />
            </StateDemo>
            <StateDemo state="Filled">
              <input
                type="text"
                defaultValue="user@example.com"
                className="px-4 py-3 bg-[#0F172A] border border-[#334155] text-[#F1F5F9] rounded-lg w-64 focus:outline-none"
                readOnly
              />
            </StateDemo>
            <StateDemo state="Disabled">
              <input
                type="text"
                placeholder="Enter your email"
                className="px-4 py-3 bg-[#1E293B]/50 border border-[#1E293B] text-[#64748B] rounded-lg w-64 cursor-not-allowed opacity-50"
                disabled
              />
            </StateDemo>
          </StateRow>

          <StateRow label="Error State">
            <StateDemo state="Error">
              <div className="w-64">
                <input
                  type="text"
                  defaultValue="invalid@"
                  className="px-4 py-3 bg-[#0F172A] border border-red-500 text-[#F1F5F9] rounded-lg w-full focus:outline-none ring-2 ring-red-500/20"
                  readOnly
                />
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Invalid email format
                </p>
              </div>
            </StateDemo>
          </StateRow>

          <StateRow label="Search Input">
            <StateDemo state="Default">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="pl-10 pr-4 py-3 bg-[#0F172A] border border-[#334155] text-[#F1F5F9] rounded-lg w-full focus:outline-none"
                />
              </div>
            </StateDemo>
            <StateDemo state="Focus">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00F0D9]" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="pl-10 pr-4 py-3 bg-[#0F172A] border border-[#00F0D9] text-[#F1F5F9] rounded-lg w-full focus:outline-none ring-2 ring-[#00F0D9]/20"
                />
              </div>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Badges & Tags Section */}
        <StateSection title="Badges & Tags">
          <StateRow label="Status Badges">
            <StateDemo state="Success">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium rounded-full">
                <CheckCircle className="w-4 h-4" />
                Complete
              </span>
            </StateDemo>
            <StateDemo state="Processing">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00F0D9]/10 border border-[#00F0D9]/20 text-[#00F0D9] text-sm font-medium rounded-full">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
              </span>
            </StateDemo>
            <StateDemo state="Error">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-full">
                <AlertCircle className="w-4 h-4" />
                Failed
              </span>
            </StateDemo>
            <StateDemo state="Pending">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full">
                <Info className="w-4 h-4" />
                Pending
              </span>
            </StateDemo>
          </StateRow>

          <StateRow label="Category Tags">
            <StateDemo state="Default">
              <span className="px-3 py-1.5 bg-[#1E293B] text-[#94A3B8] text-sm font-medium rounded-lg">
                Marketing
              </span>
            </StateDemo>
            <StateDemo state="Hover">
              <span className="px-3 py-1.5 bg-[#334155] text-[#F1F5F9] text-sm font-medium rounded-lg cursor-pointer">
                Marketing
              </span>
            </StateDemo>
            <StateDemo state="Selected">
              <span className="px-3 py-1.5 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white text-sm font-medium rounded-lg">
                Marketing
              </span>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Cards Section */}
        <StateSection title="Cards">
          <StateRow label="Video Card">
            <StateDemo state="Default">
              <div className="w-64 bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20" />
                <div className="p-4">
                  <h3 className="text-[#F1F5F9] font-semibold mb-2">Video Title</h3>
                  <p className="text-[#94A3B8] text-sm">2 days ago</p>
                </div>
              </div>
            </StateDemo>
            <StateDemo state="Hover">
              <div className="w-64 bg-[#0F172A] border border-[#00F0D9] rounded-xl overflow-hidden shadow-lg shadow-[#00F0D9]/10 cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20" />
                <div className="p-4">
                  <h3 className="text-[#F1F5F9] font-semibold mb-2">Video Title</h3>
                  <p className="text-[#94A3B8] text-sm">2 days ago</p>
                </div>
              </div>
            </StateDemo>
            <StateDemo state="Selected">
              <div className="w-64 bg-[#0F172A] border-2 border-[#00F0D9] rounded-xl overflow-hidden shadow-lg shadow-[#00F0D9]/20">
                <div className="aspect-video bg-gradient-to-br from-[#00F0D9]/30 to-[#3B1FE2]/30" />
                <div className="p-4">
                  <h3 className="text-[#F1F5F9] font-semibold mb-2">Video Title</h3>
                  <p className="text-[#94A3B8] text-sm">2 days ago</p>
                </div>
              </div>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Navigation Items Section */}
        <StateSection title="Navigation Items">
          <StateRow label="Nav Links">
            <StateDemo state="Default">
              <span className="px-4 py-2 text-[#94A3B8] font-medium rounded-lg">
                Dashboard
              </span>
            </StateDemo>
            <StateDemo state="Hover">
              <span className="px-4 py-2 text-[#F1F5F9] bg-[#1E293B] font-medium rounded-lg cursor-pointer">
                Dashboard
              </span>
            </StateDemo>
            <StateDemo state="Active">
              <span className="px-4 py-2 text-[#00F0D9] bg-[#00F0D9]/10 font-medium rounded-lg">
                Dashboard
              </span>
            </StateDemo>
            <StateDemo state="Disabled">
              <span className="px-4 py-2 text-[#64748B] font-medium rounded-lg cursor-not-allowed opacity-50">
                Dashboard
              </span>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Toggles & Checkboxes Section */}
        <StateSection title="Toggles & Checkboxes">
          <StateRow label="Toggle Switch">
            <StateDemo state="Off">
              <button className="w-12 h-6 bg-[#334155] rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </StateDemo>
            <StateDemo state="On">
              <button className="w-12 h-6 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="w-12 h-6 bg-[#1E293B] rounded-full relative opacity-50 cursor-not-allowed" disabled>
                <span className="absolute left-1 top-1 w-4 h-4 bg-[#64748B] rounded-full" />
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="Checkbox">
            <StateDemo state="Unchecked">
              <div className="w-5 h-5 border-2 border-[#334155] rounded" />
            </StateDemo>
            <StateDemo state="Checked">
              <div className="w-5 h-5 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] border-2 border-transparent rounded flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </StateDemo>
            <StateDemo state="Disabled">
              <div className="w-5 h-5 border-2 border-[#1E293B] rounded opacity-50 cursor-not-allowed" />
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Upload Zones Section */}
        <StateSection title="Upload Zones">
          <StateRow label="File Upload">
            <StateDemo state="Default">
              <div className="w-80 border-2 border-dashed border-[#334155] rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#94A3B8] text-sm">Drop files here or click to upload</p>
              </div>
            </StateDemo>
            <StateDemo state="Hover">
              <div className="w-80 border-2 border-dashed border-[#00F0D9] bg-[#00F0D9]/5 rounded-xl p-8 text-center cursor-pointer">
                <Upload className="w-8 h-8 text-[#00F0D9] mx-auto mb-3" />
                <p className="text-[#00F0D9] text-sm">Drop files here or click to upload</p>
              </div>
            </StateDemo>
            <StateDemo state="Uploading">
              <div className="w-80 border-2 border-dashed border-[#00F0D9] bg-[#00F0D9]/5 rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 text-[#00F0D9] mx-auto mb-3 animate-spin" />
                <p className="text-[#00F0D9] text-sm">Uploading... 45%</p>
              </div>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Progress & Sliders Section */}
        <StateSection title="Progress & Sliders">
          <StateRow label="Progress Bar">
            <StateDemo state="25%">
              <div className="w-64">
                <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]" />
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">25% complete</p>
              </div>
            </StateDemo>
            <StateDemo state="75%">
              <div className="w-64">
                <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]" />
                </div>
                <p className="text-xs text-[#94A3B8] mt-2">75% complete</p>
              </div>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Loading States Section */}
        <StateSection title="Loading States">
          <StateRow label="Spinners">
            <StateDemo state="Small">
              <Loader2 className="w-4 h-4 text-[#00F0D9] animate-spin" />
            </StateDemo>
            <StateDemo state="Medium">
              <Loader2 className="w-8 h-8 text-[#00F0D9] animate-spin" />
            </StateDemo>
            <StateDemo state="Large">
              <Loader2 className="w-12 h-12 text-[#00F0D9] animate-spin" />
            </StateDemo>
          </StateRow>

          <StateRow label="Skeleton Loaders">
            <StateDemo state="Text">
              <div className="w-64 space-y-2">
                <div className="h-4 bg-[#1E293B] rounded animate-pulse" />
                <div className="h-4 bg-[#1E293B] rounded animate-pulse w-3/4" />
                <div className="h-4 bg-[#1E293B] rounded animate-pulse w-1/2" />
              </div>
            </StateDemo>
            <StateDemo state="Card">
              <div className="w-64 bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
                <div className="aspect-video bg-[#1E293B] animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-[#1E293B] rounded animate-pulse" />
                  <div className="h-4 bg-[#1E293B] rounded animate-pulse w-2/3" />
                </div>
              </div>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Action Icons Section */}
        <StateSection title="Action Icons">
          <StateRow label="Icon States">
            <StateDemo state="Default">
              <button className="p-2 text-[#94A3B8] hover:text-[#F1F5F9]">
                <Heart className="w-6 h-6" />
              </button>
            </StateDemo>
            <StateDemo state="Active">
              <button className="p-2 text-red-400">
                <Heart className="w-6 h-6 fill-current" />
              </button>
            </StateDemo>
            <StateDemo state="Disabled">
              <button className="p-2 text-[#64748B] cursor-not-allowed opacity-50" disabled>
                <Heart className="w-6 h-6" />
              </button>
            </StateDemo>
          </StateRow>

          <StateRow label="More Actions">
            <StateDemo state="Share">
              <button className="p-2 text-[#94A3B8] hover:text-[#00F0D9]">
                <Share2 className="w-6 h-6" />
              </button>
            </StateDemo>
            <StateDemo state="Download">
              <button className="p-2 text-[#94A3B8] hover:text-[#00F0D9]">
                <Download className="w-6 h-6" />
              </button>
            </StateDemo>
            <StateDemo state="Star">
              <button className="p-2 text-[#94A3B8] hover:text-yellow-400">
                <Star className="w-6 h-6" />
              </button>
            </StateDemo>
          </StateRow>
        </StateSection>

        {/* Media Controls Section */}
        <StateSection title="Media Controls">
          <StateRow label="Video Controls">
            <StateDemo state="Play">
              <button className="p-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] rounded-full text-white hover:shadow-lg hover:shadow-[#00F0D9]/20">
                <Play className="w-6 h-6 fill-current" />
              </button>
            </StateDemo>
            <StateDemo state="Pause">
              <button className="p-3 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] rounded-full text-white hover:shadow-lg hover:shadow-[#00F0D9]/20">
                <Pause className="w-6 h-6 fill-current" />
              </button>
            </StateDemo>
            <StateDemo state="Volume">
              <button className="p-2 text-[#F1F5F9] hover:text-[#00F0D9]">
                <Volume2 className="w-6 h-6" />
              </button>
            </StateDemo>
          </StateRow>
        </StateSection>
      </div>
    </div>
  );
}
