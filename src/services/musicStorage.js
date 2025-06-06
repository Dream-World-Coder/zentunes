import { Filesystem, Directory } from "@capacitor/filesystem";

export async function genreExistsLocally(genre) {
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
        alert("src not found for this song");
        return;
    }
    const splittedArr = src.split("/");
    const filename = splittedArr[splittedArr.length - 1];
    return filename;
}

export async function downloadGenreSongs(genre) {
    const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/audio/list/${genre}`,
    );
    const data = await res.json();
    const songs = data.audio_data;

    // Read current localMusicsData
    let localMusicsData = {};
    try {
        const { data: raw } = await Filesystem.readFile({
            path: "localMusicsData.json",
            directory: Directory.Data,
        });
        localMusicsData = JSON.parse(raw);
    } catch (err) {
        console.error("Could not read localMusicsData.json:", err);
    }

    for (const song of songs) {
        const response = await fetch(song.src);
        const blob = await response.blob();
        const reader = new FileReader();

        await new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64 = reader.result.split(",")[1];
                try {
                    const songPath = `audios/${genre}/${songName(song.src)}`;

                    await Filesystem.writeFile({
                        path: songPath,
                        data: base64,
                        directory: Directory.Data,
                    });

                    const { uri } = await Filesystem.getUri({
                        directory: Directory.Data,
                        path: songPath,
                    });

                    localMusicsData[genre] = [
                        ...(localMusicsData[genre] || []),
                        {
                            title: song.title,
                            src: uri,
                            mediaType: song.mediaType,
                        },
                    ];

                    resolve();
                } catch (err) {
                    console.error("Write failed:", err);
                    reject(err);
                }
            };
            reader.readAsDataURL(blob);
        });
    }

    // Write updated localMusicsData back to file
    await Filesystem.writeFile({
        path: "localMusicsData.json",
        data: JSON.stringify(localMusicsData),
        directory: Directory.Data,
    });

    return songs.length;
}
