'use client';

import React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  fileName: string;
  className?: string;
}

export function UploadProgress({
  progress,
  status,
  error,
  fileName,
  className,
}: UploadProgressProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className || ''}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {status === 'uploading' && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          )}
          {status === 'error' && (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
            <span className="ml-2 text-sm text-gray-500">
              {status === 'uploading' && `${Math.round(progress)}%`}
              {status === 'success' && 'Complete'}
              {status === 'error' && 'Failed'}
            </span>
          </div>

          {status === 'uploading' && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {status === 'error' && error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}

          {status === 'success' && (
            <p className="mt-1 text-xs text-green-600">Upload complete</p>
          )}
        </div>
      </div>
    </div>
  );
}
