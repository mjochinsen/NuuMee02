import { X, Copy, Check, ExternalLink, Download, Eye, Lock, Unlock, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

interface JobLinkModalProps {
  job: {
    id: string;
    outputUrl?: string;
  };
  onClose: () => void;
}

export function JobLinkModal({ job, onClose }: JobLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [trackViews, setTrackViews] = useState(true);
  const shareUrl = job.outputUrl || `https://nuumee.ai/share/${job.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#F1F5F9] mb-1">Get Shareable Link</h2>
            <p className="text-[#94A3B8] text-sm">Configure link settings and sharing options</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Link */}
          <div>
            <label className="text-[#F1F5F9] text-sm mb-2 block">Public Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] text-sm font-mono focus:border-[#00F0D9] focus:outline-none"
              />
              <Button
                onClick={copyToClipboard}
                className={`px-6 transition-all ${
                  copied 
                    ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                    : 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Action */}
          <Button
            variant="outline"
            className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={openInNewTab}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>

          {/* Divider */}
          <div className="h-px bg-[#334155]"></div>

          {/* Link Settings */}
          <div className="space-y-4">
            <h3 className="text-[#F1F5F9]">Link Settings</h3>

            {/* Password Protection */}
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {passwordProtected ? (
                      <Lock className="w-4 h-4 text-[#00F0D9]" />
                    ) : (
                      <Unlock className="w-4 h-4 text-[#94A3B8]" />
                    )}
                    <p className="text-[#F1F5F9]">Password Protection</p>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    Require a password to view this video
                  </p>
                </div>
                <Switch
                  checked={passwordProtected}
                  onCheckedChange={setPasswordProtected}
                />
              </div>
              
              {passwordProtected && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter password"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-[#F1F5F9] text-sm focus:border-[#00F0D9] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Expiration */}
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#94A3B8]" />
                    <p className="text-[#F1F5F9]">Link Expiration</p>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    Automatically disable this link after a certain time
                  </p>
                </div>
                <Switch
                  checked={expirationEnabled}
                  onCheckedChange={setExpirationEnabled}
                />
              </div>
              
              {expirationEnabled && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 rounded-lg border border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm">
                    1 Day
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm">
                    7 Days
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm">
                    30 Days
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm">
                    Custom
                  </button>
                </div>
              )}
            </div>

            {/* Download Permission */}
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-[#94A3B8]" />
                    <p className="text-[#F1F5F9]">Allow Downloads</p>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    Let viewers download the video
                  </p>
                </div>
                <Switch
                  checked={allowDownloads}
                  onCheckedChange={setAllowDownloads}
                />
              </div>
            </div>

            {/* View Tracking */}
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-[#94A3B8]" />
                    <p className="text-[#F1F5F9]">Track Views</p>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    See who viewed your video and when
                  </p>
                </div>
                <Switch
                  checked={trackViews}
                  onCheckedChange={setTrackViews}
                />
              </div>
            </div>
          </div>

          {/* Current Stats */}
          {trackViews && (
            <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
              <h3 className="text-[#F1F5F9] mb-4">Link Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Total Views</div>
                  <div className="text-[#F1F5F9] text-2xl">127</div>
                </div>
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Unique Viewers</div>
                  <div className="text-[#F1F5F9] text-2xl">84</div>
                </div>
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Downloads</div>
                  <div className="text-[#F1F5F9] text-2xl">23</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0F172A] border-t border-[#334155] px-6 py-4 flex gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}