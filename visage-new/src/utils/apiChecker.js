// src/utils/apiChecker.js
/**
 * Utility to check API responses from the backend
 * Import this file and call checkAPIEndpoints() in your browser console
 * to check if API endpoints are working properly
 */

import axios from "axios";

// Helper for checking if token exists
const getToken = () => localStorage.getItem("userToken");

// Helper function to make authenticated requests
const makeRequest = async (url, method = "get", data = null) => {
    const token = getToken();
    const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    };

    try {
        let response;
        if (method === "get") {
            response = await axios.get(url, config);
        } else if (method === "post") {
            response = await axios.post(url, data, config);
        }
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status,
        };
    }
};

// Check if the user is authenticated
const checkAuth = async () => {
    const token = getToken();
    if (!token) {
        console.log("❌ No authentication token found. Please login first.");
        return false;
    }

    const result = await makeRequest("/api/users/profile");
    if (result.success) {
        console.log("✅ Authentication check passed. User is logged in.");
        console.log("User data:", result.data);
        return true;
    } else {
        console.log(
            "❌ Authentication check failed. Token may be invalid or expired."
        );
        console.log("Error:", result.error);
        return false;
    }
};

// Check posts endpoints
const checkPostsEndpoints = async () => {
    console.log("🔍 Checking posts endpoints...");

    const feedResult = await makeRequest("/api/posts/feed");
    console.log(
        `${feedResult.success ? "✅" : "❌"} GET /api/posts/feed ${
            feedResult.status
        }`
    );
    if (feedResult.success) {
        console.log(`Posts in feed: ${feedResult.data.length || 0}`);
        console.log("Sample post:", feedResult.data[0]);
    }

    const exploreResult = await makeRequest("/api/posts/explore");
    console.log(
        `${exploreResult.success ? "✅" : "❌"} GET /api/posts/explore ${
            exploreResult.status
        }`
    );
    if (exploreResult.success) {
        console.log(`Posts in explore: ${exploreResult.data.length || 0}`);
    }

    return { feedPosts: feedResult, explorePosts: exploreResult };
};

// Check stories endpoints
const checkStoriesEndpoints = async () => {
    console.log("🔍 Checking stories endpoints...");

    const feedResult = await makeRequest("/api/stories/feed");
    console.log(
        `${feedResult.success ? "✅" : "❌"} GET /api/stories/feed ${
            feedResult.status
        }`
    );
    if (feedResult.success) {
        console.log(`Stories in feed: ${feedResult.data.length || 0}`);
        console.log("Sample story:", feedResult.data[0]);
    }

    const poetryResult = await makeRequest("/api/stories/poetry");
    console.log(
        `${poetryResult.success ? "✅" : "❌"} GET /api/stories/poetry ${
            poetryResult.status
        }`
    );
    if (poetryResult.success) {
        console.log(`Poetry stories: ${poetryResult.data.length || 0}`);
    }

    const thoughtsResult = await makeRequest("/api/stories/thoughts");
    console.log(
        `${thoughtsResult.success ? "✅" : "❌"} GET /api/stories/thoughts ${
            thoughtsResult.status
        }`
    );
    if (thoughtsResult.success) {
        console.log(`Thought stories: ${thoughtsResult.data.length || 0}`);
    }

    return {
        feedStories: feedResult,
        poetryStories: poetryResult,
        thoughtStories: thoughtsResult,
    };
};

// Check if the API server is reachable
const checkServerConnection = async () => {
    try {
        const response = await axios.get("/api/users/search?query=test");
        console.log("✅ API server connection successful:", response.status);
        return true;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(
                "✅ API server is reachable but returned error:",
                error.response.status
            );
            return true;
        } else if (error.request) {
            // The request was made but no response was received
            console.log(
                "❌ API server not responding. Check if the backend server is running."
            );
            return false;
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("❌ Error setting up request:", error.message);
            return false;
        }
    }
};

// Main function to check all API endpoints
const checkAPIEndpoints = async () => {
    console.log("=====================================");
    console.log("🔍 Starting API Endpoints Check");
    console.log("=====================================");

    const serverOk = await checkServerConnection();
    if (!serverOk) {
        console.log(
            "❌ Cannot proceed with checks because the server is not reachable."
        );
        return;
    }

    const authOk = await checkAuth();
    if (!authOk) {
        console.log(
            "❌ Cannot proceed with all checks because the user is not authenticated."
        );
        console.log("Some endpoints might still work without authentication.");
    }

    // Check various API endpoints
    const postsResults = await checkPostsEndpoints();
    const storiesResults = await checkStoriesEndpoints();

    console.log("=====================================");
    console.log("📊 API Check Summary");
    console.log("=====================================");
    console.log("Server connection:", serverOk ? "✅ OK" : "❌ Failed");
    console.log(
        "Authentication:",
        authOk ? "✅ OK" : "❌ Failed/Not logged in"
    );
    console.log(
        "Posts API:",
        postsResults.feedPosts.success || postsResults.explorePosts.success
            ? "✅ Partially working"
            : "❌ All endpoints failed"
    );
    console.log(
        "Stories API:",
        storiesResults.feedStories.success ||
            storiesResults.poetryStories.success ||
            storiesResults.thoughtStories.success
            ? "✅ Partially working"
            : "❌ All endpoints failed"
    );

    return {
        serverOk,
        authOk,
        postsResults,
        storiesResults,
    };
};

// Export for use in browser console
window.checkAPIEndpoints = checkAPIEndpoints;

export { checkAPIEndpoints };
