"""STT Correction Module for NuuMee FFmpeg Worker.

Corrects Speech-to-Text results by aligning them with a provided original script.
Uses an "anchor and fill" strategy to prevent timing drift while preserving
accurate timing information.
"""
import logging
import re
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


def normalize_word(word: str) -> str:
    """Normalize a word for comparison by lowercasing and removing punctuation."""
    if not isinstance(word, str):
        return ""
    return word.lower().replace(",", "").replace(".", "").replace("!", "").replace("?", "").replace("'", "").replace('"', "").strip()


def parse_time(time_str: str) -> float:
    """Parse time string (e.g., '1.5s' or '1.5') to float seconds."""
    if isinstance(time_str, (int, float)):
        return float(time_str)
    if isinstance(time_str, str):
        return float(time_str.replace("s", ""))
    return 0.0


def format_time(time_float: float) -> str:
    """Format float seconds to time string (e.g., '1.500s')."""
    return f"{time_float:.3f}s"


def extract_words_from_script(script: str) -> List[str]:
    """Extract clean words array from script text."""
    # Remove punctuation but keep apostrophes in contractions
    cleaned = re.sub(r"[^\w\s'-]", " ", script)
    words = cleaned.split()
    return [w.strip() for w in words if w.strip()]


def levenshtein_distance(a: str, b: str) -> int:
    """Calculate Levenshtein edit distance between two strings."""
    if len(a) < len(b):
        a, b = b, a

    if len(b) == 0:
        return len(a)

    previous_row = list(range(len(b) + 1))

    for i, c1 in enumerate(a):
        current_row = [i + 1]
        for j, c2 in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def levenshtein_similarity(a: str, b: str) -> float:
    """Calculate similarity score (0-100) based on Levenshtein distance."""
    max_length = max(len(a), len(b))
    if max_length == 0:
        return 100.0
    distance = levenshtein_distance(a, b)
    return (1 - distance / max_length) * 100


def phonetic_key(word: str) -> str:
    """Generate a simple phonetic key for a word."""
    key = word.lower()
    # Remove vowels (except leading)
    if len(key) > 1:
        key = key[0] + re.sub(r"[aeiou]", "", key[1:])
    # Normalize similar consonants
    key = re.sub(r"[ck]", "k", key)
    key = re.sub(r"[sz]", "s", key)
    key = re.sub(r"[bp]", "b", key)
    key = re.sub(r"[dt]", "t", key)
    key = re.sub(r"[gj]", "g", key)
    key = key.replace("ph", "f")
    # Remove consecutive duplicates
    key = re.sub(r"(.)\1+", r"\1", key)
    return key


def phonetic_similarity(a: str, b: str) -> float:
    """Calculate phonetic similarity between two words."""
    key_a = phonetic_key(a)
    key_b = phonetic_key(b)
    if key_a == key_b:
        return 90.0
    return levenshtein_similarity(key_a, key_b) * 0.8


def prefix_similarity(a: str, b: str) -> float:
    """Calculate similarity based on common prefix."""
    min_length = min(len(a), len(b))
    matches = 0
    for i in range(min_length):
        if a[i] == b[i]:
            matches += 1
        else:
            break
    max_length = max(len(a), len(b))
    if max_length == 0:
        return 0.0
    return (matches / max_length) * 100


def word_similarity(word1: str, word2: str) -> float:
    """Calculate overall similarity between two words using multiple methods."""
    if not word1 or not word2:
        return 0.0

    w1 = normalize_word(word1)
    w2 = normalize_word(word2)

    if w1 == w2:
        return 100.0

    # Check for substring inclusion (compound words)
    if w2 in w1 or w1 in w2:
        inclusion_score = min(len(w1), len(w2)) / max(len(w1), len(w2)) * 100
        if inclusion_score > 50:
            return inclusion_score

    lev_sim = levenshtein_similarity(w1, w2)
    phon_sim = phonetic_similarity(w1, w2)
    pref_sim = prefix_similarity(w1, w2)

    return max(lev_sim, phon_sim * 0.9, pref_sim * 0.7)


def correct_stt_with_script(
    stt_words: List[Dict],
    script: str,
    similarity_threshold: float = 50.0
) -> List[Dict]:
    """
    Correct STT word results by aligning them with the original script.

    Uses an "anchor and fill" strategy:
    1. Find matching words (anchors) between STT and script
    2. Fill gaps between anchors by distributing script words evenly
    3. Preserve original timing from STT results

    Args:
        stt_words: List of STT word dicts with 'word', 'start_time', 'end_time'
        script: The original script text
        similarity_threshold: Minimum similarity score to consider a match (0-100)

    Returns:
        Corrected words list with same format, preserving timing
    """
    if not script or not script.strip():
        logger.info("No script provided, returning STT results unchanged")
        return stt_words

    if not stt_words:
        logger.warning("No STT words to correct")
        return stt_words

    script_words = extract_words_from_script(script)
    if not script_words:
        logger.warning("Script produced no words after extraction")
        return stt_words

    logger.info(f"Correcting {len(stt_words)} STT words against {len(script_words)} script words")

    # Configuration
    ANCHOR_SEARCH_WINDOW = 10

    corrected_words = []
    stt_index = 0
    script_index = 0

    while stt_index < len(stt_words) and script_index < len(script_words):
        current_stt = stt_words[stt_index]
        current_script = script_words[script_index]

        stt_word_norm = normalize_word(current_stt.get("word", ""))
        script_word_norm = normalize_word(current_script)

        # A. Direct Match
        if stt_word_norm == script_word_norm:
            corrected_words.append({
                "word": current_script,  # Use script spelling
                "start_time": current_stt["start_time"],
                "end_time": current_stt["end_time"],
            })
            stt_index += 1
            script_index += 1
            continue

        # B. High similarity match (substitution)
        similarity = word_similarity(stt_word_norm, script_word_norm)
        if similarity >= similarity_threshold:
            corrected_words.append({
                "word": current_script,  # Use script spelling
                "start_time": current_stt["start_time"],
                "end_time": current_stt["end_time"],
            })
            stt_index += 1
            script_index += 1
            continue

        # C. Mismatch - find next anchor point
        best_anchor = {"stt_i": -1, "script_j": -1, "dist": float("inf")}

        for i in range(1, min(ANCHOR_SEARCH_WINDOW + 1, len(stt_words) - stt_index)):
            for j in range(1, min(ANCHOR_SEARCH_WINDOW + 1, len(script_words) - script_index)):
                stt_candidate = normalize_word(stt_words[stt_index + i].get("word", ""))
                script_candidate = normalize_word(script_words[script_index + j])

                if stt_candidate == script_candidate:
                    distance = i + j
                    if distance < best_anchor["dist"]:
                        best_anchor = {
                            "stt_i": stt_index + i,
                            "script_j": script_index + j,
                            "dist": distance
                        }

        if best_anchor["stt_i"] != -1:
            # Anchor found - fill the gap
            gap_stt = stt_words[stt_index:best_anchor["stt_i"]]
            gap_script = script_words[script_index:best_anchor["script_j"]]

            gap_start = parse_time(current_stt["start_time"])
            gap_end = parse_time(stt_words[best_anchor["stt_i"]]["start_time"])
            gap_duration = gap_end - gap_start

            if gap_script and gap_duration > 0:
                time_per_word = gap_duration / len(gap_script)
                word_start = gap_start

                for word in gap_script:
                    word_end = word_start + time_per_word
                    corrected_words.append({
                        "word": word,
                        "start_time": format_time(word_start),
                        "end_time": format_time(word_end),
                    })
                    word_start = word_end

            stt_index = best_anchor["stt_i"]
            script_index = best_anchor["script_j"]
        else:
            # No anchor found - simple substitution to keep progressing
            corrected_words.append({
                "word": current_script,
                "start_time": current_stt["start_time"],
                "end_time": current_stt["end_time"],
            })
            stt_index += 1
            script_index += 1

    # Handle remaining script words (STT ended early)
    if script_index < len(script_words):
        remaining_words = script_words[script_index:]
        last_timestamp = corrected_words[-1]["end_time"] if corrected_words else "0s"

        for word in remaining_words:
            corrected_words.append({
                "word": word,
                "start_time": last_timestamp,
                "end_time": last_timestamp,
            })
        logger.info(f"Added {len(remaining_words)} remaining script words at end")

    # Log correction stats
    original_text = " ".join(w.get("word", "") for w in stt_words)
    corrected_text = " ".join(w["word"] for w in corrected_words)

    if original_text != corrected_text:
        logger.info(f"STT correction applied: {len(stt_words)} -> {len(corrected_words)} words")
        logger.debug(f"Original: {original_text[:100]}...")
        logger.debug(f"Corrected: {corrected_text[:100]}...")
    else:
        logger.info("No corrections needed - STT matched script")

    return corrected_words
