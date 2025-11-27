import { X, Copy, Download, ExternalLink, User, Video as VideoIcon, Settings, Clock, DollarSign, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface JobDetailsModalProps {
  job: {
    id: string;
    status: 'completed' | 'processing' | 'failed' | 'queued';
    createdAt: string;
    resolution: string;
    quality: string;
    credits: number;
    fileSize?: string;
    processingTime?: string;
    postProcessing?: string[];
    videoDuration?: string;
    seed?: string | number;
    inferenceSteps?: number;
    cfgScale?: number;
    safetyCheckersEnabled?: boolean;
    outputUrl?: string;
  };
  onClose: () => void;
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusBadge = () => {
    const badges = {
      completed: { icon: '✅', text: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      processing: { icon: '⏳', text: 'Processing', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      failed: { icon: '❌', text: 'Failed', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      queued: { icon: '⏸️', text: 'Queued', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    };
    const badge = badges[job.status];
    return (
      <Badge variant="outline" className={`${badge.className} border`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[#F1F5F9] mb-1">Job Details</h2>
            <p className="text-[#94A3B8] text-sm font-mono">{job.id}</p>
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
          {/* Status & Timestamp */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="text-[#94A3B8] text-sm mb-2">Status</div>
              {getStatusBadge()}
            </div>
            <div className="border border-[#334155] rounded-xl p-4 bg-[#1E293B]">
              <div className="text-[#94A3B8] text-sm mb-2">Created</div>
              <div className="text-[#F1F5F9]">{job.createdAt}</div>
            </div>
          </div>

          {/* Video Information */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <div className="flex items-center gap-2 mb-4">
              <VideoIcon className="w-5 h-5 text-[#00F0D9]" />
              <h3 className="text-[#F1F5F9]">Video Information</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[#94A3B8] text-sm mb-1">Resolution</div>
                <div className="text-[#F1F5F9]">{job.resolution}</div>
              </div>
              <div>
                <div className="text-[#94A3B8] text-sm mb-1">Quality</div>
                <div className="text-[#F1F5F9]">{job.quality}</div>
              </div>
              {job.videoDuration && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Duration</div>
                  <div className="text-[#F1F5F9]">{job.videoDuration}</div>
                </div>
              )}
              {job.fileSize && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">File Size</div>
                  <div className="text-[#F1F5F9]">{job.fileSize}</div>
                </div>
              )}
            </div>
          </div>

          {/* Processing Details */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[#00F0D9]" />
              <h3 className="text-[#F1F5F9]">Processing Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {job.processingTime && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Processing Time</div>
                  <div className="text-[#F1F5F9] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {job.processingTime}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[#94A3B8] text-sm mb-1">Credits Used</div>
                <div className="text-[#F1F5F9] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {job.credits} credits
                </div>
              </div>
              {job.seed && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Seed</div>
                  <div className="text-[#F1F5F9] font-mono text-sm">{job.seed}</div>
                </div>
              )}
              {job.inferenceSteps && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Inference Steps</div>
                  <div className="text-[#F1F5F9]">{job.inferenceSteps}</div>
                </div>
              )}
              {job.cfgScale && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">CFG Scale</div>
                  <div className="text-[#F1F5F9]">{job.cfgScale}</div>
                </div>
              )}
              {job.safetyCheckersEnabled !== undefined && (
                <div>
                  <div className="text-[#94A3B8] text-sm mb-1">Safety Checkers</div>
                  <div className="text-[#F1F5F9]">
                    {job.safetyCheckersEnabled ? '✅ Enabled' : '❌ Disabled'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post-Processing */}
          {job.postProcessing && job.postProcessing.length > 0 && (
            <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#00F0D9]" />
                <h3 className="text-[#F1F5F9]">Post-Processing Applied</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {job.postProcessing.map((item, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/30"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Output URL */}
          {job.outputUrl && job.status === 'completed' && (
            <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="w-5 h-5 text-[#00F0D9]" />
                <h3 className="text-[#F1F5F9]">Output URL</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={job.outputUrl}
                  className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(job.outputUrl!, 'url')}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  {copiedField === 'url' ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Job ID Copy */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#00F0D9]" />
              <h3 className="text-[#F1F5F9]">Job ID</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={job.id}
                className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] text-sm font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(job.id, 'id')}
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                {copiedField === 'id' ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {job.status === 'completed' && (
          <div className="sticky bottom-0 bg-[#0F172A] border-t border-[#334155] px-6 py-4 flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>
            <Button 
              variant="outline"
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
