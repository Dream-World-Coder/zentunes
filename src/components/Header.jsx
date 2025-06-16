import { useEffect, useState, useRef } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  X,
  Sun,
  Moon,
  Trash,
  Circle,
  RotateCw,
  CirclePlus,
  CircleMinus,
} from "lucide-react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { handleAddSong, handleRemoveSong } from "../services/musicStorage";
import { getFormattedTitle as pretty } from "../services/formatting";

import { navItems } from "../assets/data/navItems";
import ham from "../assets/images/ham.svg";
import "../styles/header.scss";

export default function useHeader() {
  const [selectWindowOpen, setSelectWindowOpen] = useState(false);
  const [audiosToDelete, setAudiosToDelete] = useState([]);

  const { genre } = useParams();
  useEffect(() => {
    setSelectWindowOpen(false);
    setAudiosToDelete([]);
  }, [genre]);

  function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [genreDialogOpen, setGenreDialogOpen] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("");

    const darkModeButtonRef = useRef(null);
    const { validPaths, currentAudio } = useAudioPlayer();

    useEffect(() => {
      const savedDarkMode = localStorage.getItem("isDarkModeZentunes");

      if (savedDarkMode === "true") {
        setIsDarkMode(true);
        document.body.classList.add("dark");
      } else if (savedDarkMode === "false") {
        setIsDarkMode(false);
        document.body.classList.remove("dark");
      } else {
        console.log("No dark mode preference found");
      }
    }, []);

    const handleDarkModeToggle = () => {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);

      if (newDarkMode) {
        document.body.classList.add("dark");
        localStorage.setItem("isDarkModeZentunes", "true");
      } else {
        document.body.classList.remove("dark");
        localStorage.setItem("isDarkModeZentunes", "false");
      }
    };

    return (
      <header>
        <div className="wrapper">
          <div
            className="logo"
            onClick={() => {
              const confirmReload = window.confirm(
                "Are you sure you want to reload?"
              );
              if (confirmReload) {
                window.location.reload();
              }
            }}
          >
            <div className="logo__icon">
              <img src="/favicon.png" alt="logo" />
            </div>
            <span className="logo__text">Zentunes</span>
          </div>

          <nav>
            <ul>
              {navItems.map((item, idx) =>
                item.href !== "dropdown" ? (
                  <li key={item.href} className="nav-li">
                    <NavLink to={item.href}>{item.title}</NavLink>
                  </li>
                ) : (
                  <li key={idx} className="nav-li dropdown">
                    {item.title}
                    <ul className="music-categories">
                      {item.dropdownItems.map((elm) => (
                        <li key={elm.href} className="category-li">
                          <NavLink to={elm.href}>{elm.title}</NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="options">
            <div
              className="dark-mode-button"
              ref={darkModeButtonRef}
              onClick={handleDarkModeToggle}
              style={{ cursor: "pointer" }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </div>

            {selectWindowOpen && audiosToDelete.length > 0 && (
              <div
                className="delete-audio-btn"
                onClick={async () => {
                  await handleRemoveSong(audiosToDelete);
                  setSelectWindowOpen(false);
                  setAudiosToDelete([]);
                }}
                style={{ cursor: "pointer" }}
              >
                <Trash size={18} />
              </div>
            )}
          </div>

          <div className="mobile__nav dropdown">
            <img src={ham} alt="" />
            <ul>
              <div className="mobile__nav__header">Actions</div>

              {genreDialogOpen ? (
                <div
                  className="mobile__nav__btn"
                  onClick={() => {
                    setGenreDialogOpen(false);
                  }}
                >
                  <X size={16} /> Cancel
                </div>
              ) : (
                <div
                  className="mobile__nav__btn"
                  onClick={() => {
                    setGenreDialogOpen(true);
                  }}
                >
                  <CirclePlus size={16} /> Add Songs
                </div>
              )}

              {selectWindowOpen ? (
                <div
                  className="mobile__nav__btn"
                  onClick={() => {
                    setSelectWindowOpen(false);
                  }}
                >
                  <X size={16} /> Cancel
                </div>
              ) : (
                <div
                  className="mobile__nav__btn"
                  onClick={() => {
                    // stopping any song [song stop without page change]
                    currentAudio?.audioRef?.pause();
                    setSelectWindowOpen(true);
                  }}
                >
                  <CircleMinus size={16} /> Remove Songs
                </div>
              )}

              <div
                className="mobile__nav__btn"
                onClick={() => window.location.reload()}
              >
                <RotateCw size={16} /> Reload Page
              </div>
            </ul>
          </div>
        </div>
        {genreDialogOpen && (
          <div className="genreDialog">
            <div className="genreDialog__header">
              <div className="genreDialog__header__title">Select Genre</div>
              {!inProgress && (
                <div
                  className="genreDialog__header__close"
                  onClick={() => {
                    setGenreDialogOpen(false);
                  }}
                >
                  <X size={16} /> Cancel
                </div>
              )}
            </div>
            <div className="genreDialog__options">
              {validPaths
                ?.filter((i) => i.toLowerCase() !== "home")
                .map((genre) => (
                  <div
                    key={genre}
                    className={`genreDialog__options__radio ${
                      selectedGenre === genre ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedGenre(genre);
                    }}
                  >
                    <Circle
                      size={16}
                      fill={selectedGenre === genre ? "#f6fcdf" : "white"}
                    />
                    {genre === "miscellaneous" ? "Gentle Tunes" : pretty(genre)}
                  </div>
                ))}
            </div>
            <div
              className="genreDialog__submit"
              onClick={async () => {
                if (!selectedGenre || inProgress) {
                  return;
                }
                try {
                  setInProgress(true);
                  await handleAddSong(selectedGenre);
                } catch (e) {
                  console.error(`Error in adding song, [header.jsx]: ${e}`);
                  alert(e);
                } finally {
                  setInProgress(false);
                  setGenreDialogOpen(false);
                }
              }}
            >
              {inProgress ? "in progress..." : "submit"}
            </div>
          </div>
        )}
      </header>
    );
  }
  return { Header, selectWindowOpen, setSelectWindowOpen, setAudiosToDelete };
}
