"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import Image from "next/image";

import "./header.scss";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  // Consistent key for localStorage
  const STORAGE_KEY = "isDarkModeZentunes";

  useEffect(() => {
    const savedDarkMode = localStorage.getItem(STORAGE_KEY);

    if (savedDarkMode === "true") {
      setTimeout(() => {
        setIsDarkMode(true);
      }, 100);
      document.body.classList.add("dark");
    } else if (savedDarkMode === "false") {
      setTimeout(() => {
        setIsDarkMode(false);
      }, 100);
      document.body.classList.remove("dark");
    }
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "false");
    }
  };

  return (
    <header>
      <div className="wrapper">
        <Link href="/" className="logo">
          <div className="logo__icon">
            <Image src="/favicon.png" alt="logo" width={24} height={24} />
          </div>
          <span className="logo__text">Zentunes</span>
        </Link>

        <div className="options">
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Home
          </Link>
          <Link
            href="/search"
            className={pathname === "/search" ? "active" : ""}
          >
            Search
          </Link>
          <button
            className="dark-mode-button"
            onClick={handleDarkModeToggle}
            aria-label="Toggle Dark Mode"
            style={{
              cursor: "pointer",
              background: "none",
              border: "none",
              color: "inherit",
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
