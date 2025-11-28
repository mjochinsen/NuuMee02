'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Download, Share2, Trash2, AlertCircle, Play, ChevronLeft, ChevronRight, X, RotateCcw, Mail, FileText, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type JobStatus = 'completed' | 'processing' | 'failed' | 'queued';

interface Job {
  id: string;
  status: JobStatus;
  createdAt: string;
  resolution: string;
  quality: string;
  credits: number;
  fileSize?: string;
  processingTime?: string;
  postProcessing?: string[];
  progress?: number;
  progressText?: string;
  estimatedTimeRemaining?: string;
  errorMessage?: string;
  queuePosition?: number;
  estimatedStartTime?: string;
  videoDuration?: string;
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | JobStatus>('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const mockJobs: Job[] = [
    { id: 'job-abc-123-def', status: 'completed', createdAt: 'Nov 11, 2:34 PM', resolution: '720p', quality: 'High', credits: 2, fileSize: '47.3 MB', processingTime: '12m 34s', postProcessing: ['Video Extender', 'Subtitles'], videoDuration: '0:45' },
    { id: 'job-ghi-789-jkl', status: 'processing', createdAt: '8 minutes ago', resolution: '720p', quality: 'High', credits: 2, progress: 67, progressText: 'Applying character replacement...', estimatedTimeRemaining: '~4 min remaining', videoDuration: '1:23' },
    { id: 'job-mno-345-pqr', status: 'failed', createdAt: 'Yesterday', resolution: '720p', quality: 'High', credits: 2, errorMessage: 'Character not detected in source video', videoDuration: '0:32' },
    { id: 'job-stu-567-vwx', status: 'queued', createdAt: '2 minutes ago', resolution: '1080p', quality: 'Ultra', credits: 3, queuePosition: 3, estimatedStartTime: '~8 minutes', videoDuration: '2:15' },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
    const matchesSearch = job.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const getStatusBadge = (status: JobStatus) => {
    const badges = {
      completed: { icon: '✅', text: 'Completed', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
      processing: { icon: '⏳', text: 'Processing', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' },
      failed: { icon: '❌', text: 'Failed', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      queued: { icon: '⏸️', text: 'Queued', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    };
    const badge = badges[status];
    return <Badge variant="outline" className={`${badge.className} border`}><span className="mr-1">{badge.icon}</span>{badge.text}</Badge>;
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📁</span>
          <h1 className="text-[#F1F5F9]">My Jobs</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input type="text" placeholder="Search by job ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10 w-80 bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#94A3B8] focus:border-[#00F0D9] rounded-full" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9]"><X className="w-4 h-4" /></button>}
          </div>
          <Button variant="outline" size="icon" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="h-px bg-[#334155] mb-6"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#94A3B8] text-sm mr-2">Filters:</span>
          {(['all', 'completed', 'processing', 'failed'] as const).map((filter) => (
            <Button key={filter} variant={activeFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? 'bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white' : 'border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]'}>
              {filter === 'all' ? 'All' : filter === 'completed' ? '✅ Completed' : filter === 'processing' ? '⏳ Processing' : '❌ Failed'}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#94A3B8] text-sm">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-[#1E293B] border-[#334155] text-[#F1F5F9]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="recent" className="text-[#F1F5F9]">📅 Most Recent</SelectItem>
              <SelectItem value="oldest" className="text-[#F1F5F9]">Oldest First</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[#94A3B8] text-sm">Showing {startIndex + 1}-{Math.min(endIndex, totalJobs)} of {totalJobs}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {currentJobs.length > 0 ? currentJobs.map((job) => (
          <div key={job.id} className="border border-[#334155] rounded-2xl p-6 bg-[#0F172A] hover:border-[#00F0D9] transition-colors">
            <div className="flex gap-4">
              <div className="flex gap-4 flex-shrink-0">
                <div className="w-24 h-24 border-2 border-[#334155] rounded-xl bg-[#1E293B] flex items-center justify-center"><User className="w-8 h-8 text-[#94A3B8]" /></div>
                <div className="relative w-24 h-24 border-2 border-[#334155] rounded-xl bg-[#1E293B] flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#00F0D9]" />
                  {job.videoDuration && <div className="absolute bottom-0 left-0 bg-black/80 text-white text-xs px-2 py-1 rounded-tl-xl rounded-br-xl">{job.videoDuration}</div>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1"><span className="text-[#F1F5F9] font-mono">{job.id}</span>{getStatusBadge(job.status)}</div>
                    <div className="text-[#94A3B8] text-sm">{job.createdAt}</div>
                  </div>
                </div>
                <div className="text-[#94A3B8] text-sm mb-3">{job.resolution} • {job.quality} {job.processingTime && ` • ${job.processingTime}`} • {job.credits} credits {job.fileSize && ` • ${job.fileSize}`}</div>
                {job.status === 'processing' && job.progress && (
                  <div className="mb-4">
                    <div className="text-[#94A3B8] text-sm mb-2">🔄 {job.progressText}</div>
                    <Progress value={job.progress} className="h-2 bg-[#1E293B]" />
                    <div className="text-[#94A3B8] text-sm mt-1">{job.progress}% • {job.estimatedTimeRemaining}</div>
                  </div>
                )}
                {job.status === 'failed' && <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-3 mb-4"><div className="flex items-start gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{job.errorMessage}</span></div></div>}
                {job.status === 'queued' && <div className="text-[#94A3B8] text-sm mb-4">⏸️ Position #{job.queuePosition} in queue • Estimated start: {job.estimatedStartTime}</div>}
                <div className="flex gap-2 flex-wrap">
                  {job.status === 'completed' && (
                    <>
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">Details</Button>
                      <Button size="sm" className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"><Download className="w-4 h-4 mr-1" />Download</Button>
                      <Button variant="outline" size="sm" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"><Share2 className="w-4 h-4 mr-1" />Share</Button>
                    </>
                  )}
                  {job.status === 'failed' && <Button size="sm" className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white"><RotateCcw className="w-4 h-4 mr-1" />Retry</Button>}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="border border-[#334155] rounded-2xl p-16 bg-[#0F172A] text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-[#F1F5F9] mb-2">No jobs yet</h3>
            <p className="text-[#94A3B8] mb-6">Create your first AI character replacement</p>
            <Link href="/jobs/create"><Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">🚀 Start New Project</Button></Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50"><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
          <span className="text-[#94A3B8]">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9] disabled:opacity-50">Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}
    </main>
  );
}
