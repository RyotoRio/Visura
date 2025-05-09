// src/pages/Search.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaSearch, FaUser, FaHashtag } from "react-icons/fa";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const Search = () => {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { followUser } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("users"); // 'users' or 'hashtags'

    // Extract query parameter
    useEffect(() => {
        const params = new URLSearchParams(search);
        const query = params.get("q");

        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [search]);

    const performSearch = async (query) => {
        if (!query.trim()) return;

        try {
            setLoading(true);

            // Search users
            const response = await authService.searchUsers(query);
            setSearchResults(response.data);
        } catch (err) {
            toast.error("Failed to search");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) return;

        // Update URL with search query
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        performSearch(searchQuery);
    };

    const handleFollowUser = async (userId) => {
        try {
            await followUser(userId);
            // Update user in search results
            setSearchResults(
                searchResults.map((user) =>
                    user._id === userId ? { ...user, isFollowing: true } : user
                )
            );
            toast.success("User followed successfully");
        } catch (error) {
            toast.error("Failed to follow user");
        }
    };

    // Filter results based on active tab
    const filteredResults = searchResults;

    return (
        <SearchPageContainer>
            <SearchHeader>
                <PageTitle>Search</PageTitle>

                <SearchForm onSubmit={handleSearchSubmit}>
                    <SearchInput
                        type="text"
                        placeholder="Search users or hashtags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <SearchButton type="submit">
                        <FaSearch />
                    </SearchButton>
                </SearchForm>

                <TabsContainer>
                    <Tab
                        active={activeTab === "users"}
                        onClick={() => setActiveTab("users")}
                    >
                        <FaUser /> Users
                    </Tab>
                    <Tab
                        active={activeTab === "hashtags"}
                        onClick={() => setActiveTab("hashtags")}
                    >
                        <FaHashtag /> Hashtags
                    </Tab>
                </TabsContainer>
            </SearchHeader>

            <SearchResultsContainer>
                {loading ? (
                    <Loader />
                ) : searchQuery && filteredResults.length === 0 ? (
                    <NoResultsMessage>
                        No results found for "{searchQuery}"
                    </NoResultsMessage>
                ) : !searchQuery ? (
                    <InitialStateMessage>
                        Search for users or hashtags
                    </InitialStateMessage>
                ) : (
                    <>
                        {activeTab === "users" && (
                            <UserResults>
                                {filteredResults.map((user) => (
                                    <UserCard key={user._id}>
                                        <UserAvatar
                                            src={user.profilePicture}
                                            alt={user.username}
                                        />
                                        <UserInfo>
                                            <Username to={`/${user.username}`}>
                                                {user.username}
                                            </Username>
                                            <FullName>{user.fullName}</FullName>
                                            {user.bio && (
                                                <UserBio>
                                                    {user.bio.substring(0, 100)}
                                                    {user.bio.length > 100
                                                        ? "..."
                                                        : ""}
                                                </UserBio>
                                            )}
                                        </UserInfo>
                                        <FollowButton
                                            onClick={() =>
                                                handleFollowUser(user._id)
                                            }
                                        >
                                            Follow
                                        </FollowButton>
                                    </UserCard>
                                ))}
                            </UserResults>
                        )}

                        {activeTab === "hashtags" && (
                            <HashtagResults>
                                <HashtagMessage>
                                    Hashtag search is coming soon
                                </HashtagMessage>
                            </HashtagResults>
                        )}
                    </>
                )}
            </SearchResultsContainer>
        </SearchPageContainer>
    );
};

// Styled Components
const SearchPageContainer = styled.div`
    max-width: 935px;
    margin: 0 auto;
    padding: 30px 0;
`;

const SearchHeader = styled.div`
    margin-bottom: 30px;
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 20px;
`;

const SearchForm = styled.form`
    display: flex;
    margin-bottom: 20px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #dbdbdb;
    border-radius: 4px 0 0 4px;
    font-size: 14px;
    outline: none;

    &:focus {
        border-color: #a8a8a8;
    }
`;

const SearchButton = styled.button`
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 0 16px;
    font-size: 16px;
    cursor: pointer;

    &:hover {
        background: #0086e0;
    }
`;

const TabsContainer = styled.div`
    display: flex;
    border-bottom: 1px solid #dbdbdb;
`;

const Tab = styled.button`
    background: transparent;
    border: none;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => (props.active ? "#262626" : "#8e8e8e")};
    border-bottom: 2px solid
        ${(props) => (props.active ? "#262626" : "transparent")};
    cursor: pointer;
    display: flex;
    align-items: center;

    svg {
        margin-right: 8px;
    }

    &:hover {
        color: #262626;
    }
`;

const SearchResultsContainer = styled.div`
    background: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    min-height: 300px;
`;

const NoResultsMessage = styled.div`
    text-align: center;
    padding: 50px 20px;
    color: #8e8e8e;
    font-size: 16px;
`;

const InitialStateMessage = styled.div`
    text-align: center;
    padding: 50px 20px;
    color: #8e8e8e;
    font-size: 16px;
`;

const UserResults = styled.div`
    padding: 16px;
`;

const UserCard = styled.div`
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #efefef;
`;

const UserAvatar = styled.img`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin-right: 16px;
    object-fit: cover;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const Username = styled(Link)`
    font-weight: 600;
    color: #262626;
    text-decoration: none;
    display: block;
    margin-bottom: 4px;

    &:hover {
        text-decoration: underline;
    }
`;

const FullName = styled.div`
    color: #8e8e8e;
    margin-bottom: 4px;
`;

const UserBio = styled.p`
    font-size: 14px;
    color: #262626;
`;

const FollowButton = styled.button`
    background: #0095f6;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: #0086e0;
    }
`;

const HashtagResults = styled.div`
    padding: 16px;
`;

const HashtagMessage = styled.div`
    text-align: center;
    padding: 50px 20px;
    color: #8e8e8e;
    font-size: 16px;
`;

export default Search;
