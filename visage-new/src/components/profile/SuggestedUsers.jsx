// src/components/profile/SuggestedUsers.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SuggestedUsers = () => {
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, followUser } = useAuth();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                setLoading(true);
                const response = await authService.getSuggestedUsers();
                // Ensure suggestedUsers is always an array
                setSuggestedUsers(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (error) {
                console.error("Error fetching suggested users:", error);
                // Initialize with empty array on error
                setSuggestedUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedUsers();
    }, []);

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
            // Remove user from suggestions after following
            setSuggestedUsers(
                suggestedUsers.filter((user) => user._id !== userId)
            );
        } catch (error) {
            console.error("Error following user:", error);
        }
    };

    if (loading) {
        return (
            <SuggestedUsersContainer>
                Loading suggestions...
            </SuggestedUsersContainer>
        );
    }

    // Don't render anything if there are no suggested users
    if (!Array.isArray(suggestedUsers) || suggestedUsers.length === 0) {
        return null;
    }

    return (
        <SuggestedUsersContainer>
            <Header>
                <Title>Suggestions For You</Title>
                <ViewAll to="/explore?tab=discover">See All</ViewAll>
            </Header>

            {user && (
                <CurrentUser>
                    <UserAvatar src={user.profilePicture} alt={user.username} />
                    <UserInfo>
                        <Username to={`/${user.username}`}>
                            {user.username}
                        </Username>
                        <FullName>{user.fullName}</FullName>
                    </UserInfo>
                </CurrentUser>
            )}

            <SuggestionsList>
                {/* Add explicit Array.isArray check before slice and map */}
                {Array.isArray(suggestedUsers) &&
                    suggestedUsers.slice(0, 5).map((suggestedUser) => (
                        <SuggestionItem key={suggestedUser._id}>
                            <UserAvatar
                                src={suggestedUser.profilePicture}
                                alt={suggestedUser.username}
                            />
                            <UserInfo>
                                <Username to={`/${suggestedUser.username}`}>
                                    {suggestedUser.username}
                                </Username>
                                <FollowStatus>Suggested for you</FollowStatus>
                            </UserInfo>
                            <FollowButton
                                onClick={() => handleFollow(suggestedUser._id)}
                            >
                                Follow
                            </FollowButton>
                        </SuggestionItem>
                    ))}
            </SuggestionsList>

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
        </SuggestedUsersContainer>
    );
};

// Styled Components
const SuggestedUsersContainer = styled.div`
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 20px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const Title = styled.h2`
    font-size: 14px;
    font-weight: 600;
    color: #8e8e8e;
`;

const ViewAll = styled(Link)`
    font-size: 12px;
    font-weight: 600;
    color: #262626;

    &:hover {
        color: #8e8e8e;
    }
`;

const CurrentUser = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #efefef;
`;

const UserAvatar = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const Username = styled(Link)`
    display: block;
    font-weight: 600;
    color: #262626;
    font-size: 14px;
    margin-bottom: 2px;

    &:hover {
        text-decoration: underline;
    }
`;

const FullName = styled.span`
    font-size: 12px;
    color: #8e8e8e;
`;

const FollowStatus = styled.span`
    font-size: 12px;
    color: #8e8e8e;
`;

const SuggestionsList = styled.div`
    margin-bottom: 16px;
`;

const SuggestionItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
`;

const FollowButton = styled.button`
    background: transparent;
    border: none;
    color: #0095f6;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;

    &:hover {
        color: #00376b;
    }
`;

const Footer = styled.div`
    margin-top: 16px;
`;

const FooterLinks = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16px;
`;

const FooterLink = styled.a`
    font-size: 11px;
    color: #c7c7c7;
    margin-right: 8px;
    margin-bottom: 4px;

    &:hover {
        text-decoration: underline;
    }
`;

const Copyright = styled.div`
    font-size: 11px;
    color: #c7c7c7;
    text-transform: uppercase;
`;

export default SuggestedUsers;
