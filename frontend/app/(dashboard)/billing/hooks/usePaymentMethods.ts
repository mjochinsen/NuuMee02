'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPaymentMethods, PaymentMethod } from '@/lib/api';

export interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  refresh: () => void;
}

export function usePaymentMethods(userId: string | undefined): UsePaymentMethodsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPaymentMethods = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const response = await getPaymentMethods();
      setPaymentMethods(response.payment_methods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
      setPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    isLoading,
    refresh: fetchPaymentMethods,
  };
}
