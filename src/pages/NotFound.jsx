// src/pages/NotFound.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaCamera, FaHome } from "react-icons/fa";

const NotFound = () => {
    return (
        <NotFoundContainer>
            <Logo>Visage</Logo>

            <NotFoundContent>
                <Icon>
                    <FaCamera />
                </Icon>
                <Title>Page Not Found</Title>
                <Description>
                    The page you are looking for doesn't exist or another error
                    occurred.
                </Description>
                <HomeButton to="/">
                    <FaHome /> Go back to home
                </HomeButton>
            </NotFoundContent>

            <Footer>
                <FooterLinks>
                    <FooterLink href="#">About</FooterLink>
                    <FooterLink href="#">Help</FooterLink>
                    <FooterLink href="#">Press</FooterLink>
                    <FooterLink href="#">API</FooterLink>
                    <FooterLink href="#">Jobs</FooterLink>
                    <FooterLink href="#">Privacy</FooterLink>
                    <FooterLink href="#">Terms</FooterLink>
                    <FooterLink href="#">Locations</FooterLink>
                </FooterLinks>
                <Copyright>© 2025 VISAGE</Copyright>
            </Footer>
        </NotFoundContainer>
    );
};

// Styled Components
const NotFoundContainer = styled.div`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
`;

const Logo = styled.h1`
    font-family: "Grand Hotel", cursive;
    font-size: 42px;
    color: #262626;
    margin-bottom: 40px;
`;

const NotFoundContent = styled.div`
    text-align: center;
    max-width: 400px;
    margin-bottom: 60px;
`;

const Icon = styled.div`
    font-size: 64px;
    color: #8e8e8e;
    margin-bottom: 24px;
`;

const Title = styled.h2`
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
`;

const Description = styled.p`
    color: #8e8e8e;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 24px;
`;

const HomeButton = styled(Link)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        background: #0086e0;
    }
`;

const Footer = styled.footer`
    margin-top: auto;
    text-align: center;
`;

const FooterLinks = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 16px;
`;

const FooterLink = styled.a`
    color: #8e8e8e;
    font-size: 12px;
    text-decoration: none;
    margin: 0 8px 8px;

    &:hover {
        text-decoration: underline;
    }
`;

const Copyright = styled.div`
    color: #8e8e8e;
    font-size: 12px;
`;

export default NotFound;
