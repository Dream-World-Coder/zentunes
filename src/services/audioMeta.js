import { Filesystem, Directory } from "@capacitor/filesystem";
import jsmediatags from "jsmediatags";
import { extractFilePathFromCapacitorUriV2 } from "./musicStorage";
import { getMediaTypeFromFilename } from "./formatting";

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

    // Convert base64 to ArrayBuffer for jsmediatags
    const binaryString = atob(data);
    const len = binaryString.length;
    const arrayBuffer = new ArrayBuffer(len);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Parse metadata using jsmediatags
    return new Promise((resolve) => {
      jsmediatags.read(arrayBuffer, {
        onSuccess: (tag) => {
          console.log("Metadata:", tag);
          const title = tag.tags.title;
          if (title) {
            console.log("Extracted title:", title);
            resolve(title);
          } else {
            console.log("No title found in metadata");
            resolve(null);
          }
        },
        onError: (error) => {
          console.warn("Failed to parse metadata:", error);
          resolve(null);
        },
      });
    });
  } catch (error) {
    console.warn(
      "Failed to read metadata for file:",
      fileUrl,
      error.message || error
    );
    return null;
  }
}
