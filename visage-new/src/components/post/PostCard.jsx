// src/components/post/PostCard.js
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaRegHeart, FaRegComment, FaEllipsisH } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import CommentList from "./CommentList";

const PostCard = ({ post, onLike, onUnlike, onCommentSubmit }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const commentInputRef = useRef(null);

    // Safety check - if post is undefined or null, don't render anything
    if (!post) {
        console.error("PostCard received undefined or null post");
        return null;
    }

    // Ensure all post properties exist with defaults to prevent errors
    const {
        _id = "",
        user: postUser = { profilePicture: "", username: "" },
        caption = "",
        mediaUrl = "",
        mediaType = "image",
        location = "",
        createdAt = new Date(),
        likes = [],
        comments = [],
        hashtags = [],
    } = post;

    // Add defensive check for post.likes to ensure it exists and is an array
    const isLiked =
        Array.isArray(likes) && user ? likes.includes(user._id) : false;

    const handleLikeToggle = () => {
        if (!post || !user) return;

        if (isLiked) {
            onUnlike(_id);
        } else {
            onLike(_id);
        }
    };

    const handleCommentFocus = () => {
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim() || !user) return;

        try {
            await onCommentSubmit(_id, comment);
            setComment("");
            setShowComments(true);
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    return (
        <PostCardContainer>
            <PostHeader>
                <UserInfo>
                    <UserAvatar
                        src={postUser.profilePicture}
                        alt={postUser.username}
                    />
                    <div>
                        <Username to={`/${postUser.username}`}>
                            {postUser.username}
                        </Username>
                        {location && <Location>{location}</Location>}
                    </div>
                </UserInfo>
                <MenuButton onClick={() => setShowMenu(!showMenu)}>
                    <FaEllipsisH />
                </MenuButton>
                {showMenu && (
                    <MenuDropdown>
                        <MenuItem>Report</MenuItem>
                        {user && postUser._id === user._id && (
                            <MenuItem>Delete</MenuItem>
                        )}
                        <MenuItem onClick={() => setShowMenu(false)}>
                            Cancel
                        </MenuItem>
                    </MenuDropdown>
                )}
            </PostHeader>

            <PostMedia>
                {mediaType === "image" ? (
                    <PostImage
                        src={mediaUrl}
                        alt="Post"
                        onError={(e) => {
                            console.error("Image failed to load:", mediaUrl);
                            e.target.src =
                                "https://via.placeholder.com/600x400?text=Image+Not+Found";
                        }}
                    />
                ) : (
                    <PostVideo
                        src={mediaUrl}
                        controls
                        onError={(e) => {
                            console.error("Video failed to load:", mediaUrl);
                            e.target.parentNode.innerHTML =
                                '<div style="display:flex;align-items:center;justify-content:center;height:400px;background:#f5f5f5;color:#888;">Video Not Available</div>';
                        }}
                    />
                )}
            </PostMedia>

            <PostActions>
                <ActionButtons>
                    <ActionButton onClick={handleLikeToggle}>
                        {isLiked ? <FaHeart color="#ed4956" /> : <FaRegHeart />}
                    </ActionButton>
                    <ActionButton onClick={handleCommentFocus}>
                        <FaRegComment />
                    </ActionButton>
                </ActionButtons>

                <LikesCount>
                    {!Array.isArray(likes) || likes.length === 0
                        ? "Be the first to like this"
                        : likes.length === 1
                        ? "1 like"
                        : `${likes.length} likes`}
                </LikesCount>
            </PostActions>

            {caption && (
                <PostCaption>
                    <Username to={`/${postUser.username}`}>
                        {postUser.username}
                    </Username>
                    <Caption>{caption}</Caption>
                </PostCaption>
            )}

            {Array.isArray(hashtags) && hashtags.length > 0 && (
                <Hashtags>
                    {hashtags.map((tag, index) => (
                        <Hashtag
                            key={index}
                            to={`/hashtag/${tag.replace("#", "")}`}
                        >
                            {tag}
                        </Hashtag>
                    ))}
                </Hashtags>
            )}

            {Array.isArray(comments) && comments.length > 0 && (
                <ViewCommentsButton
                    onClick={() => setShowComments(!showComments)}
                >
                    {showComments
                        ? "Hide comments"
                        : `View all ${comments.length} comments`}
                </ViewCommentsButton>
            )}

            {showComments && <CommentList comments={comments} />}

            <PostTimestamp>{formatTimestamp(createdAt)}</PostTimestamp>

            <CommentForm onSubmit={handleCommentSubmit}>
                <CommentInput
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <PostButton type="submit" disabled={!comment.trim()}>
                    Post
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
    display: block;
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
    max-height: 600px;
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
