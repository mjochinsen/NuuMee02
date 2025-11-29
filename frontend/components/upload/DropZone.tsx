'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';

export interface DropZoneProps {
  accept: string;
  maxSize: number;
  fileTypeLabel: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  file: File | null;
  isUploading?: boolean;
  className?: string;
}

export function DropZone({
  accept,
  maxSize,
  fileTypeLabel,
  onFileSelect,
  onFileRemove,
  file,
  isUploading = false,
  className,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2);
        return file.type.startsWith(prefix);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Invalid file type. Please select a ${fileTypeLabel.toLowerCase()} file.`;
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    return null;
  };

  const handleFile = useCallback(
    (selectedFile: File) => {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      onFileSelect(selectedFile);
    },
    [accept, maxSize, onFileSelect, fileTypeLabel]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setError(null);
    onFileRemove();
  };

  if (file) {
    return (
      <div className={`relative rounded-lg border-2 border-dashed border-gray-300 p-6 ${className || ''}`}>
        <button
          onClick={handleRemove}
          disabled={isUploading}
          className="absolute right-2 top-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 disabled:opacity-50"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${error ? 'border-red-300 bg-red-50' : ''}`}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center space-y-3">
          <Upload className={`h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drag & drop your {fileTypeLabel.toLowerCase()} here
            </p>
            <p className="mt-1 text-xs text-gray-500">or click to browse</p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Maximum size: {formatFileSize(maxSize)}</p>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
