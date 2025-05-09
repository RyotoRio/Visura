// src/App.js
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import NotFound from "./pages/NotFound";
import CreativeBoard from "./pages/CreativeBoard.jsx";
import CreateStory from "./pages/CreateStory";
import StoryDetail from "./pages/StoryDetail";
import Search from "./pages/Search";
import Hashtag from "./pages/Hashtag";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Feed />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/explore"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Explore />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreatePost />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile/edit"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <EditProfile />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/search"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Search />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/creative-board"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreativeBoard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create-story"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <CreateStory />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            {/* Public and Protected Routes */}
            <Route
                path="/p/:postId"
                element={
                    <Layout>
                        <PostDetail />
                    </Layout>
                }
            />
            <Route
                path="/s/:storyId"
                element={
                    <Layout>
                        <StoryDetail />
                    </Layout>
                }
            />
            <Route
                path="/hashtag/:tag"
                element={
                    <Layout>
                        <Hashtag />
                    </Layout>
                }
            />
            <Route
                path="/:username"
                element={
                    <Layout>
                        <Profile />
                    </Layout>
                }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
                <ToastContainer position="bottom-right" autoClose={3000} />
            </AuthProvider>
        </Router>
    );
}

export default App;
