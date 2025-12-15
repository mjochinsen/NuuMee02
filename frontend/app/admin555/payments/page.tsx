'use client';

import { useState, useEffect } from 'react';
import { getPayments, PaymentsResponse, PaymentTransaction } from '@/lib/admin-api';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import { TrendingUp, Users, CreditCard, Coins, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  loading = false,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success';
  loading?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl border ${
        variant === 'success'
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-[#334155] bg-[#0F172A]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#94A3B8] text-sm mb-1">{title}</p>
          {loading ? (
            <div className="h-9 w-24 bg-[#1E293B] rounded animate-pulse" />
          ) : (
            <p className={`text-3xl font-bold ${variant === 'success' ? 'text-green-400' : 'text-[#F1F5F9]'}`}>
              {value}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          variant === 'success' ? 'bg-green-500/10' : 'bg-[#1E293B]'
        }`}>
          <Icon className={`w-5 h-5 ${variant === 'success' ? 'text-green-400' : 'text-[#00F0D9]'}`} />
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'succeeded':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'refunded':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function getTypeBadgeClass(type: string) {
  switch (type) {
    case 'subscription':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'credit_purchase':
      return 'bg-[#00F0D9]/20 text-[#00F0D9] border-[#00F0D9]/30';
    case 'refund':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function PaymentsContent() {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPayments(50);
      setData(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load payments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const stats = data?.stats;
  const transactions = data?.recent_transactions || [];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">Payments</h1>
        <p className="text-[#94A3B8]">Revenue statistics and transaction history</p>
      </div>

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
            onClick={loadPayments}
            className="border-red-500/50 text-red-400 hover:bg-red-900/30"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="MRR"
          value={stats ? formatCurrency(stats.mrr) : '$0'}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatsCard
          title="Revenue This Month"
          value={stats ? formatCurrency(stats.total_revenue) : '$0'}
          icon={CreditCard}
          loading={loading}
        />
        <StatsCard
          title="Active Subscribers"
          value={stats?.subscriber_count ?? 0}
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="Credits Today"
          value={stats?.credits_purchased_today ?? 0}
          icon={Coins}
          loading={loading}
        />
        <StatsCard
          title="Credits This Month"
          value={stats?.credits_purchased_this_month ?? 0}
          icon={Coins}
          loading={loading}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155]">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">Recent Transactions</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#00F0D9] animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
            <p className="text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B] border-b border-[#334155]">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Type</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#F1F5F9]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-[#94A3B8]">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9]">
                      {txn.user_email || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeBadgeClass(txn.type)}`}>
                        {txn.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#F1F5F9] text-right font-mono">
                      ${txn.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(txn.status)}`}>
                        {txn.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function PaymentsPage() {
  return (
    <AdminErrorBoundary fallbackTitle="Failed to load payments">
      <PaymentsContent />
    </AdminErrorBoundary>
  );
}
