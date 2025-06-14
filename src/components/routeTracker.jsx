import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { addToHistory } from "../services/historyTracker";

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    addToHistory(location.pathname);
  }, [location]);

  return null;
}
