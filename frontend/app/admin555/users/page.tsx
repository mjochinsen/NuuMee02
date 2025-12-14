'use client';

import { useState, useEffect } from 'react';
import { getUsers, getUser, adjustCredits, AdminUser, AdminUserDetail } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';

function UsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const perPage = 20;

  const loadUsers = async (page: number, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({ page, per_page: perPage, search });
      setUsers(response.items);
      setTotalPages(response.pages);
      setCurrentPage(response.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, searchQuery);
  };

  const handleRetry = () => {
    loadUsers(currentPage, searchQuery);
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'business':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Users</h1>
        <p className="text-[#94A3B8]">Manage user accounts and credits</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
            />
          </div>
          <Button
            type="submit"
            className="bg-[#00F0D9] text-[#0F172A] hover:bg-[#00D9C5]"
          >
            Search
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
                loadUsers(1, '');
              }}
              className="border-[#334155] text-[#F1F5F9] hover:bg-[#1E293B]"
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="border-red-500/50 text-red-400 hover:bg-red-900/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
            <Search className="h-12 w-12 mb-4" />
            <p className="text-lg">No users found</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try adjusting your search</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B] border-b border-[#334155]">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Display Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Tier</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Credits</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Jobs</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Last Active</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {users.map((user) => (
                  <tr
                    key={user.uid}
                    className="hover:bg-[#1E293B]/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedUserId(user.uid)}
                  >
                    <td className="py-4 px-6 text-sm text-[#F1F5F9]">{user.email}</td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9]">{user.display_name || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTierBadgeClass(user.tier)}`}>
                        {user.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] text-right font-mono">
                      {user.credits.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] text-right">
                      {user.jobs_count}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(user.last_active)}
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#00F0D9] hover:text-[#00D9C5] hover:bg-[#00F0D9]/10"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="border-t border-[#334155] px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-[#94A3B8]">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-[#334155] text-[#F1F5F9] hover:bg-[#1E293B] disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-[#334155] text-[#F1F5F9] hover:bg-[#1E293B] disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Slide-Over */}
      {selectedUserId && (
        <UserDetailPanel
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdate={() => loadUsers(currentPage, searchQuery)}
        />
      )}
    </>
  );
}

function UserDetailPanel({
  userId,
  onClose,
  onUpdate
}: {
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUser(userId);
      setUser(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load user details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditAdjustment = async (amount: number, reason: string) => {
    try {
      await adjustCredits(userId, amount, reason);
      toast.success(`Successfully ${amount > 0 ? 'added' : 'removed'} ${Math.abs(amount)} credits`);
      await loadUserDetail();
      onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to adjust credits';
      toast.error(message);
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'business':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#1E293B] border-l border-[#334155] z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F172A] border-b border-[#334155] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#F1F5F9]">User Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#334155]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUserDetail}
                className="border-red-500/50 text-red-400 hover:bg-red-900/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : user ? (
            <>
              {/* User Info */}
              <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Account Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Email</p>
                    <p className="text-[#F1F5F9]">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Display Name</p>
                    <p className="text-[#F1F5F9]">{user.display_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Tier</p>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTierBadgeClass(user.tier)}`}>
                      {user.tier.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Credits</p>
                    <p className="text-[#F1F5F9] font-mono text-lg">{user.credits.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Jobs Count</p>
                    <p className="text-[#F1F5F9]">{user.jobs_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Last Active</p>
                    <p className="text-[#F1F5F9]">{formatDate(user.last_active)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Created</p>
                    <p className="text-[#F1F5F9]">{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">User ID</p>
                    <p className="text-[#64748B] font-mono text-xs">{user.uid}</p>
                  </div>
                </div>

                {user.subscription && (
                  <div className="pt-4 border-t border-[#334155]">
                    <p className="text-sm text-[#94A3B8] mb-2">Subscription</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Status</p>
                        <p className="text-[#F1F5F9] capitalize">{user.subscription.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#64748B] mb-1">Plan</p>
                        <p className="text-[#F1F5F9]">{user.subscription.plan}</p>
                      </div>
                      {user.subscription.current_period_end && (
                        <div>
                          <p className="text-xs text-[#64748B] mb-1">Period End</p>
                          <p className="text-[#F1F5F9]">{formatDate(user.subscription.current_period_end)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Adjustment */}
              <CreditAdjustmentForm onSubmit={handleCreditAdjustment} />

              {/* Recent Jobs */}
              {user.recent_jobs && user.recent_jobs.length > 0 && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Recent Jobs</h3>
                  <div className="space-y-3">
                    {user.recent_jobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between py-2 border-b border-[#334155] last:border-0">
                        <div>
                          <p className="text-[#F1F5F9] text-sm">{job.type || 'Video Processing'}</p>
                          <p className="text-[#64748B] text-xs">{formatDate(job.created_at)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(job.status)}`}>
                          {job.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              {user.recent_transactions && user.recent_transactions.length > 0 && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {user.recent_transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-2 border-b border-[#334155] last:border-0">
                        <div>
                          <p className="text-[#F1F5F9] text-sm">{txn.description || txn.type}</p>
                          <p className="text-[#64748B] text-xs">{formatDate(txn.created_at)}</p>
                        </div>
                        <div className={`font-mono text-sm ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {txn.amount > 0 ? '+' : ''}{txn.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CreditAdjustmentForm({
  onSubmit
}: {
  onSubmit: (amount: number, reason: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please enter a reason');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(numAmount, reason);
      setAmount('');
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#F1F5F9] mb-4">Adjust Credits</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-[#94A3B8] mb-2 block">
            Amount (+ to add, - to remove)
          </label>
          <Input
            type="number"
            placeholder="e.g., 100 or -50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
          />
        </div>

        <div>
          <label className="text-sm text-[#94A3B8] mb-2 block">
            Reason
          </label>
          <Input
            type="text"
            placeholder="e.g., Customer support refund"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting || !amount || !reason.trim()}
          className="w-full bg-[#00F0D9] text-[#0F172A] hover:bg-[#00D9C5] disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adjusting...
            </>
          ) : (
            'Adjust Credits'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load users">
      <UsersContent />
    </AdminErrorBoundary>
  );
}
