import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface JobDeleteDialogProps {
  job: {
    id: string;
  };
  onDelete: (job: any) => void;
  onClose: () => void;
}

export function JobDeleteDialog({ job, onDelete, onClose }: JobDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-[#0F172A] border border-red-500/30 rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="border-b border-[#334155] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-[#F1F5F9]">Delete Job</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-[#F1F5F9]">
              Are you sure you want to delete this job?
            </p>
            <p className="text-[#94A3B8] text-sm">
              This action cannot be undone. The video and all associated data will be permanently deleted.
            </p>
          </div>

          {/* Job ID */}
          <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
            <div className="text-[#94A3B8] text-sm mb-1">Job ID</div>
            <div className="text-[#F1F5F9] font-mono text-sm">{job.id}</div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 mb-1">Warning</p>
                <ul className="text-red-400/80 text-sm space-y-1">
                  <li>• The generated video will be deleted</li>
                  <li>• All processing data will be removed</li>
                  <li>• Shareable links will stop working</li>
                  <li>• Credits used will not be refunded</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#334155] px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => onDelete(job)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Job
          </Button>
        </div>
      </div>
    </div>
  );
}