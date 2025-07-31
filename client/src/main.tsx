import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeServiceWorker } from "./lib/service-worker";

// Initialize service worker for push notifications
initializeServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
