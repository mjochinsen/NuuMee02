"""ASS Subtitle Generator for NuuMee FFmpeg Worker.

Converts word timestamps to ASS subtitle format with various styles.
"""
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Subtitle style definitions
STYLES = {
    "rainbow": {
        "name": "Rainbow",
        "description": "Multi-color cycling text",
        "ass_styles": """Style: Rainbow1,DejaVu Sans,22,&H000080FF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow2,DejaVu Sans,22,&H0000FF80,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow3,DejaVu Sans,22,&H0080FF00,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow4,DejaVu Sans,22,&H00FF8000,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1""",
    },
    "classic": {
        "name": "Classic White",
        "description": "White text with black outline",
        "ass_styles": """Style: Default,DejaVu Sans,24,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,20,20,40,1""",
    },
    "bold": {
        "name": "Bold Yellow",
        "description": "Yellow text with thick outline",
        "ass_styles": """Style: Default,DejaVu Sans,26,&H0000FFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,40,1""",
    },
    "minimal": {
        "name": "Minimal",
        "description": "Small white text with subtle shadow",
        "ass_styles": """Style: Default,DejaVu Sans,18,&H00FFFFFF,&H000000FF,&H00000000,&H40000000,0,0,0,0,100,100,0,0,1,1,1,2,20,20,30,1""",
    },
}

MIN_WORD_DURATION = 0.2  # Minimum display time for each word


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


def generate_ass(words: List[Dict], style_id: str = "classic", title: str = "NuuMee Subtitles") -> str:
    """
    Generate ASS subtitle content from word timestamps.

    Args:
        words: List of {"word": str, "start_time": str, "end_time": str}
        style_id: Style identifier (rainbow, classic, bold, minimal)
        title: Title for the subtitle file

    Returns:
        Complete ASS file content as string
    """
    style = STYLES.get(style_id, STYLES["classic"])
    is_rainbow = style_id == "rainbow"

    # ASS file header
    header = f"""[Script Info]
Title: {title}
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{style["ass_styles"]}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    # Generate dialogue lines for each word
    events = []
    rainbow_styles = ["Rainbow1", "Rainbow2", "Rainbow3", "Rainbow4"]

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
        if end_sec - start_sec < MIN_WORD_DURATION:
            end_sec = start_sec + MIN_WORD_DURATION

        # Format times
        start_time = to_ass_time(start_sec)
        end_time = to_ass_time(end_sec)

        # Get word text
        word = word_data.get("word", "")

        # Choose style (cycle for rainbow)
        if is_rainbow:
            style_name = rainbow_styles[i % len(rainbow_styles)]
        else:
            style_name = "Default"

        # Create dialogue line
        event = f"Dialogue: 0,{start_time},{end_time},{style_name},,0,0,0,,{word}"
        events.append(event)

    return header + "\n".join(events) + "\n"


def get_available_styles() -> Dict:
    """Return available subtitle styles with metadata."""
    return {
        style_id: {
            "name": style["name"],
            "description": style["description"],
        }
        for style_id, style in STYLES.items()
    }
