import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import "./styles/style.css";
import "./App.css";

import Home from "./pages/Home/Home";
import MusicPage from "./pages/MusicPage/MusicPage";
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/Contact";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFound";
import { RouteTracker } from "./components/routeTracker";
import BackButtonHandler from "./components/backBtn";

import { AudioPlayerProvider } from "./contexts/AudioPlayerContext";
import { requestFilePermissions } from "./services/permissions";

export default function App() {
  useEffect(() => {
    async function initializeApp() {
      await requestFilePermissions();
    }
    initializeApp();
  }, []);

  return (
    <HelmetProvider>
      <AudioPlayerProvider>
        <Router>
          <RouteTracker />
          <BackButtonHandler />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/musics/:genre" element={<MusicPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <div className="status-bar-cover"></div>
        </Router>
      </AudioPlayerProvider>
    </HelmetProvider>
  );
}
