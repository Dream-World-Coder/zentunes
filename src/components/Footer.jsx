// import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navItems } from "../assets/data/navItems";
import "../styles/footer.scss";

export default function Footer() {
    // const [year] = useState(new Date().getFullYear());

    return (
        <footer className="footer no-select">
            <div className="footer__inner">
                <div className="footer__logo">
                    <div className="footer__icon">
                        <img src="/favicon.png" alt="logo" />
                    </div>
                    <h2 className="footer__title ecr">Zentunes</h2>
                </div>

                <div className="footer__links">
                    <ul className="footer__list">
                        <h3 className="footer__item faded">Navigation</h3>
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
                        <h3 className="footer__item faded">Genres</h3>
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
                {/* <span>Copyright © {year} Zentunes</span> */}
            </div>
        </footer>
    );
}
