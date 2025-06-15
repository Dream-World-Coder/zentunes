import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate } from "react-router-dom";

export default function BackButtonHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      handler.remove();
    };
  }, [navigate]);

  return null;
}
