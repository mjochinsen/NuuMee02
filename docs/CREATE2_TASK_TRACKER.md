# /videos/create2 Task Tracker

**Status:** 🟢 Core MVP Complete
**Last Updated:** 2025-12-27
**Recovery:** Each task is independent and can be resumed after interruption
**Access:** `/videos/create2?dev=1` (dev-only gate active)

---

## Phase 1: Foundation & Page Scaffold
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 1.1 Create `/videos/create2/page.tsx` scaffold | ✅ | 15m | Complete with all components inline |
| 1.2 Add route to navigation (hidden, dev only) | ✅ | 5m | `?dev=1` access gate working |
| 1.3 Create `ValidationBanner.tsx` component | ✅ | 20m | Pre-education banner with tips |
| 1.4 Add visual examples modal | ✅ | 20m | Good/bad examples for video & images |

**Checkpoint 1:** Page loads, shows pre-education banner ✅

---

## Phase 2: Video Upload & Preview
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 2.1 Create `VideoUploader.tsx` component | ✅ | 30m | VideoUploadZone with drag & drop |
| 2.2 Add duration check (< 4 min limit) | ✅ | 15m | Validates on upload |
| 2.3 Create video preview player | ✅ | 20m | VideoPreview component |
| 2.4 Extract frame at 2-second mark | ✅ | 20m | Using lib/face-detection.ts |

**Checkpoint 2:** Can upload video, see preview, frame extracted ✅

---

## Phase 3: Trim UI
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 3.1 Create `VideoTrimmer.tsx` component | ✅ | 45m | VideoTimeline with thumbnails |
| 3.2 Implement start/end markers | ✅ | 30m | Draggable handles with mouse/touch |
| 3.3 Add credit-based max length calc | ✅ | 20m | getMaxTrimSeconds() function |
| 3.4 Show real-time trim duration | ✅ | 15m | TrimControls shows "Xs selected (max: Ys)" |
| 3.5 Validate min 4s, max 120s | ✅ | 10m | Error states shown |
| 3.6 Preview trimmed segment | ⬜ | 20m | Not implemented - full video plays |

**Checkpoint 3:** Can trim video, shows duration, respects limits ✅

---

## Phase 4: Face Detection (MediaPipe)
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 4.1 Install @mediapipe/tasks-vision | ⏸️ | 10m | Skipped - Node v24 incompatible |
| 4.2 Create `useFaceDetection.ts` hook | ⏸️ | 30m | Deferred to future |
| 4.3 Detect face in video frame | ⏸️ | 20m | Frame extraction works, detection deferred |
| 4.4 Show warning if no face | ⏸️ | 15m | UI ready, detection not connected |
| 4.5 Detect face in uploaded image | ⏸️ | 15m | Deferred |

**Checkpoint 4:** Face detection deferred - frame extraction works ⏸️

---

## Phase 5: AI Image Generation (Backend)
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 5.1 Create `/api/v1/ai/face-enhance` endpoint | ⬜ | 45m | Not started |
| 5.2 Integrate Gemini 2.5 Flash Image API | ⬜ | 30m | Not started |
| 5.3 Store generated images in GCS | ⬜ | 20m | Not started |
| 5.4 Return signed URLs to frontend | ⬜ | 15m | Not started |

**Checkpoint 5:** AI image generation not started ⬜

---

## Phase 6: Image Selection UI
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 6.1 Create `FaceImageSelector.tsx` | ✅ | 30m | Component complete |
| 6.2 Connect to backend face-enhance API | ⬜ | 20m | API not built yet |
| 6.3 Add loading states | ✅ | 15m | Skeleton loaders in place |
| 6.4 Implement image selection | ✅ | 15m | Radio-style selection working |
| 6.5 Keep "Upload Own" option | ✅ | 15m | File picker working |

**Checkpoint 6:** UI ready, uses extracted frame or custom upload ✅

---

## Phase 7: Integration & Generate Flow
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 7.1 Wire up all components | ✅ | 30m | State management complete |
| 7.2 Calculate credit cost dynamically | ✅ | 15m | Based on trim + resolution |
| 7.3 Connect to existing create job API | ✅ | 20m | handleGenerate() implemented |
| 7.4 Pass trim start/end to backend | ✅ | 20m | Uses motion_video_duration_seconds |
| 7.5 Add loading/success/error states | ✅ | 20m | Upload progress UI with bars |

**Checkpoint 7:** Full flow works end-to-end ✅

---

## Phase 8: A/B Testing Setup
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 8.1 Upload hero-v5.mp4 to public folder | ⬜ | 10m | Needs IndianGamerSideBySide.mp4 |
| 8.2 Set up Firebase Remote Config | ⬜ | 20m | Console config needed |
| 8.3 Create `lib/ab-testing.ts` | ✅ | 20m | Flexible experiment infrastructure |
| 8.4 Update home page hero section | ✅ | 20m | Dynamic video source with useExperiment |
| 8.5 Add analytics events | ✅ | 15m | trackExperimentConversion() in place |

**Checkpoint 8:** Code ready, needs Firebase Console setup ⏸️

---

## Phase 9: Polish & Mobile
| Task | Status | Est. | Notes |
|------|--------|------|-------|
| 9.1 Mobile-responsive trim UI | ✅ | 30m | Touch events on handles |
| 9.2 Performance optimization | ⬜ | 20m | Not started |
| 9.3 Error boundary & fallbacks | ⬜ | 20m | Not started |
| 9.4 Accessibility audit | ⬜ | 20m | Not started |
| 9.5 Final QA pass | ⬜ | 30m | Not started |

**Checkpoint 9:** Basic mobile support in place ⏸️

---

## Recovery Instructions

If interrupted at any phase:
1. Check this tracker for current status
2. Run `git status` to see uncommitted changes
3. Each checkpoint represents a deployable state
4. Tasks within a phase can be done in any order
5. Use `git stash` if needed, resume with `git stash pop`

## Progress Summary

| Phase | Tasks | Done | Progress |
|-------|-------|------|----------|
| 1. Foundation | 4 | 4 | 100% |
| 2. Video Upload | 4 | 4 | 100% |
| 3. Trim UI | 6 | 5 | 83% |
| 4. Face Detection | 5 | 0 | 0% (deferred) |
| 5. AI Backend | 4 | 0 | 0% |
| 6. Image Selection | 5 | 4 | 80% |
| 7. Integration | 5 | 5 | 100% |
| 8. A/B Testing | 5 | 3 | 60% |
| 9. Polish | 5 | 1 | 20% |
| **TOTAL** | **43** | **26** | **60%** |

---

## What's Working Now

✅ **Core Flow**: Upload video → Trim → Select face (extracted or custom) → Generate
✅ **Upload Progress**: Real-time progress bars for video and image uploads
✅ **Credit Calculation**: Dynamic cost based on trim duration and resolution
✅ **Job Creation**: Calls existing API, redirects to /videos on success
✅ **A/B Testing Code**: Infrastructure ready, needs Firebase Console config

## What's Deferred

⏸️ **Face Detection**: MediaPipe incompatible with Node v24, utility ready for future
⏸️ **AI Image Generation**: Backend endpoint not built
⏸️ **Firebase Remote Config**: Needs console setup for A/B test to activate
