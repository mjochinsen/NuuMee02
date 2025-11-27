import { Download, Share2, Clock, Link } from 'lucide-react';
import { Button } from './ui/button';

interface ResultSectionProps {
  status: 'awaiting' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export function ResultSection({ status, jobId, videoUrl, progress, error }: ResultSectionProps) {
  return (
    <div className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A]">
      <h2 className="text-[#F1F5F9] mb-4">Result</h2>
      
      <div className="border-2 border-dashed border-[#334155] rounded-2xl p-12 bg-[#0F172A] min-h-[300px] flex items-center justify-center mb-4">
        {status === 'awaiting' && (
          <div className="text-center">
            <Clock className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
            <p className="text-[#94A3B8]">Your generated video will appear here.</p>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#334155] border-t-[#00F0D9] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#F1F5F9] mb-2">Processing your video...</p>
            {progress !== undefined && (
              <p className="text-[#94A3B8] text-sm">{progress}% complete</p>
            )}
            {jobId && (
              <p className="text-[#00F0D9] text-sm mt-2 font-mono">
                Job ID: {jobId}
              </p>
            )}
          </div>
        )}

        {status === 'completed' && videoUrl && (
          <video
            src={videoUrl}
            controls
            className="w-full max-h-[400px] rounded-lg"
          />
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">✕</span>
            </div>
            <p className="text-red-500 mb-2">Generation Failed</p>
            {error && <p className="text-[#94A3B8] text-sm">{error}</p>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#94A3B8]">
          {status === 'awaiting' && (
            <>
              <Clock className="w-4 h-4" />
              <span>Awaiting Job</span>
            </>
          )}
          {status === 'processing' && jobId && (
            <>
              <div className="w-2 h-2 rounded-full bg-[#00F0D9] animate-pulse"></div>
              <span>Processing</span>
            </>
          )}
          {status === 'completed' && (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={status !== 'completed'}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={status !== 'completed'}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={status !== 'completed'}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            <Link className="w-4 h-4 mr-2" />
            URL
          </Button>
        </div>
      </div>
    </div>
  );
}
