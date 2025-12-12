/**
 * n8n Function Node: STT Correction using Sequence-Aware Alignment
 *
 * This node corrects inaccuracies in Speech-to-Text (STT) results by aligning them
 * with a provided ground truth script. It intelligently handles common STT errors
 * like substitutions, merged/split words, insertions, and deletions to preserve timing.
 * This version uses an "anchor and fill" strategy to prevent timing drift.
 *
 * @input {Object} item - The input item from the previous n8n node.
 * @input {Object[]} item.sttResults - The array of results from the STT service.
 * @input {string} item.EpisodeScript - The correct, ground truth transcript.
 *
 * @output {Object} item - The item with corrected STT results.
 * @output {string} item.sttResults[0].alternatives[0].transcript - The corrected full transcript string.
 * @output {Object[]} item.sttResults[0].alternatives[0].words - The corrected words array, preserving original timestamps.
 */

// --- Helper function to normalize words for comparison ---
const normalizeWord = (word) => {
  if (typeof word !== "string") return "";
  return word.toLowerCase().replace(/[.,]/g, "");
};

// --- Helper functions for time conversion ---
const parseTime = (timeStr) => {
  if (typeof timeStr !== "string") return 0;
  return parseFloat(timeStr.replace("s", ""));
};

const formatTime = (timeFloat) => {
  return timeFloat.toFixed(3) + "s";
};

// --- Main processing logic ---
const item = items[0].json;
const sttResults = item.sttResults;
const episodeScript = item.EpisodeScript;

if (!sttResults || !sttResults[0] || !episodeScript) {
  console.error("Input data is missing 'sttResults' or 'EpisodeScript'.");
  return items;
}

const alternative = sttResults[0].alternatives[0];
const sttWords = alternative.words.filter(
  (w) => w.word && w.word.trim() !== ""
);
const scriptWords = episodeScript.trim().split(/\s+/);

const correctedWords = [];
let sttIndex = 0;
let scriptIndex = 0;
const ANCHOR_SEARCH_WINDOW = 10; // How far to look for a reliable resync point.

while (sttIndex < sttWords.length && scriptIndex < scriptWords.length) {
  const currentSttWord = sttWords[sttIndex];
  const currentScriptWord = scriptWords[scriptIndex];

  // A. Direct Match: If words are the same, it's a perfect match.
  if (normalizeWord(currentSttWord.word) === normalizeWord(currentScriptWord)) {
    correctedWords.push({
      startTime: currentSttWord.startTime,
      endTime: currentSttWord.endTime,
      word: currentScriptWord,
    });
    sttIndex++;
    scriptIndex++;
    continue;
  }

  // B. Mismatch: Find the next anchor point to resynchronize.
  let bestAnchor = {
    sttI: -1,
    scriptJ: -1,
    dist: Infinity,
  };

  for (
    let i = 1;
    i <= ANCHOR_SEARCH_WINDOW && sttIndex + i < sttWords.length;
    i++
  ) {
    for (
      let j = 1;
      j <= ANCHOR_SEARCH_WINDOW && scriptIndex + j < scriptWords.length;
      j++
    ) {
      if (
        normalizeWord(sttWords[sttIndex + i].word) ===
        normalizeWord(scriptWords[scriptIndex + j])
      ) {
        const distance = i + j;
        if (distance < bestAnchor.dist) {
          bestAnchor = {
            sttI: sttIndex + i,
            scriptJ: scriptIndex + j,
            dist: distance,
          };
        }
      }
    }
  }

  if (bestAnchor.sttI !== -1) {
    // Anchor found, now fill the gap.
    const gapSttWords = sttWords.slice(sttIndex, bestAnchor.sttI);
    const gapScriptWords = scriptWords.slice(scriptIndex, bestAnchor.scriptJ);

    const gapStartTime = parseTime(currentSttWord.startTime);
    const gapEndTime = parseTime(sttWords[bestAnchor.sttI].startTime);
    const gapDuration = gapEndTime - gapStartTime;

    if (gapScriptWords.length > 0 && gapDuration > 0) {
      const timePerWord = gapDuration / gapScriptWords.length;
      let wordStartTime = gapStartTime;
      for (const word of gapScriptWords) {
        const wordEndTime = wordStartTime + timePerWord;
        correctedWords.push({
          startTime: formatTime(wordStartTime),
          endTime: formatTime(wordEndTime),
          word: word,
        });
        wordStartTime = wordEndTime;
      }
    }

    sttIndex = bestAnchor.sttI;
    scriptIndex = bestAnchor.scriptJ;
  } else {
    // No anchor found, fallback to simple substitution to keep progressing.
    correctedWords.push({
      startTime: currentSttWord.startTime,
      endTime: currentSttWord.endTime,
      word: currentScriptWord,
    });
    sttIndex++;
    scriptIndex++;
  }
}

// --- Handle truncated STT results ---
if (scriptIndex < scriptWords.length) {
  const remainingWords = scriptWords.slice(scriptIndex);
  const lastTimestamp =
    correctedWords.length > 0
      ? correctedWords[correctedWords.length - 1].endTime
      : "0s";
  remainingWords.forEach((word) => {
    correctedWords.push({
      startTime: lastTimestamp,
      endTime: lastTimestamp,
      word: word,
    });
  });
}

alternative.words = correctedWords;
alternative.transcript = correctedWords
  .map((w) => w.word)
  .join(" ")
  .trim();
alternative.confidence = 1.0;
alternative.correctionMethod = "Sequence-Aware Alignment v6 (Anchor & Fill)";

return items;
