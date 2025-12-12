"""Local ASS subtitle generator for preview tool.

Standalone implementation that mirrors production logic but works entirely locally.
No GCS dependencies - all parameters come from UI controls.
"""
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class SubtitleStyle:
    """Subtitle style parameters for ASS generation."""
    font_name: str = "Arial"
    font_size: int = 22
    primary_color: str = "&H00FFFFFF"  # White (BGR format)
    outline_color: str = "&H00000000"  # Black
    back_color: str = "&H80000000"     # Semi-transparent black
    bold: bool = True
    outline: int = 3
    shadow: int = 2
    alignment: int = 2  # Bottom center
    margin_v: int = 80
    margin_l: int = 20
    margin_r: int = 20
    blur: float = 0  # Glow/blur effect (0 = none)


# Rainbow colors - cycling through 4 styles
RAINBOW_COLORS = [
    "&H000080FF",  # Orange
    "&H0000FF80",  # Green-ish
    "&H0080FF00",  # Cyan
    "&H00FF8000",  # Blue
]

# Animation effect definitions
ANIMATION_EFFECTS = {
    "none": {
        "name": "None",
        "description": "Static text, no animation",
        "code": "",
    },
    "pop": {
        "name": "Pop/Bounce",
        "description": "Scale up then back down",
        "code": "{\\t(0,150,\\fscx130\\fscy130)\\t(150,300,\\fscx100\\fscy100)}",
    },
    "wiggle": {
        "name": "Wiggle",
        "description": "Rotate back and forth",
        "code": "{\\t(0,100,\\frz3)\\t(100,200,\\frz-3)\\t(200,300,\\frz0)}",
    },
    "pulse": {
        "name": "Color Pulse",
        "description": "Flash to yellow and back",
        "code": "{\\t(0,200,\\c&H0000FFFF&)\\t(200,400,\\c&HFFFFFF&)}",
    },
    "fade": {
        "name": "Fade In",
        "description": "Smooth fade in appearance",
        "code": "{\\fad(200,0)}",
    },
    "typewriter": {
        "name": "Typewriter",
        "description": "Letter-by-letter reveal",
        "code": "TYPEWRITER",  # Special handling required
    },
}

# Position presets
POSITION_PRESETS = {
    "youtube": {
        "name": "YouTube Style",
        "description": "Bottom center, medium size",
        "alignment": 2,
        "margin_v": 50,
        "font_size": 24,
    },
    "tiktok": {
        "name": "TikTok Style",
        "description": "Center screen, large bold",
        "alignment": 5,  # Middle center
        "margin_v": 0,
        "font_size": 36,
    },
    "cinema": {
        "name": "Cinema Style",
        "description": "Bottom, smaller text",
        "alignment": 2,
        "margin_v": 30,
        "font_size": 20,
    },
    "top": {
        "name": "Top Banner",
        "description": "Top center",
        "alignment": 8,  # Top center
        "margin_v": 30,
        "font_size": 24,
    },
}

# Preset styles
PRESET_STYLES = {
    "classic": SubtitleStyle(
        font_name="Arial",
        font_size=24,
        primary_color="&H00FFFFFF",
        bold=False,
        outline=2,
        shadow=1,
        margin_v=40
    ),
    "bold": SubtitleStyle(
        font_name="Arial",
        font_size=26,
        primary_color="&H0000FFFF",  # Yellow
        bold=True,
        outline=3,
        shadow=2,
        margin_v=40
    ),
    "minimal": SubtitleStyle(
        font_name="Arial",
        font_size=18,
        primary_color="&H00FFFFFF",
        bold=False,
        outline=1,
        shadow=1,
        margin_v=30,
        back_color="&H40000000"
    ),
    "large": SubtitleStyle(
        font_name="Arial",
        font_size=32,
        primary_color="&H00FFFFFF",
        bold=True,
        outline=3,
        shadow=2,
        margin_v=50
    ),
    "rainbow": SubtitleStyle(
        font_name="Arial",
        font_size=22,
        primary_color="&H000080FF",
        bold=True,
        outline=3,
        shadow=2,
        margin_v=80
    ),
}

# Common colors in ASS BGR format
COLOR_PRESETS = {
    "White": "&H00FFFFFF",
    "Yellow": "&H0000FFFF",
    "Orange": "&H000080FF",
    "Red": "&H000000FF",
    "Green": "&H0000FF00",
    "Cyan": "&H00FFFF00",
    "Blue": "&H00FF0000",
    "Pink": "&H00FF00FF",
    "Black": "&H00000000",
}

# Available fonts - system fonts commonly available
AVAILABLE_FONTS = [
    "Arial",
    "DejaVu Sans",
    "Liberation Sans",
    "Noto Sans",
    "Helvetica",
    "Verdana",
    "Times New Roman",
    "Georgia",
]


def to_ass_time(seconds: float) -> str:
    """Convert seconds to ASS time format (H:MM:SS.cc)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int((seconds % 1) * 100)
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def generate_typewriter_text(word: str) -> str:
    """Generate karaoke/typewriter effect for a word."""
    # \k tag shows text letter by letter
    # Duration per letter in centiseconds (5 = 50ms per letter)
    chars_with_k = []
    for char in word:
        chars_with_k.append(f"{{\\k5}}{char}")
    return "".join(chars_with_k)


def generate_ass_content(
    style: SubtitleStyle,
    words: Optional[List[dict]] = None,
    sample_text: str = "Sample subtitle text for preview",
    duration: float = 5.0,
    is_rainbow: bool = False,
    video_width: int = 1920,
    video_height: int = 1080,
    animation: str = "none",
) -> str:
    """
    Generate ASS subtitle file content.

    Args:
        style: SubtitleStyle with all formatting parameters
        words: Optional list of {"word": str, "start_time": float, "end_time": float}
        sample_text: Fallback text if no words provided
        duration: Duration for sample text display
        is_rainbow: If True, use rainbow color cycling (4 styles)
        video_width: Video width for PlayResX
        video_height: Video height for PlayResY
        animation: Animation effect ID (none, pop, wiggle, pulse, fade, typewriter)

    Returns:
        Complete ASS file content as string
    """
    bold_flag = 1 if style.bold else 0

    # Scale margins based on video height (original values assume 1080p)
    scale_factor = video_height / 1080.0
    scaled_margin_v = int(style.margin_v * scale_factor)
    scaled_margin_l = int(style.margin_l * scale_factor)
    scaled_margin_r = int(style.margin_r * scale_factor)

    # Get animation effect code
    effect = ANIMATION_EFFECTS.get(animation, ANIMATION_EFFECTS["none"])
    anim_code = effect["code"] if effect["code"] != "TYPEWRITER" else ""
    is_typewriter = (animation == "typewriter")

    # Add blur if specified
    blur_code = f"{{\\blur{style.blur}}}" if style.blur > 0 else ""

    # Build styles section
    if is_rainbow:
        style_lines = []
        for i, color in enumerate(RAINBOW_COLORS, 1):
            style_line = (
                f"Style: Rainbow{i},{style.font_name},{style.font_size},"
                f"{color},&H000000FF,{style.outline_color},{style.back_color},"
                f"{bold_flag},0,0,0,100,100,0,0,1,{style.outline},{style.shadow},"
                f"{style.alignment},{scaled_margin_l},{scaled_margin_r},{scaled_margin_v},1"
            )
            style_lines.append(style_line)
        styles_section = "\n".join(style_lines)
    else:
        styles_section = (
            f"Style: Default,{style.font_name},{style.font_size},"
            f"{style.primary_color},&H000000FF,{style.outline_color},{style.back_color},"
            f"{bold_flag},0,0,0,100,100,0,0,1,{style.outline},{style.shadow},"
            f"{style.alignment},{scaled_margin_l},{scaled_margin_r},{scaled_margin_v},1"
        )

    # ASS header
    header = f"""[Script Info]
Title: NuuMee Subtitle Preview
ScriptType: v4.00+
PlayResX: {video_width}
PlayResY: {video_height}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{styles_section}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    # Generate dialogue events
    events = []
    min_duration = 0.2
    rainbow_styles = ["Rainbow1", "Rainbow2", "Rainbow3", "Rainbow4"]

    if words:
        for i, word_data in enumerate(words):
            start_str = str(word_data.get("start_time", 0))
            end_str = str(word_data.get("end_time", 0))

            start_sec = float(start_str.rstrip("s"))
            end_sec = float(end_str.rstrip("s"))

            if end_sec - start_sec < min_duration:
                end_sec = start_sec + min_duration

            word = word_data.get("word", "")
            start_time = to_ass_time(start_sec)
            end_time = to_ass_time(end_sec)

            style_name = rainbow_styles[i % len(rainbow_styles)] if is_rainbow else "Default"

            # Apply effects to word
            if is_typewriter:
                text = blur_code + generate_typewriter_text(word)
            else:
                text = blur_code + anim_code + word

            events.append(f"Dialogue: 0,{start_time},{end_time},{style_name},,0,0,0,,{text}")
    else:
        start_time = to_ass_time(0.5)
        end_time = to_ass_time(duration - 0.5)
        style_name = "Rainbow1" if is_rainbow else "Default"

        if is_typewriter:
            text = blur_code + generate_typewriter_text(sample_text)
        else:
            text = blur_code + anim_code + sample_text

        events.append(f"Dialogue: 0,{start_time},{end_time},{style_name},,0,0,0,,{text}")

    return header + "\n".join(events) + "\n"


def style_from_preset(preset_id: str) -> SubtitleStyle:
    """Get a copy of a preset style."""
    preset = PRESET_STYLES.get(preset_id, PRESET_STYLES["classic"])
    return SubtitleStyle(
        font_name=preset.font_name,
        font_size=preset.font_size,
        primary_color=preset.primary_color,
        outline_color=preset.outline_color,
        back_color=preset.back_color,
        bold=preset.bold,
        outline=preset.outline,
        shadow=preset.shadow,
        alignment=preset.alignment,
        margin_v=preset.margin_v,
        margin_l=preset.margin_l,
        margin_r=preset.margin_r,
        blur=preset.blur,
    )


def get_position_preset(preset_id: str) -> dict:
    """Get position preset values."""
    return POSITION_PRESETS.get(preset_id, POSITION_PRESETS["youtube"])
