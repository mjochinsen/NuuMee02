'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Video, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getJobs, getJobThumbnails, JobResponse, JobThumbnailsResponse } from '@/lib/api';

interface JobPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (job: JobResponse, thumbnailUrl: string) => void;
}

const JOBS_PER_PAGE = 12;

export function JobPickerModal({ open, onClose, onSelect }: JobPickerModalProps) {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, JobThumbnailsResponse>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch completed jobs
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getJobs(currentPage, JOBS_PER_PAGE, 'completed');
      setJobs(response.jobs);
      setTotalJobs(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  // Fetch jobs when modal opens or page changes
  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open, fetchJobs]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setCurrentPage(1);
      setHoveredJobId(null);
    }
  }, [open]);

  // Fetch thumbnails for visible jobs
  useEffect(() => {
    if (!open || jobs.length === 0) return;

    const fetchThumbnailsForJobs = async () => {
      const jobsNeedingThumbnails = jobs.filter(
        (job) => !thumbnails[job.id] && !loadingThumbnails.has(job.id)
      );

      if (jobsNeedingThumbnails.length === 0) return;

      // Mark as loading
      setLoadingThumbnails((prev) => {
        const next = new Set(prev);
        jobsNeedingThumbnails.forEach((job) => next.add(job.id));
        return next;
      });

      // Fetch thumbnails in parallel
      const results = await Promise.allSettled(
        jobsNeedingThumbnails.map(async (job) => {
          const thumbs = await getJobThumbnails(job.id);
          return { jobId: job.id, thumbs };
        })
      );

      // Update state with results
      const newThumbnails: Record<string, JobThumbnailsResponse> = {};
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          newThumbnails[result.value.jobId] = result.value.thumbs;
        }
      });

      setThumbnails((prev) => ({ ...prev, ...newThumbnails }));
      setLoadingThumbnails((prev) => {
        const next = new Set(prev);
        jobsNeedingThumbnails.forEach((job) => next.delete(job.id));
        return next;
      });
    };

    fetchThumbnailsForJobs();
  }, [open, jobs, thumbnails, loadingThumbnails]);

  // Handle hover preview - play video on hover
  useEffect(() => {
    if (hoveredJobId && videoRefs.current[hoveredJobId]) {
      videoRefs.current[hoveredJobId]?.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [hoveredJobId]);

  // Filter jobs by search query (client-side)
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.id.toLowerCase().includes(query) ||
      (job.short_id && job.short_id.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const handleSelect = (job: JobResponse) => {
    const thumbnailUrl = thumbnails[job.id]?.output_video_url || '';
    onSelect(job, thumbnailUrl);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#F1F5F9] flex items-center gap-2">
            <Video className="w-5 h-5 text-[#00F0D9]" />
            Select from Your Videos
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            placeholder="Search by job ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0F172A] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 gap-5 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video rounded-lg bg-[#334155]" />
                  <Skeleton className="h-4 w-24 bg-[#334155]" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-[#F1F5F9] font-medium mb-2">Failed to load videos</p>
              <p className="text-[#94A3B8] text-sm mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={fetchJobs}
                className="border-[#334155] text-[#F1F5F9]"
              >
                Try Again
              </Button>
            </div>
          ) : filteredJobs.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-16 h-16 bg-[#334155] rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <p className="text-[#F1F5F9] font-medium mb-2">
                {searchQuery ? 'No matching videos' : 'No completed videos yet'}
              </p>
              <p className="text-[#94A3B8] text-sm">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create a video first, then you can use it here'}
              </p>
            </div>
          ) : (
            // Job grid
            <div className="grid grid-cols-2 gap-5 p-1">
              {filteredJobs.map((job) => {
                const thumb = thumbnails[job.id];
                const isLoadingThumb = loadingThumbnails.has(job.id);
                const isHovered = hoveredJobId === job.id;

                return (
                  <button
                    key={job.id}
                    onClick={() => handleSelect(job)}
                    onMouseEnter={() => setHoveredJobId(job.id)}
                    onMouseLeave={() => {
                      setHoveredJobId(null);
                      // Pause video when not hovered
                      if (videoRefs.current[job.id]) {
                        videoRefs.current[job.id]?.pause();
                        videoRefs.current[job.id]!.currentTime = 0;
                      }
                    }}
                    className={`group text-left rounded-xl overflow-hidden border-2 transition-all ${
                      isHovered
                        ? 'border-[#00F0D9] shadow-lg shadow-[#00F0D9]/20'
                        : 'border-[#334155] hover:border-[#00F0D9]/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-[#0F172A] relative overflow-hidden">
                      {isLoadingThumb ? (
                        <Skeleton className="w-full h-full bg-[#334155]" />
                      ) : thumb?.output_video_url ? (
                        <>
                          <video
                            ref={(el) => {
                              videoRefs.current[job.id] = el;
                            }}
                            src={thumb.output_video_url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            loop
                            preload="metadata"
                          />
                          {/* Play indicator */}
                          {!isHovered && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="w-8 h-8 text-white/80 fill-white/80" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-[#64748B]" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-white text-xs font-medium">
                            Click to select
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Job info */}
                    <div className="p-3 bg-[#0F172A]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#94A3B8] truncate">
                          {job.short_id || job.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-[#64748B]">
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-1.5 py-0.5 bg-[#334155] rounded text-[#F1F5F9]">
                          {job.resolution.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && !error && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-[#334155]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-[#334155] text-[#F1F5F9] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-[#94A3B8] px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-[#334155] text-[#F1F5F9] disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
