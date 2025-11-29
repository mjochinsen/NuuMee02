'use client';

import React, { useEffect, useState } from 'react';
import { FileImage, Film, X } from 'lucide-react';

export interface FilePreviewProps {
  file: File | null;
  fileType: 'image' | 'video';
  onRemove: () => void;
  isUploading?: boolean;
  className?: string;
}

export function FilePreview({
  file,
  fileType,
  onRemove,
  isUploading = false,
  className,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) {
    return null;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`relative rounded-lg border border-gray-200 bg-white p-4 ${className || ''}`}>
      <button
        onClick={onRemove}
        disabled={isUploading}
        className="absolute right-2 top-2 z-10 rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200 disabled:opacity-50"
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {previewUrl && fileType === 'image' ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-20 w-20 rounded object-cover"
            />
          ) : previewUrl && fileType === 'video' ? (
            <video
              src={previewUrl}
              className="h-20 w-20 rounded object-cover"
              muted
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100">
              {fileType === 'image' ? (
                <FileImage className="h-8 w-8 text-gray-400" />
              ) : (
                <Film className="h-8 w-8 text-gray-400" />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
          <p className="mt-1 text-xs text-gray-500">{formatFileSize(file.size)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Type: {file.type || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
