import { X, Copy, Check, Mail, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface JobShareModalProps {
  job: {
    id: string;
    outputUrl?: string;
  };
  onClose: () => void;
}

export function JobShareModal({ job, onClose }: JobShareModalProps) {
  const [copied, setCopied] = useState(false);
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

  const shareOptions = [
    {
      name: 'Email',
      icon: Mail,
      color: 'text-[#EA4335]',
      bgColor: 'bg-[#EA4335]/10',
      borderColor: 'border-[#EA4335]/30',
      action: () => {
        window.location.href = `mailto:?subject=Check out my AI video&body=${encodeURIComponent(shareUrl)}`;
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-[#1DA1F2]',
      bgColor: 'bg-[#1DA1F2]/10',
      borderColor: 'border-[#1DA1F2]/30',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out my AI-generated video!`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-[#1877F2]',
      bgColor: 'bg-[#1877F2]/10',
      borderColor: 'border-[#1877F2]/30',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-[#0A66C2]',
      bgColor: 'bg-[#0A66C2]/10',
      borderColor: 'border-[#0A66C2]/30',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-[#25D366]',
      bgColor: 'bg-[#25D366]/10',
      borderColor: 'border-[#25D366]/30',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent('Check out my AI-generated video: ' + shareUrl)}`, '_blank');
      }
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="border-b border-[#334155] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[#F1F5F9] mb-1">Share Video</h2>
            <p className="text-[#94A3B8] text-sm">Share your AI-generated video</p>
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
            <label className="text-[#F1F5F9] text-sm mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] text-sm focus:border-[#00F0D9] focus:outline-none"
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
                    Copied!
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#334155]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0F172A] text-[#94A3B8]">Or share via</span>
            </div>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-5 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${option.borderColor} ${option.bgColor} hover:scale-105 transition-transform group`}
                >
                  <Icon className={`w-6 h-6 ${option.color}`} />
                  <span className="text-[#94A3B8] text-xs group-hover:text-[#F1F5F9] transition-colors">
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Privacy Notice */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <p className="text-[#F1F5F9] text-sm mb-1">Privacy Notice</p>
                <p className="text-[#94A3B8] text-sm">
                  Anyone with this link can view your video. Make sure you trust the people you share it with.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#334155] px-6 py-4">
          <Button
            variant="outline"
            className="w-full border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}