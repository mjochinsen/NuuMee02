'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Download, Eye, Clock, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface VideoInfo {
  short_id: string;
  video_url: string;
  resolution: string;
  created_at: string;
  view_count: number;
  expires_in_seconds: number;
}

export default function PublicVideoPage() {
  const [shortId, setShortId] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract shortId from URL on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // URL format: /v/abc123/ or /v/abc123
      const path = window.location.pathname;
      const match = path.match(/\/v\/([a-zA-Z0-9]+)\/?$/);
      if (match) {
        setShortId(match[1]);
      } else {
        setError('No video ID provided');
        setLoading(false);
      }
    }
  }, []);

  // Fetch video info when shortId is available
  useEffect(() => {
    async function fetchVideoInfo() {
      if (!shortId) return;

      try {
        const response = await fetch(`${API_BASE}/api/v1/public/video/${shortId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Video not found');
          } else if (response.status === 400) {
            setError('Video is still processing. Please check back later.');
          } else {
            setError('Failed to load video');
          }
          return;
        }
        const data = await response.json();
        setVideoInfo(data);
      } catch (err) {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    }

    if (shortId) {
      fetchVideoInfo();
    }
  }, [shortId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    if (videoInfo?.video_url) {
      window.open(videoInfo.video_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Video Unavailable</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-6 py-3 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to NuuMee
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-white">NuuMee</span>
          </Link>
          <Link
            href="/signup"
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition text-sm"
          >
            Create Your Own
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Video Player */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="aspect-video bg-black">
            {videoInfo && (
              <video
                src={videoInfo.video_url}
                controls
                autoPlay
                playsInline
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Video Info Bar */}
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{videoInfo?.view_count.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{videoInfo && formatDate(videoInfo.created_at)}</span>
              </div>
              <div className="px-2 py-0.5 bg-gray-800 rounded text-xs font-medium">
                {videoInfo?.resolution.toUpperCase()}
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Create Your Own AI Videos
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Transform any image into stunning animated videos with NuuMee&apos;s AI-powered video generation.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 py-4 rounded-xl transition text-lg"
          >
            Start Creating Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Created with <Link href="/" className="text-cyan-500 hover:underline">NuuMee</Link> - AI Video Generation</p>
        </div>
      </footer>
    </div>
  );
}
