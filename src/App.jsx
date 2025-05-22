import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./styles/style.css";
import "./App.css";

import Home from "./pages/Home/Home";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </Router>
    );
}
