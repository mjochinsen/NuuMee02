'use client';

import Link from 'next/link';
import { Home, Video, Briefcase, HelpCircle, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-[#0F172A]">
      <div className="text-center max-w-2xl mx-auto">
        {/* Film Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00F0D9]/20 to-[#3B1FE2]/20 flex items-center justify-center">
            <Film className="w-12 h-12 text-[#00F0D9]" />
          </div>
        </div>

        {/* Scene Missing Emoji */}
        <div className="text-6xl mb-6">🎬</div>

        {/* Video-Themed Message */}
        <h1 className="text-[#F1F5F9] text-xl font-semibold mb-2">Scene Missing</h1>

        {/* 404 Display */}
        <div className="mb-6">
          <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h2 className="text-[#F1F5F9] text-2xl md:text-3xl font-semibold mb-4">
          Take 404: Page Not Found
        </h2>

        <p className="text-[#94A3B8] text-lg mb-8 max-w-md mx-auto">
          Looks like this scene didn&apos;t make the final cut. The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Primary CTA */}
        <Link href="/">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white px-8 mb-12"
          >
            <Home className="w-5 h-5 mr-2" />
            Roll Camera on New Project
          </Button>
        </Link>

        {/* Helpful Links */}
        <div className="border-t border-[#334155] pt-8">
          <p className="text-[#94A3B8] mb-4">Or try these:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/videos/create">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                <Video className="w-4 h-4 mr-2" />
                Generate Videos
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                My Jobs
              </Button>
            </Link>
            <Link href="/support">
              <Button
                variant="outline"
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
