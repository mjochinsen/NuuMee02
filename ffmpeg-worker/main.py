"""FFmpeg Worker for NuuMee.

Handles post-processing jobs that require FFmpeg:
- Subtitle generation (STT + ASS burn)
- Watermark overlay
"""
import os
import logging
import subprocess
import tempfile

from flask import Flask, request, jsonify

# Import shared utilities
import sys
# Support both local dev (shared in parent) and container (shared in same dir)
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from shared.worker_utils import (
    get_firestore, get_storage,
    download_from_gcs, upload_to_gcs,
    update_job_status, refund_credits,
    OUTPUT_BUCKET, ASSETS_BUCKET,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)


def process_subtitles_job(job_data: dict) -> str:
    """Process a subtitle generation job.

    Steps:
    1. Download source video from GCS
    2. Extract audio (FFmpeg)
    3. Transcribe audio (Google STT)
    4. Generate ASS subtitle file
    5. Burn subtitles onto video (FFmpeg)
    6. Upload result to GCS

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    from stt import transcribe_audio_sync, transcribe_audio_async
    from subtitles import generate_ass
    from stt_correction import correct_stt_with_script

    job_id = job_data["id"]
    input_video_path = job_data.get("input_video_path")
    options = job_data.get("options", {})
    subtitle_style = options.get("subtitle_style", "simple")
    script_content = options.get("script_content")

    if not input_video_path:
        raise ValueError("No input_video_path provided")

    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Download source video
        local_video = os.path.join(tmpdir, "input.mp4")
        download_from_gcs(OUTPUT_BUCKET, input_video_path, local_video)

        # Step 2: Check if video has audio stream
        probe_audio_cmd = [
            "ffprobe", "-v", "quiet",
            "-select_streams", "a",
            "-show_entries", "stream=codec_type",
            "-of", "csv=p=0",
            local_video
        ]
        probe_result = subprocess.run(probe_audio_cmd, capture_output=True, text=True)
        has_audio = bool(probe_result.stdout.strip())

        if not has_audio:
            raise ValueError("Video has no audio track. Subtitles require audio for speech-to-text transcription.")

        # Step 3: Extract audio
        local_audio = os.path.join(tmpdir, "audio.wav")
        extract_cmd = [
            "ffmpeg", "-i", local_video,
            "-vn", "-acodec", "pcm_s16le",
            "-ar", "16000", "-ac", "1",
            local_audio, "-y"
        ]
        logger.info(f"Extracting audio: {' '.join(extract_cmd)}")
        result = subprocess.run(extract_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Audio extraction failed: {result.stderr}")

        # Check audio duration
        probe_cmd = [
            "ffprobe", "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            local_audio
        ]
        duration_result = subprocess.run(probe_cmd, capture_output=True, text=True)
        audio_duration = float(duration_result.stdout.strip()) if duration_result.stdout.strip() else 0
        logger.info(f"Audio duration: {audio_duration}s")

        # Step 3: Transcribe audio
        if audio_duration < 60:
            words = transcribe_audio_sync(local_audio)
        else:
            audio_gcs_path = f"temp/{job_id}/audio.wav"
            upload_to_gcs(local_audio, OUTPUT_BUCKET, audio_gcs_path, content_type="audio/wav")
            audio_gcs_uri = f"gs://{OUTPUT_BUCKET}/{audio_gcs_path}"
            words = transcribe_audio_async(audio_gcs_uri)

        if not words:
            raise ValueError("No words transcribed from audio")

        logger.info(f"Transcribed {len(words)} words")

        # Step 3b: Apply script correction if provided
        if script_content:
            logger.info("Applying script-based STT correction")
            words = correct_stt_with_script(words, script_content)
            logger.info(f"After correction: {len(words)} words")

        # Step 4: Generate ASS subtitle file
        ass_content = generate_ass(words, style_id=subtitle_style)
        local_ass = os.path.join(tmpdir, "subtitles.ass")
        with open(local_ass, "w", encoding="utf-8") as f:
            f.write(ass_content)

        # Step 5: Burn subtitles onto video
        local_output = os.path.join(tmpdir, "output.mp4")
        burn_cmd = [
            "ffmpeg", "-i", local_video,
            "-vf", f"ass={local_ass}",
            "-c:v", "libx264", "-crf", "18",
            "-c:a", "copy",
            local_output, "-y"
        ]
        logger.info(f"Burning subtitles: {' '.join(burn_cmd)}")
        result = subprocess.run(burn_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Subtitle burning failed: {result.stderr}")

        # Step 6: Upload result to GCS
        output_gcs_path = f"processed/{job_id}/subtitled.mp4"
        upload_to_gcs(local_output, OUTPUT_BUCKET, output_gcs_path)

        return output_gcs_path


def process_watermark_job(job_data: dict) -> str:
    """Process a watermark overlay job.

    Steps:
    1. Download source video from GCS
    2. Download watermark image from GCS
    3. Overlay watermark (FFmpeg) - preserving original size and transparency
    4. Upload result to GCS

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    job_id = job_data["id"]
    input_video_path = job_data.get("input_video_path")
    options = job_data.get("options", {})

    watermark_path = options.get("watermark_path", "assets/watermark.png")
    position = options.get("position", "bottom-right")
    opacity = options.get("opacity", 0.7)
    margin_percent = options.get("margin_percent", 5)

    if not input_video_path:
        raise ValueError("No input_video_path provided")

    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Download source video
        local_video = os.path.join(tmpdir, "input.mp4")
        download_from_gcs(OUTPUT_BUCKET, input_video_path, local_video)

        # Step 2: Download watermark image
        local_watermark = os.path.join(tmpdir, "watermark.png")
        download_from_gcs(ASSETS_BUCKET, watermark_path, local_watermark)

        # Step 3: Build FFmpeg overlay filter
        margin = f"(W*{margin_percent}/100)"
        positions = {
            "bottom-right": f"W-w-{margin}:H-h-{margin}",
            "bottom-left": f"{margin}:H-h-{margin}",
            "top-right": f"W-w-{margin}:{margin}",
            "top-left": f"{margin}:{margin}",
        }
        overlay_pos = positions.get(position, positions["bottom-right"])

        filter_complex = (
            f"[1:v]format=rgba,"
            f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='{opacity}*alpha(X,Y)'"
            f"[watermark];"
            f"[0:v][watermark]overlay={overlay_pos}:format=auto,format=yuv420p"
        )

        # Step 4: Apply watermark
        local_output = os.path.join(tmpdir, "output.mp4")
        overlay_cmd = [
            "ffmpeg",
            "-i", local_video,
            "-i", local_watermark,
            "-filter_complex", filter_complex,
            "-c:v", "libx264", "-crf", "18",
            "-c:a", "copy",
            local_output, "-y"
        ]
        logger.info(f"Applying watermark with opacity={opacity}, position={position}")
        result = subprocess.run(overlay_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Watermark overlay failed: {result.stderr}")

        # Step 5: Upload result to GCS
        output_gcs_path = f"processed/{job_id}/watermarked.mp4"
        upload_to_gcs(local_output, OUTPUT_BUCKET, output_gcs_path)

        return output_gcs_path


def process_job(job_id: str):
    """Process a single job."""
    db = get_firestore()
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        logger.error(f"Job {job_id} not found")
        return

    job_data = job_doc.to_dict()
    job_data["id"] = job_id
    job_type = job_data.get("job_type", "")
    user_id = job_data["user_id"]
    credits_charged = job_data.get("credits_charged", 0)

    logger.info(f"Processing job {job_id}: type={job_type}")

    JOB_HANDLERS = {
        "subtitles": process_subtitles_job,
        "watermark": process_watermark_job,
    }

    try:
        update_job_status(job_id, "processing")

        handler = JOB_HANDLERS.get(job_type)
        if not handler:
            raise ValueError(f"Unsupported job type for FFmpeg worker: {job_type}")

        output_path = handler(job_data)
        update_job_status(job_id, "completed", output_video_path=output_path)
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        logger.exception(f"Error processing job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=str(e))
        if credits_charged > 0:
            refund_credits(user_id, credits_charged, job_id)


@app.route("/", methods=["POST"])
def handle_task():
    """Handle incoming Cloud Tasks request."""
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload"}), 400

        job_id = payload.get("job_id")
        if not job_id:
            return jsonify({"error": "Missing job_id"}), 400

        logger.info(f"Received task for job: {job_id}")
        process_job(job_id)

        return jsonify({"status": "ok", "job_id": job_id}), 200

    except Exception as e:
        logger.exception(f"Error handling task: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "nuumee-ffmpeg-worker"}), 200


@app.route("/ffmpeg-check", methods=["GET"])
def ffmpeg_check():
    """Check FFmpeg capabilities."""
    checks = {}

    # Check FFmpeg version
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        version_line = result.stdout.split('\n')[0] if result.stdout else "unknown"
        checks["ffmpeg_version"] = version_line
        checks["ffmpeg_available"] = True
    except Exception as e:
        checks["ffmpeg_available"] = False
        checks["ffmpeg_error"] = str(e)

    # Check for libass (subtitle filter)
    try:
        result = subprocess.run(
            ["ffmpeg", "-filters"],
            capture_output=True,
            text=True,
            timeout=10
        )
        checks["libass_available"] = "ass" in result.stdout or "subtitles" in result.stdout
    except Exception as e:
        checks["libass_available"] = False
        checks["libass_error"] = str(e)

    # Check for fonts
    try:
        result = subprocess.run(
            ["fc-list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        font_count = len(result.stdout.strip().split('\n')) if result.stdout else 0
        checks["fonts_available"] = font_count
    except Exception as e:
        checks["fonts_available"] = 0
        checks["fonts_error"] = str(e)

    return jsonify(checks), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
