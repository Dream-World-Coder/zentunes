"use client";

import { useState, useEffect } from "react";
import { navItems } from "@/assets/data/navItems";
import Link from "next/link";
import Image from "next/image";

import "./footer.scss";

export default function Footer() {
  // Initialize with null or a fallback to avoid hydration mismatch
  const [year, setYear] = useState(2025);

  useEffect(() => {
    setTimeout(() => {
      setYear(new Date().getFullYear());
    }, 100);
  }, []);

  return (
    <footer className="footer no-select">
      <div className="footer__inner">
        <div className="footer__logo">
          <div className="footer__icon">
            <Image
              src="/favicon.png"
              alt="logo"
              width={32} // Required in Next.js
              height={32} // Required in Next.js
            />
          </div>
          <h2 className="footer__title ecr">Zentunes</h2>
        </div>

        <div className="footer__links">
          <ul className="footer__list">
            {/* Changed h3 inside ul to a div or li for valid HTML */}
            <li className="footer__item faded">Navigation</li>
            {navItems
              .filter((item) => item.href !== "dropdown")
              .map((i) => (
                <li key={i.href} className="footer__item">
                  <Link href={i.href} className="footer__link">
                    {i.title}
                  </Link>
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
