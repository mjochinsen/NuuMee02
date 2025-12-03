'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAutoRefillSettings, updateAutoRefillSettings, ApiError } from '@/lib/api';

export interface UseAutoRefillReturn {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;
  packageId: string;
  setPackageId: (packageId: string) => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  save: () => Promise<void>;
}

export function useAutoRefill(userId: string | undefined): UseAutoRefillReturn {
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [packageId, setPackageId] = useState('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutoRefillSettings = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);

    try {
      const settings = await getAutoRefillSettings();
      setEnabled(settings.enabled);
      setThreshold(settings.threshold);
      setPackageId(settings.package_id);
    } catch (err) {
      console.error('Failed to fetch auto-refill settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const save = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateAutoRefillSettings({
        enabled,
        threshold,
        package_id: packageId,
      });
    } catch (err) {
      console.error('Failed to save auto-refill settings:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      }
      throw err; // Re-throw so component can show toast
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchAutoRefillSettings();
  }, [fetchAutoRefillSettings]);

  return {
    enabled,
    setEnabled,
    threshold,
    setThreshold,
    packageId,
    setPackageId,
    isLoading,
    isSaving,
    error,
    save,
  };
}
