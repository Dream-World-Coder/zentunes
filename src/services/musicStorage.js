import { Filesystem, Directory } from "@capacitor/filesystem";
import { Http } from "@capacitor-community/http";

async function ensureGenreDir(genre) {
    try {
        await Filesystem.mkdir({
            path: `audios/${genre}`,
            directory: Directory.Documents,
            recursive: true, //Important!
        });
    } catch (e) {
        // Ignore error if already exists
        if (e.message?.toLowerCase().includes("already exists") === false) {
            console.error("Failed to create genre directory:", e);
        }
    }
}

export async function genreExistsLocally(genre) {
    await ensureGenreDir(genre);
    try {
        const { files } = await Filesystem.readdir({
            path: `audios/${genre}`,
            directory: Directory.Documents,
        });
        return files.length > 0;
    } catch (err) {
        console.error(err);
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
    const res = await Http.get({
        url: `${import.meta.env.VITE_BACKEND_URL}/audio/list/${genre}`,
        responseType: "json",
        headers: {},
        params: {},
    });
    const songs = res.data.audio_data;

    for (const song of songs) {
        try {
            console.log("Downloading:", song.src);
            const response = await Http.get({
                url: song.src,
                responseType: "arraybuffer",
                headers: {},
                params: {},
            });

            console.log("Response size:", response.data.byteLength);
            console.log("Media type:", song.mediaType);

            // Check if we actually got audio data
            if (response.data.byteLength === 0) {
                console.error("Empty response for:", song.src);
                continue;
            }

            const songPath = `audios/${genre}/${songName(song.src)}`;
            await Filesystem.writeFile({
                path: songPath,
                data: response.data, // Use binary data
                directory: Directory.Documents,
            });

            console.log("Successfully wrote:", songPath);
        } catch (err) {
            console.error(`Failed to download or write ${song.src}:`, err);
        }
    }
    return songs.length;
}
