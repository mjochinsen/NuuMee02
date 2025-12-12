#!/usr/bin/env python3
"""Gradio Subtitle Style Preview Tool.

Local-only tool for visual subtitle style experimentation.
Upload a video, adjust style parameters, and see the result immediately.

Usage:
    python app.py
    # Opens at http://localhost:7860
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import gradio as gr

from ass_generator import (
    ANIMATION_EFFECTS,
    AVAILABLE_FONTS,
    COLOR_PRESETS,
    POSITION_PRESETS,
    PRESET_STYLES,
    SubtitleStyle,
    generate_ass_content,
    get_position_preset,
    style_from_preset,
)

# Directory for custom fonts
CUSTOM_FONTS_DIR = Path(__file__).parent / "custom_fonts"
CUSTOM_FONTS_DIR.mkdir(exist_ok=True)


def get_available_fonts():
    """Get list of available fonts including custom uploaded ones."""
    fonts = list(AVAILABLE_FONTS)

    # Add custom fonts from the custom_fonts directory
    for font_file in CUSTOM_FONTS_DIR.glob("*.ttf"):
        font_name = font_file.stem
        if font_name not in fonts:
            fonts.append(font_name)
    for font_file in CUSTOM_FONTS_DIR.glob("*.otf"):
        font_name = font_file.stem
        if font_name not in fonts:
            fonts.append(font_name)

    return fonts


def install_custom_font(font_file) -> str:
    """Install a custom font file for use in subtitles."""
    if font_file is None:
        return "No font file provided"

    font_path = Path(font_file)
    font_name = font_path.stem

    # Copy to custom fonts directory
    dest_path = CUSTOM_FONTS_DIR / font_path.name
    shutil.copy(font_file, dest_path)

    # Also install to system fonts for FFmpeg to find
    system_font_dir = Path.home() / ".local/share/fonts"
    system_font_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy(font_file, system_font_dir / font_path.name)

    # Update font cache
    subprocess.run(["fc-cache", "-f"], capture_output=True)

    return f"✓ Installed font: {font_name}"


def parse_sample_text_to_words(text: str, start_time: float = 0.5, words_per_second: float = 2.0):
    """Convert sample text into word-by-word timestamps."""
    words = text.split()
    word_duration = 1.0 / words_per_second

    result = []
    current_time = start_time

    for word in words:
        result.append({
            "word": word,
            "start_time": current_time,
            "end_time": current_time + word_duration,
        })
        current_time += word_duration

    return result


def get_video_resolution(video_path: str) -> tuple:
    """Get video resolution using ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0",
            video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            parts = result.stdout.strip().split(",")
            if len(parts) == 2:
                return int(parts[0]), int(parts[1])
    except Exception as e:
        print(f"Failed to get video resolution: {e}")
    return 1920, 1080


def burn_subtitles(
    video_path: str,
    ass_content: str,
    output_path: str,
    custom_font_path: str = None,
) -> bool:
    """Burn ASS subtitles onto video using FFmpeg."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".ass", delete=False) as f:
        f.write(ass_content)
        ass_path = f.name

    try:
        if custom_font_path and Path(custom_font_path).exists():
            vf_filter = f"ass={ass_path}:fontsdir={custom_font_path}"
        else:
            vf_filter = f"ass={ass_path}"

        cmd = [
            "ffmpeg",
            "-y",
            "-i", video_path,
            "-vf", vf_filter,
            "-c:a", "copy",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            output_path,
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            print(f"FFmpeg error: {result.stderr}")
            return False

        return True

    finally:
        if os.path.exists(ass_path):
            os.unlink(ass_path)


def render_preview(
    video_file,
    preset: str,
    font_name: str,
    font_size: int,
    primary_color: str,
    outline: int,
    shadow: int,
    margin_v: int,
    alignment: int,
    bold: bool,
    blur: float,
    animation: str,
    sample_text: str,
    word_by_word: bool,
    words_per_second: float,
):
    """Render video with subtitle preview."""
    if video_file is None:
        return None, "Please upload a video file first."

    if not sample_text.strip():
        return None, "Please enter some sample text."

    # Build style from UI parameters
    style = SubtitleStyle(
        font_name=font_name,
        font_size=font_size,
        primary_color=COLOR_PRESETS.get(primary_color, "&H00FFFFFF"),
        outline=outline,
        shadow=shadow,
        margin_v=margin_v,
        alignment=alignment,
        bold=bold,
        blur=blur,
    )

    is_rainbow = (preset == "rainbow")

    # Get video resolution
    video_width, video_height = get_video_resolution(video_file)
    print(f"Detected video resolution: {video_width}x{video_height}")

    # Generate ASS content
    if word_by_word:
        words = parse_sample_text_to_words(sample_text, words_per_second=words_per_second)
        ass_content = generate_ass_content(
            style=style,
            words=words,
            duration=10.0,
            is_rainbow=is_rainbow,
            video_width=video_width,
            video_height=video_height,
            animation=animation,
        )
    else:
        ass_content = generate_ass_content(
            style=style,
            sample_text=sample_text,
            duration=10.0,
            is_rainbow=is_rainbow,
            video_width=video_width,
            video_height=video_height,
            animation=animation,
        )

    # Create output path
    output_dir = tempfile.mkdtemp()
    output_path = os.path.join(output_dir, "preview_output.mp4")

    # Burn subtitles
    success = burn_subtitles(
        video_path=video_file,
        ass_content=ass_content,
        output_path=output_path,
        custom_font_path=str(CUSTOM_FONTS_DIR),
    )

    if success and os.path.exists(output_path):
        anim_name = ANIMATION_EFFECTS.get(animation, {}).get("name", "None")
        mode = "word-by-word" if word_by_word else "single"
        return output_path, f"✓ Rendered ({mode}, {anim_name}) @ {video_width}x{video_height}"
    else:
        return None, "✗ FFmpeg rendering failed. Check console for errors."


def load_preset(preset: str):
    """Load preset values into UI controls."""
    style = style_from_preset(preset)

    color_name = "White"
    for name, value in COLOR_PRESETS.items():
        if value == style.primary_color:
            color_name = name
            break

    return (
        style.font_name,
        style.font_size,
        color_name,
        style.outline,
        style.shadow,
        style.margin_v,
        style.alignment,
        style.bold,
        style.blur,
    )


def load_position_preset(preset_id: str):
    """Load position preset values."""
    preset = get_position_preset(preset_id)
    return (
        preset["alignment"],
        preset["margin_v"],
        preset["font_size"],
    )


def refresh_font_list():
    """Refresh the font dropdown with any newly installed fonts."""
    return gr.Dropdown(choices=get_available_fonts())


# Build Gradio interface
with gr.Blocks(title="NuuMee Subtitle Style Preview") as app:
    gr.Markdown("""
    # 🎬 Subtitle Style Preview Tool

    Upload a video, adjust style parameters, and preview how subtitles will look.
    This is a **local-only** design tool for visual iteration.
    """)

    with gr.Row():
        # Left column: Controls
        with gr.Column(scale=1):
            gr.Markdown("### 📁 Video Input")
            video_input = gr.Video(
                label="Upload Video (MP4/MOV)",
                sources=["upload"],
            )

            gr.Markdown("### 🎨 Style Controls")

            preset_dropdown = gr.Dropdown(
                choices=list(PRESET_STYLES.keys()),
                value="classic",
                label="Style Preset",
                info="Load a preset as starting point",
            )

            with gr.Accordion("Font Settings", open=True):
                font_dropdown = gr.Dropdown(
                    choices=get_available_fonts(),
                    value="Arial",
                    label="Font",
                    allow_custom_value=True,
                )

                with gr.Row():
                    font_upload = gr.File(
                        label="Upload Custom Font (.ttf/.otf)",
                        file_types=[".ttf", ".otf"],
                    )
                    font_install_btn = gr.Button("Install Font", size="sm")

                font_status = gr.Textbox(
                    label="Font Status",
                    interactive=False,
                    visible=True,
                )

                font_size_slider = gr.Slider(
                    minimum=12,
                    maximum=100,
                    value=22,
                    step=1,
                    label="Font Size",
                )
                bold_checkbox = gr.Checkbox(
                    value=True,
                    label="Bold",
                )

            with gr.Accordion("Colors & Effects", open=True):
                color_dropdown = gr.Dropdown(
                    choices=list(COLOR_PRESETS.keys()),
                    value="White",
                    label="Text Color",
                )
                outline_slider = gr.Slider(
                    minimum=0,
                    maximum=8,
                    value=3,
                    step=1,
                    label="Outline Thickness",
                )
                shadow_slider = gr.Slider(
                    minimum=0,
                    maximum=6,
                    value=2,
                    step=1,
                    label="Shadow Distance",
                )
                blur_slider = gr.Slider(
                    minimum=0,
                    maximum=10,
                    value=0,
                    step=0.5,
                    label="Glow/Blur (0 = none)",
                )

            with gr.Accordion("Animation", open=True):
                animation_dropdown = gr.Dropdown(
                    choices=[
                        ("None - Static", "none"),
                        ("Pop/Bounce - Scale up then back", "pop"),
                        ("Wiggle - Rotate back and forth", "wiggle"),
                        ("Color Pulse - Flash to yellow", "pulse"),
                        ("Fade In - Smooth appearance", "fade"),
                        ("Typewriter - Letter by letter", "typewriter"),
                    ],
                    value="none",
                    label="Animation Effect",
                )

            with gr.Accordion("Position", open=True):
                position_preset = gr.Dropdown(
                    choices=[
                        ("Custom", "custom"),
                        ("YouTube Style - Bottom center", "youtube"),
                        ("TikTok Style - Center, large", "tiktok"),
                        ("Cinema Style - Bottom, smaller", "cinema"),
                        ("Top Banner - Top center", "top"),
                    ],
                    value="custom",
                    label="Position Preset",
                )
                margin_v_slider = gr.Slider(
                    minimum=0,
                    maximum=300,
                    value=80,
                    step=5,
                    label="Vertical Margin",
                )
                alignment_dropdown = gr.Dropdown(
                    choices=[
                        ("Bottom Left", 1),
                        ("Bottom Center", 2),
                        ("Bottom Right", 3),
                        ("Middle Left", 4),
                        ("Middle Center", 5),
                        ("Middle Right", 6),
                        ("Top Left", 7),
                        ("Top Center", 8),
                        ("Top Right", 9),
                    ],
                    value=2,
                    label="Alignment",
                )

            gr.Markdown("### 📝 Sample Text")
            sample_text_input = gr.Textbox(
                value="Welcome to NuuMee the AI video platform",
                label="Preview Text",
                info="Enter the text you want to preview as subtitles",
                lines=2,
            )

            with gr.Row():
                word_by_word_checkbox = gr.Checkbox(
                    value=True,
                    label="Word-by-word mode",
                )
                words_per_second_slider = gr.Slider(
                    minimum=1.0,
                    maximum=5.0,
                    value=2.0,
                    step=0.5,
                    label="Words/sec",
                )

            render_btn = gr.Button(
                "🎬 Render Preview",
                variant="primary",
                size="lg",
            )

        # Right column: Output
        with gr.Column(scale=1):
            gr.Markdown("### 📺 Preview Output")
            video_output = gr.Video(
                label="Rendered Preview",
            )
            status_text = gr.Textbox(
                label="Status",
                interactive=False,
            )

            gr.Markdown("""
            ---
            **Animation Effects:**
            - **Pop/Bounce** - Great for kids content
            - **Wiggle** - Playful rotation effect
            - **Pulse** - Flash color for emphasis
            - **Fade** - Smooth professional look
            - **Typewriter** - Letter-by-letter reveal

            **Tips:**
            - Use short videos (5-10 sec) for faster iteration
            - TikTok style works well for vertical videos
            - Higher blur creates a glow effect
            """)

    # Event handlers
    font_install_btn.click(
        fn=install_custom_font,
        inputs=[font_upload],
        outputs=[font_status],
    ).then(
        fn=refresh_font_list,
        outputs=[font_dropdown],
    )

    preset_dropdown.change(
        fn=load_preset,
        inputs=[preset_dropdown],
        outputs=[
            font_dropdown,
            font_size_slider,
            color_dropdown,
            outline_slider,
            shadow_slider,
            margin_v_slider,
            alignment_dropdown,
            bold_checkbox,
            blur_slider,
        ],
    )

    position_preset.change(
        fn=load_position_preset,
        inputs=[position_preset],
        outputs=[
            alignment_dropdown,
            margin_v_slider,
            font_size_slider,
        ],
    )

    render_btn.click(
        fn=render_preview,
        inputs=[
            video_input,
            preset_dropdown,
            font_dropdown,
            font_size_slider,
            color_dropdown,
            outline_slider,
            shadow_slider,
            margin_v_slider,
            alignment_dropdown,
            bold_checkbox,
            blur_slider,
            animation_dropdown,
            sample_text_input,
            word_by_word_checkbox,
            words_per_second_slider,
        ],
        outputs=[video_output, status_text],
    )


if __name__ == "__main__":
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        theme=gr.themes.Soft(),
    )
