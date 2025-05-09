// src/pages/Feed.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { postService, storyService } from "../services/api";
import PostCard from "../components/post/PostCard";
import StoryCircles from "../components/story/StoryCircles";
import SuggestedUsers from "../components/profile/SuggestedUsers";
import Loader from "../components/common/Loader";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedData = async () => {
            try {
                setLoading(true);

                // Fetch feed posts
                const postsResponse = await postService.getFeedPosts();
                setPosts(postsResponse.data);

                // Fetch stories
                const storiesResponse = await storyService.getFeedStories();
                setStories(storiesResponse.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load feed");
                toast.error("Failed to load feed");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedData();
    }, []);

    const handleLikePost = async (postId) => {
        try {
            await postService.likePost(postId);
            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              likes: [...post.likes, { _id: "temp-id" }],
                          }
                        : post
                )
            );
        } catch (err) {
            toast.error("Failed to like post");
        }
    };

    const handleUnlikePost = async (postId) => {
        try {
            await postService.unlikePost(postId);
            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              likes: post.likes.filter(
                                  (like) => like._id !== "temp-id"
                              ),
                          }
                        : post
                )
            );
        } catch (err) {
            toast.error("Failed to unlike post");
        }
    };

    const handleCommentSubmit = async (postId, commentText) => {
        try {
            const response = await postService.createPostComment(postId, {
                text: commentText,
            });
            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [...post.comments, response.data],
                          }
                        : post
                )
            );
            return response.data;
        } catch (err) {
            toast.error("Failed to add comment");
            throw err;
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
        <FeedContainer>
            <MainFeed>
                {stories.length > 0 && (
                    <StoriesSection>
                        <StoryCircles stories={stories} />
                    </StoriesSection>
                )}

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onLike={handleLikePost}
                            onUnlike={handleUnlikePost}
                            onCommentSubmit={handleCommentSubmit}
                        />
                    ))
                ) : (
                    <NoPostsMessage>
                        No posts in your feed yet. Start following users to see
                        their posts!
                    </NoPostsMessage>
                )}
            </MainFeed>

            <Sidebar>
                <SuggestedUsers />
            </Sidebar>
        </FeedContainer>
    );
};

// Styled Components
const FeedContainer = styled.div`
    display: flex;
    max-width: 935px;
    margin: 0 auto;
    padding-top: 30px;

    @media (max-width: 935px) {
        flex-direction: column;
    }
`;

const MainFeed = styled.div`
    flex: 2;
    max-width: 614px;

    @media (max-width: 935px) {
        max-width: 100%;
        margin-bottom: 30px;
    }
`;

const StoriesSection = styled.div`
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 24px;
    padding: 16px 0;
    overflow: hidden;
    position: relative;
`;

const Sidebar = styled.div`
    flex: 1;
    margin-left: 28px;
    position: sticky;
    top: 88px;
    height: fit-content;

    @media (max-width: 935px) {
        margin-left: 0;
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

const ErrorMessage = styled.div`
    text-align: center;
    padding: 20px;
    color: #ed4956;
    background: #fff;
    border-radius: 4px;
    margin-bottom: 20px;
`;

const NoPostsMessage = styled.div`
    text-align: center;
    padding: 40px 20px;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    color: #8e8e8e;
    font-size: 16px;
`;

export default Feed;
