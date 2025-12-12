# Subtitle Style Preview Tool

Local Gradio app for visual subtitle style experimentation. Upload a video, tweak parameters, and see the result instantly.

## Quick Start

```bash
cd tools/subtitle-preview

# Create virtual environment (first time)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open http://localhost:7860 in your browser (or use VS Code Ports panel for Cloud Workstation).

## Usage

1. **Upload a video** - Short clips (5-10 sec) work best for fast iteration
2. **Select a preset** - Start with `classic`, `bold`, `minimal`, `large`, or `rainbow`
3. **Adjust parameters** - Font, size, color, animation, position
4. **Enter sample text** - Type the subtitle text to preview
5. **Click "Render Preview"** - FFmpeg burns subtitles onto your video
6. **Review output** - Download or continue tweaking

## Controls

### Font Settings

| Control | Description | Range |
|---------|-------------|-------|
| Font | Font family | Arial, DejaVu Sans, etc. |
| Font Size | Text size (auto-scales with video resolution) | 12-100 |
| Bold | Bold text weight | On/Off |

### Colors & Effects

| Control | Description | Range |
|---------|-------------|-------|
| Text Color | Subtitle color | White, Yellow, Orange, etc. |
| Outline | Border thickness | 0-8 |
| Shadow | Drop shadow distance | 0-6 |
| Glow/Blur | Soft glow effect around text | 0-10 |

### Animation Effects

| Effect | Description | Use Case |
|--------|-------------|----------|
| None | Static text | Professional, clean |
| Pop/Bounce | Scale up 130% then back | Kids content, emphasis |
| Wiggle | Rotate ±3° then settle | Playful, casual |
| Color Pulse | Flash to yellow and back | Attention, emphasis |
| Fade In | Smooth 200ms fade | Professional, smooth |
| Typewriter | Letter-by-letter reveal | Dramatic, narrative |

### Position Settings

| Preset | Alignment | Margin | Size | Use Case |
|--------|-----------|--------|------|----------|
| YouTube | Bottom Center | 50px | 24 | Standard landscape |
| TikTok | Middle Center | 0px | 36 | Vertical video |
| Cinema | Bottom Center | 30px | 20 | Movie-style |
| Top Banner | Top Center | 30px | 24 | News/info overlay |
| Custom | Any | Any | Any | Full control |

### Text Settings

| Control | Description | Range |
|---------|-------------|-------|
| Preview Text | The text displayed as subtitle | Any text |
| Word-by-word | Show each word separately | On/Off |
| Words/sec | Speed of word display | 1-5 |

## Style Presets

| Preset | Description |
|--------|-------------|
| `classic` | White text, black outline - clean and readable |
| `bold` | Yellow text, thick outline - high visibility |
| `minimal` | Small white text, subtle shadow - unobtrusive |
| `large` | Extra large for mobile viewing |
| `rainbow` | Multi-color cycling (Orange → Green → Cyan → Blue) |

## Rainbow Mode

Rainbow mode cycles through 4 colors per word:
- **Rainbow1**: Orange (`&H000080FF`)
- **Rainbow2**: Green-ish (`&H0000FF80`)
- **Rainbow3**: Cyan (`&H0080FF00`)
- **Rainbow4**: Blue (`&H00FF8000`)

Each word in word-by-word mode gets the next color in sequence.

## ASS Format Reference

The tool generates ASS (Advanced SubStation Alpha) subtitle files.

### Style Line Format
```
Style: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
```

### Color Format (BGR)
ASS uses `&HAABBGGRR` format (not RGB!):
- `AA` = Alpha (00=opaque, FF=transparent)
- `BB` = Blue, `GG` = Green, `RR` = Red

| Color | ASS Code |
|-------|----------|
| White | `&H00FFFFFF` |
| Yellow | `&H0000FFFF` |
| Orange | `&H000080FF` |
| Red | `&H000000FF` |
| Green | `&H0000FF00` |
| Cyan | `&H00FFFF00` |
| Blue | `&H00FF0000` |

### Animation Override Tags
```
{\t(start,end,\effect)}  - Transition effect over time (ms)
{\fscx130\fscy130}       - Scale X/Y to 130%
{\frz3}                  - Rotate Z-axis 3 degrees
{\c&H0000FFFF&}          - Change color to yellow
{\fad(200,0)}            - Fade in 200ms
{\blur5}                 - Blur/glow effect
{\k5}                    - Karaoke timing (50ms per char)
```

### Alignment Values
```
7 = Top Left      8 = Top Center      9 = Top Right
4 = Middle Left   5 = Middle Center   6 = Middle Right
1 = Bottom Left   2 = Bottom Center   3 = Bottom Right
```

## Custom Fonts

1. Click "Upload Custom Font" to upload a .ttf or .otf file
2. Click "Install Font" to install it
3. Select the font from the dropdown
4. Font is installed to both the tool's custom_fonts/ directory and ~/.local/share/fonts/

## Workflow Tips

**Fast iteration:**
- Use a 5-second test clip
- Start with a preset close to your goal
- Adjust one parameter at a time

**Testing animations:**
- Use word-by-word mode to see per-word effects
- Slow down words/sec to see each animation clearly

**Once happy with settings:**
- Note the parameter values
- Update `gs://nuumee-assets/config/subtitle-styles.json`
- New production jobs will use updated styles

## Requirements

- Python 3.9+
- FFmpeg (must be in PATH): `sudo apt install ffmpeg`
- Fonts: `sudo apt install ttf-mscorefonts-installer fonts-dejavu`
- ~100MB disk space for temp files

## Files

```
tools/subtitle-preview/
├── app.py              # Gradio UI
├── ass_generator.py    # ASS subtitle generation
├── requirements.txt    # Python dependencies
├── custom_fonts/       # Uploaded custom fonts
├── venv/               # Python virtual environment
└── README.md           # This file
```

## Not for Production

This tool is **local-only** for design iteration. It does not:
- Connect to GCS
- Affect production worker behavior
- Deploy anywhere

Production subtitle styles live in `gs://nuumee-assets/config/subtitle-styles.json`.

See [SUBTITLE_STYLES_CONFIG.md](/docs/SUBTITLE_STYLES_CONFIG.md) for production config documentation.

## Related Files

| File | Purpose |
|------|---------|
| `gs://nuumee-assets/config/subtitle-styles.json` | Production runtime config |
| `ffmpeg-worker/subtitles.py` | Production ASS generator |
| `docs/SUBTITLE_STYLES_CONFIG.md` | Production config guide |
| `docs/tempDebug/ffmpeg-ASS-Payload.js` | n8n reference implementation |
