// backend/controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        // Check if user exists
        const userExists = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            fullName,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (
                req.body.profilePicture &&
                req.body.profilePicture !== user.profilePicture
            ) {
                // Upload new profile picture to Cloudinary
                const uploadResponse = await cloudinary.uploader.upload(
                    req.body.profilePicture,
                    {
                        folder: "visage_profile_pictures",
                    }
                );

                user.profilePicture = uploadResponse.secure_url;
            }

            user.username = req.body.username || user.username;
            user.fullName = req.body.fullName || user.fullName;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.website =
                req.body.website !== undefined
                    ? req.body.website
                    : user.website;
            user.isPrivate =
                req.body.isPrivate !== undefined
                    ? req.body.isPrivate
                    : user.isPrivate;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                website: updatedUser.website,
                profilePicture: updatedUser.profilePicture,
                isPrivate: updatedUser.isPrivate,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res
                .status(400)
                .json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.following.includes(req.params.id)) {
            return res
                .status(400)
                .json({ message: "You are already following this user" });
        }

        // Add to following list
        await User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.params.id },
        });

        // Add to followers list
        await User.findByIdAndUpdate(req.params.id, {
            $push: { followers: req.user._id },
        });

        res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res
                .status(400)
                .json({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.following.includes(req.params.id)) {
            return res
                .status(400)
                .json({ message: "You are not following this user" });
        }

        // Remove from following list
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.params.id },
        });

        // Remove from followers list
        await User.findByIdAndUpdate(req.params.id, {
            $pull: { followers: req.user._id },
        });

        res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        }).select("-password");

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res
                .status(400)
                .json({ message: "Query parameter is required" });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
            ],
        }).select("-password");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get suggested users
// @route   GET /api/users/suggested
// @access  Private
const getSuggestedUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        const following = currentUser.following;

        // Get users that the current user is not following
        const suggestedUsers = await User.find({
            _id: { $nin: [...following, req.user._id] },
        })
            .select("-password")
            .limit(5);

        res.json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getUserByUsername,
    searchUsers,
    getSuggestedUsers,
};
