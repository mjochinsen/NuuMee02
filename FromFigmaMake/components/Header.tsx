import { ChevronDown, Zap, Plus, User, CreditCard, Key, Briefcase, HelpCircle, Settings, LogOut, Gift } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-[#334155] bg-[#0F172A]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side - Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
              <span className="text-white">N</span>
            </div>
            <span className="text-[#F1F5F9]">NuuMee.AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/create') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Create Videos
            </Link>
            <Link 
              to="/dev" 
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/dev') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Dev
            </Link>
            <Link 
              to="/price" 
              className={`hover:text-[#00F0D9] transition-colors ${
                isActive('/price') ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              Price
            </Link>
            <Link 
              to="/documentation" 
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
          <Link to="/login">
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

          {/* Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:border-[#00F0D9] transition-colors">
                <User className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-[#F1F5F9] hidden sm:inline">{userName}</span>
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1E293B] border-[#334155]">
              <div className="px-2 py-3 border-b border-[#334155]">
                <div className="flex items-center justify-between">
                  <span className="text-[#F1F5F9]">{userName}</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white border-0">
                    {userTier}
                  </Badge>
                </div>
              </div>
              <Link to="/referral">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Gift className="w-4 h-4 mr-2" />
                  Refer Friends
                </DropdownMenuItem>
              </Link>
              <Link to="/billing">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </DropdownMenuItem>
              </Link>
              <Link to="/api-keys">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Key className="w-4 h-4 mr-2" />
                  API Keys
                </DropdownMenuItem>
              </Link>
              <Link to="/jobs">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </DropdownMenuItem>
              </Link>
              <Link to="/support">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#334155]" />
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
