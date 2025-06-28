import { Filesystem, Directory } from "@capacitor/filesystem";
import { Dialog } from "@capacitor/dialog";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { Http } from "@capacitor-community/http";
// import { safeReadDir } from "./permissions";

const DIR = Directory[import.meta.env.VITE_DIR];

async function ensureGenreDir(genre) {
  try {
    await Filesystem.mkdir({
      path: `audios/${genre}`,
      directory: DIR,
      recursive: true,
    });
  } catch (e) {
    // Ignore error if already exists
    if (e.message?.toLowerCase().includes("already exists") === false) {
      console.error("Failed to create genre directory:", e);
    }
  }
}

export async function genreExistsLocally(genre) {
  try {
    const { files } = await Filesystem.readdir({
      path: `audios/${genre}`,
      directory: DIR,
    });
    // console.error(JSON.stringify(files));
    return files?.length > 0;
  } catch (e) {
    if (e.Error?.toLowerCase().includes("does not exists") === false) {
      console.error("Failed to create genre directory:", e);
    }
    return false;
  }
}

function songName(src) {
  if (!src) {
    console.log("src not found for this song");
    return;
  }
  const splittedArr = src.split("/");
  const filename = splittedArr[splittedArr.length - 1];
  return filename;
}

export async function downloadGenreSongs(genre) {
  await ensureGenreDir(genre);

  const res = await Http.get({
    url: `${import.meta.env.VITE_BACKEND_URL}/audio/list/${genre}`,
    responseType: "json",
    headers: {},
    params: {},
  });
  const songs = res.data.audio_data || [];

  for (const song of songs) {
    try {
      // console.log("Downloading:", song.src);
      const response = await Http.get({
        url: song.src,
        responseType: "arraybuffer",
        headers: {},
        params: {},
      });

      // console.log("Response size:", response.data.byteLength);
      // console.log("Media type:", song.mediaType);

      // Check if we actually got audio data
      if (response.data.byteLength === 0) {
        console.error("Empty response for:", song.src);
        continue;
      }

      const songPath = `audios/${genre}/${songName(song.src)}`;
      await Filesystem.writeFile({
        path: songPath,
        data: response.data, // Use bin data
        directory: DIR,
      });

      // console.log("Successfully wrote:", songPath);
    } catch (err) {
      console.error(`Failed to download or write ${song.src}:`, err);
    }
  }
  return songs.length;
}

export async function handleAddSingleSong(selectedGenre) {
  try {
    // Pick audio file
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: false,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No file selected.",
      });
      return;
    }

    const file = result.files[0];
    const filename = file.name;

    try {
      const validExts = ["mp3", "m4a", "ogg", "wav"];
      const sp = filename.split(".");
      const fExt = sp[sp.length - 1];

      if (!filename || !validExts.includes(fExt)) {
        alert("wrong file type");
        return;
      }
    } catch (e) {
      console.log("handle add song error:", e);
    }

    // Get file data - try multiple approaches
    let fileData;
    let buffer;

    // Try to get data from the file object
    if (file.data) {
      // If file.data exists (base64), use it directly
      fileData = file.data;
    } else if (file.blob) {
      // Convert blob to base64
      buffer = await file.blob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      fileData = btoa(String.fromCharCode.apply(null, uint8Array));
    } else if (file.path) {
      // Read from file path if available
      const readResult = await Filesystem.readFile({
        path: file.path,
      });
      fileData = readResult.data;
    } else {
      throw new Error("Could not access file data");
    }

    if (!fileData) {
      await Dialog.alert({
        title: "Error",
        message: "Could not read file data.",
      });
      return;
    }

    // Write binary file as base64
    await Filesystem.writeFile({
      path: `audios/${selectedGenre}/${filename}`,
      data: fileData,
      directory: DIR,
      recursive: true,
    });

    await Dialog.alert({
      title: "Success",
      message: `Saved: audios/${selectedGenre}/${filename}`,
    });
  } catch (err) {
    console.error("Error in handleAddSong:", err);
    await Dialog.alert({
      title: "Error",
      message: err.message || "An unexpected error occurred.",
    });
  } finally {
    // window.location.reload();
  }
}

export async function handleAddSong(selectedGenre) {
  try {
    // Pick multiple audio files
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: true,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No file selected.",
      });
      return;
    }

    const validExts = ["mp3", "m4a", "ogg", "wav"];
    const errors = [];

    for (const file of result.files) {
      const filename = file.name;
      const sp = filename.split(".");
      const fExt = sp[sp.length - 1].toLowerCase();

      if (!filename || !validExts.includes(fExt)) {
        errors.push(`Skipped ${filename}: Invalid file type.`);
        continue;
      }

      let fileData;
      try {
        if (file.data) {
          fileData = file.data;
        } else if (file.blob) {
          const buffer = await file.blob.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          fileData = btoa(String.fromCharCode(...uint8Array));
        } else if (file.path) {
          const readResult = await Filesystem.readFile({ path: file.path });
          fileData = readResult.data;
        } else {
          throw new Error("Could not access file data.");
        }

        if (!fileData) {
          errors.push(`Failed ${filename}: No data read.`);
          continue;
        }

        await Filesystem.writeFile({
          path: `audios/${selectedGenre}/${filename}`,
          data: fileData,
          directory: DIR,
          recursive: true,
        });
      } catch (e) {
        console.error(`Error processing ${filename}:`, e);
        errors.push(`Failed ${filename}: ${e.message}`);
        continue;
      }
    }

    // Summary dialog
    const successCount = result.files.length - errors.length;
    const errorMsg = errors.length ? "\n\nErrors:\n" + errors.join("\n") : "";

    await Dialog.alert({
      title: "Finished",
      message: `Successfully processed ${successCount} out of ${result.files.length} files.${errorMsg}`,
    });
  } catch (err) {
    console.error("Error in handleAddSong:", err);
    await Dialog.alert({
      title: "Error",
      message: err.message || "An unexpected error occurred.",
    });
  } finally {
    // window.location.reload();
  }
}

export async function handleAddSongV2(selectedGenre) {
  const results = {
    successful: [],
    failed: [],
    skipped: [],
  };

  try {
    // Pick multiple audio files
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: true,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No files selected.",
      });
      return;
    }

    const files = result.files;
    const validExts = ["mp3", "m4a", "ogg", "wav"];

    // Process each file individually
    for (const file of files) {
      const filename = file.name;

      try {
        // Validate file extension
        const sp = filename.split(".");
        const fExt = sp[sp.length - 1];

        if (!filename || !validExts.includes(fExt)) {
          results.skipped.push({
            filename,
            reason: `Invalid file type: .${fExt}. Supported: ${validExts.join(
              ", "
            )}`,
          });
          continue;
        }

        // Get file data - try multiple approaches
        let fileData;
        let buffer;

        if (file.data) {
          // If file.data exists (base64), use it directly
          fileData = file.data;
        } else if (file.blob) {
          // Convert blob to base64
          buffer = await file.blob.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          fileData = btoa(String.fromCharCode.apply(null, uint8Array));
        } else if (file.path) {
          // Read from file path if available
          const readResult = await Filesystem.readFile({
            path: file.path,
          });
          fileData = readResult.data;
        } else {
          throw new Error("Could not access file data");
        }

        if (!fileData) {
          throw new Error("Could not read file data");
        }

        // Write binary file as base64
        await Filesystem.writeFile({
          path: `audios/${selectedGenre}/${filename}`,
          data: fileData,
          directory: DIR,
          recursive: true,
        });

        results.successful.push({
          filename,
          path: `audios/${selectedGenre}/${filename}`,
        });
      } catch (fileError) {
        console.error(`Error processing file ${filename}:`, fileError);
        results.failed.push({
          filename,
          error: fileError.message || "Unknown error occurred",
        });
      }
    }

    // Show summary dialog
    const totalFiles = files.length;
    const successCount = results.successful.length;
    const failedCount = results.failed.length;
    const skippedCount = results.skipped.length;

    let message = `Processed ${totalFiles} file(s):\n`;
    message += `✓ ${successCount} successful\n`;

    if (failedCount > 0) {
      message += `✗ ${failedCount} failed\n`;
    }

    if (skippedCount > 0) {
      message += `⚠ ${skippedCount} skipped (invalid format)\n`;
    }

    // Add details for failed/skipped files
    if (failedCount > 0 || skippedCount > 0) {
      message += `\nDetails:\n`;

      results.failed.forEach((item) => {
        message += `Failed: ${item.filename} - ${item.error}\n`;
      });

      results.skipped.forEach((item) => {
        message += `Skipped: ${item.filename} - ${item.reason}\n`;
      });
    }

    await Dialog.alert({
      title: successCount > 0 ? "Processing Complete" : "No Files Processed",
      message: message.trim(),
    });
  } catch (err) {
    console.error("Error in handleAddSong:", err);
    await Dialog.alert({
      title: "Error",
      message: err.message || "An unexpected error occurred.",
    });
  } finally {
    // Only reload if at least one file was successfully processed
    if (results.successful.length > 0) {
      // window.location.reload();
    }
  }
}

export function extractFilePathFromCapacitorUri(src) {
  try {
    // Remove the Capacitor prefix
    const withoutPrefix = src.replace("https://localhost/_capacitor_file_", "");

    // Decode URI components
    const decoded = decodeURIComponent(withoutPrefix);

    // For Directory.Data, we need just the relative path after /files/
    // Pattern: /data/user/0/com.subhajit.zentunes/files/audios/home/test.txt
    // We want: audios/home/test.txt

    const filesIndex = decoded.indexOf("/files/");

    if (filesIndex === -1) {
      throw new Error("/files/ directory not found in path");
    }

    // Extract everything after /files/
    const relativePath = decoded.substring(filesIndex + "/files/".length);

    return relativePath;
  } catch (error) {
    console.error("Path extraction error:", error);
    throw new Error(`Failed to extract path from: ${src}`);
  }
}

// Alternative approach using URL parsing
export function extractFilePathFromCapacitorUriV2(src) {
  try {
    // Parse the URL to handle encoding properly
    const url = new URL(src);

    // Get the pathname and decode it
    const pathname = decodeURIComponent(url.pathname);

    // Remove the _capacitor_file_ prefix if present
    const cleanPath = pathname.replace("/_capacitor_file_", "");

    // For Directory.Data, extract just the relative path after /files/
    const filesIndex = cleanPath.indexOf("/files/");

    if (filesIndex === -1) {
      throw new Error("/files/ directory not found in path");
    }

    // Return just the relative path after /files/
    return cleanPath.substring(filesIndex + "/files/".length);
  } catch (error) {
    console.error("Path extraction error:", error);
    throw new Error(`Failed to extract path from: ${src}`);
  }
}

export async function handleRemoveSong(audiosToDelete) {
  try {
    const confirmResult = await Dialog.confirm({
      title: "Confirm Delete",
      message:
        "This action will permanently delete the selected songs. Are you sure?",
      okButtonTitle: "Yes",
      cancelButtonTitle: "No",
    });

    if (!confirmResult.value) {
      alert("Cancelled");
      return;
    }

    let deletedCount = 0;
    const errors = [];

    for (const audio of audiosToDelete) {
      try {
        const fileUri = extractFilePathFromCapacitorUriV2(audio.src);
        console.log(`Attempting to delete: ${fileUri}`);

        await Filesystem.deleteFile({
          path: fileUri,
          directory: DIR,
        });

        console.log(`Successfully deleted: ${fileUri}`);
        deletedCount += 1;
      } catch (fileErr) {
        const errorMsg = `Failed to delete ${audio.title}: ${fileErr.message}`;
        console.error("Audio Delete Error:", errorMsg);
        errors.push(errorMsg);
        continue;
      }
    }

    // Provide detailed feedback
    if (deletedCount > 0) {
      alert(
        `${deletedCount} song(s) deleted successfully.${
          errors.length > 0 ? ` ${errors.length} failed.` : ""
        }`
      );
    } else {
      alert("No songs were deleted. Check console for errors.");
    }

    // Log errors for debugging
    if (errors.length > 0) {
      console.error("Deletion errors:", errors);
    }
  } catch (error) {
    console.error("handleRemoveSong Error:", error);
    alert("An error occurred while deleting songs. Check console for details.");
  } finally {
    // window.location.reload();
  }
}

/*
// Helper function for safe base64 conversion that handles large files
function arrayBufferToBase64(buffer) {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 32768; // 32KB chunks to avoid stack overflow

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const arrayBuffer = new ArrayBuffer(binaryString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return arrayBuffer;
}

// Helper function to validate file extension
function validateFileExtension(filename) {
  const validExts = ["mp3", "m4a", "ogg", "wav"];
  const sp = filename.split(".");
  const fExt = sp[sp.length - 1].toLowerCase();

  return {
    isValid: validExts.includes(fExt),
    extension: fExt,
    validExtensions: validExts
  };
}

// Helper function to get file data from various sources
async function getFileData(file) {
  let fileBuffer;

  if (file.blob) {
    // Get ArrayBuffer directly from blob
    fileBuffer = await file.blob.arrayBuffer();
  } else if (file.data) {
    // Convert base64 to ArrayBuffer
    fileBuffer = base64ToArrayBuffer(file.data);
  } else if (file.path) {
    // Read from file path
    const readResult = await Filesystem.readFile({
      path: file.path,
    });
    fileBuffer = base64ToArrayBuffer(readResult.data);
  } else {
    throw new Error("Could not access file data - no valid source found");
  }

  if (!fileBuffer || fileBuffer.byteLength === 0) {
    throw new Error("File data is empty or invalid");
  }

  return fileBuffer;
}

// Helper function to verify written file
async function verifyWrittenFile(path, directory, originalSize) {
  try {
    const writtenFile = await Filesystem.readFile({
      path: path,
      directory: directory,
    });

    if (!writtenFile.data || writtenFile.data.length === 0) {
      throw new Error("Written file is empty");
    }

    // Approximate size check (base64 is ~33% larger than binary)
    const expectedBase64Size = Math.ceil(originalSize * 4 / 3);
    const actualSize = writtenFile.data.length;
    const sizeDifference = Math.abs(actualSize - expectedBase64Size) / expectedBase64Size;

    if (sizeDifference > 0.1) { // Allow 10% variance
      console.warn(`Size mismatch for ${path}: expected ~${expectedBase64Size}, got ${actualSize}`);
    }

    return {
      success: true,
      size: actualSize,
      expectedSize: expectedBase64Size
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export async function handleAddSingleSong(selectedGenre) {
  try {
    // Pick audio file
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: false,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No file selected.",
      });
      return;
    }

    const file = result.files[0];
    const filename = file.name;

    // Validate file extension
    const validation = validateFileExtension(filename);
    if (!validation.isValid) {
      await Dialog.alert({
        title: "Invalid File Type",
        message: `File type .${validation.extension} is not supported. Supported formats: ${validation.validExtensions.join(", ")}`
      });
      return;
    }

    // Check file size (50MB limit)
    if (file.size && file.size > 50 * 1024 * 1024) {
      await Dialog.alert({
        title: "File Too Large",
        message: "File size exceeds 50MB limit. Please choose a smaller file."
      });
      return;
    }

    // Get file data
    const fileBuffer = await getFileData(file);

    // Convert to base64 safely
    const base64Data = arrayBufferToBase64(fileBuffer);

    // Write binary file as base64
    const filePath = `audios/${selectedGenre}/${filename}`;
    await Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      directory: DIR,
      recursive: true,
    });

    // Verify the written file
    const verification = await verifyWrittenFile(filePath, DIR, fileBuffer.byteLength);

    if (!verification.success) {
      throw new Error(`File verification failed: ${verification.error}`);
    }

    await Dialog.alert({
      title: "Success",
      message: `Successfully saved: ${filename}\nFile size: ${Math.round(fileBuffer.byteLength / 1024)} KB`
    });

  } catch (err) {
    console.error("Error in handleAddSingleSong:", err);
    await Dialog.alert({
      title: "Error",
      message: err.message || "An unexpected error occurred while adding the song."
    });
  }
}

export async function handleAddSong(selectedGenre) {
  const results = {
    successful: [],
    failed: [],
    skipped: [],
  };

  try {
    // Pick multiple audio files
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: true,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No files selected.",
      });
      return;
    }

    const files = result.files;
    console.log(`Processing ${files.length} files...`);

    // Process each file individually
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;

      console.log(`Processing file ${i + 1}/${files.length}: ${filename}`);

      try {
        // Validate file extension
        const validation = validateFileExtension(filename);
        if (!validation.isValid) {
          results.skipped.push({
            filename,
            reason: `Invalid file type: .${validation.extension}. Supported: ${validation.validExtensions.join(", ")}`
          });
          continue;
        }

        // Check file size (50MB limit)
        if (file.size && file.size > 50 * 1024 * 1024) {
          results.skipped.push({
            filename,
            reason: "File too large (>50MB)"
          });
          continue;
        }

        // Get file data
        const fileBuffer = await getFileData(file);

        // Convert to base64 safely
        const base64Data = arrayBufferToBase64(fileBuffer);

        // Write file
        const filePath = `audios/${selectedGenre}/${filename}`;
        await Filesystem.writeFile({
          path: filePath,
          data: base64Data,
          directory: DIR,
          recursive: true,
        });

        // Verify the written file
        const verification = await verifyWrittenFile(filePath, DIR, fileBuffer.byteLength);

        if (!verification.success) {
          throw new Error(`File verification failed: ${verification.error}`);
        }

        results.successful.push({
          filename,
          path: filePath,
          size: Math.round(fileBuffer.byteLength / 1024) // Size in KB
        });

        console.log(`✓ Successfully processed: ${filename}`);

      } catch (fileError) {
        console.error(`✗ Error processing file ${filename}:`, fileError);
        results.failed.push({
          filename,
          error: fileError.message || "Unknown error occurred"
        });
      }
    }

    // Show summary dialog
    const totalFiles = files.length;
    const successCount = results.successful.length;
    const failedCount = results.failed.length;
    const skippedCount = results.skipped.length;

    let message = `Processed ${totalFiles} file(s):\n`;
    message += `✓ ${successCount} successful\n`;

    if (failedCount > 0) {
      message += `✗ ${failedCount} failed\n`;
    }

    if (skippedCount > 0) {
      message += `⚠ ${skippedCount} skipped\n`;
    }

    // Add details for failed/skipped files (limit to first 5 of each)
    if (failedCount > 0 || skippedCount > 0) {
      message += `\nDetails:\n`;

      results.failed.slice(0, 5).forEach((item) => {
        message += `Failed: ${item.filename} - ${item.error}\n`;
      });

      if (results.failed.length > 5) {
        message += `... and ${results.failed.length - 5} more failed files\n`;
      }

      results.skipped.slice(0, 5).forEach((item) => {
        message += `Skipped: ${item.filename} - ${item.reason}\n`;
      });

      if (results.skipped.length > 5) {
        message += `... and ${results.skipped.length - 5} more skipped files\n`;
      }
    }

    // Add successful files summary
    if (successCount > 0) {
      const totalSize = results.successful.reduce((sum, item) => sum + item.size, 0);
      message += `\nTotal size added: ${Math.round(totalSize / 1024)} MB`;
    }

    await Dialog.alert({
      title: successCount > 0 ? "Processing Complete" : "No Files Processed",
      message: message.trim(),
    });

  } catch (err) {
    console.error("Error in handleAddSong:", err);
    await Dialog.alert({
      title: "Error",
      message: err.message || "An unexpected error occurred while processing files."
    });
  } finally {
    // Only reload if at least one file was successfully processed
    if (results.successful.length > 0) {
      console.log(`Successfully added ${results.successful.length} songs. Consider reloading the app to refresh the audio list.`);
      // Uncomment the next line if you want to auto-reload
      // window.location.reload();
    }
  }
}

// Alternative version with progress callback (if you want to show progress)
export async function handleAddSongWithProgress(selectedGenre, onProgress) {
  const results = {
    successful: [],
    failed: [],
    skipped: [],
  };

  try {
    const result = await FilePicker.pickFiles({
      types: ["audio/*"],
      multiple: true,
    });

    if (!result?.files?.length) {
      await Dialog.alert({
        title: "Cancelled",
        message: "No files selected.",
      });
      return;
    }

    const files = result.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          filename: filename,
          status: 'processing'
        });
      }

      try {
        const validation = validateFileExtension(filename);
        if (!validation.isValid) {
          results.skipped.push({
            filename,
            reason: `Invalid file type: .${validation.extension}`
          });
          continue;
        }

        if (file.size && file.size > 50 * 1024 * 1024) {
          results.skipped.push({
            filename,
            reason: "File too large (>50MB)"
          });
          continue;
        }

        const fileBuffer = await getFileData(file);
        const base64Data = arrayBufferToBase64(fileBuffer);

        const filePath = `audios/${selectedGenre}/${filename}`;
        await Filesystem.writeFile({
          path: filePath,
          data: base64Data,
          directory: DIR,
          recursive: true,
        });

        const verification = await verifyWrittenFile(filePath, DIR, fileBuffer.byteLength);

        if (!verification.success) {
          throw new Error(`File verification failed: ${verification.error}`);
        }

        results.successful.push({
          filename,
          path: filePath,
          size: Math.round(fileBuffer.byteLength / 1024)
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            filename: filename,
            status: 'completed'
          });
        }

      } catch (fileError) {
        console.error(`Error processing file ${filename}:`, fileError);
        results.failed.push({
          filename,
          error: fileError.message || "Unknown error occurred"
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            filename: filename,
            status: 'failed',
            error: fileError.message
          });
        }
      }
    }

    return results;

  } catch (err) {
    console.error("Error in handleAddSongWithProgress:", err);
    throw err;
  }
}
*/
