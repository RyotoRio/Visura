// src/components/post/CommentList.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { commentService } from "../../services/api";

const CommentList = ({ comments }) => {
    const { user } = useAuth();

    if (!comments || comments.length === 0) {
        return null;
    }

    return (
        <CommentListContainer>
            {comments.map((comment) => (
                <CommentItem
                    key={comment._id}
                    comment={comment}
                    currentUser={user}
                />
            ))}
        </CommentListContainer>
    );
};

const CommentItem = ({ comment, currentUser }) => {
    const [liked, setLiked] = useState(
        comment.likes?.includes(currentUser?._id)
    );
    const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    const handleLikeToggle = async () => {
        try {
            if (liked) {
                await commentService.unlikeComment(comment._id);
                setLikesCount(likesCount - 1);
            } else {
                await commentService.likeComment(comment._id);
                setLikesCount(likesCount + 1);
            }
            setLiked(!liked);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!replyText.trim()) return;

        try {
            await commentService.createReply(comment._id, { text: replyText });
            setReplyText("");
            setIsReplying(false);
            // We would ideally refresh the comment data here
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    return (
        <CommentContainer>
            <CommentContent>
                <Avatar
                    src={comment.user.profilePicture}
                    alt={comment.user.username}
                />

                <CommentDetails>
                    <CommentText>
                        <Username to={`/${comment.user.username}`}>
                            {comment.user.username}
                        </Username>
                        {comment.text}
                    </CommentText>

                    <CommentActions>
                        <CommentTime>
                            {formatTimestamp(comment.createdAt)}
                        </CommentTime>
                        {likesCount > 0 && (
                            <LikesCount>{likesCount} likes</LikesCount>
                        )}
                        <ReplyButton onClick={() => setIsReplying(!isReplying)}>
                            Reply
                        </ReplyButton>
                    </CommentActions>

                    {comment.replies && comment.replies.length > 0 && (
                        <ViewRepliesButton
                            onClick={() => setShowReplies(!showReplies)}
                        >
                            {showReplies
                                ? "Hide replies"
                                : `View ${comment.replies.length} replies`}
                        </ViewRepliesButton>
                    )}

                    {isReplying && (
                        <ReplyForm onSubmit={handleReplySubmit}>
                            <ReplyInput
                                type="text"
                                placeholder={`Reply to ${comment.user.username}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                            />
                            <PostButton
                                type="submit"
                                disabled={!replyText.trim()}
                            >
                                Post
                            </PostButton>
                        </ReplyForm>
                    )}

                    {showReplies && comment.replies && (
                        <RepliesList>
                            {comment.replies.map((reply, index) => (
                                <ReplyItem key={index}>
                                    <Avatar
                                        src={reply.user.profilePicture}
                                        alt={reply.user.username}
                                        small
                                    />
                                    <ReplyContent>
                                        <CommentText>
                                            <Username
                                                to={`/${reply.user.username}`}
                                            >
                                                {reply.user.username}
                                            </Username>
                                            {reply.text}
                                        </CommentText>
                                        <CommentTime>
                                            {formatTimestamp(reply.createdAt)}
                                        </CommentTime>
                                    </ReplyContent>
                                </ReplyItem>
                            ))}
                        </RepliesList>
                    )}
                </CommentDetails>
            </CommentContent>

            <LikeButton onClick={handleLikeToggle}>
                {liked ? <FaHeart color="#ed4956" /> : <FaRegHeart />}
            </LikeButton>
        </CommentContainer>
    );
};

// Styled Components
const CommentListContainer = styled.div`
    padding: 0 16px;
    margin-bottom: 8px;
    max-height: 300px;
    overflow-y: auto;
`;

const CommentContainer = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const CommentContent = styled.div`
    display: flex;
    flex: 1;
`;

const Avatar = styled.img`
    width: ${(props) => (props.small ? "24px" : "32px")};
    height: ${(props) => (props.small ? "24px" : "32px")};
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
`;

const CommentDetails = styled.div`
    flex: 1;
`;

const CommentText = styled.div`
    font-size: 14px;
    margin-bottom: 4px;
    word-wrap: break-word;
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

const CommentActions = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 4px;
`;

const CommentTime = styled.span`
    font-size: 12px;
    color: #8e8e8e;
    margin-right: 12px;
`;

const LikesCount = styled.span`
    font-size: 12px;
    color: #8e8e8e;
    margin-right: 12px;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const ReplyButton = styled.button`
    background: transparent;
    border: none;
    font-size: 12px;
    color: #8e8e8e;
    cursor: pointer;
    padding: 0;

    &:hover {
        text-decoration: underline;
    }
`;

const LikeButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #262626;
    display: flex;
    align-items: center;
    padding: 0 8px;
`;

const ViewRepliesButton = styled.button`
    background: transparent;
    border: none;
    font-size: 12px;
    color: #8e8e8e;
    cursor: pointer;
    padding: 0;
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    &:hover {
        text-decoration: underline;
    }
`;

const RepliesList = styled.div`
    margin-top: 8px;
`;

const ReplyItem = styled.div`
    display: flex;
    margin-bottom: 12px;
`;

const ReplyContent = styled.div`
    flex: 1;
`;

const ReplyForm = styled.form`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
`;

const ReplyInput = styled.input`
    flex: 1;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    outline: none;
    font-size: 14px;
    padding: 8px;
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

export default CommentList;
