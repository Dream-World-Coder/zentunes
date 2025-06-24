import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { getAudioDurationFromURI } from "./audioMeta";
import { getFormattedTitle, getMediaTypeFromFilename } from "./formatting";

const DIR = Directory[import.meta.env.VITE_DIR];

export async function makeAudioCache() {
  try {
    const { files } = await Filesystem.readdir({
      path: `audios`,
      directory: DIR,
    });

    // extract directories from files, and read them 1 by 1
    const genres = files
      .filter((file) => file.type === "directory")
      .map((dir) => dir.name);
    const audioData = {}; // the entire data

    for (const genre of genres) {
      const genreSongs = [];
      const result = await Filesystem.readdir({
        path: `audios/${genre}`,
        directory: DIR,
      });

      const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // helper
      for (const file of result.files) {
        const filename = file.name;
        const fileUrl = Capacitor.convertFileSrc(file.uri);

        // const metaObj = await getAudioMetadata(fileUrl, file.name); // slowing a lot, so removing
        const dur = await getAudioDurationFromURI(fileUrl);
        await delay(150);

        // const duration = dur
        //   ? Math.floor(dur)
        //   : Math.floor(metaObj.duration || 1);
        const duration = Math.floor(dur || 1);

        genreSongs.push({
          // title: metaObj.title || getFormattedTitle(filename),
          title: getFormattedTitle(filename),
          src: fileUrl,
          mediaType: getMediaTypeFromFilename(filename),
          duration,
          audioId: window.crypto.randomUUID(),
          genre,
        });
      }

      audioData[genre] = genreSongs;
    }

    // now write audioData.json
    await Filesystem.writeFile({
      path: `audios/audioData.json`,
      data: JSON.stringify(audioData),
      directory: Directory.Data, // fixed
      encoding: Encoding.UTF8,
    });

    // for debug purposes
    await Filesystem.writeFile({
      path: `audios/audioData.json`,
      data: JSON.stringify(audioData),
      directory: Directory.External, // fixed
      encoding: Encoding.UTF8,
    });
  } catch (e) {
    console.error("Failed to rebuild cache:", JSON.stringify(e, null, 2));
  } finally {
    setTimeout(() => {
      window.location.reload();
    }, 650);
  }
}
