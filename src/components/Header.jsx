import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon, Share2 } from "lucide-react";

import { navItems } from "../assets/data/navItems";
import ham from "../assets/images/ham.svg";
import "../styles/header.scss";

function handleShare() {
  const urlToShare = window.location.href;
  navigator.clipboard.writeText(urlToShare);
  alert("link copied to clipboard.");
}

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const darkModeButtonRef = useRef(null);

  // Initialize dark mode from localStorage
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
              ),
            )}
          </ul>
        </nav>

        <div className="mobile-nav dropdown">
          <img src={ham} alt="" />
          <ul>
            {navItems.map(
              (item, idx) =>
                item.href !== "dropdown" && (
                  <li key={idx}>
                    <NavLink to={item.href}>{item.title}</NavLink>
                  </li>
                ),
            )}
          </ul>
        </div>
        <div className="options">
          <div
            className="dark-mode-button"
            ref={darkModeButtonRef}
            onClick={handleDarkModeToggle}
            style={{ cursor: "pointer" }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div className="login-btn" onClick={handleShare}>
            <Share2 size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
