'use client';

import React, { useState } from 'react';
import { DropZone, FilePreview, UploadProgress } from '@/components/upload';
import { getSignedUrl, uploadToGCS } from '@/lib/api';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
const VIDEO_TYPES = 'video/mp4,video/webm';

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function CreatePage() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [motionVideo, setMotionVideo] = useState<File | null>(null);

  const [imageUpload, setImageUpload] = useState<UploadState>({
    progress: 0,
    status: 'idle',
  });
  const [videoUpload, setVideoUpload] = useState<UploadState>({
    progress: 0,
    status: 'idle',
  });

  const [imagePath, setImagePath] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const uploadFile = async (
    file: File,
    fileType: 'image' | 'video',
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>,
    setFilePath: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    try {
      setUploadState({ progress: 0, status: 'uploading' });

      const { upload_url, file_path } = await getSignedUrl({
        file_type: fileType,
        file_name: file.name,
        content_type: file.type,
      });

      await uploadToGCS(file, upload_url, (progress) => {
        setUploadState({ progress, status: 'uploading' });
      });

      setFilePath(file_path);
      setUploadState({ progress: 100, status: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  const handleImageSelect = async (file: File) => {
    setReferenceImage(file);
    await uploadFile(file, 'image', setImageUpload, setImagePath);
  };

  const handleVideoSelect = async (file: File) => {
    setMotionVideo(file);
    await uploadFile(file, 'video', setVideoUpload, setVideoPath);
  };

  const handleImageRemove = () => {
    setReferenceImage(null);
    setImagePath(null);
    setImageUpload({ progress: 0, status: 'idle' });
  };

  const handleVideoRemove = () => {
    setMotionVideo(null);
    setVideoPath(null);
    setVideoUpload({ progress: 0, status: 'idle' });
  };

  const handleCreateVideo = async () => {
    if (!imagePath || !videoPath) return;

    setIsCreating(true);
    try {
      // TODO: Phase 4 - Call video creation API
      console.log('Creating video with:', { imagePath, videoPath });
      alert('Video creation will be implemented in Phase 4!');
    } catch (error) {
      console.error('Video creation error:', error);
      alert('Failed to create video. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateVideo =
    imageUpload.status === 'success' &&
    videoUpload.status === 'success' &&
    !isCreating;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Videos
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create AI Video</h1>
          <p className="mt-2 text-gray-600">
            Upload a reference image and motion video to generate your AI-powered video
          </p>
        </div>

        {/* Upload Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Reference Image */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Reference Image</h2>
            <p className="mb-4 text-sm text-gray-500">
              Upload the image you want to animate (max 10MB)
            </p>

            {!referenceImage ? (
              <DropZone
                accept={IMAGE_TYPES}
                maxSize={MAX_IMAGE_SIZE}
                fileTypeLabel="Image"
                onFileSelect={handleImageSelect}
                onFileRemove={handleImageRemove}
                file={referenceImage}
                isUploading={imageUpload.status === 'uploading'}
              />
            ) : (
              <div className="space-y-4">
                <FilePreview
                  file={referenceImage}
                  fileType="image"
                  onRemove={handleImageRemove}
                  isUploading={imageUpload.status === 'uploading'}
                />
                <UploadProgress
                  progress={imageUpload.progress}
                  status={imageUpload.status}
                  error={imageUpload.error}
                  fileName={referenceImage.name}
                />
              </div>
            )}
          </div>

          {/* Motion Video */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Motion Video</h2>
            <p className="mb-4 text-sm text-gray-500">
              Upload the motion reference video (max 100MB)
            </p>

            {!motionVideo ? (
              <DropZone
                accept={VIDEO_TYPES}
                maxSize={MAX_VIDEO_SIZE}
                fileTypeLabel="Video"
                onFileSelect={handleVideoSelect}
                onFileRemove={handleVideoRemove}
                file={motionVideo}
                isUploading={videoUpload.status === 'uploading'}
              />
            ) : (
              <div className="space-y-4">
                <FilePreview
                  file={motionVideo}
                  fileType="video"
                  onRemove={handleVideoRemove}
                  isUploading={videoUpload.status === 'uploading'}
                />
                <UploadProgress
                  progress={videoUpload.progress}
                  status={videoUpload.status}
                  error={videoUpload.error}
                  fileName={motionVideo.name}
                />
              </div>
            )}
          </div>
        </div>

        {/* Create Button */}
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={handleCreateVideo}
            disabled={!canCreateVideo}
            className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isCreating ? 'Creating...' : 'Create Video'}
          </button>

          {!canCreateVideo && (referenceImage || motionVideo) && (
            <p className="mt-4 text-sm text-gray-500">
              {imageUpload.status !== 'success' && 'Upload reference image to continue'}
              {imageUpload.status === 'success' && videoUpload.status !== 'success' && 'Upload motion video to continue'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
