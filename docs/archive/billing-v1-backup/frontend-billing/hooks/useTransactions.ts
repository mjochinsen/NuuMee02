'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactions, CreditTransaction, ApiError } from '@/lib/api';

export interface UseTransactionsReturn {
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  total: number;
  hasMore: boolean;
  pageSize: number;
  refresh: () => void;
}

const TRANSACTION_PAGE_SIZE = 10;

export function useTransactions(userId: string | undefined): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getTransactions(page, TRANSACTION_PAGE_SIZE);
      setTransactions(response.transactions);
      setTotal(response.total);
      setHasMore(response.has_more);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load transaction history');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    page,
    setPage,
    total,
    hasMore,
    pageSize: TRANSACTION_PAGE_SIZE,
    refresh: fetchTransactions,
  };
}
