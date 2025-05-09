// backend/controllers/postController.js
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { caption, location } = req.body;
        let mediaUrl;
        let mediaType;

        // Check if media file exists
        if (!req.file && !req.body.mediaUrl) {
            return res
                .status(400)
                .json({ message: "Please upload an image or video" });
        }

        // Upload to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "visage_posts",
                resource_type: "auto",
            });
            mediaUrl = result.secure_url;
            mediaType = result.resource_type === "video" ? "video" : "image";
        } else if (req.body.mediaUrl) {
            // Handle base64 encoded images
            const result = await cloudinary.uploader.upload(req.body.mediaUrl, {
                folder: "visage_posts",
            });
            mediaUrl = result.secure_url;
            mediaType = "image";
        }

        // Extract hashtags from caption
        const hashtagsRegex = /#[a-zA-Z0-9_]+/g;
        const hashtags = caption ? caption.match(hashtagsRegex) || [] : [];

        // Create post
        const post = await Post.create({
            user: req.user._id,
            caption,
            mediaUrl,
            mediaType,
            location,
            hashtags: hashtags.map((tag) => tag.toLowerCase()),
        });

        const populatedPost = await Post.findById(post._id).populate(
            "user",
            "username profilePicture"
        );

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "username profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profilePicture",
                },
            });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all posts for a user
// @route   GET /api/posts/user/:userId
// @access  Public
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get posts for user's feed
// @route   GET /api/posts/feed
// @access  Private
const getFeedPosts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        // Get posts from users that the current user follows and their own posts
        const posts = await Post.find({
            $or: [
                { user: { $in: currentUser.following } },
                { user: req.user._id },
            ],
        })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if post is already liked
        if (post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Post already liked" });
        }

        // Add like
        post.likes.push(req.user._id);
        await post.save();

        res.json({ message: "Post liked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlike a post
// @route   POST /api/posts/:id/unlike
// @access  Private
const unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if post is not liked
        if (!post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Post not liked yet" });
        }

        // Remove like
        post.likes = post.likes.filter(
            (like) => like.toString() !== req.user._id.toString()
        );
        await post.save();

        res.json({ message: "Post unliked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check user authorization
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        // Delete image from Cloudinary
        const publicId = post.mediaUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`visage_posts/${publicId}`);

        // Delete post
        await post.remove();

        res.json({ message: "Post removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
    try {
        const { caption, location } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check user authorization
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        // Extract hashtags from caption
        const hashtagsRegex = /#[a-zA-Z0-9_]+/g;
        const hashtags = caption ? caption.match(hashtagsRegex) || [] : [];

        // Update post
        post.caption = caption || post.caption;
        post.location = location !== undefined ? location : post.location;
        post.hashtags = hashtags.map((tag) => tag.toLowerCase());

        const updatedPost = await post.save();

        const populatedPost = await Post.findById(updatedPost._id).populate(
            "user",
            "username profilePicture"
        );

        res.json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get posts by hashtag
// @route   GET /api/posts/hashtag/:tag
// @access  Public
const getPostsByHashtag = async (req, res) => {
    try {
        const hashtag = `#${req.params.tag.toLowerCase()}`;

        const posts = await Post.find({ hashtags: hashtag })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get explore posts (popular posts)
// @route   GET /api/posts/explore
// @access  Public
const getExplorePosts = async (req, res) => {
    try {
        // Get posts with most likes and comments
        const posts = await Post.aggregate([
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    engagementScore: {
                        $add: [
                            { $size: "$likes" },
                            { $multiply: [{ $size: "$comments" }, 2] },
                        ],
                    },
                },
            },
            { $sort: { engagementScore: -1 } },
            { $limit: 30 },
        ]);

        // Populate user data
        await Post.populate(posts, {
            path: "user",
            select: "username profilePicture",
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getPostById,
    getUserPosts,
    getFeedPosts,
    likePost,
    unlikePost,
    deletePost,
    updatePost,
    getPostsByHashtag,
    getExplorePosts,
};
