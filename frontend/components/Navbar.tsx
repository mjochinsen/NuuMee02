'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

export function Navbar() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <header className="border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left - Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="NuuMee.AI"
              width={40}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
              Home
            </Link>
            <Link href={user ? "/create" : "/login"} className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
              Create Videos
            </Link>
            <Link href="/price" className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-24 bg-[#1E293B] rounded-lg animate-pulse" />
          ) : user && profile ? (
            <>
              {/* Credits */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9]">
                <span className="text-white text-sm">{profile.credits_balance} Credits</span>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:border-[#00F0D9] transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center text-white text-xs">
                    {profile.display_name?.[0] || profile.email[0].toUpperCase()}
                  </div>
                  <span className="text-[#F1F5F9] hidden sm:inline text-sm">
                    {profile.display_name || profile.email.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#1E293B] border border-[#334155] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-[#334155]">
                    <p className="text-[#F1F5F9] text-sm">{profile.display_name || 'User'}</p>
                    <p className="text-[#94A3B8] text-xs capitalize">{profile.subscription_tier}</p>
                  </div>
                  <Link
                    href="/jobs"
                    className="block px-4 py-2 text-[#94A3B8] hover:text-[#00F0D9] hover:bg-[#0F172A] text-sm"
                  >
                    My Jobs
                  </Link>
                  <Link
                    href="/billing"
                    className="block px-4 py-2 text-[#94A3B8] hover:text-[#00F0D9] hover:bg-[#0F172A] text-sm"
                  >
                    Billing
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-[#94A3B8] hover:text-[#00F0D9] hover:bg-[#0F172A] text-sm"
                  >
                    Settings
                  </Link>
                  <div className="border-t border-[#334155] mt-1 pt-1">
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-[#94A3B8] hover:text-red-400 hover:bg-[#0F172A] text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-[#94A3B8] hover:text-[#00F0D9] transition-colors text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
