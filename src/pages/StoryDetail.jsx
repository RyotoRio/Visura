// src/pages/StoryDetail.js
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
    FaQuoteLeft,
} from "react-icons/fa";
import { storyService, commentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import CommentList from "../components/post/CommentList";
import Loader from "../components/common/Loader";

const StoryDetail = () => {
    const { storyId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [story, setStory] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const fetchStoryData = async () => {
            try {
                setLoading(true);

                // Fetch story details
                const response = await storyService.getStoryById(storyId);
                setStory(response.data);

                // Check if story is liked by current user
                setIsLiked(
                    response.data.likes.some((like) => like === user?._id)
                );

                // Fetch comments
                const commentsResponse = await commentService.getStoryComments(
                    storyId
                );
                setComments(commentsResponse.data);

                // Mark story as viewed
                if (response.data.storyType === "ephemeral") {
                    storyService.viewStory(storyId);
                }
            } catch (err) {
                toast.error("Failed to load story");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchStoryData();
    }, [storyId, user, navigate]);

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await storyService.unlikeStory(storyId);
                setStory({
                    ...story,
                    likes: story.likes.filter((id) => id !== user._id),
                });
            } else {
                await storyService.likeStory(storyId);
                setStory({
                    ...story,
                    likes: [...story.likes, user._id],
                });
            }
            setIsLiked(!isLiked);
        } catch (error) {
            toast.error("Failed to like/unlike story");
        }
    };

    const handleSaveToggle = () => {
        // In a real app, this would save to a user's bookmarks
        setIsSaved(!isSaved);
        toast.info(
            isSaved
                ? "Story removed from saved items"
                : "Story saved successfully"
        );
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        try {
            const response = await commentService.createStoryComment(storyId, {
                text: commentText,
            });
            setComments([...comments, response.data]);
            setCommentText("");
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    const handleDeleteStory = async () => {
        if (window.confirm("Are you sure you want to delete this story?")) {
            try {
                await storyService.deleteStory(storyId);
                toast.success("Story deleted successfully");
                navigate("/creative-board");
            } catch (error) {
                toast.error("Failed to delete story");
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (loading) {
        return <Loader />;
    }

    if (!story) {
        return (
            <ErrorContainer>
                <ErrorText>Story not found</ErrorText>
                <BackButton to="/creative-board">
                    Back to Creative Board
                </BackButton>
            </ErrorContainer>
        );
    }

    // Determine background color based on story type
    const getBackgroundColor = () => {
        if (story.mediaUrl) return "black";
        if (story.storyType === "poetry")
            return "linear-gradient(135deg, #4158D0, #C850C0)";
        if (story.storyType === "thought")
            return "linear-gradient(135deg, #0F2027, #203A43, #2C5364)";
        return "linear-gradient(135deg, #FF416C, #FF4B2B)"; // ephemeral
    };

    return (
        <StoryDetailContainer>
            <BackButtonContainer onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </BackButtonContainer>

            <StoryContentContainer>
                <StoryMediaContainer background={getBackgroundColor()}>
                    {story.mediaUrl ? (
                        story.mediaType === "image" ? (
                            <StoryImage src={story.mediaUrl} alt="Story" />
                        ) : (
                            <StoryVideo src={story.mediaUrl} controls />
                        )
                    ) : (
                        <TextContent>
                            {story.storyType === "poetry" && (
                                <FaQuoteLeft className="quote-icon" />
                            )}
                            {story.content}
                        </TextContent>
                    )}
                </StoryMediaContainer>

                <StoryInfoContainer>
                    <StoryHeader>
                        <UserInfo>
                            <UserAvatar
                                src={story.user.profilePicture}
                                alt={story.user.username}
                            />
                            <div>
                                <Username to={`/${story.user.username}`}>
                                    {story.user.username}
                                </Username>
                                <StoryType>{story.storyType}</StoryType>
                            </div>
                        </UserInfo>

                        <MenuButton onClick={() => setShowMenu(!showMenu)}>
                            <FaEllipsisH />
                        </MenuButton>

                        {showMenu && (
                            <MenuDropdown>
                                {user && story.user._id === user._id && (
                                    <MenuItem onClick={handleDeleteStory}>
                                        Delete Story
                                    </MenuItem>
                                )}
                                <MenuItem>Report</MenuItem>
                                <MenuItem onClick={() => setShowMenu(false)}>
                                    Cancel
                                </MenuItem>
                            </MenuDropdown>
                        )}
                    </StoryHeader>

                    <CommentsContainer>
                        {!story.mediaUrl && (
                            <StoryTextContainer>
                                <ContentText>{story.content}</ContentText>
                                <Timestamp>
                                    {formatTimestamp(story.createdAt)}
                                </Timestamp>
                            </StoryTextContainer>
                        )}

                        {story.hashtags.length > 0 && (
                            <HashtagsContainer>
                                {story.hashtags.map((tag, index) => (
                                    <Hashtag
                                        key={index}
                                        to={`/hashtag/${tag.replace("#", "")}`}
                                    >
                                        {tag}
                                    </Hashtag>
                                ))}
                            </HashtagsContainer>
                        )}

                        {story.storyType === "ephemeral" && (
                            <EphemeralBadge>
                                This story will disappear{" "}
                                {formatTimestamp(story.expireAt)}
                            </EphemeralBadge>
                        )}

                        <CommentsTitle>Comments</CommentsTitle>

                        {comments.length > 0 ? (
                            <CommentList comments={comments} />
                        ) : (
                            <NoCommentsMessage>
                                No comments yet. Be the first to comment!
                            </NoCommentsMessage>
                        )}
                    </CommentsContainer>

                    <StoryActionsContainer>
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
                            {story.likes.length === 0
                                ? "Be the first to like this"
                                : story.likes.length === 1
                                ? "1 like"
                                : `${story.likes.length} likes`}
                        </LikesCount>

                        <StoryDate>
                            {new Date(story.createdAt).toLocaleDateString()}
                        </StoryDate>

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
                    </StoryActionsContainer>
                </StoryInfoContainer>
            </StoryContentContainer>
        </StoryDetailContainer>
    );
};

// Styled Components
const StoryDetailContainer = styled.div`
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

const StoryContentContainer = styled.div`
    display: flex;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    overflow: hidden;

    @media (max-width: 935px) {
        flex-direction: column;
    }
`;

const StoryMediaContainer = styled.div`
    flex: 1.5;
    background: ${(props) => props.background || "black"};
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 450px;
    max-height: 600px;

    @media (max-width: 935px) {
        min-height: 350px;
    }
`;

const StoryImage = styled.img`
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const StoryVideo = styled.video`
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
`;

const TextContent = styled.div`
    color: white;
    font-size: 24px;
    text-align: center;
    max-width: 80%;
    white-space: pre-wrap;
    line-height: 1.5;
    position: relative;
    padding: 20px;

    .quote-icon {
        position: absolute;
        top: -10px;
        left: -10px;
        font-size: 24px;
        opacity: 0.5;
    }
`;

const StoryInfoContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #dbdbdb;

    @media (max-width: 935px) {
        border-left: none;
        border-top: 1px solid #dbdbdb;
    }
`;

const StoryHeader = styled.div`
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
    width: 42px;
    height: 42px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
`;

const Username = styled(Link)`
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    display: block;

    &:hover {
        text-decoration: underline;
    }
`;

const StoryType = styled.div`
    font-size: 12px;
    color: #8e8e8e;
    text-transform: capitalize;
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

const StoryTextContainer = styled.div`
    margin-bottom: 16px;
`;

const ContentText = styled.div`
    margin-bottom: 8px;
    white-space: pre-wrap;
    line-height: 1.5;
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

const EphemeralBadge = styled.div`
    background: #ed4956;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 16px;
    display: inline-block;
`;

const CommentsTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
`;

const NoCommentsMessage = styled.div`
    color: #8e8e8e;
    text-align: center;
    padding: 24px 0;
`;

const StoryActionsContainer = styled.div`
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

const StoryDate = styled.div`
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

export default StoryDetail;
