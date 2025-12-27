import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

import "../styles/header.scss";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const darkModeButtonRef = useRef(null);

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
        <NavLink to="/" className="logo">
          <div className="logo__icon">
            <img src="/favicon.png" alt="logo" />
          </div>
          <span className="logo__text">Zentunes</span>
        </NavLink>

        <div className="options">
          <NavLink to={"/"}>Home</NavLink>
          <NavLink to={"/search"}>Search</NavLink>
          <div
            className="dark-mode-button"
            ref={darkModeButtonRef}
            onClick={handleDarkModeToggle}
            style={{ cursor: "pointer" }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
}
