import { X, Copy, Download, AlertTriangle, FileText, Clock, Code, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface JobErrorLogModalProps {
  job: {
    id: string;
    errorMessage?: string;
  };
  onClose: () => void;
}

export function JobErrorLogModal({ job, onClose }: JobErrorLogModalProps) {
  const [copied, setCopied] = useState(false);

  const errorMessage = job.errorMessage || 'An unknown error occurred';
  const errorDetails = {
    timestamp: new Date().toISOString(),
    errorCode: 'ERR_CHARACTER_NOT_DETECTED',
    stackTrace: `Error: Character not detected in source video
  at CharacterDetector.analyze (detector.js:245)
  at VideoProcessor.process (processor.js:112)
  at JobQueue.execute (queue.js:89)
  at async JobWorker.run (worker.js:34)`,
    technicalDetails: {
      modelVersion: 'v2.3.1',
      processingNode: 'gpu-cluster-07',
      videoDuration: '32.5s',
      framerate: '30fps',
      resolution: '1920x1080',
      detectionConfidence: '0.12 (threshold: 0.75)',
      framesAnalyzed: 975,
      charactersDetected: 0
    }
  };

  const fullErrorLog = `
NuuMee.AI Error Report
=====================
Job ID: ${job.id}
Timestamp: ${errorDetails.timestamp}
Error Code: ${errorDetails.errorCode}

Error Message:
${errorMessage}

Stack Trace:
${errorDetails.stackTrace}

Technical Details:
${JSON.stringify(errorDetails.technicalDetails, null, 2)}

Environment:
- Service: Character Replacement API v3.2
- Region: us-west-2
- Processing Time: 2m 34s
- Credits Charged: 0 (failed job)

Recommendations:
1. Ensure the source video contains a clearly visible character
2. Try using a higher resolution video
3. Verify the character is facing the camera
4. Check video quality and lighting conditions

If this issue persists, please contact support@nuumee.ai
`.trim();

  const copyErrorLog = async () => {
    try {
      await navigator.clipboard.writeText(fullErrorLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadErrorLog = () => {
    const blob = new Blob([fullErrorLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${job.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0F172A] border border-red-500/30 rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-[#F1F5F9] mb-1">Error Log Details</h2>
              <p className="text-[#94A3B8] text-sm font-mono">{job.id}</p>
            </div>
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
          {/* Error Overview */}
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-400 mb-2">Error Message</h3>
                <p className="text-red-400/90">{errorMessage}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                {errorDetails.errorCode}
              </Badge>
              <span className="text-[#94A3B8] text-sm">•</span>
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                <Clock className="w-4 h-4" />
                {new Date(errorDetails.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-[#00F0D9]" />
              <h3 className="text-[#F1F5F9]">Technical Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(errorDetails.technicalDetails).map(([key, value]) => (
                <div key={key}>
                  <div className="text-[#94A3B8] text-sm mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div className="text-[#F1F5F9] font-mono text-sm">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stack Trace */}
          {errorDetails.stackTrace && (
            <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#00F0D9]" />
                <h3 className="text-[#F1F5F9]">Stack Trace</h3>
              </div>
              
              <pre className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-[#F1F5F9] text-sm font-mono overflow-x-auto">
                {errorDetails.stackTrace}
              </pre>
            </div>
          )}

          {/* Recommendations */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <h3 className="text-[#F1F5F9] mb-3">💡 Recommendations</h3>
            <ul className="space-y-2 text-[#94A3B8]">
              <li className="flex items-start gap-2">
                <span className="text-[#00F0D9]">•</span>
                <span>Ensure the source video contains a clearly visible character</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00F0D9]">•</span>
                <span>Try using a higher resolution video with better lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00F0D9]">•</span>
                <span>Verify the character is facing the camera for at least 70% of the video</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00F0D9]">•</span>
                <span>Check that the video quality meets minimum requirements (720p recommended)</span>
              </li>
            </ul>
          </div>

          {/* Full Error Log Preview */}
          <div className="border border-[#334155] rounded-xl p-5 bg-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#F1F5F9]">Complete Error Log</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyErrorLog}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  {copied ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadErrorLog}
                  className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <pre className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 text-[#94A3B8] text-xs font-mono overflow-x-auto max-h-64">
              {fullErrorLog}
            </pre>
          </div>

          {/* Support Info */}
          <div className="bg-[#00F0D9]/5 border border-[#00F0D9]/20 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="text-[#F1F5F9] mb-2">Need Help?</h3>
                <p className="text-[#94A3B8] text-sm mb-3">
                  If this issue persists, our support team is here to help. Include the job ID and error log when contacting us.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00F0D9] text-[#00F0D9] hover:bg-[#00F0D9]/10"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0F172A] border-t border-[#334155] px-6 py-4">
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