import { Filesystem, Directory } from "@capacitor/filesystem";
import { Dialog } from "@capacitor/dialog";

const DIR = Directory[import.meta.env.VITE_DIR];

// Helper function to validate file extension
function validateFileExtension(filename) {
  const validExts = ["mp3", "m4a", "ogg", "wav"];
  const sp = filename.split(".");
  const fExt = sp[sp.length - 1].toLowerCase();

  return {
    isValid: validExts.includes(fExt),
    extension: fExt,
    validExtensions: validExts,
  };
}

async function ensureDirExists(fullPath) {
  try {
    await Filesystem.mkdir({
      path: fullPath,
      directory: Directory.Documents,
      recursive: true,
    });
    console.log(`✓ Directory ensured: ${fullPath}`);
  } catch (e) {
    // Ignore error if directory already exists
    if (e.message?.toLowerCase().includes("already exists") === false) {
      console.error("Failed to create directory:", fullPath, e);
      throw e; // Re-throw if it's not an "already exists" error
    }
  }
}

// Function to copy all songs from app's Data directory to Android's Music directory
export async function copyAllSongs(onProgress) {
  const results = {
    successful: [],
    failed: [],
    totalSongs: 0,
    totalGenres: 0,
    totalSize: 0, // in bytes
  };

  try {
    console.log("Starting copyAllSongs operation...");
    await ensureDirExists("Zentunes");

    // Check if we have permission to write to external storage
    const permissions = await Filesystem.checkPermissions();
    if (permissions.publicStorage !== "granted") {
      const requestResult = await Filesystem.requestPermissions();
      if (requestResult.publicStorage !== "granted") {
        throw new Error(
          "Storage permission required to copy songs to Music directory"
        );
      }
    }

    // Read the main audios directory to get all genre subdirectories
    const { files } = await Filesystem.readdir({
      path: `audios`,
      directory: DIR,
    });

    console.log(
      "Found files/directories in audios:",
      JSON.stringify(files, null, 2)
    );

    // Extract directories (genres) from files
    const genres = files
      .filter((file) => file.type === "directory")
      .map((dir) => dir.name);

    if (genres.length === 0) {
      await Dialog.alert({
        title: "No Genres Found",
        message: "No audio genre directories found in the app's storage.",
      });
      return results;
    }

    results.totalGenres = genres.length;
    console.log(`Found ${genres.length} genres:`, genres);

    let processedSongs = 0;

    // Process each genre directory
    for (let genreIndex = 0; genreIndex < genres.length; genreIndex++) {
      const genre = genres[genreIndex];
      console.log(
        `Processing genre ${genreIndex + 1}/${genres.length}: ${genre}`
      );

      try {
        // Read songs in this genre directory
        const { files: genreSongs } = await Filesystem.readdir({
          path: `audios/${genre}`,
          directory: DIR,
        });

        // Filter only audio files
        const audioFiles = genreSongs.filter((file) => {
          if (file.type !== "file") return false;
          const validation = validateFileExtension(file.name);
          return validation.isValid;
        });

        console.log(`Found ${audioFiles.length} audio files in ${genre}`);
        results.totalSongs += audioFiles.length;

        // Process each song in this genre
        for (let songIndex = 0; songIndex < audioFiles.length; songIndex++) {
          const audioFile = audioFiles[songIndex];
          const filename = audioFile.name;
          processedSongs++;

          // Update progress
          if (onProgress) {
            onProgress({
              current: processedSongs,
              total: results.totalSongs,
              currentGenre: genre,
              filename: filename,
              genreProgress: {
                current: songIndex + 1,
                total: audioFiles.length,
              },
              status: "processing",
            });
          }

          try {
            console.log(
              `Processing song ${processedSongs}/${results.totalSongs}: ${genre}/${filename}`
            );

            // Read the audio file from app's Data directory
            const audioData = await Filesystem.readFile({
              path: `audios/${genre}/${filename}`,
              directory: DIR,
            });

            if (!audioData.data || audioData.data.length === 0) {
              throw new Error("File data is empty or corrupted");
            }

            // Create the Music/Zentunes/genre directory structure
            const musicGenrePath = `Zentunes/${genre}`;

            // Ensure the genre directory exists in Music
            await ensureDirExists(musicGenrePath);

            // Write the file to Music directory
            const musicFilePath = `Zentunes/${genre}/${filename}`;
            await Filesystem.writeFile({
              path: musicFilePath,
              data: audioData.data, // Keep as base64, Filesystem will handle conversion
              directory: Directory.Documents,
            });

            // Verify the written file
            const verification = await Filesystem.stat({
              path: musicFilePath,
              directory: Directory.Documents,
            });

            if (!verification.size || verification.size === 0) {
              throw new Error("Copied file appears to be empty");
            }

            results.successful.push({
              genre: genre,
              filename: filename,
              sourcePath: `audios/${genre}/${filename}`,
              destPath: musicFilePath,
              size: verification.size,
            });

            results.totalSize += verification.size;

            console.log(
              `✓ Successfully copied: ${genre}/${filename} (${Math.round(
                verification.size / 1024
              )} KB)`
            );

            if (onProgress) {
              onProgress({
                current: processedSongs,
                total: results.totalSongs,
                currentGenre: genre,
                filename: filename,
                genreProgress: {
                  current: songIndex + 1,
                  total: audioFiles.length,
                },
                status: "completed",
                size: verification.size,
              });
            }
          } catch (songError) {
            console.error(
              `✗ Error copying song ${genre}/${filename}:`,
              songError
            );
            results.failed.push({
              genre: genre,
              filename: filename,
              sourcePath: `audios/${genre}/${filename}`,
              error: songError.message || "Unknown error occurred",
            });

            if (onProgress) {
              onProgress({
                current: processedSongs,
                total: results.totalSongs,
                currentGenre: genre,
                filename: filename,
                genreProgress: {
                  current: songIndex + 1,
                  total: audioFiles.length,
                },
                status: "failed",
                error: songError.message,
              });
            }
          }

          // Small delay to prevent overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } catch (genreError) {
        console.error(`Error processing genre ${genre}:`, genreError);
        // Continue with next genre
      }
    }

    // Show summary
    const successCount = results.successful.length;
    const failedCount = results.failed.length;
    const totalSizeMB = Math.round(results.totalSize / (1024 * 1024));

    let message = `Copy operation completed!\n\n`;
    message += `Processed ${results.totalGenres} genre(s)\n`;
    message += `✓ ${successCount} songs copied successfully\n`;

    if (failedCount > 0) {
      message += `✗ ${failedCount} songs failed to copy\n`;
    }

    if (successCount > 0) {
      message += `\nTotal size copied: ${totalSizeMB} MB\n`;
      message += `Location: /storage/emulated/0/Music/Zentunes/\n`;
      message += `\nYou can now access your songs through any music player app!`;
    }

    // Add some failed files details (limit to first 3)
    if (failedCount > 0) {
      message += `\n\nSome failed files:\n`;
      results.failed.slice(0, 3).forEach((item) => {
        message += `• ${item.genre}/${item.filename}: ${item.error}\n`;
      });

      if (failedCount > 3) {
        message += `... and ${failedCount - 3} more failed files\n`;
      }
    }

    await Dialog.alert({
      title: successCount > 0 ? "Copy Completed" : "Copy Failed",
      message: message.trim(),
    });

    console.log("copyAllSongs completed. Results:", {
      successful: successCount,
      failed: failedCount,
      totalSize: `${totalSizeMB} MB`,
    });

    return results;
  } catch (err) {
    console.error("Error in copyAllSongs:", err);
    await Dialog.alert({
      title: "Copy Error",
      message:
        err.message || "An unexpected error occurred while copying songs.",
    });
    throw err;
  }
}
