// src/pages/Hashtag.js
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaHashtag, FaThLarge } from "react-icons/fa";
import { postService } from "../services/api";
import Loader from "../components/common/Loader";

const Hashtag = () => {
    const { tag } = useParams();

    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts"); // 'posts' or 'stories'

    useEffect(() => {
        const fetchHashtagData = async () => {
            try {
                setLoading(true);

                // Fetch posts with this hashtag
                const postsResponse = await postService.getPostsByHashtag(tag);
                setPosts(postsResponse.data);

                // For stories, we would ideally have an API endpoint for getting stories by hashtag
                // For now, we'll just simulate this with an empty array
                setStories([]);
            } catch (err) {
                toast.error("Failed to load hashtag content");
            } finally {
                setLoading(false);
            }
        };

        fetchHashtagData();
    }, [tag]);

    const totalPosts = posts.length;
    const totalStories = stories.length;

    if (loading) {
        return <Loader />;
    }

    return (
        <HashtagPageContainer>
            <HashtagHeader>
                <HashtagIcon>
                    <FaHashtag />
                </HashtagIcon>
                <HashtagInfo>
                    <HashtagName>#{tag}</HashtagName>
                    <PostCount>
                        <strong>{totalPosts}</strong>{" "}
                        {totalPosts === 1 ? "post" : "posts"}
                        {" • "}
                        <strong>{totalStories}</strong>{" "}
                        {totalStories === 1 ? "story" : "stories"}
                    </PostCount>
                </HashtagInfo>
            </HashtagHeader>

            <TabsContainer>
                <Tab
                    active={activeTab === "posts"}
                    onClick={() => setActiveTab("posts")}
                >
                    <FaThLarge /> Posts
                </Tab>
                <Tab
                    active={activeTab === "stories"}
                    onClick={() => setActiveTab("stories")}
                >
                    <FaHashtag /> Stories
                </Tab>
            </TabsContainer>

            {activeTab === "posts" ? (
                posts.length > 0 ? (
                    <PostsGrid>
                        {posts.map((post) => (
                            <GridItem key={post._id} to={`/p/${post._id}`}>
                                <GridItemImage src={post.mediaUrl} alt="Post" />
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
                        ))}
                    </PostsGrid>
                ) : (
                    <NoContentMessage>
                        No posts found with #{tag}
                    </NoContentMessage>
                )
            ) : stories.length > 0 ? (
                <StoriesGrid>
                    {stories.map((story) => (
                        <GridItem key={story._id} to={`/s/${story._id}`}>
                            {story.mediaUrl ? (
                                <GridItemImage
                                    src={story.mediaUrl}
                                    alt="Story"
                                />
                            ) : (
                                <TextPreview type={story.storyType}>
                                    {story.content}
                                </TextPreview>
                            )}
                            <GridItemOverlay>
                                <OverlayStats>
                                    <StatItem>♥ {story.likes.length}</StatItem>
                                    <StatItem>
                                        💬 {story.comments.length}
                                    </StatItem>
                                </OverlayStats>
                            </GridItemOverlay>
                        </GridItem>
                    ))}
                </StoriesGrid>
            ) : (
                <NoContentMessage>
                    No stories found with #{tag}
                </NoContentMessage>
            )}
        </HashtagPageContainer>
    );
};

// Styled Components
const HashtagPageContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const HashtagHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 44px;
`;

const HashtagIcon = styled.div`
    width: 150px;
    height: 150px;
    background: #fafafa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60px;
    color: #8e8e8e;
    margin-right: 100px;

    @media (max-width: 768px) {
        width: 100px;
        height: 100px;
        font-size: 40px;
        margin-right: 30px;
    }
`;

const HashtagInfo = styled.div`
    flex: 1;
`;

const HashtagName = styled.h1`
    font-size: 28px;
    font-weight: 300;
    margin-bottom: 12px;

    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

const PostCount = styled.div`
    font-size: 16px;
    color: #262626;
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

const PostsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 28px;

    @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 4px;
    }
`;

const StoriesGrid = styled.div`
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
    text-align: center;
    padding: 40px 0;
    color: #8e8e8e;
    font-size: 16px;
`;

export default Hashtag;
