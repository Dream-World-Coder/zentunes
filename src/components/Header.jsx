import { useEffect, useState, useRef, useCallback } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import {
  X,
  Scan,
  Trash,
  Search,
  Share2,
  Circle,
  RotateCw,
  CirclePlus,
  ToggleLeft,
  ToggleRight,
  CircleMinus,
  DatabaseZap,
  CopyPlusIcon,
  MessageCirclePlus,
} from "lucide-react";
import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { handleAddSong, handleRemoveSong } from "../services/musicStorage";
import { getFormattedTitle as pretty } from "../services/formatting";
import { makeAudioCache } from "../services/cacheService";
import { copyAllSongs } from "../services/copyAudios";

import { navItems as n1, navItemsSimple as n2 } from "../assets/data/navItems";
import ham from "../assets/images/ham.svg";
import "../styles/header.scss";

const ProgressDialog = ({
  isOpen,
  progress,
  currentFile,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "24px",
          borderRadius: "8px",
          minWidth: "400px",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h3
          style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "bold" }}
        >
          Copying Songs...
        </h3>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#31511e",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Progress Text */}
        <div style={{ fontSize: "14px", marginBottom: "8px" }}>
          {progress}% Complete
        </div>

        {/* Current File */}
        {currentFile && (
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "8px",
              wordBreak: "break-all",
            }}
          >
            Current: {currentFile}
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {/* Close Button (only show when complete) */}
        {progress >= 100 && (
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#31511e",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
ProgressDialog.propTypes = {
  isOpen: PropTypes.bool,
  progress: PropTypes.number,
  currentFile: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
};

export default function useHeader() {
  const [selectWindowOpen, setSelectWindowOpen] = useState(false);
  const [audiosToDelete, setAudiosToDelete] = useState([]);

  const { genre } = useParams();
  useEffect(() => {
    setSelectWindowOpen(false);
    setAudiosToDelete([]);
  }, [genre]);

  function handleShare() {
    const urlToShare = window.location.href;
    navigator.clipboard.writeText(urlToShare);
    alert("link copied to clipboard.");
  }

  function Header() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [genreDialogOpen, setGenreDialogOpen] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState("");

    const darkModeButtonRef = useRef(null);
    const { validPaths, currentAudio, setIsPlaylistLoading } = useAudioPlayer();

    const navigate = useNavigate();
    function toggleSimpleVersion() {
      navigate("/");
      const val = JSON.parse(localStorage.getItem("simpleVersion") || "false");
      localStorage.setItem("simpleVersion", JSON.stringify(!val));
    }
    const simpleVersion = JSON.parse(
      localStorage.getItem("simpleVersion") || "false"
    );
    const navItems = !simpleVersion ? n1 : n2;

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

    // progressbar -> when copying
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState("");
    const [message, setMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Progress handler
    const progressHandler = useCallback((progressData) => {
      const { current, total, currentGenre, filename, status, error } =
        progressData;
      const percentage = Math.round((current / total) * 100);

      setProgress(percentage);
      setCurrentFile(`${currentGenre}/${filename}`);

      let statusMessage = "";
      if (status === "completed") {
        statusMessage = "Completed";
      } else if (status === "failed") {
        statusMessage = `Failed: ${error}`;
      } else if (status === "processing") {
        statusMessage = "Processing...";
      }

      setMessage(statusMessage);
    }, []);

    // Start copy operation
    const handleStartCopy = async () => {
      setIsPlaylistLoading(true);
      setIsDialogOpen(true);
      setProgress(0);
      setCurrentFile("");
      setMessage("Starting...");
      setIsProcessing(true);

      try {
        const results = await copyAllSongs(progressHandler);
        setMessage(
          `Copy completed! ${results.successful.length} songs copied successfully.`
        );
        console.log("Copy results:", results);
      } catch (error) {
        setMessage(`Copy failed: ${error.message}`);
        console.error("Copy error:", error);
      } finally {
        setIsProcessing(false);
        setIsPlaylistLoading(false);
      }
    };

    // Close dialog
    const handleCloseDialog = () => {
      setIsDialogOpen(false);
      setProgress(0);
      setCurrentFile("");
      setMessage("");
    };

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
            {/* <div className="dark-mode-button"></div> */}
            <Search
              size={18}
              onClick={() => {
                navigate("/search");
              }}
            />

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

              {/* preferences */}
              <div className="mobile__nav__header">Preferences</div>
              <div
                className="mobile__nav__btn"
                ref={darkModeButtonRef}
                onClick={handleDarkModeToggle}
                style={{ cursor: "pointer" }}
              >
                {isDarkMode ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}{" "}
                Dark Mode
              </div>
              <div className="mobile__nav__btn" onClick={toggleSimpleVersion}>
                {!simpleVersion ? (
                  <ToggleLeft size={16} />
                ) : (
                  <ToggleRight size={16} />
                )}
                Simple Version
              </div>

              {/* actions */}
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
                onClick={() => {
                  const confirmReload = window.confirm(
                    "Are you sure you want to reload?"
                  );
                  if (confirmReload) {
                    window.location.reload();
                  }
                }}
              >
                <RotateCw size={16} /> Reload Page
              </div>

              <div
                className="mobile__nav__btn"
                onClick={handleStartCopy}
                disabled={isProcessing}
                style={{ pointerEvents: isProcessing ? "none" : "all" }}
              >
                <CopyPlusIcon size={16} /> Copy Songs in Device
              </div>

              <div
                className="mobile__nav__btn"
                onClick={() => alert("Will be available soon")}
              >
                <Scan size={16} /> Scan Songs
              </div>

              <div
                className="mobile__nav__btn"
                onClick={async () => {
                  try {
                    setIsPlaylistLoading(true);
                    const confirmReCache = window.confirm(
                      "This may take upto 10 minutes. Are you sure?"
                    );
                    if (confirmReCache) {
                      await makeAudioCache();
                    }
                  } catch (e) {
                    console.log("header line:267", e);
                  } finally {
                    setIsPlaylistLoading(false);
                  }
                }}
              >
                <DatabaseZap size={16} /> Rebuild Cache
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

        {/* add songs dialog */}
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
              {validPaths?.map((genre) => (
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

        {/* copy songs dialog */}
        <ProgressDialog
          isOpen={isDialogOpen}
          progress={progress}
          currentFile={currentFile}
          message={message}
          onClose={handleCloseDialog}
        />
      </header>
    );
  }
  return { Header, selectWindowOpen, setSelectWindowOpen, setAudiosToDelete };
}
