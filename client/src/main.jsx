import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { QuickRTCProvider } from "quickrtc-react-client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QuickRTCProvider>
      <App />
    </QuickRTCProvider>
  </StrictMode>
);
