import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Remixicon is already loaded via CDN in index.html, removed to avoid conflicts

createRoot(document.getElementById("root")!).render(<App />);
