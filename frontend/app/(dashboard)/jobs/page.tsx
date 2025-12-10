'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  Download,
  Share2,
  Link as LinkIcon,
  Trash2,
  AlertCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Mail,
  FileText,
  User,
  Video,
  Loader2,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/AuthProvider';
import { getJobs, getJobOutput, getJobThumbnails, deleteJob, createJob, JobResponse, JobStatus as ApiJobStatus, JobType, Resolution, JobThumbnailsResponse } from '@/lib/api';
import { toast } from 'sonner';

type JobStatus = 'completed' | 'processing' | 'failed' | 'queued' | 'pending';

interface Job {
  id: string;
  shortId?: string | null;
  shareUrl?: string | null;
  jobType: string;
  referenceImagePath?: string;
  motionVideoPath?: string;
  status: JobStatus;
  createdAt: string;
  createdAtRaw: string;
  updatedAt: string;
  completedAt?: string | null;
  resolution: string;
  credits: number;
  errorMessage?: string;
  outputVideoPath?: string | null;
  seed?: number | null;
  viewCount?: number;
}

// Helper to format elapsed time
function formatElapsedTime(isoDate: string): string {
  const created = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  const remainingSec = diffSec % 60;
  if (diffMin < 60) return `${diffMin}m ${remainingSec}s`;
  const diffHour = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;
  return `${diffHour}h ${remainingMin}m`;
}

// Convert API job to display job
function convertApiJob(apiJob: JobResponse): Job {
  return {
    id: apiJob.id,
    shortId: apiJob.short_id,
    shareUrl: apiJob.share_url,
    jobType: apiJob.job_type,
    referenceImagePath: apiJob.reference_image_path || undefined,
    motionVideoPath: apiJob.motion_video_path || undefined,
    status: apiJob.status as JobStatus,
    createdAt: new Date(apiJob.created_at).toLocaleString(),
    createdAtRaw: apiJob.created_at,
    updatedAt: new Date(apiJob.updated_at).toLocaleString(),
    completedAt: apiJob.completed_at ? new Date(apiJob.completed_at).toLocaleString() : null,
    resolution: apiJob.resolution,
    credits: apiJob.credits_charged,
    errorMessage: apiJob.error_message || undefined,
    outputVideoPath: apiJob.output_video_path,
    seed: apiJob.seed,
    viewCount: apiJob.view_count,
  };
}

export default function JobsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | JobStatus>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, JobThumbnailsResponse>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());
  const [previewMedia, setPreviewMedia] = useState<{ type: 'image' | 'video'; url: string; label: string } | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const jobsPerPage = 25;

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setTotalJobs(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const statusFilter = activeFilter === 'all' ? undefined : activeFilter as ApiJobStatus;
      const response = await getJobs(currentPage, jobsPerPage, statusFilter);
      setJobs(response.jobs.map(convertApiJob));
      setTotalJobs(response.total);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, activeFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto-refresh every 10 seconds if any job is processing or queued
  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (j) => j.status === 'processing' || j.status === 'queued' || j.status === 'pending'
    );

    if (hasActiveJobs && !isLoading) {
      const interval = setInterval(() => {
        fetchJobs();
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [jobs, isLoading, fetchJobs]);

  // Handle download button click - fetches and downloads the video file
  const handleDownload = async (jobId: string) => {
    setDownloadingId(jobId);
    try {
      const response = await getJobOutput(jobId);
      toast.info('Downloading video...');

      // Fetch the video as blob to enable proper download
      const videoResponse = await fetch(response.download_url);
      const blob = await videoResponse.blob();

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${jobId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download complete!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed', {
        description: err instanceof Error ? err.message : 'Could not download video',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle retry failed job
  const handleRetry = async (job: Job) => {
    if (!job.referenceImagePath || !job.motionVideoPath) {
      setError('Cannot retry: missing input files');
      return;
    }

    setRetryingId(job.id);
    try {
      await createJob({
        job_type: job.jobType as JobType,
        reference_image_path: job.referenceImagePath,
        motion_video_path: job.motionVideoPath,
        resolution: job.resolution as Resolution,
        seed: job.seed,
      });
      // Refresh jobs list to show the new job
      await fetchJobs();
    } catch (err) {
      console.error('Retry failed:', err);
      setError(err instanceof Error ? err.message : 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  // Fetch thumbnails for visible jobs
  useEffect(() => {
    const fetchThumbnails = async () => {
      for (const job of jobs) {
        if (!thumbnails[job.id] && !loadingThumbnails.has(job.id)) {
          setLoadingThumbnails(prev => new Set(prev).add(job.id));
          try {
            const thumb = await getJobThumbnails(job.id);
            setThumbnails(prev => ({ ...prev, [job.id]: thumb }));
          } catch (err) {
            console.error(`Failed to fetch thumbnails for ${job.id}:`, err);
          } finally {
            setLoadingThumbnails(prev => {
              const next = new Set(prev);
              next.delete(job.id);
              return next;
            });
          }
        }
      }
    };

    if (jobs.length > 0) {
      fetchThumbnails();
    }
  }, [jobs, thumbnails, loadingThumbnails]);

  // Handle delete button click
  const handleDelete = async (job: Job) => {
    setDeletingId(job.id);
    try {
      await deleteJob(job.id);
      toast.success('Job deleted', {
        description: `Job ${job.id} has been deleted.`,
      });
      setJobToDelete(null);
      // Refresh jobs list
      await fetchJobs();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Delete failed', {
        description: err instanceof Error ? err.message : 'Failed to delete job',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter by search query (client-side for now)
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs;

  const getStatusBadge = (status: JobStatus) => {
    const badges: Record<JobStatus, { icon: string; text: string; className: string }> = {
      completed: { icon: '✅', text: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      processing: { icon: '⏳', text: 'Processing', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' },
      failed: { icon: '❌', text: 'Failed', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      queued: { icon: '⏸️', text: 'Queued', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      pending: { icon: '🕐', text: 'Pending', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <Badge variant="outline" className={`${badge.className} border`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
      </Badge>
    );
  };

  const renderJobCard = (job: Job) => {
    const jobThumbnails = thumbnails[job.id];
    const isLoadingThumb = loadingThumbnails.has(job.id);

    // Skeleton component for loading state
    const ThumbnailSkeleton = () => (
      <div className="w-full h-full bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#1E293B] animate-pulse" />
    );

    return (
      <div key={job.id} className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors">
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex gap-3 flex-shrink-0">
            {/* Reference Image */}
            <div className="relative group">
              <button
                onClick={() => jobThumbnails?.reference_image_url && setPreviewMedia({ type: 'image', url: jobThumbnails.reference_image_url, label: 'Reference Image' })}
                disabled={!jobThumbnails?.reference_image_url}
                className="w-36 h-36 border-2 border-[#334155] rounded-xl bg-[#1E293B] flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-[#00F0D9] transition-all cursor-pointer disabled:cursor-default disabled:hover:scale-100 disabled:hover:border-[#334155]"
              >
                {isLoadingThumb ? (
                  <ThumbnailSkeleton />
                ) : jobThumbnails?.reference_image_url ? (
                  <img
                    src={jobThumbnails.reference_image_url}
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#94A3B8]" />
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-1 text-center rounded-b-xl">
                REF
              </div>
            </div>

            {/* Source Video - motion_video_url for ANIMATE, input_video_url for EXTEND/UPSCALE */}
            <div className="relative group">
              {(() => {
                const srcUrl = jobThumbnails?.motion_video_url || jobThumbnails?.input_video_url;
                return (
                  <button
                    onClick={() => srcUrl && setPreviewMedia({ type: 'video', url: srcUrl, label: 'Source Video' })}
                    disabled={!srcUrl}
                    className="w-36 h-36 border-2 border-[#334155] rounded-xl bg-[#1E293B] flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-[#00F0D9] transition-all cursor-pointer disabled:cursor-default disabled:hover:scale-100 disabled:hover:border-[#334155]"
                  >
                    {isLoadingThumb ? (
                      <ThumbnailSkeleton />
                    ) : srcUrl ? (
                      <video
                        src={srcUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center group-hover:animate-pulse">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <Video className="w-10 h-10 text-[#94A3B8] opacity-30" />
                      </>
                    )}
                  </button>
                );
              })()}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-1 text-center rounded-b-xl">
                SRC
              </div>
            </div>

            {/* Output Video (only for completed jobs) */}
            {job.status === 'completed' && (
              <div className="relative group">
                <button
                  onClick={() => jobThumbnails?.output_video_url && setPreviewMedia({ type: 'video', url: jobThumbnails.output_video_url, label: 'Output Video' })}
                  disabled={!jobThumbnails?.output_video_url}
                  className="w-36 h-36 border-2 border-[#00F0D9]/50 rounded-xl bg-[#1E293B] flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:border-[#00F0D9] transition-all cursor-pointer disabled:cursor-default disabled:hover:scale-100 disabled:border-[#334155]"
                >
                  {isLoadingThumb ? (
                    <ThumbnailSkeleton />
                  ) : jobThumbnails?.output_video_url ? (
                    <video
                      src={jobThumbnails.output_video_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                          <Play className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <Video className="w-10 h-10 text-[#94A3B8] opacity-30" />
                    </>
                  )}
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white text-xs py-1 text-center rounded-b-xl font-medium">
                  OUTPUT
                </div>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[#F1F5F9] font-mono">{job.id}</span>
                  {getStatusBadge(job.status)}
                  <Badge variant="outline" className="border-[#334155] text-[#94A3B8] text-xs uppercase">
                    {job.jobType === 'animate' ? '🎬 Animate' :
                     job.jobType === 'extend' ? '⏩ Extend' :
                     job.jobType === 'upscale' ? '📈 Upscale' :
                     job.jobType === 'foley' ? '🔊 Foley' : job.jobType}
                  </Badge>
                </div>
                <div className="text-[#94A3B8] text-sm">{job.createdAt}</div>
              </div>
            </div>

            <div className="text-[#94A3B8] text-sm mb-3">
              {job.resolution}
              {` • ${job.credits} credits`}
              {job.seed && ` • Seed: ${job.seed}`}
            </div>

            {/* Status-specific content */}
            {job.status === 'completed' && job.outputVideoPath && (
              <div className="text-[#94A3B8] text-sm mb-4">
                🎬 Video ready for download
              </div>
            )}

            {job.status === 'processing' && (
              <div className="mb-4">
                <div className="text-[#94A3B8] text-sm mb-2">
                  🔄 Processing your video...
                </div>
                <Progress value={50} className="h-2 bg-[#1E293B]" />
              </div>
            )}

            {job.status === 'pending' && (
              <div className="text-[#94A3B8] text-sm mb-4">
                🕐 Waiting to be processed...
              </div>
            )}

            {job.status === 'failed' && (
              <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{job.errorMessage}</span>
                </div>
              </div>
            )}

            {job.status === 'queued' && (
              <div className="text-[#94A3B8] text-sm mb-4">
                ⏸️ Queued for processing
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {job.status === 'completed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    onClick={() => setSelectedJob(job)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => handleDownload(job.id)}
                    disabled={downloadingId === job.id || !job.outputVideoPath}
                  >
                    {downloadingId === job.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    {downloadingId === job.id ? 'Downloading...' : 'Download'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    onClick={() => {
                      const url = job.shareUrl || `${window.location.origin}/jobs/${job.id}`;
                      navigator.clipboard.writeText(url);
                      setCopiedJobId(job.id);
                      toast.success('Link copied to clipboard');
                      setTimeout(() => setCopiedJobId(null), 2000);
                    }}
                  >
                    {copiedJobId === job.id ? (
                      <Check className="w-4 h-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copiedJobId === job.id ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#334155] text-[#F1F5F9] hover:border-red-500 hover:text-red-500"
                    onClick={() => setJobToDelete(job)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}

              {job.status === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Processing... {formatElapsedTime(job.createdAtRaw)}</span>
                </div>
              )}

              {job.status === 'failed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    onClick={() => {
                      toast.error('Job Failed', {
                        description: job.errorMessage || 'Unknown error occurred',
                        duration: 10000,
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Error Log
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => handleRetry(job)}
                    disabled={retryingId === job.id}
                  >
                    {retryingId === job.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-1" />
                    )}
                    {retryingId === job.id ? 'Retrying...' : 'Retry'}
                  </Button>
                  <Link href="/support">
                    <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                      <Mail className="w-4 h-4 mr-1" />
                      Support
                    </Button>
                  </Link>
                </>
              )}

              {job.status === 'queued' && (
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Clock className="w-4 h-4" />
                  <span>Queued... {formatElapsedTime(job.createdAtRaw)}</span>
                </div>
              )}

              {job.status === 'pending' && (
                <>
                  <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="border border-[#334155] rounded-2xl p-16 bg-[#0F172A] text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-[#F1F5F9] mb-2">No jobs yet</h3>
        <p className="text-[#94A3B8] mb-6">
          Create your first AI character replacement
        </p>
        <Link href="/jobs/create">
          <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
            🚀 Start New Project
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <h1 className="text-[#F1F5F9]">My Jobs</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input
              type="text"
              placeholder="Search by job ID or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 w-80 bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={fetchJobs}
            disabled={isLoading}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-6"></div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#94A3B8] text-sm mr-2">Filters:</span>
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className={activeFilter === 'all'
              ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-[#00F0D9]'
              : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
            }
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('completed')}
            className={activeFilter === 'completed'
              ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-[#00F0D9]'
              : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
            }
          >
            ✅ Completed
          </Button>
          <Button
            variant={activeFilter === 'processing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('processing')}
            className={activeFilter === 'processing'
              ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-[#00F0D9]'
              : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
            }
          >
            ⏳ Processing
          </Button>
          <Button
            variant={activeFilter === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('failed')}
            className={activeFilter === 'failed'
              ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-[#00F0D9]'
              : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
            }
          >
            ❌ Failed
          </Button>
          <Button
            variant={activeFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('pending')}
            className={activeFilter === 'pending'
              ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-[#00F0D9]'
              : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'
            }
          >
            🕐 Pending
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#94A3B8] text-sm">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="recent" className="text-[#F1F5F9]">📅 Most Recent</SelectItem>
              <SelectItem value="oldest" className="text-[#F1F5F9]">Oldest First</SelectItem>
              <SelectItem value="cost" className="text-[#F1F5F9]">Highest Cost</SelectItem>
              <SelectItem value="completed-only" className="text-[#F1F5F9]">Completed Only</SelectItem>
              <SelectItem value="failed-only" className="text-[#F1F5F9]">Failed Only</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[#94A3B8] text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, totalJobs)} of {totalJobs}
          </span>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          <div className="border border-[#334155] rounded-2xl p-16 bg-[#0F172A] text-center">
            <Loader2 className="w-12 h-12 text-[#00F0D9] mx-auto mb-4 animate-spin" />
            <p className="text-[#94A3B8]">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="border border-red-500/20 rounded-2xl p-16 bg-red-500/5 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-red-400 mb-2">Failed to load jobs</h3>
            <p className="text-[#94A3B8] mb-4">{error}</p>
            <Button onClick={fetchJobs} variant="outline" className="border-[#334155] text-[#F1F5F9]">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : !user ? (
          <div className="border border-[#334155] rounded-2xl p-16 bg-[#0F172A] text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-[#F1F5F9] mb-2">Sign in to view jobs</h3>
            <p className="text-[#94A3B8] mb-6">
              Please sign in to see your video generation jobs
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                Sign In
              </Button>
            </Link>
          </div>
        ) : currentJobs.length > 0 ? (
          currentJobs.map(renderJobCard)
        ) : (
          renderEmptyState()
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-[#94A3B8]">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-3">
              Job Details
              {selectedJob && getStatusBadge(selectedJob.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4 mt-4">
              {/* Thumbnails Row */}
              <div className="flex gap-4 justify-center">
                {/* Reference Image Thumbnail */}
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-[#334155] rounded-xl bg-[#0F172A] flex items-center justify-center overflow-hidden mb-2">
                    {thumbnails[selectedJob.id]?.reference_image_url ? (
                      <img
                        src={thumbnails[selectedJob.id].reference_image_url!}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-[#94A3B8]" />
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8]">Reference</p>
                </div>

                {/* Motion Video Thumbnail */}
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-[#334155] rounded-xl bg-[#0F172A] flex items-center justify-center overflow-hidden mb-2">
                    {thumbnails[selectedJob.id]?.motion_video_url ? (
                      <video
                        src={thumbnails[selectedJob.id].motion_video_url!}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <Video className="w-8 h-8 text-[#94A3B8]" />
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8]">Source Video</p>
                </div>

                {/* Output Video Thumbnail (if completed) */}
                {selectedJob.status === 'completed' && (
                  <div className="text-center">
                    <div className="w-24 h-24 border-2 border-[#00F0D9]/50 rounded-xl bg-[#0F172A] flex items-center justify-center overflow-hidden mb-2">
                      {thumbnails[selectedJob.id]?.output_video_url ? (
                        <video
                          src={thumbnails[selectedJob.id].output_video_url!}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <Play className="w-8 h-8 text-[#00F0D9]" />
                      )}
                    </div>
                    <p className="text-xs text-[#00F0D9]">Output</p>
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#334155]">
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">Video Type</p>
                  <p className="capitalize">{selectedJob.jobType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">Resolution</p>
                  <p>{selectedJob.resolution}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">Credits Used</p>
                  <p className="font-semibold">{selectedJob.credits}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">Created</p>
                  <p className="text-sm">{selectedJob.createdAt}</p>
                </div>
                {selectedJob.completedAt && (
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Completed</p>
                    <p className="text-sm">{selectedJob.completedAt}</p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {selectedJob.errorMessage && (
                <div className="bg-red-950/20 border border-red-900/50 rounded p-3">
                  <p className="text-sm text-[#94A3B8] mb-1">Error</p>
                  <p className="text-red-400 text-sm">{selectedJob.errorMessage}</p>
                </div>
              )}

              {/* Action buttons */}
              {selectedJob.status === 'completed' && selectedJob.outputVideoPath && (
                <div className="flex gap-3 pt-4 border-t border-[#334155]">
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"
                    onClick={() => handleDownload(selectedJob.id)}
                    disabled={downloadingId === selectedJob.id}
                  >
                    {downloadingId === selectedJob.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                    onClick={() => {
                      const url = selectedJob.shareUrl || `${window.location.origin}/jobs/${selectedJob.id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent className="bg-[#0F172A] border-red-500/30 text-[#F1F5F9] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              Delete Job
            </DialogTitle>
          </DialogHeader>

          {jobToDelete && (
            <div className="space-y-4 mt-4">
              <p className="text-[#F1F5F9]">
                Are you sure you want to delete this job?
              </p>
              <p className="text-[#94A3B8] text-sm">
                This action cannot be undone. The video and all associated data will be permanently deleted.
              </p>

              {/* Job ID */}
              <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                <div className="text-[#94A3B8] text-sm mb-1">Job ID</div>
                <div className="text-[#F1F5F9] font-mono text-sm">{jobToDelete.id}</div>
              </div>

              {/* Warning */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
                  onClick={() => setJobToDelete(null)}
                  disabled={deletingId === jobToDelete.id}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleDelete(jobToDelete)}
                  disabled={deletingId === jobToDelete.id}
                >
                  {deletingId === jobToDelete.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Job
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="bg-[#0F172A] border-[#334155] text-[#F1F5F9] max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-[#334155]">
            <DialogTitle className="text-[#F1F5F9] flex items-center gap-3">
              {previewMedia?.type === 'video' ? (
                <Video className="w-5 h-5 text-[#00F0D9]" />
              ) : (
                <User className="w-5 h-5 text-[#00F0D9]" />
              )}
              {previewMedia?.label}
            </DialogTitle>
          </DialogHeader>

          {previewMedia && (
            <div className="relative bg-black flex items-center justify-center min-h-[400px] max-h-[70vh]">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  className="max-w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.label}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
