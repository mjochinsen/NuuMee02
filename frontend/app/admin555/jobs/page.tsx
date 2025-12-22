'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getJobs, getJob, retryJob, recoverJob, AdminJob, AdminJobDetail } from '@/lib/admin-api';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Wrench
} from 'lucide-react';

type JobStatus = 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

const STATUS_TABS: { value: JobStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'processing':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse';
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'cancelled':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateId(id: string) {
  return id.length > 16 ? `${id.slice(0, 16)}...` : id;
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeStatus, setActiveStatus] = useState<JobStatus>('all');
  const perPage = 20;

  useEffect(() => {
    const statusParam = searchParams.get('status') as JobStatus;
    if (statusParam && STATUS_TABS.some((tab) => tab.value === statusParam)) {
      setActiveStatus(statusParam);
    }
  }, [searchParams]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = activeStatus === 'all' ? undefined : activeStatus;
      const response = await getJobs({ page: currentPage, per_page: perPage, status });
      setJobs(response.items);
      setTotalPages(response.pages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load jobs';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [currentPage, activeStatus]);

  const handleStatusChange = (status: JobStatus) => {
    setActiveStatus(status);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/admin555/jobs?${params.toString()}`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Jobs</h1>
        <p className="text-[#94A3B8]">Monitor and manage video processing jobs</p>
      </div>

      {/* Status Tabs */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl mb-6 overflow-hidden">
        <div className="flex border-b border-[#334155]">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeStatus === tab.value
                  ? 'border-[#00F0D9] text-[#00F0D9]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadJobs}
            className="border-red-500/50 text-red-400 hover:bg-red-900/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
            <p className="text-lg">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B] border-b border-[#334155]">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Job ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">WaveSpeed</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Credits</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Created</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-[#1E293B]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] font-mono">
                      {truncateId(job.id)}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9]">
                      {job.user_email || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {job.type || 'video'}
                    </td>
                    <td className="py-4 px-6 text-sm font-mono">
                      {job.wavespeed_request_id ? (
                        <a
                          href={`https://wavespeed.ai/dashboard/predictions/${job.wavespeed_request_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#00F0D9] hover:underline"
                        >
                          {truncateId(job.wavespeed_request_id)}
                        </a>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(job.status)}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] text-right font-mono">
                      {job.credits_used}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(job.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="border-t border-[#334155] px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-[#94A3B8]">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-[#334155] text-[#F1F5F9] hover:bg-[#1E293B] disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-[#334155] text-[#F1F5F9] hover:bg-[#1E293B] disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Job Detail Slide-Over */}
      {selectedJobId && (
        <JobDetailPanel
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
          onRetry={loadJobs}
        />
      )}
    </>
  );
}

function JobDetailPanel({
  jobId,
  onClose,
  onRetry
}: {
  jobId: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  const [job, setJob] = useState<AdminJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRecoverConfirm, setShowRecoverConfirm] = useState(false);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJob(jobId);
      setJob(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load job details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setRetrying(true);
      await retryJob(jobId);
      toast.success('Job retry initiated');
      onRetry();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retry job';
      toast.error(message);
    } finally {
      setRetrying(false);
      setShowConfirm(false);
    }
  };

  const handleRecover = async () => {
    try {
      setRecovering(true);
      const result = await recoverJob(jobId);
      if (result.success) {
        toast.success(result.message || 'Job recovered successfully');
        onRetry(); // Refresh the job list
        onClose();
      } else {
        toast.info(result.message || 'Job recovery completed');
        loadJobDetail(); // Refresh job details to show updated status
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to recover job';
      toast.error(message);
    } finally {
      setRecovering(false);
      setShowRecoverConfirm(false);
    }
  };

  const formatDateFull = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#1E293B] border-l border-[#334155] z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#F1F5F9]">Job Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          ) : job ? (
            <>
              {/* Basic Info */}
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Job Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Job ID</p>
                    <p className="text-[#F1F5F9] font-mono text-sm">{job.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">User</p>
                    <p className="text-[#F1F5F9]">{job.user_email || job.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Type</p>
                    <p className="text-[#F1F5F9]">{job.type || 'video'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">WaveSpeed ID</p>
                    {job.wavespeed_request_id ? (
                      <a
                        href={`https://wavespeed.ai/dashboard/predictions/${job.wavespeed_request_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00F0D9] hover:underline font-mono text-sm"
                      >
                        {job.wavespeed_request_id}
                      </a>
                    ) : (
                      <p className="text-[#64748B]">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(job.status)}`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Credits Used</p>
                    <p className="text-[#F1F5F9] font-mono">{job.credits_used}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Created</p>
                    <p className="text-[#F1F5F9]">{formatDateFull(job.created_at)}</p>
                  </div>
                  {job.completed_at && (
                    <div>
                      <p className="text-sm text-[#94A3B8] mb-1">Completed</p>
                      <p className="text-[#F1F5F9]">{formatDateFull(job.completed_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input/Output Paths */}
              {(job.input_path || job.output_path) && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Paths</h3>
                  {job.input_path && (
                    <div className="mb-4">
                      <p className="text-sm text-[#94A3B8] mb-1">Input</p>
                      <p className="text-[#F1F5F9] font-mono text-xs bg-[#1E293B] p-2 rounded break-all">
                        {job.input_path}
                      </p>
                    </div>
                  )}
                  {job.output_path && (
                    <div>
                      <p className="text-sm text-[#94A3B8] mb-1">Output</p>
                      <p className="text-[#F1F5F9] font-mono text-xs bg-[#1E293B] p-2 rounded break-all">
                        {job.output_path}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Info */}
              {job.error_message && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Error</h3>
                  <p className="text-red-300 mb-4">{job.error_message}</p>
                  {job.error_details && (
                    <pre className="text-xs text-red-200 bg-red-900/30 p-3 rounded overflow-x-auto">
                      {typeof job.error_details === 'string'
                        ? job.error_details
                        : JSON.stringify(job.error_details, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Metadata */}
              {job.metadata && Object.keys(job.metadata).length > 0 && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Metadata</h3>
                  <pre className="text-xs text-[#94A3B8] bg-[#1E293B] p-3 rounded overflow-x-auto">
                    {JSON.stringify(job.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions Section */}
              {(job.status === 'failed' || job.status === 'processing' || job.status === 'pending') && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Actions</h3>

                  {/* Retry Button for Failed Jobs */}
                  {job.status === 'failed' && (
                    showConfirm ? (
                      <div className="flex items-center gap-4">
                        <p className="text-[#94A3B8]">Retry this job?</p>
                        <Button
                          onClick={handleRetry}
                          disabled={retrying}
                          className="bg-[#00F0D9] text-[#0F172A] hover:bg-[#00D9C5]"
                        >
                          {retrying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirm(false)}
                          className="border-[#334155] text-[#F1F5F9]"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowConfirm(true)}
                        className="bg-[#00F0D9] text-[#0F172A] hover:bg-[#00D9C5]"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry Job
                      </Button>
                    )
                  )}

                  {/* Recover Button for Processing/Pending Jobs */}
                  {(job.status === 'processing' || job.status === 'pending') && (
                    <>
                      <p className="text-[#94A3B8] text-sm mb-4">
                        If this job is stuck, recovery will check WaveSpeed for the actual status
                        and complete or fail the job accordingly.
                      </p>
                      {showRecoverConfirm ? (
                        <div className="flex items-center gap-4">
                          <p className="text-[#94A3B8]">Recover this stuck job?</p>
                          <Button
                            onClick={handleRecover}
                            disabled={recovering}
                            className="bg-amber-500 text-[#0F172A] hover:bg-amber-400"
                          >
                            {recovering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowRecoverConfirm(false)}
                            className="border-[#334155] text-[#F1F5F9]"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowRecoverConfirm(true)}
                          className="bg-amber-500 text-[#0F172A] hover:bg-amber-400"
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Recover Job
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default function JobsPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load jobs">
      <JobsContent />
    </AdminErrorBoundary>
  );
}
