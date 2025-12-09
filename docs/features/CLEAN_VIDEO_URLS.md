# Clean Shareable Video URLs

## Overview

Instead of long, ugly GCS signed URLs, NuuMee now generates clean shareable URLs like:

```
https://nuumee.ai/v/25ca1d0f
```

This replaces the previous approach of sharing signed URLs that:
- Expire after 1 hour
- Are 200+ characters long
- Look unprofessional when shared on social media

## How It Works

### 1. Short ID Generation

When a job completes successfully, the backend generates an 8-character short ID:

```python
# backend/app/jobs/router.py
short_id = str(uuid.uuid4())[:8]  # e.g., "25ca1d0f"
```

This is stored in the Firestore job document:
```json
{
  "id": "abc123...",
  "short_id": "25ca1d0f",
  "status": "completed",
  ...
}
```

### 2. Public Video API

A new public endpoint serves video info without authentication:

```
GET /api/v1/public/video/{short_id}
```

Response:
```json
{
  "short_id": "25ca1d0f",
  "video_url": "https://storage.googleapis.com/...(signed URL)",
  "resolution": "720p",
  "created_at": "2024-01-15T10:30:00Z",
  "view_count": 42,
  "expires_in_seconds": 3600
}
```

The endpoint:
- Looks up the job by `short_id`
- Generates a fresh signed URL for the video
- Increments the view count
- Returns video metadata

### 3. Public Video Player Page

A Next.js page at `/v/{shortId}` displays the video:

```
frontend/app/v/page.tsx
```

Features:
- Clean NuuMee branding
- Video player with controls
- View count display
- Download button
- CTA to create your own videos
- Mobile-friendly design

### 4. Firebase Hosting Rewrite

The `firebase.json` includes a rewrite rule:

```json
{
  "source": "/v/**",
  "destination": "/v/index.html"
}
```

This allows client-side routing to handle the short ID.

## Architecture

```
User clicks "Copy Link"
         │
         ▼
https://nuumee.ai/v/25ca1d0f
         │
         ▼
Firebase Hosting → /v/index.html (Next.js static page)
         │
         ▼
Client extracts shortId from URL
         │
         ▼
Fetch: GET /api/v1/public/video/25ca1d0f
         │
         ▼
Backend: Look up job, generate signed URL, increment views
         │
         ▼
Response: video_url, metadata
         │
         ▼
Video player renders with fresh signed URL
```

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/public/video/{short_id}` | None | Get video info + signed URL |
| `GET /api/v1/jobs` | Required | Lists jobs with `share_url` field |

## Frontend Integration

### Jobs Page - Copy Link Button

```tsx
<Button onClick={() => {
  const url = job.shareUrl || `${window.location.origin}/jobs/${job.id}`;
  navigator.clipboard.writeText(url);
  toast.success('Link copied to clipboard');
}}>
  <Copy className="w-4 h-4 mr-1" />
  Copy Link
</Button>
```

The `shareUrl` is computed from `short_id`:
```typescript
// frontend/lib/api.ts
share_url: job.short_id ? `https://nuumee.ai/v/${job.short_id}` : null
```

### Job Details Modal

Also includes Copy Link button with same functionality.

## Files Changed

| File | Changes |
|------|---------|
| `backend/app/jobs/models.py` | Added `short_id` and `view_count` fields |
| `backend/app/jobs/router.py` | Generate `short_id` on job completion |
| `backend/app/public/router.py` | New public video endpoint |
| `backend/app/main.py` | Register public router |
| `frontend/app/v/page.tsx` | Public video player page |
| `frontend/app/(dashboard)/jobs/page.tsx` | Copy Link button |
| `frontend/lib/api.ts` | Added `share_url` field mapping |
| `firebase.json` | Added `/v/**` rewrite rule |

## Benefits

1. **Professional sharing** - Clean URLs look better on social media
2. **Never expire** - The page generates fresh signed URLs on each view
3. **Analytics** - View count tracking built in
4. **Marketing** - Public page promotes NuuMee with CTAs
5. **SEO potential** - Public pages can be indexed (future)

## Security Notes

- Video files remain in private GCS buckets
- Signed URLs generated on-demand, expire in 1 hour
- No authentication required to view (intentional for sharing)
- Job owner can delete the job to invalidate the share link
