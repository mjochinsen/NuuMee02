"""Google Speech-to-Text integration for NuuMee FFmpeg Worker.

Handles audio transcription with word-level timestamps.
"""
import logging
from typing import List, Dict, Optional
from google.cloud import speech_v1 as speech

logger = logging.getLogger(__name__)


def transcribe_audio_sync(audio_path: str, language_code: str = "en-US") -> List[Dict]:
    """
    Transcribe audio file using synchronous API (for audio < 60 seconds).

    Args:
        audio_path: Path to local audio file (WAV format, 16kHz mono)
        language_code: Language code (default: en-US)

    Returns:
        List of word dictionaries with start_time, end_time, word
    """
    # TODO: Implement in Phase D
    raise NotImplementedError("Sync transcription not yet implemented")


def transcribe_audio_async(audio_gcs_uri: str, language_code: str = "en-US") -> List[Dict]:
    """
    Transcribe audio file using asynchronous API (for audio 60-480 seconds).

    Args:
        audio_gcs_uri: GCS URI of audio file (gs://bucket/path)
        language_code: Language code (default: en-US)

    Returns:
        List of word dictionaries with start_time, end_time, word
    """
    # TODO: Implement in Phase D
    raise NotImplementedError("Async transcription not yet implemented")


def extract_word_timestamps(response) -> List[Dict]:
    """
    Extract word-level timestamps from STT response.

    Args:
        response: Google STT response object

    Returns:
        List of {"word": str, "start_time": str, "end_time": str}
    """
    words = []

    for result in response.results:
        alternative = result.alternatives[0]
        for word_info in alternative.words:
            start_sec = word_info.start_time.total_seconds()
            end_sec = word_info.end_time.total_seconds()
            words.append({
                "word": word_info.word,
                "start_time": f"{start_sec:.3f}s",
                "end_time": f"{end_sec:.3f}s",
            })

    return words
