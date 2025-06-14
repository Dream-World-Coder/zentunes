/**
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

/**
 * @param fileUri: URI,
 * @param filename: string
 * _/
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

    // const directory = Directory.Data;
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
*/

export async function getAudioDurationFromURI(fileUri) {
  try {
    const duration = await new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = fileUri;
      audio.preload = "metadata";

      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });

      audio.addEventListener("error", (e) => {
        reject(new Error(`Failed to load audio metadata: ${e.message || e}`));
      });
    });

    return duration;
  } catch (err) {
    console.error("Error loading audio duration:", err);
    return null;
  }
}
