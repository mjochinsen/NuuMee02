"""ASS Subtitle Generator for NuuMee FFmpeg Worker.

Converts word timestamps to ASS subtitle format with various styles.
Styles are loaded from GCS config file at runtime for easy customization.
"""
import json
import logging
import os
from typing import Dict, List, Optional

from google.cloud import storage

logger = logging.getLogger(__name__)

# GCS config location
CONFIG_BUCKET = os.environ.get("NUUMEE_ASSETS_BUCKET", "nuumee-assets")
CONFIG_PATH = "config/subtitle-styles.json"

# Cache for loaded styles (refreshed on worker restart or manual reload)
_styles_cache: Optional[Dict] = None
_min_word_duration: float = 0.2

# Fallback styles if GCS config fails to load
FALLBACK_STYLES = {
    "simple": {
        "name": "Simple",
        "description": "Clean white text with subtle glow",
        "is_multi_style": False,
        "animation": "fade",
        "ass_styles": [
            "Style: Default,Arial,72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,20,20,160,1"
        ],
        "style_names": ["Default"],
    },
}


def load_styles_from_gcs(force_reload: bool = False) -> Dict:
    """
    Load subtitle styles from GCS config file.

    Args:
        force_reload: If True, bypass cache and reload from GCS

    Returns:
        Dict of style configurations
    """
    global _styles_cache, _min_word_duration

    if _styles_cache is not None and not force_reload:
        return _styles_cache

    try:
        client = storage.Client()
        bucket = client.bucket(CONFIG_BUCKET)
        blob = bucket.blob(CONFIG_PATH)

        if not blob.exists():
            logger.warning(f"Config file not found at gs://{CONFIG_BUCKET}/{CONFIG_PATH}, using fallback styles")
            _styles_cache = FALLBACK_STYLES
            return _styles_cache

        config_content = blob.download_as_text()
        config = json.loads(config_content)

        _styles_cache = config.get("styles", FALLBACK_STYLES)
        _min_word_duration = config.get("min_word_duration", 0.2)

        logger.info(f"Loaded {len(_styles_cache)} subtitle styles from GCS config")
        return _styles_cache

    except Exception as e:
        logger.error(f"Failed to load styles from GCS: {e}, using fallback")
        _styles_cache = FALLBACK_STYLES
        return _styles_cache


def get_min_word_duration() -> float:
    """Get minimum word duration from config."""
    global _min_word_duration
    # Ensure styles are loaded (which also loads min_word_duration)
    load_styles_from_gcs()
    return _min_word_duration


def to_ass_time(seconds: float) -> str:
    """
    Convert seconds to ASS time format (H:MM:SS.cc).

    Args:
        seconds: Time in seconds

    Returns:
        ASS formatted time string
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int((seconds % 1) * 100)
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def generate_ass(words: List[Dict], style_id: str = "simple", title: str = "NuuMee Subtitles") -> str:
    """
    Generate ASS subtitle content from word timestamps.

    Args:
        words: List of {"word": str, "start_time": str, "end_time": str}
        style_id: Style identifier (simple, rainbow_bounce, bold_shine)
        title: Title for the subtitle file

    Returns:
        Complete ASS file content as string
    """
    styles = load_styles_from_gcs()
    min_duration = get_min_word_duration()

    style = styles.get(style_id, styles.get("simple", FALLBACK_STYLES["simple"]))
    is_multi_style = style.get("is_multi_style", False)
    style_names = style.get("style_names", ["Default"])

    # Build ASS styles section
    ass_styles_lines = style.get("ass_styles", [])
    if isinstance(ass_styles_lines, list):
        ass_styles = "\n".join(ass_styles_lines)
    else:
        ass_styles = ass_styles_lines

    # ASS file header
    header = f"""[Script Info]
Title: {title}
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{ass_styles}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    # Generate dialogue lines for each word
    events = []

    for i, word_data in enumerate(words):
        # Parse timestamps (format: "1.234s" or just float)
        start_str = word_data.get("start_time", "0")
        end_str = word_data.get("end_time", "0")

        # Remove 's' suffix if present
        if isinstance(start_str, str):
            start_str = start_str.rstrip("s")
        if isinstance(end_str, str):
            end_str = end_str.rstrip("s")

        start_sec = float(start_str)
        end_sec = float(end_str)

        # Ensure minimum word duration
        if end_sec - start_sec < min_duration:
            end_sec = start_sec + min_duration

        # Format times
        start_time = to_ass_time(start_sec)
        end_time = to_ass_time(end_sec)

        # Get word text
        word = word_data.get("word", "")

        # Choose style (cycle for multi-style like rainbow)
        if is_multi_style and len(style_names) > 1:
            style_name = style_names[i % len(style_names)]
        else:
            style_name = style_names[0] if style_names else "Default"

        # Create dialogue line
        event = f"Dialogue: 0,{start_time},{end_time},{style_name},,0,0,0,,{word}"
        events.append(event)

    return header + "\n".join(events) + "\n"


def get_available_styles() -> Dict:
    """Return available subtitle styles with metadata."""
    styles = load_styles_from_gcs()
    return {
        style_id: {
            "name": style.get("name", style_id),
            "description": style.get("description", ""),
        }
        for style_id, style in styles.items()
    }


def reload_styles() -> Dict:
    """Force reload styles from GCS. Call this to pick up config changes."""
    return load_styles_from_gcs(force_reload=True)
