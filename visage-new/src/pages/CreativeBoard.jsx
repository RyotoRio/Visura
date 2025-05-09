// src/pages/CreativeBoard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaPlus, FaFilter } from "react-icons/fa";
import { storyService } from "../services/api";
import StoryCard from "../components/story/StoryCard";
import Loader from "../components/common/Loader";
import { useAuth } from "../context/AuthContext";

const CreativeBoard = () => {
    const { user } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'poetry', or 'thought'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                setLoading(true);
                let response;

                if (filter === "poetry") {
                    response = await storyService.getPoetryStories();
                } else if (filter === "thought") {
                    response = await storyService.getThoughtStories();
                } else {
                    // Fetch both types and combine
                    const poetryResponse =
                        await storyService.getPoetryStories();
                    const thoughtResponse =
                        await storyService.getThoughtStories();

                    // Combine and sort by creation date
                    const combinedStories = [
                        ...poetryResponse.data,
                        ...thoughtResponse.data,
                    ].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );

                    setStories(combinedStories);
                    setLoading(false);
                    return;
                }

                setStories(response.data);
            } catch (err) {
                toast.error("Failed to load stories");
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [filter]);

    const handleLike = async (storyId) => {
        try {
            await storyService.likeStory(storyId);
            setStories(
                stories.map((story) =>
                    story._id === storyId
                        ? { ...story, likes: [...story.likes, user._id] }
                        : story
                )
            );
        } catch (error) {
            toast.error("Failed to like story");
        }
    };

    const handleUnlike = async (storyId) => {
        try {
            await storyService.unlikeStory(storyId);
            setStories(
                stories.map((story) =>
                    story._id === storyId
                        ? {
                              ...story,
                              likes: story.likes.filter(
                                  (id) => id !== user._id
                              ),
                          }
                        : story
                )
            );
        } catch (error) {
            toast.error("Failed to unlike story");
        }
    };

    const handleComment = async (storyId, text) => {
        try {
            const response = await storyService.createStoryComment(storyId, {
                text,
            });
            setStories(
                stories.map((story) =>
                    story._id === storyId
                        ? {
                              ...story,
                              comments: [...story.comments, response.data],
                          }
                        : story
                )
            );
            return response.data;
        } catch (error) {
            toast.error("Failed to add comment");
            throw error;
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <CreativeBoardContainer>
            <BoardHeader>
                <PageTitle>Creative Board</PageTitle>
                <BoardActions>
                    <FilterButton
                        onClick={() =>
                            setShowFilterDropdown(!showFilterDropdown)
                        }
                    >
                        <FaFilter /> Filter
                        {showFilterDropdown && (
                            <FilterDropdown>
                                <FilterOption
                                    active={filter === "all"}
                                    onClick={() => {
                                        setFilter("all");
                                        setShowFilterDropdown(false);
                                    }}
                                >
                                    All
                                </FilterOption>
                                <FilterOption
                                    active={filter === "poetry"}
                                    onClick={() => {
                                        setFilter("poetry");
                                        setShowFilterDropdown(false);
                                    }}
                                >
                                    Poetry
                                </FilterOption>
                                <FilterOption
                                    active={filter === "thought"}
                                    onClick={() => {
                                        setFilter("thought");
                                        setShowFilterDropdown(false);
                                    }}
                                >
                                    Thoughts
                                </FilterOption>
                            </FilterDropdown>
                        )}
                    </FilterButton>
                    <CreateButton to="/create-story">
                        <FaPlus /> Create
                    </CreateButton>
                </BoardActions>
            </BoardHeader>

            <BoardDescription>
                Share your poetry, thoughts, and creative expressions with the
                world.
            </BoardDescription>

            <StoriesGrid>
                {stories.length > 0 ? (
                    stories.map((story) => (
                        <StoryCard
                            key={story._id}
                            story={story}
                            onLike={handleLike}
                            onUnlike={handleUnlike}
                            onComment={handleComment}
                            currentUser={user}
                        />
                    ))
                ) : (
                    <NoStoriesMessage>
                        No stories found. Be the first to share your creative
                        expression!
                    </NoStoriesMessage>
                )}
            </StoriesGrid>
        </CreativeBoardContainer>
    );
};

// Styled Components
const CreativeBoardContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const BoardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #262626;
`;

const BoardActions = styled.div`
    display: flex;
    gap: 12px;
`;

const FilterButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    position: relative;

    &:hover {
        background: #fafafa;
    }

    svg {
        font-size: 12px;
    }
`;

const FilterDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
    min-width: 150px;
`;

const FilterOption = styled.div`
    padding: 12px 16px;
    cursor: pointer;
    font-weight: ${(props) => (props.active ? "600" : "normal")};
    background: ${(props) => (props.active ? "#fafafa" : "white")};

    &:hover {
        background: #fafafa;
    }
`;

const CreateButton = styled(Link)`
    display: flex;
    align-items: center;
    gap: 6px;
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        background: #0086e0;
    }

    svg {
        font-size: 12px;
    }
`;

const BoardDescription = styled.p`
    color: #8e8e8e;
    font-size: 16px;
    margin-bottom: 24px;
`;

const StoriesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const NoStoriesMessage = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    color: #8e8e8e;
    font-size: 16px;
`;

export default CreativeBoard;
