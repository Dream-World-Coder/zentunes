import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/footer.scss";

export default function Footer() {
    const [year] = useState(new Date().getFullYear());

    const navItems = [
        { title: "Home", href: "/" },
        {
            title: "Categories",
            href: "dropdown",
            dropdownItems: [
                { title: "Nature", href: "/musics/nature" },
                { title: "Classical", href: "/musics/classical" },
                { title: "Retro Bangla", href: "/musics/bangla_retro" },
                { title: "Bangla", href: "/musics/bangla_new" },
                {
                    title: "Rabindra Sangeeet",
                    href: "/musics/rabindra_sangeet",
                },
                { title: "Hindi Retro", href: "/musics/hindi_retro" },
                { title: "Religious", href: "/musics/religious" },
                { title: "Song Clips", href: "/musics/song_clips" },
            ],
        },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
    ];

    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__logo">
                    <h2 className="footer__title ecr">Zentunes</h2>
                </div>

                <div className="footer__links">
                    <ul className="footer__list">
                        <h3 className="footer__item">Navigation</h3>
                        {navItems
                            .filter((item) => item.href !== "dropdown")
                            .map((i) => (
                                <li key={i.href} className="footer__item">
                                    <NavLink
                                        to={i.href}
                                        className="footer__link"
                                    >
                                        {i.title}
                                    </NavLink>
                                </li>
                            ))}
                    </ul>

                    <ul className="footer__list">
                        <h3 className="footer__item">Categories</h3>
                        {navItems
                            .find((item) => item.href === "dropdown")
                            ?.dropdownItems.map((i) => (
                                <li key={i.href} className="footer__item">
                                    <NavLink
                                        to={i.href}
                                        className="footer__link"
                                    >
                                        {i.title}
                                    </NavLink>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>

            <div className="footer__bottom">
                <span>Copyright © {year} Zentunes</span>
            </div>
        </footer>
    );
}
