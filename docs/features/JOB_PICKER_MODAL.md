# Job Picker Modal - Implementation Plan

## Overview

Allow users to select a completed job's output video as the motion source for a new job, enabling multi-step video processing pipelines.

**Example Use Case:** User creates a video (Job A), then wants to use that output as input for a new job (Job B) with different settings or post-processing.

## Current Architecture

```
/videos/create page
    ↓
Upload reference image → GCS (nuumee-images bucket)
Upload motion video → GCS (nuumee-videos bucket)
    ↓
createJob API
    ↓
Worker processes → Output to GCS (nuumee-outputs bucket)
```

## Proposed Change

```
/videos/create page
    ↓
Upload reference image → GCS (nuumee-images bucket)
┌─────────────────────────────────────────┐
│ Motion Source (choose one):             │
│ [📁 Upload File] [🎬 From My Jobs]      │
└─────────────────────────────────────────┘
    ↓                    ↓
Upload to GCS     Select from JobPickerModal
    ↓                    ↓
createJob API (motion_video_path can be either)
```

## Components

### 1. JobPickerModal.tsx (New)

**Location:** `frontend/components/JobPickerModal.tsx`

**Props:**
```typescript
interface JobPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (job: JobResponse, thumbnailUrl: string) => void;
}
```

**Features:**
- Grid of completed job thumbnails (3 columns on desktop, 2 on mobile)
- Pagination (12 jobs per page)
- Search by job ID
- Hover to preview video (muted autoplay)
- Click card to select
- Empty state: "No completed videos yet. Create one first!"
- Loading state: Skeleton grid

**UI Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Select from Your Videos                              [X] │
├──────────────────────────────────────────────────────────┤
│ [🔍 Search jobs...]                                      │
├──────────────────────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│ │ Video 1 │  │ Video 2 │  │ Video 3 │                   │
│ │ 720p    │  │ 480p    │  │ 720p    │                   │
│ │ Dec 5   │  │ Dec 4   │  │ Dec 3   │                   │
│ └─────────┘  └─────────┘  └─────────┘                   │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│ │ Video 4 │  │ Video 5 │  │ Video 6 │                   │
│ └─────────┘  └─────────┘  └─────────┘                   │
├──────────────────────────────────────────────────────────┤
│                    [< 1 2 3 >]                           │
└──────────────────────────────────────────────────────────┘
```

### 2. videos/create/page.tsx (Modify)

**New State:**
```typescript
// Existing
const [motionVideo, setMotionVideo] = useState<File | null>(null);
const [motionVideoPreview, setMotionVideoPreview] = useState<string | null>(null);

// New
const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
const [selectedJobThumbnail, setSelectedJobThumbnail] = useState<string | null>(null);
const [jobPickerOpen, setJobPickerOpen] = useState(false);
```

**Motion Source Selection:**
- Two buttons: "Upload File" and "From My Jobs"
- If file uploaded: show file preview (current behavior)
- If job selected: show job thumbnail + "Selected from Job #xyz"
- Clear one when other is set

**handleGenerate() modifications:**
```typescript
// Get motion video path
let motionVideoPath: string;

if (selectedJob) {
  // Use output from previous job
  motionVideoPath = selectedJob.output_video_path!;
} else if (motionVideo) {
  // Upload new file
  const videoSignedUrl = await getSignedUrl({...});
  await uploadToGCS(motionVideo, videoSignedUrl.upload_url, ...);
  motionVideoPath = videoSignedUrl.file_path;
} else {
  setGenerateError('Please select a motion source');
  return;
}
```

### 3. Backend Security Validation (New)

**Location:** `backend/app/jobs/router.py` - `create_job` endpoint

**Validation Logic:**
```python
def validate_video_path_ownership(path: str, user_id: str, db) -> None:
    """Validate that the video path belongs to the current user."""

    # Output videos from previous jobs
    if path.startswith("outputs/"):
        # Format: outputs/{user_id}/{job_id}/output.mp4
        parts = path.split("/")
        if len(parts) < 3:
            raise HTTPException(400, "Invalid output path format")
        path_user_id = parts[1]
        if path_user_id != user_id:
            raise HTTPException(403, "Cannot use another user's video output")
        return

    # Uploaded videos
    if path.startswith("uploads/"):
        # Format: uploads/{user_id}/...
        parts = path.split("/")
        if len(parts) < 2:
            raise HTTPException(400, "Invalid upload path format")
        path_user_id = parts[1]
        if path_user_id != user_id:
            raise HTTPException(403, "Cannot use another user's uploaded files")
        return

    # Unknown path format
    raise HTTPException(400, f"Invalid video path format: {path}")
```

## API Endpoints Used

No new endpoints needed:

| Endpoint | Use |
|----------|-----|
| `GET /jobs?status=completed` | List completed jobs for picker |
| `GET /jobs/{id}/thumbnails` | Get thumbnail URLs for previews |
| `POST /jobs` | Create new job (existing, add validation) |

## Data Flow

```
1. User clicks "From My Jobs" button
   ↓
2. JobPickerModal opens
   ↓
3. Modal fetches: getJobs(page=1, status='completed')
   ↓
4. For each job in view, fetch: getJobThumbnails(jobId)
   ↓
5. User hovers over card → video thumbnail autoplays
   ↓
6. User clicks card
   ↓
7. Modal calls onSelect(job, outputThumbnailUrl) and closes
   ↓
8. Create page shows: "Using output from job {short_id}"
   ↓
9. User uploads reference image (required)
   ↓
10. User clicks "Generate Video"
    ↓
11. Frontend sends createJob() with:
    - reference_image_path: newly uploaded
    - motion_video_path: selected job's output_video_path
    ↓
12. Backend validates motion_video_path ownership
    ↓
13. Job created, worker processes
```

## Security Considerations

1. **Path ownership validation** - Backend MUST verify GCS paths belong to current user
2. **Output paths** - Only allow `outputs/{user_id}/...` paths from user's own completed jobs
3. **Upload paths** - Only allow `uploads/{user_id}/...` paths from user's own uploads
4. **No local paths** - Reject any local file system paths (prevent abuse)

## Edge Cases

| Case | Handling |
|------|----------|
| No completed jobs | Empty state with CTA |
| Job deleted after selection | Validation error on submit |
| Very long job list | Pagination (12 per page) |
| Slow thumbnail loading | Skeleton loaders |
| Failed thumbnail fetch | Show placeholder icon |

## Files to Modify/Create

| File | Action |
|------|--------|
| `frontend/components/JobPickerModal.tsx` | CREATE |
| `frontend/app/(dashboard)/videos/create/page.tsx` | MODIFY |
| `backend/app/jobs/router.py` | MODIFY |
| `docs/features/JOB_PICKER_MODAL.md` | CREATE (this file) |
| `docs/TASK_TRACKER.md` | UPDATE |

## Testing Checklist

- [ ] Modal opens when clicking "From My Jobs"
- [ ] Completed jobs load with thumbnails
- [ ] Pagination works
- [ ] Search filters jobs
- [ ] Hover shows video preview
- [ ] Clicking job selects it and closes modal
- [ ] Create page shows selected job info
- [ ] Can switch between upload and job selection
- [ ] Generate works with selected job
- [ ] Backend rejects other user's paths
- [ ] Backend accepts own output paths
- [ ] Empty state shows when no completed jobs

## Estimated Time

- JobPickerModal.tsx: 45 min
- videos/create/page.tsx modifications: 30 min
- Backend validation: 20 min
- Testing: 20 min
- **Total: ~2 hours**
