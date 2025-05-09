// src/services/api.js
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
    baseURL: "/api",
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    register: (userData) => api.post("/users/register", userData),
    login: (credentials) => api.post("/users/login", credentials),
    getProfile: () => api.get("/users/profile"),
    updateProfile: (userData) => api.put("/users/profile", userData),
    getUserByUsername: (username) => api.get(`/users/username/${username}`),
    searchUsers: (query) => api.get(`/users/search?query=${query}`),
    getSuggestedUsers: () => api.get("/users/suggested"),
    followUser: (userId) => api.post(`/users/follow/${userId}`),
    unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),
};

// Post services
export const postService = {
    createPost: (postData) => {
        if (postData instanceof FormData) {
            return api.post("/posts", postData);
        }
        return api.post("/posts", postData);
    },
    getFeedPosts: () => api.get("/posts/feed"),
    getExplorePosts: () => api.get("/posts/explore"),
    getPostsByHashtag: (tag) => api.get(`/posts/hashtag/${tag}`),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
    getPostById: (postId) => api.get(`/posts/${postId}`),
    updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
    deletePost: (postId) => api.delete(`/posts/${postId}`),
    likePost: (postId) => api.post(`/posts/${postId}/like`),
    unlikePost: (postId) => api.post(`/posts/${postId}/unlike`),
};

// Story services
export const storyService = {
    createStory: (storyData) => {
        if (storyData instanceof FormData) {
            return api.post("/stories", storyData);
        }
        return api.post("/stories", storyData);
    },
    getFeedStories: () => api.get("/stories/feed"),
    getPoetryStories: () => api.get("/stories/poetry"),
    getThoughtStories: () => api.get("/stories/thoughts"),
    getUserStories: (userId) => api.get(`/stories/user/${userId}`),
    getStoryById: (storyId) => api.get(`/stories/${storyId}`),
    deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
    likeStory: (storyId) => api.post(`/stories/${storyId}/like`),
    unlikeStory: (storyId) => api.post(`/stories/${storyId}/unlike`),
    viewStory: (storyId) => api.post(`/stories/${storyId}/view`),
};

// Comment services
export const commentService = {
    createPostComment: (postId, commentData) =>
        api.post(`/comments/post/${postId}`, commentData),
    createStoryComment: (storyId, commentData) =>
        api.post(`/comments/story/${storyId}`, commentData),
    getPostComments: (postId) => api.get(`/comments/post/${postId}`),
    getStoryComments: (storyId) => api.get(`/comments/story/${storyId}`),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
    likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
    unlikeComment: (commentId) => api.post(`/comments/${commentId}/unlike`),
    createReply: (commentId, replyData) =>
        api.post(`/comments/${commentId}/reply`, replyData),
};

// Create an apiService object to export as default
const apiService = {
    auth: authService,
    posts: postService,
    stories: storyService,
    comments: commentService,
};

export default apiService;
