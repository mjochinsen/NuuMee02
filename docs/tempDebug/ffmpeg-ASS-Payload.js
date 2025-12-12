// n8n Function Node: ASS Subtitle Generator - Direct Words Array Input
const episodeData = $input.item.json;
const TARGET_FIRST_CHUNK_SEC = 8.0;

function toASSTime(secondsStr) {
  const totalSeconds = parseFloat(secondsStr.replace("s", ""));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.floor((totalSeconds % 1) * 100);
  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

function calculateSilencePadding(words) {
  if (words.length === 0) return 0;
  const lastWord = words[words.length - 1];
  const originalDuration = parseFloat(lastWord.endTime.replace("s", ""));
  return Math.max(0, TARGET_FIRST_CHUNK_SEC - originalDuration);
}

function adjustWordTimings(words, introLength, silencePadding) {
  const totalDelay = introLength + silencePadding;
  return words.map((word) => ({
    ...word,
    startTime:
      (parseFloat(word.startTime.replace("s", "")) + totalDelay).toFixed(3) +
      "s",
    endTime:
      (parseFloat(word.endTime.replace("s", "")) + totalDelay).toFixed(3) + "s",
  }));
}

function detectWordStyle(word, index, allWords) {
  const wordLower = word.toLowerCase();
  const punchlineWords = [
    "subwoofer",
    "subwoofers",
    "catastrophe",
    "microphone",
    "comedy",
  ];
  if (punchlineWords.some((punch) => wordLower.includes(punch)))
    return "Punchline";
  if (word.includes("?")) return "Question";
  const emphasisWords = ["wait", "no", "swear", "actually"];
  if (emphasisWords.includes(wordLower)) return "Emphasis";
  const rainbowStyles = ["Rainbow1", "Rainbow2", "Rainbow3", "Rainbow4"];
  return rainbowStyles[index % rainbowStyles.length];
}

function generateASSContent(words, episodeName) {
  const assHeader = `[Script Info]
Title: ${episodeName} - Kids Comedy Captions
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Rainbow1,Arial,22,&H000080FF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow2,Arial,22,&H0000FF80,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow3,Arial,22,&H0080FF00,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Rainbow4,Arial,22,&H00FF8000,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,20,20,80,1
Style: Punchline,Arial,25,&H0000FFFF,&H000000FF,&H0000FF00,&H80000000,1,0,0,0,120,120,0,0,1,4,3,2,20,20,75,1
Style: Question,Arial,24,&H00FF00FF,&H000000FF,&H00FFFFFF,&H80000000,1,1,0,0,110,110,0,0,1,3,2,2,20,20,78,1
Style: Emphasis,Arial,23,&H0000FFFF,&H000000FF,&H000000FF,&H80000000,1,0,0,0,105,105,0,0,1,3,2,2,20,20,79,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = words
    .map((word, index) => {
      const startSec = parseFloat(word.startTime.replace("s", ""));
      let endSec = parseFloat(word.endTime.replace("s", ""));

      // Force 0.2s minimum duration
      if (endSec - startSec < 0.2) {
        endSec = startSec + 0.2;
      }

      const startTime = toASSTime(`${startSec}s`);
      const endTime = toASSTime(`${endSec}s`);
      const style = detectWordStyle(word.word, index, words);

      let text = word.word;
      if (style === "Punchline") {
        text = `{\\t(0,300,\\fscx120\\fscy120)\\t(300,600,\\fscx100\\fscy100)}${text}`;
      } else if (style === "Question") {
        text = `{\\t(0,200,\\frz2)\\t(200,400,\\frz-2)\\t(400,600,\\frz0)}${text}`;
      } else if (style === "Emphasis") {
        text = `{\\t(0,250,\\fscx105\\fscy105)\\t(250,500,\\fscx100\\fscy100)}${text}`;
      }

      return `Dialogue: 0,${startTime},${endTime},${style},,0,0,0,,${text}`;
    })
    .join("\n");

  return `${assHeader}\n${events}`;
}

// MAIN PROCESSING
try {
  console.log(
    "Processing episode with direct words array:",
    episodeData.EpisodeName
  );

  const episodeName = episodeData.EpisodeName;
  const episodeNumber = episodeData.EpisodeNumber;
  const introLength = 0; // Remove intro delay - set to 0
  const wordsArray = episodeData.words;

  if (!wordsArray || !Array.isArray(wordsArray) || wordsArray.length === 0) {
    throw new Error("No words array found in input data");
  }

  console.log(`Found ${wordsArray.length} words in direct words array`);

  const silencePadding = 0; // calculateSilencePadding(wordsArray);
  const adjustedWords = adjustWordTimings(
    wordsArray,
    introLength,
    silencePadding
  );
  const assContent = generateASSContent(adjustedWords, episodeName);

  const cleanName = episodeName.replace(/[^a-zA-Z0-9]/g, "");
  const timestamp = Date.now();

  // Generate output filename
  const outputFilename = `gs://books001final/InnerCritters01/${cleanName}_${episodeNumber}/AddedCaptions_${cleanName}_${episodeNumber}_${timestamp}.mp4`;

  console.log("SUCCESS: Generated ASS content from direct words array");
  console.log("Video URL:", episodeData.VideoWithAudio);
  console.log("Output:", outputFilename);
  console.log("ASS content length:", assContent.length);

  return {
    json: {
      // Output variables exactly as requested
      videoUrl: episodeData.VideoWithAudio,
      assContent: assContent
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"'),
      output: outputFilename,

      // Metadata for tracking
      metadata: {
        success: true,
        runner_type: "NEW_ASS_RUNNER",
        episode_name: episodeName,
        episode_number: episodeNumber,
        word_count: adjustedWords.length,
        intro_delay: introLength,
        silence_padding: silencePadding,
        total_delay: introLength + silencePadding,
        video_url: episodeData.VideoWithAudio,
        output_filename: outputFilename,
        ass_content_length: assContent.length,
        input_type: "DIRECT_WORDS_ARRAY",
      },
    },
  };
} catch (error) {
  console.error("Error processing episode:", error.message);

  return {
    json: {
      videoUrl: "",
      assContent: "",
      output: "",
      metadata: {
        success: false,
        error: error.message,
        episode_name: episodeData.EpisodeName || "Unknown",
        episode_number: episodeData.EpisodeNumber || "Unknown",
        runner_type: "NEW_ASS_RUNNER",
        input_type: "DIRECT_WORDS_ARRAY",
      },
    },
  };
}
