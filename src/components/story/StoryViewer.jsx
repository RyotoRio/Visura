// src/components/story/StoryViewer.js
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import {
    FaTimes,
    FaHeart,
    FaRegHeart,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { storyService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StoryViewer = ({ stories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const { user } = useAuth();

    const currentStory = stories[currentIndex];

    // Define handleNext as useCallback to avoid dependency issues
    const handleNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, onClose]);

    useEffect(() => {
        // Mark story as viewed
        if (currentStory) {
            storyService.viewStory(currentStory._id);

            // Check if story is liked
            setIsLiked(currentStory.likes.includes(user?._id));
        }

        // Reset progress when story changes
        setProgress(0);

        // Autoplay timer
        let timer;
        if (!isPaused) {
            timer = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prevProgress + 1;
                });
            }, 50); // 5 seconds total (50ms * 100)
        }

        return () => clearInterval(timer);
    }, [currentIndex, isPaused, currentStory, user, handleNext]);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleLike = async () => {
        try {
            if (isLiked) {
                await storyService.unlikeStory(currentStory._id);
            } else {
                await storyService.likeStory(currentStory._id);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const formatTimestamp = (timestamp) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };

    if (!currentStory) return null;

    return (
        <StoryViewerContainer>
            <StoryOverlay onClick={onClose} />

            <StoryContent
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onClick={(e) => e.stopPropagation()}
            >
                <CloseButton onClick={onClose}>
                    <FaTimes />
                </CloseButton>

                <ProgressBar>
                    {stories.map((_, index) => (
                        <ProgressItem
                            key={index}
                            active={index === currentIndex}
                            completed={index < currentIndex}
                        >
                            <ProgressFill
                                style={{
                                    width:
                                        index === currentIndex
                                            ? `${progress}%`
                                            : "0%",
                                }}
                            />
                        </ProgressItem>
                    ))}
                </ProgressBar>

                <StoryHeader>
                    <UserInfo>
                        <UserAvatar
                            src={currentStory.user.profilePicture}
                            alt={currentStory.user.username}
                        />
                        <div>
                            <Username to={`/${currentStory.user.username}`}>
                                {currentStory.user.username}
                            </Username>
                            <Timestamp>
                                {formatTimestamp(currentStory.createdAt)}
                            </Timestamp>
                        </div>
                    </UserInfo>
                </StoryHeader>

                <StoryMedia>
                    {currentStory.mediaType === "image" &&
                    currentStory.mediaUrl ? (
                        <StoryImage src={currentStory.mediaUrl} alt="Story" />
                    ) : currentStory.mediaType === "video" &&
                      currentStory.mediaUrl ? (
                        <StoryVideo
                            src={currentStory.mediaUrl}
                            autoPlay
                            controls={false}
                            loop
                        />
                    ) : (
                        <TextContent storyType={currentStory.storyType}>
                            {currentStory.content}
                        </TextContent>
                    )}
                </StoryMedia>

                <StoryFooter>
                    <StoryCaption>{currentStory.content}</StoryCaption>
                    <LikeButton onClick={handleLike}>
                        {isLiked ? <FaHeart color="#ed4956" /> : <FaRegHeart />}
                    </LikeButton>
                </StoryFooter>

                {currentIndex > 0 && (
                    <NavButton prev onClick={handlePrev}>
                        <FaChevronLeft />
                    </NavButton>
                )}

                {currentIndex < stories.length - 1 && (
                    <NavButton next onClick={handleNext}>
                        <FaChevronRight />
                    </NavButton>
                )}
            </StoryContent>
        </StoryViewerContainer>
    );
};

// Styled Components
const StoryViewerContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const StoryOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
`;

const StoryContent = styled.div`
    position: relative;
    width: 400px;
    max-width: 100%;
    height: 80vh;
    max-height: 700px;
    background: #262626;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 1;

    @media (max-width: 480px) {
        width: 100%;
        height: 100%;
        border-radius: 0;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 10;
`;

const ProgressBar = styled.div`
    display: flex;
    padding: 16px;
    gap: 4px;
`;

const ProgressItem = styled.div`
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    background: ${(props) =>
        props.completed ? "white" : "rgba(255, 255, 255, 0.3)"};
`;

const ProgressFill = styled.div`
    height: 100%;
    background: white;
    transition: width 0.05s linear;
`;

const StoryHeader = styled.div`
    padding: 0 16px 16px;
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
    color: white;
    font-weight: 600;
    text-decoration: none;
    display: block;

    &:hover {
        text-decoration: underline;
    }
`;

const Timestamp = styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
`;

const StoryMedia = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: #000;
`;

const StoryImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const StoryVideo = styled.video`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const TextContent = styled.div`
    padding: 24px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    font-size: ${(props) => (props.storyType === "poetry" ? "20px" : "24px")};
    font-weight: ${(props) => (props.storyType === "poetry" ? "400" : "600")};
    line-height: 1.5;
    white-space: pre-wrap;
    overflow: auto;
    background: ${(props) =>
        props.storyType === "poetry"
            ? "linear-gradient(135deg, #4158D0, #C850C0)"
            : "linear-gradient(135deg, #0F2027, #203A43, #2C5364)"};
`;

const StoryFooter = styled.div`
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StoryCaption = styled.div`
    color: white;
    font-size: 14px;
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const LikeButton = styled.button`
    background: transparent;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
`;

const NavButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(props) => (props.prev ? "left: 16px;" : "right: 16px;")}
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

export default StoryViewer;
