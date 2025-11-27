import { X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface JobMediaPreviewModalProps {
  type: 'reference' | 'source' | 'result';
  job: {
    id: string;
    referenceImageUrl?: string;
    motionVideoUrl?: string;
    outputUrl?: string;
  };
  onClose: () => void;
}

export function JobMediaPreviewModal({ type, job, onClose }: JobMediaPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const isVideo = type === 'source' || type === 'result';
  
  const mediaUrl = type === 'reference' 
    ? (job.referenceImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800')
    : type === 'source'
    ? (job.motionVideoUrl || 'https://storage.nuumee.ai/samples/demo-source.mp4')
    : (job.outputUrl || 'https://storage.nuumee.ai/samples/demo-result.mp4');

  const titles = {
    reference: 'Reference Image',
    source: 'Source Video',
    result: 'Result Video'
  };

  const descriptions = {
    reference: 'Character reference image used for replacement',
    source: 'Original motion source video',
    result: 'AI-generated result video'
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    // In real app, this would trigger download
    window.open(mediaUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-[#0F172A] border border-[#334155] rounded-2xl shadow-2xl m-4 flex flex-col">
        {/* Header */}
        <div className="border-b border-[#334155] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-[#F1F5F9] mb-1">{titles[type]}</h2>
            <p className="text-[#94A3B8] text-sm">{descriptions[type]}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isVideo && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom === 50}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-[#94A3B8] text-sm min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom === 200}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-[#334155] mx-2"></div>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-[#1E293B]">
          <div className="relative">
            {isVideo ? (
              <video
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
                src={mediaUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div 
                className="relative overflow-auto max-w-full max-h-[70vh] rounded-lg shadow-2xl"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s'
                }}
              >
                <ImageWithFallback
                  src={mediaUrl}
                  alt={titles[type]}
                  className="rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-[#334155] px-6 py-4 flex items-center justify-between flex-shrink-0 bg-[#0F172A]">
          <div className="flex items-center gap-4 text-sm text-[#94A3B8]">
            <span>Job ID: <span className="font-mono text-[#F1F5F9]">{job.id}</span></span>
            {isVideo && (
              <>
                <span>•</span>
                <span>Press Space to play/pause</span>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(mediaUrl, '_blank')}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>
    </div>
  );
}