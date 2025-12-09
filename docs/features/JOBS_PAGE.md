# Jobs Page Feature

## Overview

The Jobs page (`/jobs`) displays all video generation jobs for the authenticated user with rich media previews, management actions, and real-time status updates.

## Architecture

```
Frontend (Next.js)                    Backend (FastAPI)                    Storage (GCS)
┌─────────────────┐                  ┌─────────────────┐                  ┌─────────────────┐
│ /jobs page      │ ──API calls───▶ │ /jobs endpoints │ ──signed URLs──▶ │ nuumee-images/  │
│                 │                  │                 │                  │ nuumee-videos/  │
│ • Job cards     │ ◀──JSON+URLs─── │ • list_jobs     │                  │ nuumee-outputs/ │
│ • Thumbnails    │                  │ • get_thumbnails│                  │                 │
│ • Preview modal │                  │ • delete_job    │                  │                 │
│ • Actions       │                  │ • get_output    │                  │                 │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/jobs` | GET | List jobs with pagination & status filter |
| `/jobs/{id}/thumbnails` | GET | Get signed URLs for REF, SRC, OUTPUT media |
| `/jobs/{id}/output` | GET | Get download URL for completed video |
| `/jobs/{id}` | DELETE | Soft delete job + cleanup GCS files |

## GCS Bucket Mapping

| Media Type | Bucket | Path Format |
|------------|--------|-------------|
| Reference Image | `nuumee-images` | `{user_id}/{job_id}/reference.{ext}` |
| Source Video | `nuumee-videos` | `{user_id}/{job_id}/motion.{ext}` |
| Output Video | `nuumee-outputs` | `{user_id}/{job_id}/output.mp4` |

## UI Components

### Job Card
Each job displays:
- **Thumbnails** (144x144px tiles):
  - REF - Reference image (click to preview)
  - SRC - Source motion video (hover to play, click to preview)
  - OUTPUT - Generated result (only for completed jobs, cyan border)
- **Job metadata**: ID, status badge, timestamp, resolution, credits
- **Action buttons** (completed jobs): Details, Download, Copy Link, Delete
- **Processing/Queued jobs**: Elapsed time display (e.g., "Processing... 2m 30s")

### Job Details Modal
Simplified modal showing:
- Thumbnails row: Reference, Source Video, Output (if completed)
- Video Type, Resolution, Credits Used
- Created/Completed timestamps
- Download + Copy Link buttons

### Media Preview Modal
- Opens on tile click
- Full-size media display (max 70vh)
- Video: autoplay with controls
- Image: centered with object-contain

### Status Badges
| Status | Icon | Color |
|--------|------|-------|
| Completed | ✅ | Green |
| Processing | ⏳ | Amber (pulsing) |
| Failed | ❌ | Red |
| Queued | ⏸️ | Blue |
| Pending | 🕐 | Yellow |

## Features

### Auto-refresh
Jobs with `processing`, `queued`, or `pending` status trigger automatic polling every 10 seconds.

### Thumbnail Loading
- Skeleton animation during load
- Parallel fetch for visible jobs
- Cached in component state
- Signed URLs valid for 1 hour

### Delete Flow
1. User clicks trash icon
2. Confirmation dialog with warnings
3. Backend soft-deletes (sets `deleted_at`)
4. GCS files deleted from all 3 buckets
5. Toast notification on success/failure

### Video Playback
- **Thumbnail hover**: Muted autoplay preview
- **Modal**: Full controls, autoplay, playsInline for mobile

### Clean Shareable URLs
Completed jobs get a `short_id` (8-char UUID) enabling clean share URLs:
```
https://nuumee.ai/v/25ca1d0f
```
See [CLEAN_VIDEO_URLS.md](./CLEAN_VIDEO_URLS.md) for full documentation.

### Elapsed Time Display
Processing and queued jobs show elapsed time instead of action buttons:
```
Processing... 2m 30s
Queued... 45s
```
Time updates on each 10-second auto-refresh.

## State Management

```typescript
// Key state variables
const [jobs, setJobs] = useState<Job[]>([]);
const [thumbnails, setThumbnails] = useState<Record<string, JobThumbnailsResponse>>({});
const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());
const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);
const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
```

## File Locations

| File | Purpose |
|------|---------|
| `frontend/app/(dashboard)/jobs/page.tsx` | Main jobs page component |
| `frontend/lib/api.ts` | API client functions |
| `backend/app/jobs/router.py` | FastAPI job endpoints |

## Security

- All endpoints require Firebase Auth token
- Job ownership verified before any operation
- Signed URLs expire after 1 hour
- Soft delete preserves audit trail
