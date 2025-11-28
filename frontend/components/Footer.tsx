'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#334155] bg-[#0F172A] mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[#94A3B8] text-sm">
            <Link href="/terms" className="hover:text-[#F1F5F9] transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-[#F1F5F9] transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/careers" className="hover:text-[#F1F5F9] transition-colors">
              Careers
            </Link>
          </div>
          <p className="text-[#94A3B8] text-sm">
            © 2025 NuuMee.AI — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
