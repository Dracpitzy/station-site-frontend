import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/glass.css";
import "./styles/layout.css";
import App from "./App.jsx";
import { hideSplash } from "./splash.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

requestAnimationFrame(hideSplash);