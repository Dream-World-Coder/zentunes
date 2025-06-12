import { Filesystem, Directory } from "@capacitor/filesystem";
import { parseBlob } from "music-metadata-browser";
import { extractFilePathFromCapacitorUriV2 } from "./musicStorage";
import { getMediaTypeFromFilename } from "./formatting";

// Polyfill Buffer for music-metadata-browser
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

export async function getAudioTitleFromFile(fileUrl, filename) {
  try {
    // Ensure we have valid inputs
    if (!fileUrl || !filename) {
      console.warn("Invalid fileUrl or filename provided");
      return null;
    }

    const filePath = extractFilePathFromCapacitorUriV2(fileUrl);
    if (!filePath) {
      console.warn("Could not extract file path from URL:", fileUrl);
      return null;
    }

    // Get the directory enum value safely
    const directoryKey = import.meta.env.VITE_DIR;
    const directory = Directory[directoryKey];

    if (!directory) {
      console.warn("Invalid directory key:", directoryKey);
      return null;
    }

    const { data } = await Filesystem.readFile({
      path: filePath,
      directory: directory,
    });

    // Validate that we got data
    if (!data) {
      console.warn("No data received from file read");
      return null;
    }

    // Convert base64 to Uint8Array more efficiently
    const binaryString = atob(data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Get media type and create blob
    const mediaType = getMediaTypeFromFilename(filename);
    const blob = new Blob([bytes], {
      type: mediaType || "audio/mpeg", // fallback to common audio type
    });

    // Validate blob size
    if (blob.size === 0) {
      console.warn("Created blob has zero size");
      return null;
    }

    const metadata = await parseBlob(blob);
    console.log(JSON.stringify(metadata, null, 2));

    // Safely access nested properties
    const title = metadata?.common?.title;

    if (title) {
      console.log("Extracted title:", JSON.stringify(title));
    } else {
      console.log("No title found in metadata");
    }

    return title || null;
  } catch (error) {
    console.warn(
      "Failed to read metadata for file:",
      fileUrl,
      error.message || error
    );
    return null;
  }
}
