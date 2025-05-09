// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import GlobalStyles from "./styles/GlobalStyles";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Fix for React 18
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <GlobalStyles />
        <App />
    </React.StrictMode>
);
