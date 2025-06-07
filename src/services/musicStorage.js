import { Filesystem, Directory } from "@capacitor/filesystem";
import { Http } from "@capacitor-community/http";

async function ensureGenreDir(genre) {
    try {
        await Filesystem.mkdir({
            path: `audios/${genre}`,
            directory: Directory.Data,
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
            directory: Directory.Data,
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
            const response = await Http.get({
                url: song.src,
                responseType: "arraybuffer",
                headers: {},
                params: {},
            });

            const blob = new Blob([response.data], {
                type: song.mediaType,
            });

            const reader = new FileReader();

            await new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64 = reader.result.split(",")[1];
                    console.log("Base64 length:", base64.length);
                    try {
                        const songPath = `audios/${genre}/${songName(song.src)}`;

                        await Filesystem.writeFile({
                            path: songPath,
                            data: base64,
                            directory: Directory.Data,
                        });

                        resolve();
                    } catch (err) {
                        console.error("Write failed:", err);
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (err) {
            console.error(`Failed to download or write ${song.src}:`, err);
        }
    }

    return songs.length;
}
