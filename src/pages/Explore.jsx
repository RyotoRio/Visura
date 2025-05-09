// src/pages/Explore.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaFire, FaQuoteLeft, FaImage } from "react-icons/fa";
import { postService, storyService, authService } from "../services/api";
import Loader from "../components/common/Loader";

const Explore = () => {
    const [explorePosts, setExplorePosts] = useState([]);
    const [poetryStories, setPoetryStories] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("trending");

    useEffect(() => {
        const fetchExploreData = async () => {
            try {
                setLoading(true);

                // Fetch trending posts
                const postsResponse = await postService.getExplorePosts();
                setExplorePosts(postsResponse.data);

                // Fetch poetry stories
                const poetryResponse = await storyService.getPoetryStories();
                setPoetryStories(poetryResponse.data);

                // Fetch suggested users
                const usersResponse = await authService.getSuggestedUsers();
                setSuggestedUsers(usersResponse.data);
            } catch (err) {
                toast.error("Failed to load explore content");
            } finally {
                setLoading(false);
            }
        };

        fetchExploreData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <ExploreContainer>
            <ExploreHeader>
                <PageTitle>Explore</PageTitle>

                <TabsContainer>
                    <Tab
                        active={activeTab === "trending"}
                        onClick={() => setActiveTab("trending")}
                    >
                        <FaFire /> Trending
                    </Tab>
                    <Tab
                        active={activeTab === "poetry"}
                        onClick={() => setActiveTab("poetry")}
                    >
                        <FaQuoteLeft /> Poetry
                    </Tab>
                    <Tab
                        active={activeTab === "discover"}
                        onClick={() => setActiveTab("discover")}
                    >
                        <FaImage /> Discover People
                    </Tab>
                </TabsContainer>
            </ExploreHeader>

            {activeTab === "trending" && (
                <>
                    <SectionTitle>Popular Posts</SectionTitle>
                    <PostsGrid>
                        {explorePosts.length > 0 ? (
                            explorePosts.map((post) => (
                                <GridItem key={post._id} to={`/p/${post._id}`}>
                                    <GridItemImage
                                        src={post.mediaUrl}
                                        alt="Post"
                                    />
                                    <GridItemOverlay>
                                        <OverlayStats>
                                            <StatItem>
                                                ♥ {post.likes.length}
                                            </StatItem>
                                            <StatItem>
                                                💬 {post.comments.length}
                                            </StatItem>
                                        </OverlayStats>
                                    </GridItemOverlay>
                                </GridItem>
                            ))
                        ) : (
                            <NoContentMessage>
                                No trending posts available right now. Check
                                back later!
                            </NoContentMessage>
                        )}
                    </PostsGrid>
                </>
            )}

            {activeTab === "poetry" && (
                <>
                    <SectionTitle>Poetry & Creative Expression</SectionTitle>
                    <StoryGrid>
                        {poetryStories.length > 0 ? (
                            poetryStories.map((story) => (
                                <StoryItem
                                    key={story._id}
                                    to={`/s/${story._id}`}
                                >
                                    {story.mediaUrl ? (
                                        <StoryImage
                                            src={story.mediaUrl}
                                            alt="Poetry"
                                        />
                                    ) : (
                                        <StoryTextPreview>
                                            <StoryAuthor>
                                                <AuthorAvatar
                                                    src={
                                                        story.user
                                                            .profilePicture
                                                    }
                                                    alt={story.user.username}
                                                />
                                                <AuthorName>
                                                    {story.user.username}
                                                </AuthorName>
                                            </StoryAuthor>
                                            <StoryContent>
                                                {story.content}
                                            </StoryContent>
                                        </StoryTextPreview>
                                    )}
                                </StoryItem>
                            ))
                        ) : (
                            <NoContentMessage>
                                No poetry stories available right now. Share
                                your own creative expressions!
                            </NoContentMessage>
                        )}
                    </StoryGrid>
                </>
            )}

            {activeTab === "discover" && (
                <>
                    <SectionTitle>People to Follow</SectionTitle>
                    <UsersGrid>
                        {suggestedUsers.length > 0 ? (
                            suggestedUsers.map((user) => (
                                <UserCard key={user._id}>
                                    <UserAvatar
                                        src={user.profilePicture}
                                        alt={user.username}
                                    />
                                    <UserInfo>
                                        <Username to={`/${user.username}`}>
                                            {user.username}
                                        </Username>
                                        <FullName>{user.fullName}</FullName>
                                        {user.bio && (
                                            <UserBio>
                                                {user.bio.substring(0, 60)}
                                                {user.bio.length > 60
                                                    ? "..."
                                                    : ""}
                                            </UserBio>
                                        )}
                                    </UserInfo>
                                    <FollowButton to={`/${user.username}`}>
                                        View
                                    </FollowButton>
                                </UserCard>
                            ))
                        ) : (
                            <NoContentMessage>
                                No suggested users available right now.
                            </NoContentMessage>
                        )}
                    </UsersGrid>
                </>
            )}
        </ExploreContainer>
    );
};

// Styled Components
const ExploreContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const ExploreHeader = styled.div`
    margin-bottom: 30px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 20px;
`;

const TabsContainer = styled.div`
    display: flex;
    border-bottom: 1px solid #dbdbdb;
    margin-bottom: 20px;
`;

const Tab = styled.button`
    background: transparent;
    border: none;
    padding: 16px 24px;
    font-size: 15px;
    font-weight: 600;
    color: ${(props) => (props.active ? "#262626" : "#8e8e8e")};
    border-bottom: 2px solid
        ${(props) => (props.active ? "#262626" : "transparent")};
    cursor: pointer;
    display: flex;
    align-items: center;

    svg {
        margin-right: 8px;
    }

    &:hover {
        color: #262626;
    }

    @media (max-width: 640px) {
        padding: 12px 16px;
        font-size: 14px;
    }
`;

const SectionTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
`;

const PostsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 28px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 4px;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const GridItem = styled(Link)`
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;

    &:hover > div {
        opacity: 1;
    }
`;

const GridItemImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const GridItemOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
`;

const OverlayStats = styled.div`
    display: flex;
    color: white;
    font-weight: 600;
`;

const StatItem = styled.div`
    margin: 0 10px;
    display: flex;
    align-items: center;
`;

const StoryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 28px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        grid-gap: 16px;
    }
`;

const StoryItem = styled(Link)`
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    height: 300px;
    text-decoration: none;

    &:hover {
        transform: translateY(-4px);
    }
`;

const StoryImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const StoryTextPreview = styled.div`
    height: 100%;
    padding: 20px;
    background: linear-gradient(135deg, #4158d0, #c850c0);
    color: white;
    display: flex;
    flex-direction: column;
`;

const StoryAuthor = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 16px;
`;

const AuthorAvatar = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 12px;
`;

const AuthorName = styled.div`
    font-weight: 600;
`;

const StoryContent = styled.div`
    font-size: 16px;
    line-height: 1.5;
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    white-space: pre-wrap;
`;

const UsersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 20px;
`;

const UserCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
`;

const UserAvatar = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 16px;
    object-fit: cover;
`;

const UserInfo = styled.div`
    text-align: center;
    margin-bottom: 16px;
`;

const Username = styled(Link)`
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    display: block;
    margin-bottom: 4px;

    &:hover {
        text-decoration: underline;
    }
`;

const FullName = styled.div`
    color: #8e8e8e;
    margin-bottom: 8px;
`;

const UserBio = styled.p`
    font-size: 14px;
    color: #262626;
`;

const FollowButton = styled(Link)`
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        background: #0086e0;
    }
`;

const NoContentMessage = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 0;
    color: #8e8e8e;
    font-size: 16px;
`;

export default Explore;
