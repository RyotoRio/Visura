// src/components/story/StoryCircles.js
import React, { useState, useRef } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import StoryViewer from "./StoryViewer";
import { useAuth } from "../../context/AuthContext";

const StoryCircles = ({ stories }) => {
    const { user } = useAuth();
    const [selectedStory, setSelectedStory] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const sliderRef = useRef(null);

    // Group stories by user
    const storyGroups = stories.reduce((groups, story) => {
        const userId = story.user._id;
        if (!groups[userId]) {
            groups[userId] = {
                user: story.user,
                stories: [],
                viewed: false,
            };
        }
        groups[userId].stories.push(story);
        // Check if all stories are viewed
        const allViewed = groups[userId].stories.every((s) =>
            s.views.includes(user?._id)
        );
        groups[userId].viewed = allViewed;
        return groups;
    }, {});

    const groupedStories = Object.values(storyGroups);

    const handleStoryClick = (userStories) => {
        setSelectedStory(userStories);
        setShowViewer(true);
    };

    const handleCloseViewer = () => {
        setShowViewer(false);
        setSelectedStory(null);
    };

    const handlePrev = () => {
        sliderRef.current.slickPrev();
    };

    const handleNext = () => {
        sliderRef.current.slickNext();
    };

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 7,
        slidesToScroll: 4,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <StoryCirclesContainer>
            <SliderButton prev onClick={handlePrev}>
                <FaChevronLeft />
            </SliderButton>

            <SliderContainer>
                <Slider ref={sliderRef} {...sliderSettings}>
                    {groupedStories.map((group) => (
                        <StoryCircleItem key={group.user._id}>
                            <StoryCircle
                                onClick={() => handleStoryClick(group.stories)}
                                viewed={group.viewed}
                            >
                                <StoryAvatar
                                    src={group.user.profilePicture}
                                    alt={group.user.username}
                                />
                            </StoryCircle>
                            <Username>{group.user.username}</Username>
                        </StoryCircleItem>
                    ))}
                </Slider>
            </SliderContainer>

            <SliderButton next onClick={handleNext}>
                <FaChevronRight />
            </SliderButton>

            {showViewer && selectedStory && (
                <StoryViewer
                    stories={selectedStory}
                    onClose={handleCloseViewer}
                />
            )}
        </StoryCirclesContainer>
    );
};

// Styled Components
const StoryCirclesContainer = styled.div`
    position: relative;
    padding: 0 20px;
`;

const SliderContainer = styled.div`
    .slick-track {
        display: flex;
        padding: 8px 0;
    }

    .slick-slide {
        padding: 0 8px;
    }
`;

const SliderButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(props) => (props.prev ? "left: 5px;" : "right: 5px;")}
    z-index: 10;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    &:focus {
        outline: none;
    }
`;

const StoryCircleItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StoryCircle = styled.div`
    width: 66px;
    height: 66px;
    border-radius: 50%;
    padding: 2px;
    background: ${(props) =>
        props.viewed
            ? "#dbdbdb"
            : "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"};
    cursor: pointer;
`;

const StoryAvatar = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid white;
`;

const Username = styled.span`
    font-size: 12px;
    color: #262626;
    margin-top: 4px;
    max-width: 66px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
`;

export default StoryCircles;
