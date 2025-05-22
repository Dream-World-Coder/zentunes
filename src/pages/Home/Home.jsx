import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import Header from "../../components/Header";
import PlayOptions from "../../hooks/playOptions";
import AudioItem from "../../components/Music";

import musicsData from "../musics-data";

export default function Home() {
    const musics = musicsData["home"];
    const musicItemsRef = useRef([]);
    /*
     * inspired from: https://www.supah.it/portfolio/
     * credit: Favio Ottoviani
     */
    const isDesktop =
        !/Android/i.test(navigator.userAgent) && window.innerWidth > 1025;

    // Handle mouse enter animation
    const handleMouseEnter = (e, index) => {
        if (!isDesktop) return;

        const music = musicItemsRef.current[index];
        if (!music) return;

        const link = music.querySelector("figcaption");
        const overlay = music.querySelector(".overlay");

        if (!link || !overlay) return;

        // Determine if mouse is entering from top or bottom
        const bounds = music.getBoundingClientRect();
        const top = e.clientY < bounds.y + bounds.height / 2;

        // Animate link movement and overlay scale
        gsap.to(link, {
            x: "2rem",
            duration: 0.5,
            ease: "power3.out",
        });

        gsap.fromTo(
            overlay,
            {
                scaleY: 0,
                transformOrigin: top ? "0 0" : "0 100%",
            },
            {
                scaleY: 1,
                duration: 0.5,
                ease: "power3.out",
            },
        );
    };

    // Handle mouse leave animation
    const handleMouseLeave = (e, index) => {
        if (!isDesktop) return;

        const music = musicItemsRef.current[index];
        if (!music) return;

        const link = music.querySelector("figcaption");
        const overlay = music.querySelector(".overlay");

        if (!link || !overlay) return;

        // Determine if mouse is leaving from top or bottom
        const bounds = music.getBoundingClientRect();
        const top = e.clientY < bounds.y + bounds.height / 2;

        // Reset animations
        gsap.killTweensOf([overlay, link]);

        gsap.to(link, {
            x: 0,
            duration: 0.3,
            ease: "power3.out",
        });

        gsap.to(overlay, {
            scaleY: 0,
            transformOrigin: top ? "0 0" : "0 100%",
            duration: 0.7,
            ease: "power3.out",
        });
    };

    // Cleanup animations on unmount
    useEffect(() => {
        return () => {
            // Kill all GSAP animations when component unmounts
            musicItemsRef.current.forEach((music) => {
                if (music) {
                    const link = music.querySelector("figcaption");
                    const overlay = music.querySelector(".overlay");
                    if (link && overlay) {
                        gsap.killTweensOf([overlay, link]);
                    }
                }
            });
        };
    }, []);

    // Set ref for each music item
    const setMusicRef = (el, index) => {
        musicItemsRef.current[index] = el;
    };

    return (
        <>
            <Header />
            <section className="container">
                <h2>Some Melodies</h2>
                <p>
                    Some melodies of my collection. I hope you like them. Taken
                    from vivo&apos;s youtube channel.
                </p>
                <PlayOptions />
                <ul className="musics">
                    {musics.map((music, index) => (
                        <li
                            key={index}
                            ref={(el) => setMusicRef(el, index)}
                            onMouseEnter={(e) => handleMouseEnter(e, index)}
                            onMouseLeave={(e) => handleMouseLeave(e, index)}
                        >
                            <AudioItem
                                src={music.src}
                                title={music.title}
                                mediaType={music.mediaType}
                                index={index}
                            />
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
}
