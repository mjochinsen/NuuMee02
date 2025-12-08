# Jobs Collection Schema

**Collection:** `jobs/{jobId}`
**Purpose:** Video generation jobs and post-processing

## Document Structure

```typescript
{
  // Identity
  job_id: string,                     // Auto-generated (doc ID)
  user_id: string,                    // Owner (indexed)
  parent_job_id: string | null,       // If post-processing
  job_type: "base" | "extend" | "upscale" | "subtitles" | "audio",

  // Status
  status: "pending" | "processing" | "completed" | "failed",
  progress: number,                   // 0-100
  progress_text: string | null,
  queue_position: number | null,

  // Timing
  created_at: timestamp,
  updated_at: timestamp,
  started_at: timestamp | null,
  completed_at: timestamp | null,
  estimated_time_remaining: string | null,
  processing_time_seconds: number | null,

  // Input
  input: {
    ref_image_gcs_path: string,       // gs://nuumee-66a48-inputs/...
    motion_video_gcs_path: string,
  },

  // Options
  options: {
    resolution: "480p" | "720p",
    video_quality: "high" | "ultra",
    safety_checker_image: boolean,
    safety_checker_video: boolean,
    advanced: {
      seed: number | null,
      inference_steps: number,        // 10-50, default 20
      cfg_scale: number,              // 0.5-2.0, default 1.0
    },
  },

  // Output (only when completed)
  output: {
    video_url: string,                // Signed URL (7 days)
    video_url_expires_at: timestamp,
    gcs_path: string,
    duration_seconds: number,
    file_size_bytes: number,
  } | null,

  // Credits
  credits_charged: number,
  estimated_seconds: number,

  // Error Handling
  error_message: string | null,
  error_code: string | null,
  retry_count: number,

  // Metadata
  watermark_applied: boolean,         // Auto-true for free tier
  deleted_at: timestamp | null,       // Soft delete
}
```

## Indexes

- Composite: `user_id ASC, created_at DESC`
- Composite: `user_id ASC, status ASC, created_at DESC`
- Composite: `status ASC, created_at DESC` (queue management)
