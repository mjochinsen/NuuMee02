'use client';

import { FileText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditTransaction, TransactionType, TransactionStatus } from '@/lib/api';

export interface TransactionHistorySectionProps {
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

// Helper to format transaction type for display
const getTransactionTypeLabel = (type: TransactionType | string): string => {
  const labels: Record<string, string> = {
    purchase: 'Credit Purchase',
    subscription: 'Subscription Credits',
    subscription_renewal: 'Subscription Renewal',
    subscription_upgrade: 'Plan Upgrade',
    subscription_downgrade: 'Plan Downgrade',
    subscription_cancel: 'Plan Canceled',
    billing_switch_annual: 'Switched to Annual',
    billing_switch_monthly: 'Switched to Monthly',
    referral: 'Referral Bonus',
    job_usage: 'Job Usage',
    refund: 'Refund',
    bonus: 'Bonus Credits',
  };
  return labels[type] || type;
};

// Helper to get transaction type badge color
const getTransactionBadgeColor = (type: TransactionType | string): string => {
  const colors: Record<string, string> = {
    purchase: 'bg-blue-500/20 text-blue-400',
    subscription: 'bg-purple-500/20 text-purple-400',
    subscription_renewal: 'bg-purple-500/20 text-purple-400',
    subscription_upgrade: 'bg-green-500/20 text-green-400',
    subscription_downgrade: 'bg-amber-500/20 text-amber-400',
    subscription_cancel: 'bg-red-500/20 text-red-400',
    billing_switch_annual: 'bg-green-500/20 text-green-400',
    billing_switch_monthly: 'bg-blue-500/20 text-blue-400',
    referral: 'bg-green-500/20 text-green-400',
    job_usage: 'bg-orange-500/20 text-orange-400',
    refund: 'bg-amber-500/20 text-amber-400',
    bonus: 'bg-cyan-500/20 text-cyan-400',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400';
};

// Helper to get status badge color
const getStatusBadgeColor = (status: TransactionStatus | string): string => {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

// Helper to format status label
const getStatusLabel = (status: TransactionStatus | string): string => {
  const labels: Record<string, string> = {
    completed: 'Success',
    pending: 'Pending',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return labels[status] || status;
};

// Helper to format date with time
const formatDateWithTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper to format dollar amount
const formatAmount = (amountCents: number | null | undefined): string => {
  if (amountCents === null || amountCents === undefined) return '-';
  return `$${(amountCents / 100).toFixed(2)}`;
};

export function TransactionHistorySection({
  transactions,
  isLoading,
  error,
  page,
  total,
  hasMore,
  onPageChange,
  onRefresh,
}: TransactionHistorySectionProps) {
  return (
    <div className="border border-[#334155] rounded-2xl p-8 bg-[#0F172A]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00F0D9]" />
          <h2 className="text-[#F1F5F9]">Transaction History</h2>
          {total > 0 && (
            <Badge variant="outline" className="border-[#334155] text-[#94A3B8]">
              {total} total
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-[#94A3B8] hover:text-[#F1F5F9]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && transactions.length === 0 && (
        <div className="text-center text-[#94A3B8] py-8">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && transactions.length === 0 && !error && (
        <div className="text-center text-[#94A3B8] py-8">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Your purchase and usage history will appear here</p>
        </div>
      )}

      {/* Transaction List - Table Format */}
      {transactions.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-[#94A3B8] border-b border-[#334155]">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Credits</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#334155]">
            {transactions.map((txn) => (
              <div
                key={txn.transaction_id}
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-[#1E293B]/50 transition-colors"
              >
                {/* Date */}
                <div className="col-span-2 text-[#94A3B8] text-sm">
                  {formatDateWithTime(txn.created_at)}
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <div className="text-[#F1F5F9] text-sm font-medium truncate">
                    {txn.description || getTransactionTypeLabel(txn.type)}
                  </div>
                  <Badge className={`text-xs mt-1 ${getTransactionBadgeColor(txn.type)}`}>
                    {getTransactionTypeLabel(txn.type)}
                  </Badge>
                </div>

                {/* Amount (Dollar) */}
                <div className="col-span-2 text-right text-[#F1F5F9] text-sm">
                  {formatAmount(txn.amount_cents)}
                </div>

                {/* Credits */}
                <div className={`col-span-2 text-right text-sm font-semibold ${txn.amount >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  {txn.amount >= 0 ? '+' : ''}{txn.amount}
                </div>

                {/* Status */}
                <div className="col-span-2 text-center">
                  <Badge className={`text-xs border ${getStatusBadgeColor(txn.status || 'completed')}`}>
                    {getStatusLabel(txn.status || 'completed')}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="col-span-1 text-center">
                  {txn.receipt_url ? (
                    <a
                      href={txn.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#00F0D9] hover:bg-[#00F0D9]/10 transition-colors"
                      title="View Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-[#64748B]">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-between pt-4 border-t border-[#334155]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || isLoading}
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-[#94A3B8] text-sm">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasMore || isLoading}
                className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
