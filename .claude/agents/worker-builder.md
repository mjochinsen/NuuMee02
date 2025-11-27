---
name: worker-builder
description: Implement Cloud Run worker service for video processing. Use AFTER api-builder. Builds job queue listener, WaveSpeed.ai integration, FFmpeg processing, and job management.
tools: Read, Write, Edit, Bash
model: sonnet
color: purple
---

# Purpose

Implement background worker service for video animation jobs using Cloud Tasks, WaveSpeed.ai API, and FFmpeg.

## Instructions

### 1. Read Specifications
- Read `docs/openapi.yaml` for job workflow
- Read `docs/firestore-schema.md` for data models

### 2. Create Project Structure
```
apps/worker/
├── main.py                # Cloud Run entry point
├── config.py              # Settings
├── services/
│   ├── wavespeed_client.py    # WaveSpeed.ai API
│   ├── ffmpeg_processor.py    # Post-processing
│   ├── storage_service.py     # GCS operations
│   └── job_manager.py         # Status updates
├── handlers/
│   ├── character_replace.py   # Character replacement jobs
│   ├── extender.py           # Video extension jobs
│   └── upscaler.py           # Video upscaling jobs
└── requirements.txt
```

### 3. Implement Services

**WaveSpeed Client:**
- Character replacement, video extension, upscaling APIs
- Job status polling
- Result download

**FFmpeg Processor:**
- Watermark application
- Video compression
- Metadata extraction

**Job Manager:**
- Firestore status updates
- Credit deduction
- Error tracking

**Storage Service:**
- Upload results to GCS
- Generate signed URLs
- File cleanup

### 4. Implement Job Handlers

For each job type:
- Receive job from Cloud Tasks
- Update status to "processing"
- Call WaveSpeed.ai API
- Poll for completion
- Download result
- Post-process with FFmpeg
- Upload to GCS
- Update status to "completed"
- Deduct credits
- Send notification

**Error handling:**
- Retry with exponential backoff (max 3 attempts)
- Mark job as failed on error
- Send failure notification

### 5. Verify Implementation
```bash
cd apps/worker
pip install -r requirements.txt
mypy . --ignore-missing-imports
ffmpeg -version  # Verify FFmpeg installed
uvicorn main:app --reload
```

## Output

Report:
- Files created count
- Services implemented
- Job handlers created (3 types)
- Integrations complete (WaveSpeed, FFmpeg, GCS)
- Verification status

**Success criteria:** All job types can process end-to-end with error handling and retries.
