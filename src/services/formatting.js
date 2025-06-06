export function capitalizeFirstLetter(str) {
    if (!str) {
        return str; // Handle empty strings
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeEachWord(str) {
    if (!str) {
        return str;
    }
    return str
        .split(" ")
        .map((word) => capitalizeFirstLetter(word))
        .join(" ");
}

export function getFormattedTitle(filename) {
    const nameWithoutExt = filename
        ?.replace(/\.[^/.]+$/, "")
        ?.replace(/_/g, " ");
    return capitalizeEachWord(nameWithoutExt);
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
