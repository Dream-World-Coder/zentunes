import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { getAudioDuration, getAudioMetadata } from "./audioMeta";
import { getFormattedTitle, getMediaTypeFromFilename } from "./formatting";

const DIR = Directory[import.meta.env.VITE_DIR];

export async function makeAudioCache() {
  try {
    const { files } = await Filesystem.readdir({
      path: `audios`,
      directory: DIR,
    });

    console.log("Found files:", JSON.stringify(files, null, 2));

    // Extract directories from files, and read them 1 by 1
    const genres = files
      .filter((file) => file.type === "directory")
      .map((dir) => dir.name);

    console.log("Found genres:", JSON.stringify(genres, null, 2));

    const audioData = {}; // the entire data
    const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // helper

    for (const genre of genres) {
      console.log(`\nProcessing genre: ${genre}`);

      const result = await Filesystem.readdir({
        path: `audios/${genre}`,
        directory: DIR,
      });

      const genreSongs = [];
      let processedCount = 0;

      for (const file of result.files) {
        if (!file.name || !file.uri) {
          console.warn(
            `[cache service]: for file = ${
              file.name || "unnamed"
            }, file.name or file.uri is undefined, so skipping`
          );
          continue;
        }

        const filename = file.name;
        const fileUrl = Capacitor.convertFileSrc(file.uri);

        console.log(
          `Processing file ${++processedCount}/${
            result.files.length
          }: ${filename}`
        );

        let duration = null;
        let metaObj = null;

        try {
          // Get metadata first (for title, artist, etc.)
          metaObj = await getAudioMetadata(fileUrl, filename);

          // Use the improved duration extraction
          duration = await getAudioDuration(fileUrl, filename);

          // Add a small delay to prevent overwhelming the system
          await delay(100);
        } catch (e) {
          console.warn(
            `[cache service]: Failed to process file ${filename}:`,
            e.message || e
          );
          // Don't skip the file, use fallback values
          duration = 180; // 3 minutes fallback
          metaObj = {
            title: null,
            artist: null,
            album: null,
            duration: null,
            bitrate: null,
            sampleRate: null,
          };
        }

        // Ensure we have a valid duration
        if (!duration || duration <= 0) {
          console.warn(`Invalid duration for ${filename}, using fallback`);
          duration = 180; // 3 minutes fallback
        }

        const songData = {
          title: metaObj?.title || getFormattedTitle(filename),
          artist: metaObj?.artist || "Unknown Artist",
          album: metaObj?.album || "Unknown Album",
          src: fileUrl,
          mediaType: getMediaTypeFromFilename(filename),
          duration: Math.floor(duration),
          audioId: window.crypto.randomUUID(),
          genre,
          filename, // Keep original filename for debugging
        };

        genreSongs.push(songData);
        console.log(`✓ Processed: ${songData.title} (${songData.duration}s)`);
      }

      audioData[genre] = genreSongs;
      console.log(`✓ Completed genre ${genre}: ${genreSongs.length} songs`);
    }

    console.log(
      `\nCache building complete. Total songs processed: ${Object.values(
        audioData
      ).reduce((sum, songs) => sum + songs.length, 0)}`
    );

    // Write audioData.json to the main location
    await Filesystem.writeFile({
      path: `audios/audioData.json`,
      data: JSON.stringify(audioData, null, 2), // Pretty print for debugging
      directory: DIR, // Use the same directory as configured
      encoding: Encoding.UTF8,
    });

    // For debug purposes - write to Documents directory
    try {
      await Filesystem.writeFile({
        path: `audioData.json`,
        data: JSON.stringify(audioData, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log("Debug file written to Documents directory");
    } catch (debugError) {
      console.warn("Could not write debug file:", debugError.message);
    }

    // Log summary
    const summary = Object.entries(audioData).map(([genre, songs]) => ({
      genre,
      count: songs.length,
      avgDuration: Math.round(
        songs.reduce((sum, song) => sum + song.duration, 0) / songs.length
      ),
      totalDuration: songs.reduce((sum, song) => sum + song.duration, 0),
    }));

    console.log("Cache Summary:", JSON.stringify(summary, null, 2));

    return audioData;
  } catch (e) {
    console.error("Failed to rebuild cache:", e);
    throw e; // Re-throw to handle upstream
  } finally {
    // Optional: Add a delay before reload to see logs
    setTimeout(() => {
      console.log("Reloading application...");
      window.location.reload();
    }, 1000); // Increased delay to see results
  }
}

export async function validateCache() {
  try {
    const { data } = await Filesystem.readFile({
      path: `audios/audioData.json`,
      directory: DIR,
      encoding: Encoding.UTF8,
    });

    const audioData = JSON.parse(data);
    const issues = [];

    for (const [genre, songs] of Object.entries(audioData)) {
      for (const song of songs) {
        if (!song.duration || song.duration <= 0) {
          issues.push(
            `${genre}/${song.filename}: Invalid duration (${song.duration})`
          );
        }
        if (!song.title || song.title.trim() === "") {
          issues.push(`${genre}/${song.filename}: Missing title`);
        }
      }
    }

    if (issues.length > 0) {
      console.warn("Cache validation issues found:", issues);
      return { valid: false, issues };
    }

    console.log("Cache validation passed");
    return { valid: true, issues: [] };
  } catch (error) {
    console.error("Cache validation failed:", error);
    return { valid: false, issues: [`Validation error: ${error.message}`] };
  }
}
