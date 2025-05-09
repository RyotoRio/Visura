// src/pages/Feed.js
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
// Import the services correctly
import { postService, storyService, commentService } from "../services/api";
import PostCard from "../components/post/PostCard";
import StoryCircles from "../components/story/StoryCircles";
import SuggestedUsers from "../components/profile/SuggestedUsers";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";

const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedData = async () => {
            try {
                setLoading(true);

                // Fetch feed posts
                console.log("Fetching posts...");
                const postsResponse = await postService.getFeedPosts();
                console.log("Posts response:", postsResponse);

                // Set posts, ensuring it's always an array
                const postsData = Array.isArray(postsResponse.data)
                    ? postsResponse.data
                    : [];
                console.log(`Loaded ${postsData.length} posts`);
                setPosts(postsData);

                // Fetch stories
                console.log("Fetching stories...");
                const storiesResponse = await storyService.getFeedStories();
                console.log("Stories response:", storiesResponse);

                // Set stories, ensuring it's always an array
                const storiesData = Array.isArray(storiesResponse.data)
                    ? storiesResponse.data
                    : [];
                console.log(`Loaded ${storiesData.length} stories`);
                setStories(storiesData);
            } catch (err) {
                console.error("Error fetching feed:", err);
                setError(err.response?.data?.message || "Failed to load feed");
                toast.error("Failed to load feed");
                // Initialize with empty arrays on error
                setPosts([]);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedData();
    }, []);

    // Check if a post is liked by the current user
    const isPostLikedByUser = (post) => {
        // Make sure we have a user and the post has likes
        if (!user || !post.likes) return false;

        // Handle different possible data structures for likes
        // Case 1: likes is an array of user IDs
        if (typeof post.likes[0] === "string") {
            return post.likes.includes(user._id);
        }

        // Case 2: likes is an array of user objects with _id property
        if (post.likes[0] && post.likes[0]._id) {
            return post.likes.some((like) => like._id === user._id);
        }

        // Case 3: likes might be an array of objects with user property
        if (post.likes[0] && post.likes[0].user) {
            return post.likes.some(
                (like) =>
                    (typeof like.user === "string" && like.user === user._id) ||
                    like.user._id === user._id
            );
        }

        return false;
    };

    const handleLikePost = async (postId) => {
        if (!user) return;

        // Find the post
        const post = posts.find((p) => p._id === postId);

        // If post is already liked, don't proceed
        if (post && isPostLikedByUser(post)) {
            console.log("Post already liked, skipping like action");
            return;
        }

        try {
            console.log(`Liking post ${postId}`);
            await postService.likePost(postId);

            // Update posts state based on backend response structure
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        // Create a new likes array with the updated like
                        // Check if likes is an array of IDs or objects
                        let updatedLikes;

                        if (!post.likes || post.likes.length === 0) {
                            // If likes is empty, start a new array
                            updatedLikes = [{ _id: user._id }];
                        } else if (typeof post.likes[0] === "string") {
                            // If likes is an array of IDs
                            updatedLikes = [...post.likes, user._id];
                        } else if (post.likes[0] && post.likes[0]._id) {
                            // If likes is an array of user objects with _id
                            updatedLikes = [...post.likes, { _id: user._id }];
                        } else if (post.likes[0] && post.likes[0].user) {
                            // If likes is an array of objects with user property
                            updatedLikes = [...post.likes, { user: user._id }];
                        } else {
                            // Default case, assume object with _id
                            updatedLikes = [...post.likes, { _id: user._id }];
                        }

                        return {
                            ...post,
                            likes: updatedLikes,
                        };
                    }
                    return post;
                })
            );
        } catch (err) {
            console.error("Error liking post:", err);
            toast.error("Failed to like post");
        }
    };

    const handleUnlikePost = async (postId) => {
        if (!user) return;

        // Find the post
        const post = posts.find((p) => p._id === postId);

        // If post is not liked, don't proceed
        if (post && !isPostLikedByUser(post)) {
            console.log("Post not liked, skipping unlike action");
            return;
        }

        try {
            console.log(`Unliking post ${postId}`);
            await postService.unlikePost(postId);

            // Update posts state based on backend response structure
            setPosts(
                posts.map((post) => {
                    if (post._id === postId) {
                        let updatedLikes;

                        if (!post.likes || post.likes.length === 0) {
                            // If likes is empty, return empty array
                            updatedLikes = [];
                        } else if (typeof post.likes[0] === "string") {
                            // If likes is an array of IDs
                            updatedLikes = post.likes.filter(
                                (id) => id !== user._id
                            );
                        } else if (post.likes[0] && post.likes[0]._id) {
                            // If likes is an array of user objects with _id
                            updatedLikes = post.likes.filter(
                                (like) => like._id !== user._id
                            );
                        } else if (post.likes[0] && post.likes[0].user) {
                            // If likes is an array of objects with user property
                            updatedLikes = post.likes.filter(
                                (like) =>
                                    (typeof like.user === "string" &&
                                        like.user !== user._id) ||
                                    like.user._id !== user._id
                            );
                        } else {
                            // Default case
                            updatedLikes = post.likes;
                        }

                        return {
                            ...post,
                            likes: updatedLikes,
                        };
                    }
                    return post;
                })
            );
        } catch (err) {
            console.error("Error unliking post:", err);
            toast.error("Failed to unlike post");
        }
    };

    const handleCommentSubmit = async (postId, commentText) => {
        if (!user) return null;

        try {
            console.log(`Adding comment to post ${postId}: ${commentText}`);

            // Use commentService instead of postService
            const response = await commentService.createPostComment(postId, {
                text: commentText,
            });

            console.log("Comment response:", response);

            // Update posts state with the new comment
            setPosts(
                posts.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: [
                                  ...(Array.isArray(post.comments)
                                      ? post.comments
                                      : []),
                                  response.data,
                              ],
                          }
                        : post
                )
            );

            return response.data;
        } catch (err) {
            console.error("Error adding comment:", err);
            console.error("Error response:", err.response?.data);
            toast.error(err.response?.data?.message || "Failed to add comment");
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
                {Array.isArray(stories) && stories.length > 0 && (
                    <StoriesSection>
                        <StoryCircles stories={stories} />
                    </StoriesSection>
                )}

                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onLike={handleLikePost}
                            onUnlike={handleUnlikePost}
                            onCommentSubmit={handleCommentSubmit}
                            currentUser={user}
                            isLiked={isPostLikedByUser(post)} // Pass the liked status
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
