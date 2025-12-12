"""Google Speech-to-Text integration for NuuMee FFmpeg Worker.

Handles audio transcription with word-level timestamps.
"""
import logging
from typing import List, Dict
from google.cloud import speech_v1 as speech

logger = logging.getLogger(__name__)

# Initialize client (lazy)
_speech_client: speech.SpeechClient = None


def get_speech_client() -> speech.SpeechClient:
    """Get Speech-to-Text client (lazy initialization)."""
    global _speech_client
    if _speech_client is None:
        _speech_client = speech.SpeechClient()
    return _speech_client


def transcribe_audio_sync(audio_path: str, language_code: str = "en-US") -> List[Dict]:
    """
    Transcribe audio file using synchronous API (for audio < 60 seconds).

    Args:
        audio_path: Path to local audio file (WAV format, 16kHz mono)
        language_code: Language code (default: en-US)

    Returns:
        List of word dictionaries with start_time, end_time, word
    """
    client = get_speech_client()

    # Read audio file
    with open(audio_path, "rb") as f:
        audio_content = f.read()

    audio = speech.RecognitionAudio(content=audio_content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code=language_code,
        enable_word_time_offsets=True,
        enable_automatic_punctuation=True,
    )

    logger.info(f"Transcribing audio (sync): {audio_path}")
    response = client.recognize(config=config, audio=audio)

    return extract_word_timestamps(response)


def transcribe_audio_async(audio_gcs_uri: str, language_code: str = "en-US") -> List[Dict]:
    """
    Transcribe audio file using asynchronous API (for audio 60-480 seconds).

    Args:
        audio_gcs_uri: GCS URI of audio file (gs://bucket/path)
        language_code: Language code (default: en-US)

    Returns:
        List of word dictionaries with start_time, end_time, word
    """
    client = get_speech_client()

    audio = speech.RecognitionAudio(uri=audio_gcs_uri)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code=language_code,
        enable_word_time_offsets=True,
        enable_automatic_punctuation=True,
    )

    logger.info(f"Transcribing audio (async): {audio_gcs_uri}")
    operation = client.long_running_recognize(config=config, audio=audio)

    logger.info("Waiting for STT operation to complete...")
    response = operation.result(timeout=300)  # 5 minute timeout

    return extract_word_timestamps(response)


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
