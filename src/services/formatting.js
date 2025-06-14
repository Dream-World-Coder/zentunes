export function capitalizeFirstLetter(str) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeEachWord(sentence) {
  if (!sentence) {
    return sentence;
  }
  return sentence
    .split(" ")
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function getFormattedTitle(filename) {
  try {
    const nameWithoutExt = filename
      ?.replace(/\.[^/.]+$/, "") // remove file extension
      ?.replace(/[_\-+]/g, " ") // replace _, -, + with space
      ?.replace(/\d{3,}/g, "hash"); // replace 3+ consecutive digits with "hash"

    if (!nameWithoutExt?.trim()) return "Unknown Track";

    return capitalizeEachWord(nameWithoutExt.trim());
  } catch (e) {
    console.log("Title extraction error:", e);
    return "Unknown Track";
  }
}

export function getMediaTypeFromFilename(filename) {
  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    default:
      return "audio/*";
  }
}
