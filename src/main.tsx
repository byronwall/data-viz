import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";
import { registerAllCharts } from "./charts/registry.ts";
import { GlobalAlertDialog } from "./components/GlobalAlertDialog.tsx";
import { LandingPage } from "./components/LandingPage.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import "./index.css";

// Register all chart definitions
registerAllCharts();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalAlertDialog />
      <LandingPage />
      <Toaster />
      <App />
    </BrowserRouter>
  </StrictMode>
);
