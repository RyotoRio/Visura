// src/styles/GlobalStyles.js
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
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
  
  /* Fix for styled-components not loading properly */
  .slick-slider {
    position: relative;
    display: block;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -khtml-user-select: none;
    -ms-touch-action: pan-y;
    touch-action: pan-y;
    -webkit-tap-highlight-color: transparent;
  }
  
  .slick-list {
    position: relative;
    display: block;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
  
  .slick-track {
    position: relative;
    top: 0;
    left: 0;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  
  .slick-slide {
    display: none;
    float: left;
    height: 100%;
    min-height: 1px;
  }
  
  .slick-initialized .slick-slide {
    display: block;
  }
  
  /* Add CSS for story circles and story viewer */
  .story-circle {
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    padding: 2px;
  }
  
  .story-avatar {
    border-radius: 50%;
    border: 2px solid white;
  }
  
  /* Fix some UI inconsistencies */
  .comment-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .hashtag {
    color: #00376b;
  }
  
  /* Fix for action buttons */
  .action-button {
    display: flex;
    align-items: center;
  }
  
  /* Fix for text overflow */
  .text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Fix for Creative Board */
  .creative-board-container {
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
  }
  
  .story-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }
  
  .story-card:hover {
    transform: translateY(-4px);
  }
`;

export default GlobalStyles;
