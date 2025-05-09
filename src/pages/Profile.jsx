// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
    FaUserEdit,
    FaCog,
    FaLink,
    FaThLarge,
    FaRegBookmark,
    FaQuoteLeft,
    FaRegClock,
} from "react-icons/fa";
import { authService, postService, storyService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import StoryCircles from "../components/story/StoryCircles";

const Profile = () => {
    const { username } = useParams();
    const { user: currentUser, followUser, unfollowUser } = useAuth();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // Fetch user data
                const userResponse = await authService.getUserByUsername(
                    username
                );
                setUser(userResponse.data);

                // Check if current user is following this user
                if (currentUser) {
                    setIsFollowing(
                        currentUser.following.includes(userResponse.data._id)
                    );
                }

                // Fetch user posts
                const postsResponse = await postService.getUserPosts(
                    userResponse.data._id
                );
                setPosts(postsResponse.data);

                // Fetch user stories
                const storiesResponse = await storyService.getUserStories(
                    userResponse.data._id
                );
                setStories(storiesResponse.data);
            } catch (err) {
                toast.error("Failed to load profile");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username, currentUser, navigate]);

    const handleFollow = async () => {
        try {
            await followUser(user._id);
            setIsFollowing(true);
            // Update user followers count
            setUser((prev) => ({
                ...prev,
                followers: [...prev.followers, currentUser._id],
            }));
        } catch (error) {
            toast.error("Failed to follow user");
        }
    };

    const handleUnfollow = async () => {
        try {
            await unfollowUser(user._id);
            setIsFollowing(false);
            // Update user followers count
            setUser((prev) => ({
                ...prev,
                followers: prev.followers.filter(
                    (id) => id !== currentUser._id
                ),
            }));
        } catch (error) {
            toast.error("Failed to unfollow user");
        }
    };

    // Filter stories by type
    const ephemeralStories = stories.filter(
        (story) => story.storyType === "ephemeral"
    );
    const poetryStories = stories.filter(
        (story) => story.storyType === "poetry"
    );
    const thoughtStories = stories.filter(
        (story) => story.storyType === "thought"
    );

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return (
            <ErrorContainer>
                <ErrorText>User not found</ErrorText>
                <BackButton to="/">Back to Home</BackButton>
            </ErrorContainer>
        );
    }

    const isOwnProfile = currentUser && currentUser._id === user._id;

    return (
        <ProfileContainer>
            <ProfileHeader>
                <ProfileAvatar src={user.profilePicture} alt={user.username} />

                <ProfileInfo>
                    <UsernameRow>
                        <Username>{user.username}</Username>

                        {isOwnProfile ? (
                            <ActionButtons>
                                <EditProfileButton to="/profile/edit">
                                    <FaUserEdit /> Edit Profile
                                </EditProfileButton>
                                <SettingsButton>
                                    <FaCog />
                                </SettingsButton>
                            </ActionButtons>
                        ) : (
                            <ActionButtons>
                                {isFollowing ? (
                                    <UnfollowButton onClick={handleUnfollow}>
                                        Unfollow
                                    </UnfollowButton>
                                ) : (
                                    <FollowButton onClick={handleFollow}>
                                        Follow
                                    </FollowButton>
                                )}
                            </ActionButtons>
                        )}
                    </UsernameRow>

                    <StatsRow>
                        <Stat>
                            <StatNumber>{posts.length}</StatNumber> posts
                        </Stat>
                        <Stat>
                            <StatNumber>{user.followers.length}</StatNumber>{" "}
                            followers
                        </Stat>
                        <Stat>
                            <StatNumber>{user.following.length}</StatNumber>{" "}
                            following
                        </Stat>
                    </StatsRow>

                    <BioSection>
                        <FullName>{user.fullName}</FullName>
                        {user.bio && <Bio>{user.bio}</Bio>}
                        {user.website && (
                            <Website
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaLink />{" "}
                                {user.website.replace(/(^\w+:|^)\/\//, "")}
                            </Website>
                        )}
                    </BioSection>
                </ProfileInfo>
            </ProfileHeader>

            {ephemeralStories.length > 0 && (
                <StoriesSection>
                    <StoryCircles stories={ephemeralStories} />
                </StoriesSection>
            )}

            <TabsContainer>
                <Tab
                    active={activeTab === "posts"}
                    onClick={() => setActiveTab("posts")}
                >
                    <FaThLarge /> Posts
                </Tab>
                {isOwnProfile && (
                    <Tab
                        active={activeTab === "saved"}
                        onClick={() => setActiveTab("saved")}
                    >
                        <FaRegBookmark /> Saved
                    </Tab>
                )}
                <Tab
                    active={activeTab === "poetry"}
                    onClick={() => setActiveTab("poetry")}
                >
                    <FaQuoteLeft /> Poetry
                </Tab>
                <Tab
                    active={activeTab === "thoughts"}
                    onClick={() => setActiveTab("thoughts")}
                >
                    <FaRegClock /> Thoughts
                </Tab>
            </TabsContainer>

            <ContentContainer>
                {activeTab === "posts" && (
                    <GridContainer>
                        {posts.length > 0 ? (
                            posts.map((post) => (
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
                            <NoContentMessage>No posts yet</NoContentMessage>
                        )}
                    </GridContainer>
                )}

                {activeTab === "saved" && (
                    <GridContainer>
                        <NoContentMessage>
                            Saved posts feature coming soon
                        </NoContentMessage>
                    </GridContainer>
                )}

                {activeTab === "poetry" && (
                    <GridContainer>
                        {poetryStories.length > 0 ? (
                            poetryStories.map((story) => (
                                <GridItem
                                    key={story._id}
                                    to={`/s/${story._id}`}
                                >
                                    {story.mediaUrl ? (
                                        <GridItemImage
                                            src={story.mediaUrl}
                                            alt="Poetry"
                                        />
                                    ) : (
                                        <TextPreview type="poetry">
                                            {story.content}
                                        </TextPreview>
                                    )}
                                    <GridItemOverlay>
                                        <OverlayStats>
                                            <StatItem>
                                                ♥ {story.likes.length}
                                            </StatItem>
                                            <StatItem>
                                                💬 {story.comments.length}
                                            </StatItem>
                                        </OverlayStats>
                                    </GridItemOverlay>
                                </GridItem>
                            ))
                        ) : (
                            <NoContentMessage>
                                No poetry pieces yet
                            </NoContentMessage>
                        )}
                    </GridContainer>
                )}

                {activeTab === "thoughts" && (
                    <GridContainer>
                        {thoughtStories.length > 0 ? (
                            thoughtStories.map((story) => (
                                <GridItem
                                    key={story._id}
                                    to={`/s/${story._id}`}
                                >
                                    {story.mediaUrl ? (
                                        <GridItemImage
                                            src={story.mediaUrl}
                                            alt="Thought"
                                        />
                                    ) : (
                                        <TextPreview type="thought">
                                            {story.content}
                                        </TextPreview>
                                    )}
                                    <GridItemOverlay>
                                        <OverlayStats>
                                            <StatItem>
                                                ♥ {story.likes.length}
                                            </StatItem>
                                            <StatItem>
                                                💬 {story.comments.length}
                                            </StatItem>
                                        </OverlayStats>
                                    </GridItemOverlay>
                                </GridItem>
                            ))
                        ) : (
                            <NoContentMessage>
                                No thoughts shared yet
                            </NoContentMessage>
                        )}
                    </GridContainer>
                )}
            </ContentContainer>
        </ProfileContainer>
    );
};

// Styled Components
const ProfileContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const ProfileHeader = styled.div`
    display: flex;
    margin-bottom: 44px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const ProfileAvatar = styled.img`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-right: 100px;
    object-fit: cover;

    @media (max-width: 768px) {
        margin-right: 0;
        margin-bottom: 20px;
    }
`;

const ProfileInfo = styled.div`
    flex: 1;
`;

const UsernameRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
    }
`;

const Username = styled.h1`
    font-size: 28px;
    font-weight: 300;
    color: #262626;
    margin-right: 20px;
`;

const ActionButtons = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
        margin-top: 10px;
    }
`;

const EditProfileButton = styled(Link)`
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 5px 9px;
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    margin-right: 10px;

    svg {
        margin-right: 6px;
    }

    &:hover {
        background: #fafafa;
    }
`;

const SettingsButton = styled.button`
    background: transparent;
    border: none;
    color: #262626;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;

    &:hover {
        opacity: 0.7;
    }
`;

const FollowButton = styled.button`
    background: #0095f6;
    border: none;
    border-radius: 4px;
    padding: 5px 24px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;

    &:hover {
        background: #0086e0;
    }
`;

const UnfollowButton = styled.button`
    background: transparent;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 5px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    cursor: pointer;

    &:hover {
        background: #fafafa;
    }
`;

const StatsRow = styled.div`
    display: flex;
    margin-bottom: 20px;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const Stat = styled.div`
    margin-right: 40px;
    font-size: 16px;

    @media (max-width: 640px) {
        margin-right: 20px;
        font-size: 14px;
    }
`;

const StatNumber = styled.span`
    font-weight: 600;
`;

const BioSection = styled.div``;

const FullName = styled.h2`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
`;

const Bio = styled.p`
    margin-bottom: 5px;
    white-space: pre-wrap;
`;

const Website = styled.a`
    color: #00376b;
    font-weight: 600;
    text-decoration: none;
    display: flex;
    align-items: center;

    svg {
        margin-right: 6px;
        font-size: 12px;
    }

    &:hover {
        text-decoration: underline;
    }
`;

const StoriesSection = styled.div`
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    margin-bottom: 44px;
    padding: 16px 0;
    overflow: hidden;
`;

const TabsContainer = styled.div`
    display: flex;
    border-top: 1px solid #dbdbdb;
    margin-bottom: 20px;
`;

const Tab = styled.button`
    flex: 1;
    background: transparent;
    border: none;
    padding: 16px 0;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => (props.active ? "#262626" : "#8e8e8e")};
    text-transform: uppercase;
    letter-spacing: 1px;
    border-top: 1px solid
        ${(props) => (props.active ? "#262626" : "transparent")};
    margin-top: -1px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        margin-right: 6px;
    }

    &:hover {
        color: #262626;
    }
`;

const ContentContainer = styled.div``;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 28px;

    @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 4px;
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

const TextPreview = styled.div`
    width: 100%;
    height: 100%;
    padding: 16px;
    background: ${(props) =>
        props.type === "poetry"
            ? "linear-gradient(135deg, #4158D0, #C850C0)"
            : "linear-gradient(135deg, #0F2027, #203A43, #2C5364)"};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 14px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
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

const NoContentMessage = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 0;
    color: #8e8e8e;
    font-size: 16px;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
`;

const ErrorText = styled.h2`
    font-size: 24px;
    color: #262626;
    margin-bottom: 20px;
`;

const BackButton = styled(Link)`
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;

    &:hover {
        background: #0086e0;
    }
`;

export default Profile;
