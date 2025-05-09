// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Check if user is logged in on initial load
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem("userToken");
                if (token) {
                    const response = await authService.getProfile();
                    setUser(response.data);
                }
            } catch (err) {
                localStorage.removeItem("userToken");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(userData);
            setUser(response.data);
            localStorage.setItem("userToken", response.data.token);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(credentials);
            setUser(response.data);
            localStorage.setItem("userToken", response.data.token);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem("userToken");
        setUser(null);
        navigate("/login");
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.updateProfile(userData);
            setUser(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Follow user
    const followUser = async (userId) => {
        try {
            await authService.followUser(userId);
            // Refresh user profile
            const response = await authService.getProfile();
            setUser(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to follow user");
            throw err;
        }
    };

    // Unfollow user
    const unfollowUser = async (userId) => {
        try {
            await authService.unfollowUser(userId);
            // Refresh user profile
            const response = await authService.getProfile();
            setUser(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to unfollow user");
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        followUser,
        unfollowUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
