'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Briefcase, CreditCard, Gift, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { getDashboardStats, DashboardStats } from '@/lib/admin-api';

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  variant?: 'default' | 'warning' | 'success';
}) {
  const content = (
    <div
      className={`p-6 rounded-xl border ${
        variant === 'warning'
          ? 'border-amber-500/30 bg-amber-500/5'
          : variant === 'success'
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-[#334155] bg-[#0F172A]'
      } ${href ? 'hover:border-[#00F0D9]/50 transition-colors cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94A3B8] text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${
            variant === 'warning' ? 'text-amber-400' :
            variant === 'success' ? 'text-green-400' :
            'text-[#F1F5F9]'
          }`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[#64748B] text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          variant === 'warning' ? 'bg-amber-500/10' :
          variant === 'success' ? 'bg-green-500/10' :
          'bg-[#1E293B]'
        }`}>
          <Icon className={`w-5 h-5 ${
            variant === 'warning' ? 'text-amber-400' :
            variant === 'success' ? 'text-green-400' :
            'text-[#00F0D9]'
          }`} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0D9]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <p className="text-[#94A3B8]">{error || 'Failed to load stats'}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          subtitle={`+${stats.users.new_today} today`}
          icon={Users}
          href="/admin555/users"
        />
        <StatsCard
          title="Jobs Today"
          value={stats.jobs.today}
          subtitle={`${stats.jobs.processing} processing`}
          icon={Briefcase}
          href="/admin555/jobs"
        />
        <StatsCard
          title="Failed Jobs"
          value={stats.jobs.failed}
          subtitle="Needs attention"
          icon={AlertTriangle}
          href="/admin555/jobs?status=failed"
          variant={stats.jobs.failed > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="MRR"
          value={`$${stats.revenue.mrr.toLocaleString()}`}
          subtitle={`$${stats.revenue.this_month.toLocaleString()} this month`}
          icon={TrendingUp}
          href="/admin555/payments"
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[#334155]">
              <span className="text-[#94A3B8]">Total Jobs</span>
              <span className="text-[#F1F5F9] font-medium">{stats.jobs.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#334155]">
              <span className="text-[#94A3B8]">Active Promos</span>
              <span className="text-[#F1F5F9] font-medium">{stats.promos.active}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#334155]">
              <span className="text-[#94A3B8]">Promo Redemptions</span>
              <span className="text-[#F1F5F9] font-medium">{stats.promos.total_redemptions}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#94A3B8]">New Users This Week</span>
              <span className="text-[#F1F5F9] font-medium">{stats.users.new_this_week}</span>
            </div>
          </div>
        </div>

        <div className="border border-[#334155] rounded-xl p-6 bg-[#0F172A]">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin555/users"
              className="flex items-center gap-3 p-3 rounded-lg border border-[#334155] hover:border-[#00F0D9]/50 transition-colors"
            >
              <Users className="w-5 h-5 text-[#00F0D9]" />
              <span className="text-[#F1F5F9]">Manage Users</span>
            </Link>
            <Link
              href="/admin555/jobs?status=failed"
              className="flex items-center gap-3 p-3 rounded-lg border border-[#334155] hover:border-[#00F0D9]/50 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-[#00F0D9]" />
              <span className="text-[#F1F5F9]">View Failed Jobs</span>
            </Link>
            <Link
              href="/admin555/promos"
              className="flex items-center gap-3 p-3 rounded-lg border border-[#334155] hover:border-[#00F0D9]/50 transition-colors"
            >
              <Gift className="w-5 h-5 text-[#00F0D9]" />
              <span className="text-[#F1F5F9]">Manage Promo Codes</span>
            </Link>
            <Link
              href="/admin555/payments"
              className="flex items-center gap-3 p-3 rounded-lg border border-[#334155] hover:border-[#00F0D9]/50 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-[#00F0D9]" />
              <span className="text-[#F1F5F9]">Payment Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load dashboard">
      <DashboardContent />
    </AdminErrorBoundary>
  );
}
