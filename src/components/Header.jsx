import { useEffect, useState, useRef } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  X,
  Sun,
  Moon,
  Trash,
  Share2,
  RotateCw,
  CirclePlus,
  CircleMinus,
  MessageCirclePlus,
} from "lucide-react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { handleAddSong, handleRemoveSong } from "../services/musicStorage";

import { navItems } from "../assets/data/navItems";
import ham from "../assets/images/ham.svg";
import "../styles/header.scss";

function handleShare() {
  const urlToShare = window.location.href;
  navigator.clipboard.writeText(urlToShare);
  alert("link copied to clipboard.");
}

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

    // Handle dark mode toggle
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
          <NavLink to="/" className="logo">
            <div className="logo__icon">
              <img src="/favicon.png" alt="logo" />
            </div>
            <span className="logo__text">Zentunes</span>
          </NavLink>

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
              <h2 className="mobile__nav__header">Navigation</h2>
              {navItems.map(
                (item, idx) =>
                  item.href !== "dropdown" && (
                    <li key={idx}>
                      <NavLink to={item.href}>{item.title}</NavLink>
                    </li>
                  )
              )}
              <div className="mobile__nav__header">Actions</div>
              <div
                className="mobile__nav__btn"
                onClick={() => handleAddSong(validPaths)}
              >
                <CirclePlus size={16} /> Add Songs
              </div>
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
              <div className="mobile__nav__btn" onClick={handleShare}>
                <Share2 size={16} /> Share
              </div>
              <div
                className="mobile__nav__btn"
                onClick={() => alert("Will be available soon")}
              >
                <MessageCirclePlus size={16} /> Feedback
              </div>
            </ul>
          </div>
        </div>
      </header>
    );
  }
  return { Header, selectWindowOpen, setSelectWindowOpen, setAudiosToDelete };
}
