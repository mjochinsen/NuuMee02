'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Gift,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearStoredPassword } from '@/lib/admin-api';

interface AdminSidebarProps {
  failedJobsCount?: number;
  onLogout?: () => void;
}

const navItems = [
  { href: '/admin555', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin555/users', label: 'Users', icon: Users },
  { href: '/admin555/jobs', label: 'Jobs', icon: Briefcase, badgeKey: 'failedJobsCount' as const },
  { href: '/admin555/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin555/promos', label: 'Promo Codes', icon: Gift },
];

export function AdminSidebar({ failedJobsCount = 0, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    clearStoredPassword();
    onLogout?.();
  };

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#334155] min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#334155]">
        <Link href="/" className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to site</span>
        </Link>
        <h1 className="text-xl font-bold text-[#F1F5F9] mt-4">Admin Panel</h1>
        <p className="text-[#64748B] text-sm">NuuMee Operations</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin555' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const showBadge = item.badgeKey === 'failedJobsCount' && failedJobsCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
                    isActive
                      ? 'bg-[#1E293B] text-[#00F0D9]'
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {failedJobsCount > 99 ? '99+' : failedJobsCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#334155]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
