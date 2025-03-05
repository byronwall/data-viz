import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LandingPage />
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
