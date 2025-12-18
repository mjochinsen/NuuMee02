# Video Comparison Creation Guide

Guide for creating side-by-side comparison videos for the NuuMee website.

## Existing Videos

### hero-comparison.mp4 (Homepage Hero - Landscape)
- **Location:** `frontend/public/hero-comparison.mp4`
- **Dimensions:** 2560x720 (two 1280x720 landscape videos side by side)
- **Frame rate:** 25fps
- **Duration:** 8 seconds
- **Source videos:** `docs/tempDebug/LEFTSIDE.mp4` + `docs/tempDebug/RIGHTSIDE.mp4`

### hero-comparison-2.mp4 (Portrait Version)
- **Location:** `frontend/public/hero-comparison-2.mp4`
- **Dimensions:** 1440x1280 (two 720x1280 portrait videos side by side)
- **Frame rate:** 30fps
- **Duration:** 10 seconds
- **Size:** 8.0MB
- **Source videos:** `docs/tempDebug/LEFT1.mp4` + `docs/tempDebug/RIGHT1.mp4`
- **Created:** 2025-12-16
- **Command used:**
```bash
ffmpeg -y \
  -i docs/tempDebug/LEFT1.mp4 \
  -i docs/tempDebug/RIGHT1.mp4 \
  -filter_complex "\
    [0:v]scale=720:-2,trim=0:10,setpts=PTS-STARTPTS[left];\
    [1:v]scale=720:-2,trim=0:10,setpts=PTS-STARTPTS[right];\
    [left][right]hstack=inputs=2" \
  -c:v libx264 -crf 20 -preset medium \
  -movflags +faststart \
  -an \
  frontend/public/hero-comparison-2.mp4
```

## FFmpeg Commands

### Landscape Videos (16:9 or similar)
For two landscape videos of equal dimensions:

```bash
ffmpeg -i LEFT.mp4 -i RIGHT.mp4 \
  -filter_complex "[0:v][1:v]hstack=inputs=2" \
  -c:v libx264 -crf 23 -preset medium \
  -an \
  output.mp4
```

### Portrait Videos (9:16)
For two portrait videos (720x1280 each), creating a 1440x1280 output:

```bash
ffmpeg -i LEFT.mp4 -i RIGHT.mp4 \
  -filter_complex "[0:v][1:v]hstack=inputs=2" \
  -c:v libx264 -crf 23 -preset medium \
  -an \
  output.mp4
```

### With Scaling (for web optimization)
Scale output to specific width while maintaining aspect ratio:

```bash
ffmpeg -i LEFT.mp4 -i RIGHT.mp4 \
  -filter_complex "[0:v]scale=640:-2[left];[1:v]scale=640:-2[right];[left][right]hstack=inputs=2" \
  -c:v libx264 -crf 23 -preset medium \
  -an \
  output.mp4
```

### With Duration Trimming
Trim to specific duration (e.g., first 10 seconds):

```bash
ffmpeg -i LEFT.mp4 -i RIGHT.mp4 \
  -filter_complex "[0:v]trim=0:10,setpts=PTS-STARTPTS[left];[1:v]trim=0:10,setpts=PTS-STARTPTS[right];[left][right]hstack=inputs=2" \
  -c:v libx264 -crf 23 -preset medium \
  -an \
  output.mp4
```

### Full Featured Command
Scale, trim, and loop-friendly:

```bash
ffmpeg -i LEFT.mp4 -i RIGHT.mp4 \
  -filter_complex "\
    [0:v]scale=720:-2,trim=0:10,setpts=PTS-STARTPTS[left];\
    [1:v]scale=720:-2,trim=0:10,setpts=PTS-STARTPTS[right];\
    [left][right]hstack=inputs=2" \
  -c:v libx264 -crf 20 -preset medium \
  -movflags +faststart \
  -an \
  output.mp4
```

## Parameters Explained

| Parameter | Description |
|-----------|-------------|
| `hstack=inputs=2` | Horizontally stack 2 videos |
| `scale=W:-2` | Scale to width W, height auto (divisible by 2) |
| `trim=start:end` | Trim video from start to end seconds |
| `setpts=PTS-STARTPTS` | Reset timestamps after trim |
| `-crf 20-23` | Quality (lower = better, 18-23 recommended) |
| `-preset medium` | Encoding speed/quality balance |
| `-movflags +faststart` | Enable web streaming |
| `-an` | Remove audio |

## Usage on Website

```html
<video autoplay loop muted playsinline class="w-full h-auto">
  <source src="/hero-comparison.mp4" type="video/mp4">
</video>
```

**Important:** Always include `muted` for autoplay to work in browsers.
