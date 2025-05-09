// src/components/post/PostCard.js
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import CommentList from "./CommentList";

const PostCard = ({ post, onLike, onUnlike, onCommentSubmit, isLiked }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState(isLiked); // Local state for immediate UI updates
    const commentInputRef = useRef(null);

    // Update local state when prop changes
    React.useEffect(() => {
        setLocalIsLiked(isLiked);
    }, [isLiked]);

    const handleLikeToggle = () => {
        // Update UI immediately for better user experience
        setLocalIsLiked(!localIsLiked);

        if (localIsLiked) {
            onUnlike(post._id);
        } else {
            onLike(post._id);
        }
    };

    const handleCommentFocus = () => {
        commentInputRef.current.focus();
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            console.log(`Submitting comment to post ${post._id}: ${comment}`);

            await onCommentSubmit(post._id, comment);

            // Clear the comment input and show comments after successful submission
            setComment("");
            setShowComments(true);
        } catch (error) {
            console.error("Error submitting comment:", error);
            // Error handling is done in the parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        try {
            return formatDistanceToNow(new Date(timestamp), {
                addSuffix: true,
            });
        } catch (error) {
            console.error("Invalid date format:", timestamp);
            return "recently";
        }
    };

    // Handle cases where post properties might be undefined
    const postUser = post.user || {};
    const postComments = Array.isArray(post.comments) ? post.comments : [];
    const postHashtags = Array.isArray(post.hashtags) ? post.hashtags : [];

    // Get likes count safely
    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;

    return (
        <PostCardContainer>
            <PostHeader>
                <UserInfo>
                    <UserAvatar
                        src={postUser.profilePicture || "/default-avatar.png"}
                        alt={postUser.username}
                    />
                    <Username to={`/${postUser.username}`}>
                        {postUser.username}
                    </Username>
                    {post.location && <Location>{post.location}</Location>}
                </UserInfo>
                <MenuButton onClick={() => setShowMenu(!showMenu)}>
                    <FaEllipsisH />
                </MenuButton>
                {showMenu && (
                    <MenuDropdown>
                        <MenuItem>Report</MenuItem>
                        {postUser._id === user?._id && (
                            <MenuItem>Delete</MenuItem>
                        )}
                    </MenuDropdown>
                )}
            </PostHeader>

            <PostMedia>
                {post.mediaType === "image" ? (
                    <PostImage src={post.mediaUrl} alt="Post" />
                ) : (
                    <PostVideo src={post.mediaUrl} controls />
                )}
            </PostMedia>

            <PostActions>
                <ActionButtons>
                    <ActionButton onClick={handleLikeToggle}>
                        {localIsLiked ? (
                            <FaHeart color="#ed4956" />
                        ) : (
                            <FaRegHeart />
                        )}
                    </ActionButton>
                    <ActionButton onClick={handleCommentFocus}>
                        <FaRegComment />
                    </ActionButton>
                </ActionButtons>

                <LikesCount>
                    {likesCount === 0
                        ? "Be the first to like this"
                        : likesCount === 1
                        ? "1 like"
                        : `${likesCount} likes`}
                </LikesCount>
            </PostActions>

            <PostCaption>
                <Username to={`/${postUser.username}`}>
                    {postUser.username}
                </Username>
                <Caption>{post.caption}</Caption>
            </PostCaption>

            {postHashtags.length > 0 && (
                <Hashtags>
                    {postHashtags.map((tag, index) => (
                        <Hashtag
                            key={index}
                            to={`/hashtag/${tag.replace("#", "")}`}
                        >
                            {tag}
                        </Hashtag>
                    ))}
                </Hashtags>
            )}

            {postComments.length > 0 && (
                <ViewCommentsButton
                    onClick={() => setShowComments(!showComments)}
                >
                    {showComments
                        ? "Hide comments"
                        : `View all ${postComments.length} comments`}
                </ViewCommentsButton>
            )}

            {showComments && <CommentList comments={postComments} />}

            <PostTimestamp>
                {post.createdAt && formatTimestamp(post.createdAt)}
            </PostTimestamp>

            <CommentForm onSubmit={handleCommentSubmit}>
                <CommentInput
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                />
                <PostButton
                    type="submit"
                    disabled={!comment.trim() || isSubmitting}
                >
                    {isSubmitting ? "Posting..." : "Post"}
                </PostButton>
            </CommentForm>
        </PostCardContainer>
    );
};

// Styled Components
const PostCardContainer = styled.div`
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
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
    width: 32px;
    height: 32px;
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

const Location = styled.span`
    font-size: 12px;
    color: #8e8e8e;
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

const PostMedia = styled.div`
    width: 100%;
    background: #efefef;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const PostImage = styled.img`
    width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const PostVideo = styled.video`
    width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const PostActions = styled.div`
    padding: 8px 16px;
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

const LikesCount = styled.div`
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
`;

const PostCaption = styled.div`
    padding: 0 16px;
    margin-bottom: 8px;
    display: flex;
    font-size: 14px;
`;

const Caption = styled.span`
    margin-left: 5px;
    word-wrap: break-word;
    white-space: pre-wrap;
`;

const Hashtags = styled.div`
    padding: 0 16px;
    margin-bottom: 8px;
    display: flex;
    flex-wrap: wrap;
`;

const Hashtag = styled(Link)`
    color: #00376b;
    text-decoration: none;
    margin-right: 5px;
    font-size: 14px;

    &:hover {
        text-decoration: underline;
    }
`;

const ViewCommentsButton = styled.button`
    background: transparent;
    border: none;
    padding: 0 16px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #8e8e8e;
    cursor: pointer;
    text-align: left;

    &:hover {
        text-decoration: underline;
    }
`;

const PostTimestamp = styled.div`
    padding: 0 16px;
    margin-bottom: 12px;
    font-size: 10px;
    color: #8e8e8e;
    text-transform: uppercase;
`;

const CommentForm = styled.form`
    display: flex;
    align-items: center;
    padding: 16px;
    border-top: 1px solid #efefef;
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

export default PostCard;
