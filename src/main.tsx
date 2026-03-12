import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import App from "./App.tsx";
import { ApiProvider, PlayerProvider } from "./providers/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApiProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </ApiProvider>
  </StrictMode>,
);
