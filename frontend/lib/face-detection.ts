/**
 * Face Detection Utility
 *
 * Currently uses a simple frame extraction approach.
 * Can be upgraded to MediaPipe when package compatibility is resolved.
 *
 * The goal is to:
 * 1. Extract a frame from the video at a given timestamp
 * 2. Optionally detect faces (when MediaPipe is available)
 * 3. Return the frame for AI image generation input
 */

export interface FaceDetectionResult {
  frameDataUrl: string;
  faceDetected: boolean | null; // null = detection not available
  faceCount: number | null;
  boundingBox?: { x: number; y: number; width: number; height: number };
  warning?: string;
}

/**
 * Extract a frame from a video element at the current time
 */
export function extractVideoFrame(
  video: HTMLVideoElement,
  targetWidth: number = 512
): string | null {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = video.videoWidth / video.videoHeight;
    const width = targetWidth;
    const height = Math.round(targetWidth / aspectRatio);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (error) {
    console.error('[FaceDetection] Frame extraction failed:', error);
    return null;
  }
}

/**
 * Extract a frame at a specific timestamp
 */
export async function extractFrameAtTime(
  video: HTMLVideoElement,
  timestamp: number,
  targetWidth: number = 512
): Promise<string | null> {
  return new Promise((resolve) => {
    const originalTime = video.currentTime;

    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      const frame = extractVideoFrame(video, targetWidth);
      // Restore original position
      video.currentTime = originalTime;
      resolve(frame);
    };

    video.addEventListener('seeked', handleSeeked);
    video.currentTime = timestamp;

    // Timeout fallback
    setTimeout(() => {
      video.removeEventListener('seeked', handleSeeked);
      resolve(null);
    }, 3000);
  });
}

/**
 * Analyze a frame for face presence
 * Currently returns a basic analysis; can be upgraded to use MediaPipe
 */
export async function analyzeFrame(
  frameDataUrl: string
): Promise<FaceDetectionResult> {
  // For now, return a placeholder result
  // This will be upgraded to actual face detection with MediaPipe
  return {
    frameDataUrl,
    faceDetected: null, // Detection not available yet
    faceCount: null,
    warning: undefined, // No warning since we can't detect
  };
}

/**
 * Combined function: extract frame and analyze
 */
export async function extractAndAnalyzeFrame(
  video: HTMLVideoElement,
  timestamp: number
): Promise<FaceDetectionResult | null> {
  const frameDataUrl = await extractFrameAtTime(video, timestamp);
  if (!frameDataUrl) {
    return null;
  }

  return analyzeFrame(frameDataUrl);
}

/**
 * Get a recommendation message based on face detection result
 */
export function getFaceWarningMessage(result: FaceDetectionResult): string | null {
  if (result.faceDetected === null) {
    // Detection not available - no warning needed
    return null;
  }

  if (!result.faceDetected) {
    return "We couldn't detect a clear face in this frame. Make sure a face is visible in your video.";
  }

  if (result.faceCount !== null && result.faceCount > 1) {
    return `Multiple faces detected (${result.faceCount}). For best results, use a video with a single person.`;
  }

  return null;
}
