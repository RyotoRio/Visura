// src/pages/PostDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import {
    FaHeart,
    FaRegHeart,
    FaRegComment,
    FaEllipsisH,
    FaShareAlt,
    FaBookmark,
    FaRegBookmark,
    FaArrowLeft,
} from "react-icons/fa";
import { postService, commentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CommentList from "../components/post/CommentList";
import Loader from "../components/common/Loader";

const PostDetail = () => {
    const { postId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true);

                // Fetch post details
                const response = await postService.getPostById(postId);
                setPost(response.data);

                // Check if post is liked by current user
                setIsLiked(
                    response.data.likes.some((like) => like === user?._id)
                );

                // Fetch comments
                const commentsResponse = await commentService.getPostComments(
                    postId
                );
                setComments(commentsResponse.data);
            } catch (err) {
                toast.error("Failed to load post");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [postId, user, navigate]);

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await postService.unlikePost(postId);
                setPost({
                    ...post,
                    likes: post.likes.filter((id) => id !== user._id),
                });
            } else {
                await postService.likePost(postId);
                setPost({
                    ...post,
                    likes: [...post.likes, user._id],
                });
            }
            setIsLiked(!isLiked);
        } catch (error) {
            toast.error("Failed to like/unlike post");
        }
    };

    const handleSaveToggle = () => {
        // In a real app, this would save to a user's bookmarks
        setIsSaved(!isSaved);
        toast.info(
            isSaved
                ? "Post removed from saved items"
                : "Post saved successfully"
        );
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        try {
            const response = await commentService.createPostComment(postId, {
                text: commentText,
            });
            setComments([...comments, response.data]);
            setCommentText("");
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await postService.deletePost(postId);
                toast.success("Post deleted successfully");
                navigate("/");
            } catch (error) {
                toast.error("Failed to delete post");
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (loading) {
        return <Loader />;
    }

    if (!post) {
        return (
            <ErrorContainer>
                <ErrorText>Post not found</ErrorText>
                <BackButton to="/">Back to Home</BackButton>
            </ErrorContainer>
        );
    }

    return (
        <PostDetailContainer>
            <BackButtonContainer onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </BackButtonContainer>

            <PostContentContainer>
                <PostMediaContainer>
                    {post.mediaType === "image" ? (
                        <PostImage src={post.mediaUrl} alt="Post" />
                    ) : (
                        <PostVideo src={post.mediaUrl} controls />
                    )}
                </PostMediaContainer>

                <PostInfoContainer>
                    <PostHeader>
                        <UserInfo>
                            <UserAvatar
                                src={post.user.profilePicture}
                                alt={post.user.username}
                            />
                            <div>
                                <Username to={`/${post.user.username}`}>
                                    {post.user.username}
                                </Username>
                                {post.location && (
                                    <Location>{post.location}</Location>
                                )}
                            </div>
                        </UserInfo>

                        <MenuButton onClick={() => setShowMenu(!showMenu)}>
                            <FaEllipsisH />
                        </MenuButton>

                        {showMenu && (
                            <MenuDropdown>
                                {user && post.user._id === user._id && (
                                    <MenuItem onClick={handleDeletePost}>
                                        Delete Post
                                    </MenuItem>
                                )}
                                <MenuItem>Report</MenuItem>
                                <MenuItem onClick={() => setShowMenu(false)}>
                                    Cancel
                                </MenuItem>
                            </MenuDropdown>
                        )}
                    </PostHeader>

                    <CommentsContainer>
                        {post.caption && (
                            <CaptionContainer>
                                <UserAvatar
                                    small
                                    src={post.user.profilePicture}
                                    alt={post.user.username}
                                />
                                <CaptionContent>
                                    <Username to={`/${post.user.username}`}>
                                        {post.user.username}
                                    </Username>
                                    <Caption>{post.caption}</Caption>

                                    <Timestamp>
                                        {formatTimestamp(post.createdAt)}
                                    </Timestamp>
                                </CaptionContent>
                            </CaptionContainer>
                        )}

                        {post.hashtags.length > 0 && (
                            <HashtagsContainer>
                                {post.hashtags.map((tag, index) => (
                                    <Hashtag
                                        key={index}
                                        to={`/hashtag/${tag.replace("#", "")}`}
                                    >
                                        {tag}
                                    </Hashtag>
                                ))}
                            </HashtagsContainer>
                        )}

                        {comments.length > 0 ? (
                            <CommentList comments={comments} />
                        ) : (
                            <NoCommentsMessage>
                                No comments yet. Be the first to comment!
                            </NoCommentsMessage>
                        )}
                    </CommentsContainer>

                    <PostActionsContainer>
                        <ActionButtons>
                            <ActionButton onClick={handleLikeToggle}>
                                {isLiked ? (
                                    <FaHeart color="#ed4956" />
                                ) : (
                                    <FaRegHeart />
                                )}
                            </ActionButton>
                            <ActionButton>
                                <FaRegComment />
                            </ActionButton>
                            <ActionButton>
                                <FaShareAlt />
                            </ActionButton>
                            <SaveButton onClick={handleSaveToggle}>
                                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                            </SaveButton>
                        </ActionButtons>

                        <LikesCount>
                            {post.likes.length === 0
                                ? "Be the first to like this"
                                : post.likes.length === 1
                                ? "1 like"
                                : `${post.likes.length} likes`}
                        </LikesCount>

                        <PostDate>
                            {new Date(post.createdAt).toLocaleDateString()}
                        </PostDate>

                        <CommentForm onSubmit={handleCommentSubmit}>
                            <CommentInput
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <PostButton
                                type="submit"
                                disabled={!commentText.trim()}
                            >
                                Post
                            </PostButton>
                        </CommentForm>
                    </PostActionsContainer>
                </PostInfoContainer>
            </PostContentContainer>
        </PostDetailContainer>
    );
};

// Styled Components
const PostDetailContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 20px 0;
`;

const BackButtonContainer = styled.button`
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #262626;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 20px;
    cursor: pointer;

    &:hover {
        color: #8e8e8e;
    }
`;

const PostContentContainer = styled.div`
    display: flex;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    overflow: hidden;

    @media (max-width: 935px) {
        flex-direction: column;
    }
`;

const PostMediaContainer = styled.div`
    flex: 1.5;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 450px;
    max-height: 600px;

    @media (max-width: 935px) {
        min-height: 350px;
    }
`;

const PostImage = styled.img`
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const PostVideo = styled.video`
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const PostInfoContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #dbdbdb;

    @media (max-width: 935px) {
        border-left: none;
        border-top: 1px solid #dbdbdb;
    }
`;

const PostHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #efefef;
    position: relative;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
`;

const UserAvatar = styled.img`
    width: ${(props) => (props.small ? "32px" : "42px")};
    height: ${(props) => (props.small ? "32px" : "42px")};
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
`;

const Username = styled(Link)`
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    margin-right: 5px;

    &:hover {
        text-decoration: underline;
    }
`;

const Location = styled.div`
    font-size: 12px;
    color: #8e8e8e;
    margin-top: 2px;
`;

const MenuButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    color: #262626;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
`;

const MenuDropdown = styled.div`
    position: absolute;
    top: 40px;
    right: 10px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    z-index: 10;
    overflow: hidden;
`;

const MenuItem = styled.button`
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #fafafa;
    }

    &:not(:last-child) {
        border-bottom: 1px solid #efefef;
    }
`;

const CommentsContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    @media (max-width: 935px) {
        max-height: 300px;
    }
`;

const CaptionContainer = styled.div`
    display: flex;
    margin-bottom: 16px;
`;

const CaptionContent = styled.div`
    flex: 1;
`;

const Caption = styled.div`
    margin-bottom: 8px;
    white-space: pre-wrap;
`;

const Timestamp = styled.div`
    font-size: 12px;
    color: #8e8e8e;
    margin-top: 4px;
`;

const HashtagsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16px;
`;

const Hashtag = styled(Link)`
    color: #00376b;
    text-decoration: none;
    margin-right: 8px;
    margin-bottom: 4px;

    &:hover {
        text-decoration: underline;
    }
`;

const NoCommentsMessage = styled.div`
    color: #8e8e8e;
    text-align: center;
    padding: 24px 0;
`;

const PostActionsContainer = styled.div`
    padding: 16px;
    border-top: 1px solid #efefef;
`;

const ActionButtons = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`;

const ActionButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 24px;
    padding: 8px;
    margin-right: 16px;
    display: flex;
    align-items: center;
    color: #262626;

    &:hover {
        opacity: 0.7;
    }
`;

const SaveButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 24px;
    padding: 8px;
    display: flex;
    align-items: center;
    color: #262626;
    margin-left: auto;

    &:hover {
        opacity: 0.7;
    }
`;

const LikesCount = styled.div`
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
`;

const PostDate = styled.div`
    font-size: 10px;
    color: #8e8e8e;
    text-transform: uppercase;
    margin-bottom: 16px;
`;

const CommentForm = styled.form`
    display: flex;
    align-items: center;
    border-top: 1px solid #efefef;
    padding-top: 16px;
`;

const CommentInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    padding: 8px 0;
`;

const PostButton = styled.button`
    background: transparent;
    border: none;
    color: #0095f6;
    font-weight: 600;
    cursor: pointer;
    padding: 0 8px;

    &:disabled {
        opacity: 0.3;
        cursor: default;
    }
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

export default PostDetail;
