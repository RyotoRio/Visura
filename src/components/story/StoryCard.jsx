// src/components/story/StoryCard.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";
import { FaHeart, FaRegHeart, FaRegComment, FaShareAlt } from "react-icons/fa";

const StoryCard = ({ story, onLike, onUnlike, onComment, currentUser }) => {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);

    const isLiked = story.likes.includes(currentUser?._id);

    const handleLikeToggle = () => {
        if (isLiked) {
            onUnlike(story._id);
        } else {
            onLike(story._id);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await onComment(story._id, commentText);
            setCommentText("");
            setShowComments(true);
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    // Determine card background type based on styling
    const cardType = story.storyType;
    const hasMedia = !!story.mediaUrl;

    return (
        <StoryCardContainer type={cardType} hasMedia={hasMedia}>
            <CardHeader>
                <UserInfo>
                    <UserAvatar
                        src={story.user.profilePicture}
                        alt={story.user.username}
                    />
                    <UserDetails>
                        <Username to={`/${story.user.username}`}>
                            {story.user.username}
                        </Username>
                        <StoryType>
                            {story.storyType === "poetry"
                                ? "Poetry"
                                : "Thought"}
                        </StoryType>
                    </UserDetails>
                </UserInfo>
                <Timestamp>{formatTimestamp(story.createdAt)}</Timestamp>
            </CardHeader>

            <CardContent
                to={`/s/${story._id}`}
                type={story.storyType}
                hasMedia={hasMedia}
            >
                {story.mediaType === "image" && story.mediaUrl ? (
                    <StoryImage src={story.mediaUrl} alt="Story" />
                ) : story.mediaType === "video" && story.mediaUrl ? (
                    <StoryVideo src={story.mediaUrl} />
                ) : (
                    <TextContent>{story.content}</TextContent>
                )}
            </CardContent>

            <CardActions>
                <ActionButton onClick={handleLikeToggle}>
                    {isLiked ? <FaHeart color="#ed4956" /> : <FaRegHeart />}
                    <ActionCount>{story.likes.length}</ActionCount>
                </ActionButton>

                <ActionButton onClick={() => setShowComments(!showComments)}>
                    <FaRegComment />
                    <ActionCount>{story.comments.length}</ActionCount>
                </ActionButton>

                <ActionButton>
                    <FaShareAlt />
                </ActionButton>
            </CardActions>

            {showComments && (
                <CommentsSection>
                    {story.comments.length > 0 && (
                        <CommentsList>
                            {story.comments
                                .slice(0, 3)
                                .map((comment, index) => (
                                    <CommentItem key={index}>
                                        <CommentUsername
                                            to={`/${comment.user.username}`}
                                        >
                                            {comment.user.username}
                                        </CommentUsername>
                                        <CommentText>
                                            {comment.text}
                                        </CommentText>
                                    </CommentItem>
                                ))}
                            {story.comments.length > 3 && (
                                <ViewMoreComments to={`/s/${story._id}`}>
                                    View all {story.comments.length} comments
                                </ViewMoreComments>
                            )}
                        </CommentsList>
                    )}

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
                </CommentsSection>
            )}

            {story.hashtags.length > 0 && (
                <Hashtags>
                    {story.hashtags.map((tag, index) => (
                        <Hashtag
                            key={index}
                            to={`/hashtag/${tag.replace("#", "")}`}
                        >
                            {tag}
                        </Hashtag>
                    ))}
                </Hashtags>
            )}
        </StoryCardContainer>
    );
};

// Styled Components
const StoryCardContainer = styled.div`
    background: ${(props) =>
        props.hasMedia
            ? "white"
            : props.type === "poetry"
            ? "linear-gradient(135deg, #4158D0, #C850C0)"
            : "linear-gradient(135deg, #0F2027, #203A43, #2C5364)"};
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-4px);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: ${(props) =>
        props.hasMedia ? "1px solid #efefef" : "none"};
    color: ${(props) => (props.hasMedia ? "#262626" : "white")};
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

const UserDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const Username = styled(Link)`
    font-weight: 600;
    color: inherit;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const StoryType = styled.span`
    font-size: 12px;
    opacity: 0.8;
`;

const Timestamp = styled.span`
    font-size: 12px;
    color: inherit;
    opacity: 0.8;
`;

const CardContent = styled(Link)`
    display: block;
    text-decoration: none;
    color: ${(props) => (props.hasMedia ? "#262626" : "white")};
    position: relative;
    overflow: hidden;
`;

const StoryImage = styled.img`
    width: 100%;
    max-height: 400px;
    object-fit: cover;
`;

const StoryVideo = styled.video`
    width: 100%;
    max-height: 400px;
    object-fit: cover;
`;

const TextContent = styled.div`
    padding: 24px;
    font-size: 16px;
    min-height: 100px;
    max-height: 300px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    white-space: pre-wrap;
    color: white;
`;

const CardActions = styled.div`
    display: flex;
    padding: 8px 16px;
    border-top: ${(props) =>
        props.hasMedia ? "none" : "1px solid rgba(255,255,255,0.1)"};
`;

const ActionButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    color: ${(props) => (props.hasMedia ? "#262626" : "white")};
    margin-right: 16px;
    padding: 8px 0;

    svg {
        font-size: 20px;
        margin-right: 6px;
    }
`;

const ActionCount = styled.span`
    font-size: 14px;
`;

const CommentsSection = styled.div`
    padding: 0 16px 16px;
    border-top: 1px solid #efefef;
`;

const CommentsList = styled.div`
    margin-bottom: 12px;
    max-height: 200px;
    overflow-y: auto;
`;

const CommentItem = styled.div`
    margin-bottom: 8px;
    font-size: 14px;
    display: flex;
`;

const CommentUsername = styled(Link)`
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    margin-right: 6px;

    &:hover {
        text-decoration: underline;
    }
`;

const CommentText = styled.span`
    color: #262626;
    word-break: break-word;
`;

const ViewMoreComments = styled(Link)`
    display: block;
    color: #8e8e8e;
    font-size: 14px;
    margin-top: 8px;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const CommentForm = styled.form`
    display: flex;
    align-items: center;
    border-top: 1px solid #efefef;
    padding-top: 12px;
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

const Hashtags = styled.div`
    padding: 0 16px 16px;
    display: flex;
    flex-wrap: wrap;
`;

const Hashtag = styled(Link)`
    color: #00376b;
    text-decoration: none;
    margin-right: 8px;
    margin-bottom: 4px;
    font-size: 14px;

    &:hover {
        text-decoration: underline;
    }
`;

export default StoryCard;
