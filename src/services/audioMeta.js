// pnpm add music-metadata

import { Filesystem, Directory } from "@capacitor/filesystem";
import { parseBlob } from "music-metadata";
import { extractFilePathFromCapacitorUriV2 } from "./musicStorage";
import { getMediaTypeFromFilename } from "./formatting";

// Polyfill Buffer for music-metadata
if (typeof global === "undefined") {
  window.global = window;
}

if (typeof Buffer === "undefined") {
  window.Buffer = {
    from: (data, encoding) => {
      if (encoding === "base64") {
        const binaryString = atob(data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
      if (typeof data === "string") {
        return new TextEncoder().encode(data);
      }
      if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
      }
      if (data instanceof Uint8Array) {
        return data;
      }
      return new Uint8Array(data);
    },
    alloc: (size, fill = 0) => {
      const buffer = new Uint8Array(size);
      if (fill !== 0) {
        buffer.fill(fill);
      }
      return buffer;
    },
    allocUnsafe: (size) => new Uint8Array(size),
    isBuffer: (obj) => obj instanceof Uint8Array,
    concat: (buffers, totalLength) => {
      if (!Array.isArray(buffers)) return new Uint8Array(0);
      const length =
        totalLength || buffers.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Uint8Array(length);
      let offset = 0;
      for (const buffer of buffers) {
        result.set(buffer, offset);
        offset += buffer.length;
      }
      return result;
    },
  };
}

export async function getAudioMetadata(fileUrl, filename) {
  let res = {
    title: null,
    artist: null,
    album: null,
    duration: null,
    bitrate: null,
    sampleRate: null,
  };

  if (!fileUrl || !filename) {
    console.warn("Invalid fileUrl or filename provided");
    return res;
  }

  try {
    const filePath = extractFilePathFromCapacitorUriV2(fileUrl);
    if (!filePath) {
      console.warn("Could not extract file path from URL:", fileUrl);
      return res;
    }

    const directory = Directory[import.meta.env.VITE_DIR];

    const { data } = await Filesystem.readFile({
      path: filePath,
      directory: directory,
    });

    if (!data) {
      console.warn("No data received from file read");
      return res;
    }

    // Convert base64 to Uint8Array more efficiently
    const binaryString = atob(data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // get media type and make blob
    const mediaType = getMediaTypeFromFilename(filename);
    const blob = new Blob([bytes], {
      type: mediaType || "audio/mpeg", // fallback
    });

    if (blob.size === 0) {
      console.warn("Created blob has zero size");
      return res;
    }

    const metadata = await parseBlob(blob);

    // access properties now
    const title = metadata?.common?.title;
    const artist = metadata?.common?.artist;
    const album = metadata?.common?.album;
    const duration = metadata?.format?.duration;
    const bitrate = metadata?.format?.bitrate;
    const sampleRate = metadata?.format?.sampleRate;

    res.title = title;
    res.artist = artist;
    res.album = album;
    res.duration = duration;
    res.bitrate = bitrate;
    res.sampleRate = sampleRate;

    return res;
  } catch (error) {
    console.error(
      "Failed to read metadata for file:",
      fileUrl,
      error.message || error
    );
    return res;
  }
}

// Improved duration extraction with multiple fallback strategies
export async function getAudioDuration(fileUrl, filename) {
  // Strategy 1: Try to get duration from music-metadata first (most reliable)
  try {
    const metadata = await getAudioMetadata(fileUrl, filename);
    if (metadata.duration && metadata.duration > 0) {
      console.log(
        `Duration from metadata: ${metadata.duration}s for ${filename}`
      );
      return Math.floor(metadata.duration);
    }
  } catch (error) {
    console.warn(`Metadata extraction failed for ${filename}:`, error.message);
  }

  // Strategy 2: Use HTML Audio element with improved approach
  try {
    const duration = await getAudioDurationFromHTMLAudio(fileUrl);
    if (duration && duration > 0) {
      console.log(`Duration from HTML Audio: ${duration}s for ${filename}`);
      return Math.floor(duration);
    }
  } catch (error) {
    console.warn(`HTML Audio duration failed for ${filename}:`, error.message);
  }

  // Strategy 3: Try Web Audio API approach
  try {
    const duration = await getAudioDurationFromWebAudio(fileUrl);
    if (duration && duration > 0) {
      console.log(`Duration from Web Audio: ${duration}s for ${filename}`);
      return Math.floor(duration);
    }
  } catch (error) {
    console.warn(`Web Audio duration failed for ${filename}:`, error.message);
  }

  // Fallback: return a default duration
  console.warn(
    `All duration extraction methods failed for ${filename}, using fallback`
  );
  return 180; // 3 minutes fallback
}

// Improved HTML Audio approach
async function getAudioDurationFromHTMLAudio(fileUri) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    let resolved = false;
    const timeout = 5000; // 5 seconds timeout

    const cleanup = () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("canplaythrough", onCanPlayThrough);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onStalled);
    };

    const resolveWithDuration = (source) => {
      if (resolved) return;
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        resolved = true;
        console.log(
          `HTML Audio duration resolved from ${source}: ${audio.duration}`
        );
        cleanup();
        resolve(audio.duration);
        return true;
      }
      return false;
    };

    const onLoadedMetadata = () => resolveWithDuration("loadedmetadata");
    const onLoadedData = () => resolveWithDuration("loadeddata");
    const onCanPlayThrough = () => resolveWithDuration("canplaythrough");

    const onError = (e) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      reject(
        new Error(`Audio loading failed: ${e.message || "Unknown error"}`)
      );
    };

    const onStalled = () => {
      console.warn("Audio loading stalled, trying play trick...");
      tryPlayTrick();
    };

    const tryPlayTrick = async () => {
      try {
        audio.muted = true;
        audio.volume = 0;
        const playPromise = audio.play();

        if (playPromise) {
          await playPromise;
          setTimeout(() => {
            if (!resolveWithDuration("play-trick")) {
              audio.pause();
            }
          }, 1000);
        }
      } catch (err) {
        console.warn("Play trick failed:", err.message);
      }
    };

    // Set up event listeners
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("canplaythrough", onCanPlayThrough);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);

    // Configure audio element
    audio.preload = "metadata";
    audio.muted = true;
    audio.volume = 0;
    audio.crossOrigin = "anonymous";

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Timeout waiting for audio metadata"));
      }
    }, timeout);

    // Start loading
    audio.src = fileUri;

    // Clear timeout if we resolve early
    const originalResolve = resolve;
    resolve = (value) => {
      clearTimeout(timeoutId);
      originalResolve(value);
    };
  });
}

// Web Audio API approach (works with decoded audio data)
async function getAudioDurationFromWebAudio(fileUrl) {
  try {
    // Fetch the audio file as array buffer
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Create audio context
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    try {
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const duration = audioBuffer.duration;

      // Clean up
      await audioContext.close();

      if (duration && duration > 0) {
        return duration;
      }

      throw new Error("Invalid duration from Web Audio API");
    } catch (decodeError) {
      await audioContext.close();
      throw decodeError;
    }
  } catch (error) {
    throw new Error(`Web Audio API failed: ${error.message}`);
  }
}

// Legacy function for backward compatibility
export async function getAudioDurationFromURI(fileUri) {
  console.warn(
    "getAudioDurationFromURI is deprecated, use getAudioDuration instead"
  );
  try {
    return await getAudioDurationFromHTMLAudio(fileUri);
  } catch (error) {
    console.error("Legacy duration extraction failed:", error);
    return null;
  }
}
