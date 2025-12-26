'use client';

import { useEffect } from 'react';
import { ChevronDown, Zap, Plus, User, CreditCard, Key, Briefcase, HelpCircle, Settings, LogOut, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { warmBackend } from '@/lib/api';

export function Header() {
  // Pre-warm backend on any page load to reduce login cold start latency
  useEffect(() => {
    warmBackend();
  }, []);
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  // Get credits from profile, null while loading or if profile not yet synced
  const credits = loading || !profile ? null : (profile.credits_balance ?? 0);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side - Logo and Nav */}
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
          <Link
            href="/"
            className={`hover:text-[#00F0D9] transition-colors ${
              isActive('/') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
            }`}
          >
            Home
          </Link>
          <Link
            href={user ? "/videos/create" : "/login?redirect=/videos/create"}
            className={`hover:text-[#00F0D9] transition-colors ${
              isActive('/videos/create') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
            }`}
          >
            Create Videos
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-[#00F0D9] transition-colors ${
              isActive('/pricing') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/documentation"
            className={`hover:text-[#00F0D9] transition-colors ${
              isActive('/documentation') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
            }`}
          >
            Docs
          </Link>
        </nav>
        </div>

        {/* Right Side - Auth/Credits/Account */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-[#1E293B]" />
          ) : user ? (
            <>
              {/* Credits Display - Links to Billing */}
              <Link href="/billing/">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] hover:opacity-90 transition-opacity">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">{credits === null ? '...' : credits} Credits</span>
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </Link>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:border-[#00F0D9] transition-colors">
                    <User className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#F1F5F9] hidden sm:inline text-sm">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1E293B] border-[#334155]">
                  <div className="px-2 py-3 border-b border-[#334155]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F1F5F9] text-sm">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                      <Badge variant="secondary" className="bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white border-0 text-xs">
                        {profile?.subscription_tier || 'Free'}
                      </Badge>
                    </div>
                  </div>
                  <Link href="/referral/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <Gift className="w-4 h-4 mr-2" />
                      Refer Friends
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/billing/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/api-keys/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <Key className="w-4 h-4 mr-2" />
                      API Keys
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/jobs/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Jobs
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/support/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Support
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/account/">
                    <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-[#334155]" />
                  <DropdownMenuItem
                    className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login/">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white hover:opacity-90 transition-opacity text-sm font-medium">
                Login / Sign Up
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
