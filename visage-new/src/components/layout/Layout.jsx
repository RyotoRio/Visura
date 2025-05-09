// src/components/layout/Layout.js
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import {
    FaHome,
    FaCompass,
    FaPlus,
    FaSearch,
    FaPencilAlt,
    FaSignOutAlt,
    FaUserCircle,
} from "react-icons/fa";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
            setIsSearchOpen(false);
        }
    };

    // If user is not logged in and trying to access a protected route, render only children
    if (
        !user &&
        location.pathname !== "/login" &&
        location.pathname !== "/register"
    ) {
        return <>{children}</>;
    }

    // Skip layout for login and register pages
    if (location.pathname === "/login" || location.pathname === "/register") {
        return <>{children}</>;
    }

    return (
        <LayoutContainer>
            <Sidebar>
                <LogoContainer>
                    <Link to="/">
                        <Logo>Visage</Logo>
                    </Link>
                </LogoContainer>

                <NavLinks>
                    <NavItem active={location.pathname === "/"}>
                        <Link to="/">
                            <FaHome /> <span>Feed</span>
                        </Link>
                    </NavItem>
                    <NavItem active={location.pathname === "/explore"}>
                        <Link to="/explore">
                            <FaCompass /> <span>Explore</span>
                        </Link>
                    </NavItem>
                    <NavItem>
                        <NavLink onClick={() => setIsSearchOpen(!isSearchOpen)}>
                            <FaSearch /> <span>Search</span>
                        </NavLink>
                    </NavItem>
                    <NavItem active={location.pathname === "/create"}>
                        <Link to="/create">
                            <FaPlus /> <span>Create Post</span>
                        </Link>
                    </NavItem>
                    <NavItem active={location.pathname === "/creative-board"}>
                        <Link to="/creative-board">
                            <FaPencilAlt /> <span>Creative Board</span>
                        </Link>
                    </NavItem>
                    <NavItem
                        active={location.pathname === `/${user?.username}`}
                    >
                        <Link to={`/${user?.username}`}>
                            <FaUserCircle /> <span>Profile</span>
                        </Link>
                    </NavItem>
                    <NavItem>
                        <NavLink onClick={logout}>
                            <FaSignOutAlt /> <span>Logout</span>
                        </NavLink>
                    </NavItem>
                </NavLinks>
            </Sidebar>

            {isSearchOpen && (
                <SearchOverlay>
                    <SearchContainer>
                        <SearchForm onSubmit={handleSearchSubmit}>
                            <SearchInput
                                type="text"
                                placeholder="Search users, hashtags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <SearchButton type="submit">Search</SearchButton>
                        </SearchForm>
                        <CloseButton onClick={() => setIsSearchOpen(false)}>
                            Cancel
                        </CloseButton>
                    </SearchContainer>
                </SearchOverlay>
            )}

            <MainContent>{children}</MainContent>
        </LayoutContainer>
    );
};

// Styled Components
const LayoutContainer = styled.div`
    display: flex;
    min-height: 100vh;
`;

const Sidebar = styled.div`
    width: 250px;
    background: white;
    border-right: 1px solid #dbdbdb;
    height: 100vh;
    position: fixed;
    padding: 20px 0;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 70px;
    }
`;

const LogoContainer = styled.div`
    padding: 0 20px 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #dbdbdb;
`;

const Logo = styled.h1`
    font-family: "Grand Hotel", cursive;
    font-size: 28px;
    color: #262626;
    margin: 0;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const NavLinks = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
`;

const NavItem = styled.li`
    margin-bottom: 5px;

    a,
    button {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        color: #262626;
        text-decoration: none;
        font-weight: ${(props) => (props.active ? "bold" : "normal")};
        background: ${(props) => (props.active ? "#fafafa" : "transparent")};

        &:hover {
            background: #fafafa;
        }

        svg {
            margin-right: 15px;
            font-size: 20px;
        }

        @media (max-width: 768px) {
            padding: 15px;
            justify-content: center;

            svg {
                margin-right: 0;
            }

            span {
                display: none;
            }
        }
    }
`;

const NavLink = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px 20px;
    color: #262626;
    text-decoration: none;
    font-weight: normal;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 16px;

    &:hover {
        background: #fafafa;
    }

    svg {
        margin-right: 15px;
        font-size: 20px;
    }

    @media (max-width: 768px) {
        padding: 15px;
        justify-content: center;

        svg {
            margin-right: 0;
        }

        span {
            display: none;
        }
    }
`;

const MainContent = styled.main`
    flex: 1;
    margin-left: 250px;
    padding: 20px;
    background: #fafafa;

    @media (max-width: 768px) {
        margin-left: 70px;
        padding: 10px;
    }
`;

const SearchOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const SearchContainer = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
`;

const SearchForm = styled.form`
    display: flex;
    margin-bottom: 10px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 10px;
    border: 1px solid #dbdbdb;
    border-radius: 4px 0 0 4px;
    font-size: 16px;
    outline: none;
`;

const SearchButton = styled.button`
    padding: 10px 15px;
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-weight: bold;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: #0095f6;
    cursor: pointer;
    font-size: 16px;
    align-self: center;
    padding: 5px;
`;

export default Layout;
