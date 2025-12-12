# FFmpeg Worker Implementation Plan

**Task:** 11.2.3 (Auto Subtitles) + 11.2.4 (Watermark)
**Created:** 2025-12-12
**Status:** IN PROGRESS

---

## Overview

Create a separate Cloud Run service (`nuumee-ffmpeg-worker`) for FFmpeg-based post-processing:
- Auto Subtitles: STT transcription + ASS generation + subtitle burning
- Watermark: Logo overlay on videos

---

## Architecture Decision

| Decision | Choice | Reason |
|----------|--------|--------|
| Deployment | Separate Cloud Run service | Resource isolation, cost efficiency |
| Queue | Separate Cloud Tasks queue | Independent scaling |
| Memory | 1-2GB | FFmpeg processing needs |
| Shared code | Copy utilities (~50 lines) | Simplicity over DRY |

---

## Implementation Phases

### PHASE A: Infrastructure Setup (30 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| A.1 | Create `ffmpeg-worker/` directory structure | ✅ | |
| A.2 | Create Dockerfile with Python + FFmpeg + fonts | ✅ | |
| A.3 | Create requirements.txt | ✅ | |
| A.4 | Create basic Flask app (main.py) | ✅ | |
| A.5 | Copy shared utilities (GCS, Firestore) | ✅ | Inline in main.py |
| A.6 | **TEST:** Local build + health check | ✅ | FFmpeg 7.1.3, libass OK, 20 fonts |

### PHASE B: Cloud Tasks Queue (15 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| B.1 | Create Cloud Tasks queue `nuumee-ffmpeg-jobs` | ✅ | us-central1, max 5 concurrent |
| B.2 | Update backend to route subtitle/watermark jobs | ✅ | Added enqueue_ffmpeg_job() |
| B.3 | **TEST:** Job enqueue verification | ⬜ | Pending Cloud Run deploy |

### PHASE C: FFmpeg Verification (15 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| C.1 | Deploy minimal worker to Cloud Run | ✅ | us-central1 |
| C.2 | Add FFmpeg capability test endpoint | ✅ | /ffmpeg-check |
| C.3 | **TEST:** Verify libass + fonts available | ✅ | FFmpeg 7.1.3, libass OK, 20 fonts |
| C.4 | Test audio extraction command | ⬜ | Deferred to Phase F |

### PHASE D: Google STT Integration (45 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| D.1 | Add google-cloud-speech to requirements | ✅ | Already in requirements.txt |
| D.2 | Create `stt.py` module | ✅ | |
| D.3 | Implement sync transcribe (<60s videos) | ✅ | |
| D.4 | Implement async transcribe (60-120s videos) | ✅ | |
| D.5 | Add word-level timestamps extraction | ✅ | |
| D.6 | **TEST:** Transcribe sample audio file | ⬜ | Deferred to E2E test |

### PHASE E: ASS Subtitle Generator (45 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| E.1 | Create `subtitles.py` module | ✅ | |
| E.2 | Port ASS time formatting from JS | ✅ | to_ass_time() |
| E.3 | Create style definitions (Rainbow, Classic, Bold, Minimal) | ✅ | |
| E.4 | Implement `generate_ass()` function | ✅ | |
| E.5 | Add minimum word duration handling (0.2s) | ✅ | MIN_WORD_DURATION |
| E.6 | **TEST:** Generate ASS from sample timestamps | ⬜ | Deferred to E2E test |

### PHASE F: Subtitle Job Handler (1 hour) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| F.1 | Add `process_subtitles_job()` to main.py | ✅ | |
| F.2 | Implement video download from GCS | ✅ | |
| F.3 | Implement audio extraction (FFmpeg) | ✅ | |
| F.4 | Implement STT → ASS pipeline | ✅ | |
| F.5 | Implement subtitle burning (FFmpeg) | ✅ | |
| F.6 | Implement result upload to GCS | ✅ | |
| F.7 | Add Firestore status updates | ✅ | Via process_job() |
| F.8 | Add error handling + credit refund | ✅ | Via process_job() |
| F.9 | **TEST:** End-to-end subtitle job locally | ⬜ | Needs prod test |

### PHASE G: Watermark Handler (30 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| G.1 | Upload watermark PNG to GCS | ✅ | gs://nuumee-assets/assets/watermark.png |
| G.2 | Add `process_watermark_job()` to main.py | ✅ | |
| G.3 | Implement FFmpeg overlay filter | ✅ | filter_complex |
| G.4 | Configure position (bottom-right, 10% margin) | ✅ | 5% default |
| G.5 | Configure opacity (70%) | ✅ | 0.7 default |
| G.6 | **TEST:** End-to-end watermark job locally | ⬜ | Needs prod test |

### PHASE H: Backend Integration (30 min) ✅

| ID | Task | Status | Notes |
|----|------|--------|-------|
| H.1 | Add `subtitle_style` field to CreateJobRequest | ✅ | SubtitleStyle enum |
| H.2 | Add `watermark_enabled` field to CreateJobRequest | ✅ | PostProcessRequest |
| H.3 | Update job creation to route to FFmpeg queue | ✅ | POST /{job_id}/post-process |
| H.4 | Add pricing for subtitles (0 credits - free) | ✅ | FREE |
| H.5 | Add pricing for watermark (0 credits - free) | ✅ | FREE |
| H.6 | **TEST:** Create subtitle job via API | ⬜ | Needs deploy + test |

### PHASE I: Frontend UI (45 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| I.1 | Add subtitle style dropdown to PostProcessingOptions | ⬜ | |
| I.2 | Create style preview images (4 styles) | ⬜ | |
| I.3 | Add watermark toggle to PostProcessingOptions | ⬜ | |
| I.4 | Wire up to CreateJobRequest | ⬜ | |
| I.5 | Update api.ts types | ⬜ | |
| I.6 | **TEST:** UI renders correctly | ⬜ | |

### PHASE J: Production Deployment (30 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| J.1 | Deploy FFmpeg worker to Cloud Run | ⬜ | |
| J.2 | Configure memory (1GB) and timeout (5min) | ⬜ | |
| J.3 | Set environment variables | ⬜ | |
| J.4 | Deploy backend updates | ⬜ | |
| J.5 | Deploy frontend updates | ⬜ | |
| J.6 | **TEST:** End-to-end production test | ⬜ | |

### PHASE K: Documentation & Cleanup (15 min)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| K.1 | Update TASK_TRACKER.md (mark 11.2.3, 11.2.4 complete) | ⬜ | |
| K.2 | Add FFmpeg worker to CREDENTIALS_INVENTORY.md | ⬜ | |
| K.3 | Document subtitle styles in README or docs | ⬜ | |
| K.4 | `/remember` key learnings | ⬜ | |
| K.5 | Final commit + push | ⬜ | |

---

## File Structure

```
ffmpeg-worker/
├── Dockerfile
├── requirements.txt
├── main.py              # Flask app + job handlers
├── stt.py               # Google Speech-to-Text client
├── subtitles.py         # ASS generator + styles
├── watermark.py         # Watermark overlay logic
└── utils.py             # Shared utilities (GCS, Firestore)
```

---

## Subtitle Styles

| Style ID | Name | Description |
|----------|------|-------------|
| `rainbow` | Rainbow | Multi-color cycling (existing from n8n) |
| `classic` | Classic White | White text, black outline |
| `bold` | Bold Yellow | Yellow text, thick outline |
| `minimal` | Minimal | Small white text, subtle shadow |

---

## FFmpeg Commands Reference

### Audio Extraction
```bash
ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav
```

### Burn ASS Subtitles
```bash
ffmpeg -i video.mp4 -vf "ass=subtitles.ass" -c:v libx264 -crf 18 -c:a copy output.mp4
```

### Add Watermark
```bash
ffmpeg -i video.mp4 -i watermark.png -filter_complex "overlay=W-w-10:H-h-10:format=auto,format=yuv420p" -c:v libx264 -crf 18 -c:a copy output.mp4
```

---

## Environment Variables (FFmpeg Worker)

| Variable | Value | Notes |
|----------|-------|-------|
| `GCP_PROJECT` | `wanapi-prod` | |
| `OUTPUT_BUCKET` | `nuumee-outputs` | |
| `ASSETS_BUCKET` | `nuumee-assets` | For watermark |
| `PORT` | `8080` | Cloud Run default |

---

## Checkpoints

After each phase, commit progress:
- `git add -A && git commit -m "ffmpeg-worker: Phase X complete"`
- Update this file with status

---

## Rollback Plan

If issues arise:
1. Remove subtitle/watermark from PostProcessingOptions UI
2. Disable queue routing in backend
3. FFmpeg worker scales to zero (no cost)

---

## Success Criteria

- [ ] User can select subtitle style and generate subtitled video
- [ ] User can enable watermark on video
- [ ] Jobs complete within 2 minutes for 30s video
- [ ] Failed jobs refund credits
- [ ] Worker scales to zero when idle

---

## Current Progress

**Phase:** I (Frontend UI)
**Last Updated:** 2025-12-12
**Blocker:** None

### Completed
- Phase A: Infrastructure Setup ✅
- Phase B: Cloud Tasks Queue ✅
- Phase C: FFmpeg Verification ✅
  - Cloud Run: https://nuumee-ffmpeg-worker-450296399943.us-central1.run.app
- Phase D: Google STT Integration ✅
- Phase E: ASS Subtitle Generator ✅
- Phase F: Subtitle Job Handler ✅
- Phase G: Watermark Handler ✅
- Phase H: Backend Integration ✅
  - POST /jobs/{job_id}/post-process endpoint
  - PostProcessRequest, PostProcessResponse models
  - SubtitleStyle, PostProcessType enums
  - Free pricing for both features
