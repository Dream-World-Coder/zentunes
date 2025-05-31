import { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Sun, Orbit } from "lucide-react";

import "../styles/header.scss";

// import logo from "../assets/images/logo.svg";
import ham from "../assets/images/ham.svg";

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

    const navItems = [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "Categories",
            href: "dropdown",

            // fetch them -- no need, cuz as of now they should be fixed bcz of music-page-data, just songs inside will vary
            dropdownItems: [
                {
                    title: "Nature",
                    href: "/musics/nature",
                },
                {
                    title: "Classical",
                    href: "/musics/classical",
                },
                {
                    title: "Retro Bangla",
                    href: "/musics/bangla_retro",
                },
                {
                    title: "Extant Bangla",
                    href: "/musics/bangla_new",
                },
                {
                    title: "Rabindra Sangeeet",
                    href: "/musics/rabindra_sangeet",
                },
                {
                    title: "Hindi Retro",
                    href: "/musics/hindi_retro",
                },
                {
                    title: "Contemporary Hindi",
                    href: "/musics/hindi_new",
                },
                {
                    title: "Devotional",
                    href: "/musics/religious",
                },
                {
                    title: "Tunes",
                    href: "/musics/miscellaneous",
                },
            ],
        },
        {
            title: "About",
            href: "/about",
        },
        {
            title: "Contact",
            href: "/contact",
        },
    ];

    return (
        <header>
            <div className="wrapper">
                <div className="logo">
                    <div className="logoIcon ecr">Zs</div>
                    <span className="">Zentunes</span>
                </div>
                <nav>
                    <ul>
                        {navItems.map((item, idx) =>
                            item.href !== "dropdown" ? (
                                <li key={item.href} className="nav-li">
                                    <NavLink to={item.href}>
                                        {item.title}
                                    </NavLink>
                                </li>
                            ) : (
                                <li key={idx} className="nav-li dropdown">
                                    {item.title}
                                    <ul className="music-categories">
                                        {item.dropdownItems.map((elm) => (
                                            <li
                                                key={elm.href}
                                                className="category-li"
                                            >
                                                <NavLink to={elm.href}>
                                                    {elm.title}
                                                </NavLink>
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
                        <li>
                            <NavLink to="/">Home</NavLink>
                        </li>
                        <li>
                            <NavLink to="/about">About</NavLink>
                        </li>
                        <li>
                            <NavLink to="/contact">Contact</NavLink>
                        </li>
                    </ul>
                </div>
                <div className="options">
                    <div
                        className="dark-mode-button"
                        ref={darkModeButtonRef}
                        onClick={handleDarkModeToggle}
                        style={{ cursor: "pointer" }}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Orbit size={20} />}
                    </div>
                    {/* <div className="download-button">
                        <Download size={20} />
                    </div> */}
                    <div
                        className="login-btn"
                        onClick={() => {
                            alert("not available now.");
                        }}
                    >
                        Login
                    </div>
                </div>
            </div>
        </header>
    );
}
