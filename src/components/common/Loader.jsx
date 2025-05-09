// src/components/common/Loader.js
import React from "react";
import styled, { keyframes } from "styled-components";

const Loader = () => {
    return (
        <LoaderContainer>
            <SpinnerContainer>
                <Spinner />
            </SpinnerContainer>
        </LoaderContainer>
    );
};

// Animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled Components
const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
`;

const SpinnerContainer = styled.div`
    width: 40px;
    height: 40px;
    position: relative;
`;

const Spinner = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: #0095f6;
    border-left-color: #0095f6;
    animation: ${spin} 0.8s linear infinite;
`;

export default Loader;
