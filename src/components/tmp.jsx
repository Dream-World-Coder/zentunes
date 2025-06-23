import useHeader from "./Header";
import Footer from "./Footer";
import AudioItem from "./Audio";
import PlayOptions from "./PlayOptions";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";

// for style testing

function Tmp() {
  const { Header, selectWindowOpen, setAudiosToDelete } = useHeader();
  const { isPlaylistLoading: loading } = useAudioPlayer();
  const musicsList = [
    {
      title: "Song One",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      audioId: window.crypto.randomUUID(),
      mediaType: "audio/mpeg",
    },
    {
      title: "Song Two",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      audioId: window.crypto.randomUUID(),
      mediaType: "audio/mpeg",
    },
    {
      title: "Song Three",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      audioId: window.crypto.randomUUID(),
      mediaType: "audio/mpeg",
    },
  ];

  const simpleVersion = JSON.parse(
    localStorage.getItem("simpleVersion") || "false"
  );

  return (
    <>
      <Header />

      <section className="container">
        <h2 className={`heading isr ${simpleVersion ? "simpleVersion" : ""}`}>
          pageHeading
        </h2>
        <p className={`description ${simpleVersion ? "simpleVersion" : ""}`}>
          pageDescription
        </p>

        {musicsList.length > 0 && <PlayOptions />}

        <ul className={`musics ${loading ? "loading" : ""}`}>
          {musicsList.length > 0 &&
            musicsList.map((music, index) => (
              <li key={`${music.audioId}`}>
                <AudioItem
                  audioId={music.audioId}
                  src={music.src}
                  title={music.title}
                  mediaType={music.mediaType}
                  index={index}
                  selectWindowOpen={selectWindowOpen}
                  setAudiosToDelete={setAudiosToDelete}
                />
              </li>
            ))}
        </ul>
      </section>

      <Footer />
    </>
  );
}
export default Tmp;
