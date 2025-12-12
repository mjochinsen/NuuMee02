# Subtitle Styles Configuration Guide

This document explains how to customize subtitle appearance for NuuMee's auto-subtitle feature without redeploying the FFmpeg worker.

## Overview

Subtitle styles are stored in a JSON config file in Google Cloud Storage. The FFmpeg worker loads this config at runtime, so you can tweak styles by simply editing and re-uploading the file.

**Config location:** `gs://nuumee-assets/config/subtitle-styles.json`

## Quick Start: Editing Styles

```bash
# 1. Download current config
gsutil cp gs://nuumee-assets/config/subtitle-styles.json .

# 2. Edit the file (see format below)
nano subtitle-styles.json  # or use any editor

# 3. Upload back to GCS
gsutil cp subtitle-styles.json gs://nuumee-assets/config/subtitle-styles.json
```

Changes take effect on the next subtitle job (worker caches styles per instance).

## Config File Structure

```json
{
  "default_style": "classic",
  "min_word_duration": 0.2,

  "styles": {
    "style_id": {
      "name": "Display Name",
      "description": "Description shown to users",
      "is_multi_style": false,
      "ass_styles": ["Style: ..."],
      "style_names": ["Default"]
    }
  }
}
```

## ASS Style Format

Each style line follows the ASS format:

```
Style: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
```

### Key Parameters

| Parameter | Position | Description | Common Values |
|-----------|----------|-------------|---------------|
| Name | 1 | Style name reference | `Default`, `Rainbow1` |
| Fontname | 2 | Font family | `DejaVu Sans` |
| Fontsize | 3 | Size (1080p relative) | 18-32 |
| PrimaryColour | 4 | Text color (BGR) | `&H00FFFFFF` (white) |
| OutlineColour | 6 | Outline color | `&H00000000` (black) |
| BackColour | 7 | Shadow color | `&H80000000` (semi-transparent) |
| Bold | 8 | Bold text | 0 or 1 |
| Outline | 17 | Outline thickness | 1-4 |
| Shadow | 18 | Shadow distance | 0-3 |
| Alignment | 19 | Position | 2 (bottom center) |
| MarginV | 22 | Vertical margin | 30-80 |

### Color Format (BGR)

ASS uses `&HAABBGGRR` format (not RGB!):
- `AA` = Alpha (00=opaque, FF=transparent)
- `BB` = Blue
- `GG` = Green
- `RR` = Red

**Common colors:**
| Color | ASS Code |
|-------|----------|
| White | `&H00FFFFFF` |
| Yellow | `&H0000FFFF` |
| Orange | `&H000080FF` |
| Red | `&H000000FF` |
| Green | `&H0000FF00` |
| Blue | `&H00FF0000` |
| Black | `&H00000000` |
| Semi-transparent black | `&H80000000` |

### Alignment Values

```
7 = Top Left      8 = Top Center      9 = Top Right
4 = Middle Left   5 = Middle Center   6 = Middle Right
1 = Bottom Left   2 = Bottom Center   3 = Bottom Right
```

## Available Styles

| Style ID | Name | Description |
|----------|------|-------------|
| `classic` | Classic White | White text, black outline - clean and readable |
| `bold` | Bold Yellow | Yellow text, thick outline - high visibility |
| `minimal` | Minimal | Small white text, subtle shadow - unobtrusive |
| `large` | Large | Extra large for mobile viewing |
| `rainbow` | Rainbow | Multi-color cycling text (4 rotating colors) |

## Example: Making Subtitles Larger

Edit the `classic` style in the config:

```json
"classic": {
  "name": "Classic White",
  "description": "White text with black outline - clean and readable",
  "is_multi_style": false,
  "ass_styles": [
    "Style: Default,DejaVu Sans,28,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,20,20,50,1"
  ],
  "style_names": ["Default"]
}
```

Changed: `Fontsize` 24→28, `Outline` 2→3, `MarginV` 40→50

## Example: Adding a New Style

```json
"neon": {
  "name": "Neon Green",
  "description": "Bright green text with glow effect",
  "is_multi_style": false,
  "ass_styles": [
    "Style: Default,DejaVu Sans,26,&H0000FF00,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,2,2,20,20,45,1"
  ],
  "style_names": ["Default"]
}
```

Note: New styles need to be added to the frontend dropdown to be selectable by users.

## Frontend Style Mapping

The frontend maps UI style names to backend style IDs:

| Frontend Style | Backend Style ID |
|----------------|------------------|
| Bold Modern | `bold` |
| Classic | `classic` |
| Minimal | `minimal` |
| Boxed | `classic` |
| Outlined | `rainbow` |

See `frontend/components/PostProcessingOptions.tsx` for the mapping.

## Troubleshooting

**Changes not appearing:**
- Worker caches styles per instance. New jobs will use the updated config.
- For immediate effect, redeploy the worker (forces new instances).

**Style not rendering correctly:**
- Check ASS format - all 24 parameters must be present
- Verify color format is BGR, not RGB
- Test with a simple style first

**Worker using fallback styles:**
- Check GCS permissions: worker service account needs `objectViewer` on `nuumee-assets`
- Verify file exists: `gsutil ls gs://nuumee-assets/config/subtitle-styles.json`

## Files

| File | Purpose |
|------|---------|
| `gs://nuumee-assets/config/subtitle-styles.json` | Runtime config (edit this) |
| `ffmpeg-worker/config/subtitle-styles.json` | Source template in repo |
| `ffmpeg-worker/subtitles.py` | ASS generator code |
