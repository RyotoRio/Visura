// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Grand+Hotel&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: #fafafa;
    color: #262626;
    line-height: 1.5;
  }

  button {
    font-family: 'Roboto', sans-serif;
  }

  a {
    color: #0095f6;
    text-decoration: none;
  }
`;

// Check if we can use the new React 18 API
if (ReactDOM.createRoot) {
    const container = document.getElementById("root");
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <GlobalStyle />
            <App />
        </React.StrictMode>
    );
} else {
    // Fallback to the old React 17 and below API
    ReactDOM.render(
        <React.StrictMode>
            <GlobalStyle />
            <App />
        </React.StrictMode>,
        document.getElementById("root")
    );
}
