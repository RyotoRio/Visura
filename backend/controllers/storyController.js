// backend/controllers/storyController.js
const Story = require("../models/Story");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
    try {
        const { content, storyType } = req.body;
        let mediaUrl = null;
        let mediaType = "text";

        // Upload media to Cloudinary if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "visage_stories",
                resource_type: "auto",
            });
            mediaUrl = result.secure_url;
            mediaType = result.resource_type === "video" ? "video" : "image";
        } else if (req.body.mediaUrl) {
            // Handle base64 encoded images
            const result = await cloudinary.uploader.upload(req.body.mediaUrl, {
                folder: "visage_stories",
            });
            mediaUrl = result.secure_url;
            mediaType = "image";
        }

        // Extract hashtags from content
        const hashtagsRegex = /#[a-zA-Z0-9_]+/g;
        const hashtags = content ? content.match(hashtagsRegex) || [] : [];

        // Create story
        const story = await Story.create({
            user: req.user._id,
            content,
            mediaUrl,
            mediaType,
            storyType,
            hashtags: hashtags.map((tag) => tag.toLowerCase()),
        });

        const populatedStory = await Story.findById(story._id).populate(
            "user",
            "username profilePicture"
        );

        res.status(201).json(populatedStory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a story by ID
// @route   GET /api/stories/:id
// @access  Public
const getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate("user", "username profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profilePicture",
                },
            });

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        res.json(story);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all stories for a user
// @route   GET /api/stories/user/:userId
// @access  Public
const getUserStories = async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.userId,
            $or: [{ expireAt: { $gt: new Date() } }, { expireAt: null }],
        })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get stories for user's feed
// @route   GET /api/stories/feed
// @access  Private
const getFeedStories = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        // Get stories from users that the current user follows and their own stories
        const stories = await Story.find({
            $or: [
                { user: { $in: currentUser.following } },
                { user: req.user._id },
            ],
            $or: [{ expireAt: { $gt: new Date() } }, { expireAt: null }],
        })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like a story
// @route   POST /api/stories/:id/like
// @access  Private
const likeStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if story is already liked
        if (story.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Story already liked" });
        }

        // Add like
        story.likes.push(req.user._id);
        await story.save();

        res.json({ message: "Story liked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlike a story
// @route   POST /api/stories/:id/unlike
// @access  Private
const unlikeStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if story is not liked
        if (!story.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Story not liked yet" });
        }

        // Remove like
        story.likes = story.likes.filter(
            (like) => like.toString() !== req.user._id.toString()
        );
        await story.save();

        res.json({ message: "Story unliked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private
const deleteStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check user authorization
        if (story.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        // Delete media from Cloudinary if exists
        if (story.mediaUrl) {
            const publicId = story.mediaUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`visage_stories/${publicId}`);
        }

        // Delete story
        await story.remove();

        res.json({ message: "Story removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
const viewStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if story is already viewed
        if (story.views.includes(req.user._id)) {
            return res.json({ message: "Story already viewed" });
        }

        // Add view
        story.views.push(req.user._id);
        await story.save();

        res.json({ message: "Story viewed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get poetry stories
// @route   GET /api/stories/poetry
// @access  Public
const getPoetryStories = async (req, res) => {
    try {
        // Ensure we're only getting unique stories by _id
        const stories = await Story.find({ storyType: "poetry" })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 })
            .limit(30);

        // Get unique story IDs (in case there are duplicates in the database)
        const uniqueStoryIds = [
            ...new Set(stories.map((story) => story._id.toString())),
        ];

        // Filter stories to only include unique ones
        const uniqueStories = uniqueStoryIds.map((id) =>
            stories.find((story) => story._id.toString() === id)
        );

        res.json(uniqueStories);
    } catch (error) {
        console.error("Error in getPoetryStories:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get thought stories
// @route   GET /api/stories/thoughts
// @access  Public
const getThoughtStories = async (req, res) => {
    try {
        // Ensure we're only getting unique stories by _id
        const stories = await Story.find({ storyType: "thought" })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 })
            .limit(30);

        // Get unique story IDs (in case there are duplicates in the database)
        const uniqueStoryIds = [
            ...new Set(stories.map((story) => story._id.toString())),
        ];

        // Filter stories to only include unique ones
        const uniqueStories = uniqueStoryIds.map((id) =>
            stories.find((story) => story._id.toString() === id)
        );

        res.json(uniqueStories);
    } catch (error) {
        console.error("Error in getThoughtStories:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createStory,
    getStoryById,
    getUserStories,
    getFeedStories,
    likeStory,
    unlikeStory,
    deleteStory,
    viewStory,
    getPoetryStories,
    getThoughtStories,
};
