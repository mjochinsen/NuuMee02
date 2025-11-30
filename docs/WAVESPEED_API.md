# WaveSpeed API Reference

**Purpose:** Technical reference for Claude Code when implementing WaveSpeed integrations.

---

## Authentication

All WaveSpeed API calls require bearer token authentication.

### Header Format
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Example
```bash
curl --location --request POST "https://api.wavespeed.ai/api/v3/endpoint" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"video": "https://..."}'
```

### API Key Management
- Dashboard: https://wavespeed.ai/accesskey
- Storage: GCP Secret Manager (`wavespeed-api-key`)
- Never hardcode keys in source code
- Use environment variables

### Auth Errors
| HTTP Code | Meaning |
|-----------|---------|
| 401 | Invalid or missing API key |
| 403 | Key lacks permission for endpoint |

---

## Base Configuration

```python
BASE_URL = "https://api.wavespeed.ai"
AUTH_HEADER = {"Authorization": "Bearer {WAVESPEED_API_KEY}"}
```

---

## 1. Wan 2.2 Animate (Image-to-Video)

**Use:** Animate a static image using motion from a reference video.

### Endpoint
```
POST /api/v3/wavespeed-ai/wan-2.2/animate
GET  /api/v3/predictions/{request_id}/result
```

### Parameters

| Parameter | Type | Required | Default | Values |
|-----------|------|----------|---------|--------|
| `image` | string | YES | - | Character photo URL |
| `video` | string | YES | - | Motion source video URL |
| `prompt` | string | NO | - | Generation constraints |
| `mode` | string | NO | "animate" | "animate" \| "replace" |
| `resolution` | string | NO | "480p" | "480p" \| "720p" |
| `seed` | integer | NO | -1 | -1 to 2147483647 |

### Resolutions & Limits

| Resolution | Max Length | Cost/Second |
|------------|------------|-------------|
| 480p | 120s | $0.04 |
| 720p | 120s | $0.08 |

### Billing
- Minimum: 5 seconds
- Maximum: 120 seconds

### Response
```json
{
  "data": {
    "id": "prediction_id",
    "status": "created|processing|completed|failed",
    "outputs": ["https://...output_video.mp4"],
    "has_nsfw_contents": [false],
    "timings": { "inference": 12345 }
  }
}
```

### Constraints
- Input formats: PNG, JPG (avoid WebP)
- Match aspect ratio between image and video
- Align pose/composition for best results

### Aspect Ratio
- **Both 9:16 (portrait) and 16:9 (landscape) supported**
- Image and video MUST have matching aspect ratio
- Output inherits aspect ratio from inputs

### Modes
| Mode | Behavior |
|------|----------|
| `animate` | Character + background from reference image. Video drives motion only. |
| `replace` | Keep original video background. Only swap the character. |

### Safety Checker
- **Not a configurable parameter** in WaveSpeed API
- NSFW detection runs automatically on outputs
- Response includes `has_nsfw_contents: [true/false]` array
- NuuMee UI has `safety_checker_image` / `safety_checker_video` toggles (for future pre-scan implementation)

---

## 2. Wan 2.5 Video-Extend

**Use:** Extend an existing video by 3-10 seconds.

### Endpoint
```
POST /api/v3/alibaba/wan-2.5/video-extend
GET  /api/v3/predictions/{request_id}/result
```

### Parameters

| Parameter | Type | Required | Default | Values |
|-----------|------|----------|---------|--------|
| `video` | string | YES | - | Input video URL |
| `prompt` | string | YES | - | Description of extension |
| `audio` | string | NO | - | Audio URL to guide generation |
| `duration` | integer | NO | 5 | 3, 4, 5, 6, 7, 8, 9, 10 |
| `resolution` | string | NO | "480p" | "480p" \| "720p" \| "1080p" |
| `negative_prompt` | string | NO | - | Elements to avoid |
| `enable_prompt_expansion` | boolean | NO | false | Prompt optimization |
| `seed` | integer | NO | -1 | Random seed |

### Resolutions & Pricing

| Resolution | Cost/Second | 5s Cost |
|------------|-------------|---------|
| 480p | $0.05 | $0.25 |
| 720p | $0.10 | $0.50 |
| 1080p | $0.15 | $0.75 |

### Constraints
- Extension duration: 3-10 seconds ONLY
- Audio file: max 15 MB, 3-30 seconds
- Output storage: 7 days

### Response
```json
{
  "id": "prediction_id",
  "status": "created|processing|completed|failed",
  "outputs": ["https://...extended_video.mp4"],
  "created_at": "2025-01-01T00:00:00Z",
  "has_nsfw_contents": [false]
}
```

---

## 3. Video Upscaler Pro

**Use:** Upscale video resolution (720p → 1080p/2K/4K).

### Endpoint
```
POST /api/v3/wavespeed-ai/video-upscaler-pro
GET  /api/v3/predictions/{request_id}/result
```

### Parameters

| Parameter | Type | Required | Default | Values |
|-----------|------|----------|---------|--------|
| `video` | string | YES | - | Input video URL |
| `target_resolution` | string | NO | "1080p" | "720p" \| "1080p" \| "2k" \| "4k" |

### Pricing (per 5 seconds)

| Target | Cost/5s | Cost/Second |
|--------|---------|-------------|
| 720p | $0.10 | $0.02 |
| 1080p | $0.15 | $0.03 |
| 2K | $0.20 | $0.04 |
| 4K | $0.25 | $0.05 |

### Constraints
- Minimum billing: 5 seconds
- Maximum video length: 10 minutes (600s)
- Videos >10 min must be split into segments
- Processing time: 10-30 seconds wall time per 1 second of video

### Response
```json
{
  "id": "prediction_id",
  "status": "created|processing|completed|failed",
  "outputs": ["https://...upscaled_video.mp4"],
  "created_at": "2025-01-01T00:00:00Z",
  "has_nsfw_contents": [false]
}
```

---

## 4. Hunyuan Video Foley (Add Audio)

**Use:** Generate synchronized sound effects for a video.

### Endpoint
```
POST /api/v3/wavespeed-ai/hunyuan-video-foley
GET  /api/v3/predictions/{request_id}/result
```

### Parameters

| Parameter | Type | Required | Default | Values |
|-----------|------|----------|---------|--------|
| `video` | string | YES | - | Input video URL |
| `prompt` | string | NO | - | Sound description |
| `seed` | integer | NO | -1 | Random seed |

### Pricing
- **Flat rate:** $0.05 per run

### Output
- Audio quality: 48 kHz
- Format: MP4 with embedded audio

### Constraints
- Requires video input (no audio-only)
- Output storage: 7 days

### Response
```json
{
  "id": "prediction_id",
  "status": "created|processing|completed|failed",
  "outputs": ["https://...video_with_audio.mp4"],
  "created_at": "2025-01-01T00:00:00Z",
  "has_nsfw_contents": [false]
}
```

---

## Status Polling

All endpoints use async processing. Poll for results:

```python
import time

def poll_result(request_id: str, max_wait: int = 300) -> dict:
    url = f"{BASE_URL}/api/v3/predictions/{request_id}/result"
    start = time.time()

    while time.time() - start < max_wait:
        response = requests.get(url, headers=AUTH_HEADER)
        data = response.json()

        if data["status"] == "completed":
            return data["outputs"]
        elif data["status"] == "failed":
            raise Exception(f"Generation failed: {data}")

        time.sleep(5)  # Poll every 5 seconds

    raise TimeoutError("Max wait exceeded")
```

---

## NuuMee Resolution Support

**IMPORTANT:** NuuMee base generation only exposes 480p and 720p to users.

| Model | 480p | 720p | 1080p | 2K | 4K |
|-------|------|------|-------|----|----|
| Wan 2.2 Animate | YES | YES | NO | NO | NO |
| Wan 2.5 Extend | YES | YES | NO* | NO | NO |
| Video Upscaler Pro | N/A | YES | YES | YES | YES |
| Hunyuan Foley | N/A | N/A | N/A | N/A | N/A |

*1080p available in Extend API but NOT exposed in NuuMee UI.

**Upscaler workflow:** Generate at 480p/720p → Upscale to 2K/4K via Video Upscaler Pro.

---

## Error Handling

| Status | Action |
|--------|--------|
| `created` | Continue polling |
| `processing` | Continue polling |
| `completed` | Extract `outputs` array |
| `failed` | Log error, notify user, refund credits |

### Retry Codes
```python
RETRY_STATUS_CODES = [429, 502, 503, 504]
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds
```

---

## Cost Calculation (Backend)

```python
def calculate_wavespeed_cost(
    model: str,
    duration_seconds: int,
    resolution: str
) -> float:
    """Calculate WaveSpeed API cost in USD."""

    if model == "wan-2.2-animate":
        rates = {"480p": 0.04, "720p": 0.08}
        return max(5, duration_seconds) * rates.get(resolution, 0.04)

    elif model == "wan-2.5-extend":
        rates = {"480p": 0.05, "720p": 0.10, "1080p": 0.15}
        return duration_seconds * rates.get(resolution, 0.05)

    elif model == "video-upscaler-pro":
        # Per-second rates (cost/5s divided by 5)
        rates = {"720p": 0.02, "1080p": 0.03, "2k": 0.04, "4k": 0.05}
        return max(5, duration_seconds) * rates.get(resolution, 0.03)

    elif model == "hunyuan-foley":
        return 0.05  # Flat rate

    return 0.0
```

---

## Quick Reference

| Feature | Model | Endpoint Suffix |
|---------|-------|-----------------|
| Image-to-Video | Wan 2.2 Animate | `/wavespeed-ai/wan-2.2/animate` |
| Video Extend | Wan 2.5 Extend | `/alibaba/wan-2.5/video-extend` |
| Upscale Video | Video Upscaler Pro | `/wavespeed-ai/video-upscaler-pro` |
| Add Audio | Hunyuan Foley | `/wavespeed-ai/hunyuan-video-foley` |
