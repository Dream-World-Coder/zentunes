import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Filesystem, Directory } from "@capacitor/filesystem";

import "./styles/style.css";
import "./App.css";

import Home from "./pages/Home/Home";
import MusicPage from "./pages/MusicPage/MusicPage";
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";
import NotFoundPage from "./pages/NotFound";

import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";

export default function App() {
    const [localMusicsDataUri, setLocalMusicsDataUri] = useState({});

    useEffect(() => {
        const initLocalMusicsData = async () => {
            try {
                // Check if file exists
                await Filesystem.readFile({
                    path: "localMusicsData.json",
                    directory: Directory.Data,
                });
                console.log("localMusicsData.json exists.");
            } catch (error) {
                // If not found, create empty file
                if (error.message.includes("File does not exist")) {
                    await Filesystem.writeFile({
                        path: "localMusicsData.json",
                        data: JSON.stringify({}),
                        directory: Directory.Data,
                    });
                    console.log("Created empty localMusicsData.json.");
                } else {
                    console.error("Error reading localMusicsData.json", error);
                }
            }

            // Get URI and pass to context
            const { uri } = await Filesystem.getUri({
                directory: Directory.Data,
                path: "localMusicsData.json",
            });
            setLocalMusicsDataUri(uri);
        };

        initLocalMusicsData();
    }, []);

    return (
        <HelmetProvider>
            <AudioPlayerProvider
                localMusicsDataUri={localMusicsDataUri}
                setLocalMusicsDataUri={setLocalMusicsDataUri}
            >
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/musics/:genre" element={<MusicPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    <div className="status-bar-cover"></div>
                </Router>
            </AudioPlayerProvider>
        </HelmetProvider>
    );
}
