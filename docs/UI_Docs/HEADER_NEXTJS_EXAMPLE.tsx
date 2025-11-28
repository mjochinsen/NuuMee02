/**
 * NEXT.JS CONVERTED VERSION - Header Component
 * 
 * This is the CONVERTED version of /components/Header.tsx for Next.js
 * Use this as a reference when converting your React Router version
 * 
 * KEY CHANGES FROM REACT VERSION:
 * 1. Added "use client" directive (line 1)
 * 2. Changed Link import: react-router-dom → next/link
 * 3. Changed hook: useLocation → usePathname
 * 4. Changed Link prop: to → href
 * 5. Changed pathname access: location.pathname → pathname
 */

'use client'; // ← CHANGE #1: Add this directive

import { ChevronDown, Zap, Plus, User, CreditCard, Key, Briefcase, HelpCircle, Settings, LogOut, Gift } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link'; // ← CHANGE #2: Next.js Link
import { usePathname } from 'next/navigation'; // ← CHANGE #3: Next.js hook
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function Header() {
  const [credits] = useState(25);
  const userName = "Alex Chen";
  const userTier = "Creator";
  const pathname = usePathname(); // ← CHANGE #4: usePathname instead of useLocation

  const isActive = (path: string) => pathname === path; // ← CHANGE #5: pathname instead of location.pathname

  return (
    <header className="border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side - Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2"> {/* ← CHANGE #6: to → href */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
              <span className="text-white">N</span>
            </div>
            <span className="text-[#F1F5F9]">NuuMee.AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" // ← CHANGE: to → href
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/create" // ← CHANGE: to → href
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/create') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Create Videos
            </Link>
            <Link 
              href="/dev" // ← CHANGE: to → href
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/dev') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Dev
            </Link>
            <Link 
              href="/price" // ← CHANGE: to → href
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/price') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Price
            </Link>
            <Link 
              href="/documentation" // ← CHANGE: to → href
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/documentation') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Documentation
            </Link>
          </nav>
        </div>

        {/* Right Side - Credits and Account */}
        <div className="flex items-center gap-4">
          {/* Dev: Login Link */}
          <Link href="/login"> {/* ← CHANGE: to → href */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#334155] text-[#94A3B8] hover:border-[#00F0D9] hover:text-[#00F0D9] transition-colors text-sm">
              Login
            </button>
          </Link>

          {/* Credits Display */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] hover:opacity-90 transition-opacity">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white">{credits} Credits</span>
            <Plus className="w-4 h-4 text-white" />
          </button>

          {/* Account Dropdown - THE MAIN COMPONENT YOU'RE CONVERTING */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:border-[#00F0D9] transition-colors">
                <User className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-[#F1F5F9] hidden sm:inline">{userName}</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1E293B] border-[#334155]">
              {/* User Info Header */}
              <div className="px-2 py-3 border-b border-[#334155]">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]">{userName}</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white border-0">
                    {userTier}
                  </Badge>
                </div>
              </div>
              
              {/* Menu Items */}
              <Link href="/referral"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Gift className="w-4 h-4 mr-2" />
                  Refer Friends
                </DropdownMenuItem>
              </Link>
              <Link href="/billing"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </DropdownMenuItem>
              </Link>
              <Link href="/api-keys"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </DropdownMenuItem>
              </Link>
              <Link href="/jobs"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </DropdownMenuItem>
              </Link>
              <Link href="/support"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support
                </DropdownMenuItem>
              </Link>
              <Link href="/settings"> {/* ← CHANGE: to → href */}
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
              </Link>
              
              {/* Separator */}
              <DropdownMenuSeparator className="bg-[#334155]" />
              
              {/* Sign Out */}
              <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/**
 * SUMMARY OF CHANGES:
 * 
 * ✅ Line 1: Added "use client" directive
 * ✅ Line 19: import Link from 'next/link'
 * ✅ Line 20: import { usePathname } from 'next/navigation'
 * ✅ Line 33: const pathname = usePathname()
 * ✅ Line 35: pathname === path (instead of location.pathname)
 * ✅ All Links: Changed to="..." to href="..."
 * 
 * TESTING CHECKLIST:
 * 
 * [ ] Dropdown opens when clicking user button
 * [ ] User name displays: "Alex Chen"
 * [ ] Badge displays: "Creator" with gradient
 * [ ] All 7 menu items are present
 * [ ] Clicking menu items navigates correctly
 * [ ] Hover effects work (cyan highlight)
 * [ ] Active navigation states work
 * [ ] No console errors
 * [ ] Works on mobile
 * [ ] Dropdown closes when clicking outside
 * 
 * NOTES:
 * - This component requires Next.js 13+ (App Router)
 * - Ensure your Next.js app has proper route pages
 * - The dropdown uses Radix UI primitives (already configured)
 * - Styling uses Tailwind CSS with custom colors
 * - Icons from lucide-react package
 */
