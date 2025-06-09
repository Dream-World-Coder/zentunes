import { Filesystem, Directory } from "@capacitor/filesystem";
import { Dialog } from "@capacitor/dialog";
import { FilePicker } from "@capawesome/capacitor-file-picker";
import { Http } from "@capacitor-community/http";
import { getFormattedTitle as pretty } from "./formatting";

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
    await ensureGenreDir(genre);

    const res = await Http.get({
        url: `${import.meta.env.VITE_BACKEND_URL}/audio/list/${genre}`,
        responseType: "json",
        headers: {},
        params: {},
    });
    const songs = res.data.audio_data;

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
                directory: Directory.Documents,
            });

            // console.log("Successfully wrote:", songPath);
        } catch (err) {
            console.error(`Failed to download or write ${song.src}:`, err);
        }
    }
    return songs.length;
}

export async function handleAddSong(validPaths) {
    // removing "home"
    validPaths = validPaths?.filter((i) => i.toLowerCase() !== "home");

    try {
        // Step 1: Prompt for genre
        let genreIndex = window.prompt(
            "Choose a genre:\n" +
                validPaths.map((g, i) => `${i + 1}. ${pretty(g)}`).join("\n") +
                "\n\nEnter number:",
        );

        const index = parseInt(genreIndex.trim()) - 1;
        if (index < 0 || index > validPaths.length - 1) {
            alert("Invalid choice.");
            return;
        }
        const selectedGenre = validPaths[index];

        // Step 2: Pick audio file
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
        const fileBlob = file.blob;

        if (!fileBlob) {
            await Dialog.alert({
                title: "Error",
                message: "Could not read selected file as blob.",
            });
            return;
        }

        // Step 3: Convert blob to ArrayBuffer
        const buffer = await fileBlob.arrayBuffer();

        // Step 4: Write binary file
        await Filesystem.writeFile({
            path: `audios/${selectedGenre}/${filename}`,
            data: buffer,
            directory: Directory.Documents,
            recursive: true,
        });

        await Dialog.alert({
            title: "Success",
            message: `Saved: audios/${selectedGenre}/${filename}`,
        });
    } catch (err) {
        console.error(err);
        await Dialog.alert({
            title: "Error",
            message: err.message || "An unexpected error occurred.",
        });
    }
}
