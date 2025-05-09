// backend/controllers/commentController.js
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Story = require("../models/Story");

// @desc    Create a new comment on a post
// @route   POST /api/comments/post/:postId
// @access  Private
const createComment = async (req, res) => {
    try {
        const { text } = req.body;

        // Create comment
        const comment = new Comment({
            user: req.user._id,
            text,
        });

        // Check if comment is for a post or story
        if (req.params.postId) {
            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            comment.post = req.params.postId;

            // Save comment
            const savedComment = await comment.save();

            // Add comment to post
            post.comments.push(savedComment._id);
            await post.save();
        } else if (req.params.storyId) {
            const story = await Story.findById(req.params.storyId);

            if (!story) {
                return res.status(404).json({ message: "Story not found" });
            }

            comment.story = req.params.storyId;

            // Save comment
            const savedComment = await comment.save();

            // Add comment to story
            story.comments.push(savedComment._id);
            await story.save();
        } else {
            return res
                .status(400)
                .json({ message: "Post ID or Story ID is required" });
        }

        // Populate user data
        const populatedComment = await Comment.findById(comment._id).populate(
            "user",
            "username profilePicture"
        );

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a story
// @route   GET /api/comments/story/:storyId
// @access  Public
const getStoryComments = async (req, res) => {
    try {
        const comments = await Comment.find({ story: req.params.storyId })
            .populate("user", "username profilePicture")
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check user authorization
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        // Remove comment from post or story
        if (comment.post) {
            await Post.findByIdAndUpdate(comment.post, {
                $pull: { comments: req.params.id },
            });
        } else if (comment.story) {
            await Story.findByIdAndUpdate(comment.story, {
                $pull: { comments: req.params.id },
            });
        }

        // Delete comment
        await comment.remove();

        res.json({ message: "Comment removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if comment is already liked
        if (comment.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Comment already liked" });
        }

        // Add like
        comment.likes.push(req.user._id);
        await comment.save();

        res.json({ message: "Comment liked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlike a comment
// @route   POST /api/comments/:id/unlike
// @access  Private
const unlikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if comment is not liked
        if (!comment.likes.includes(req.user._id)) {
            return res.status(400).json({ message: "Comment not liked yet" });
        }

        // Remove like
        comment.likes = comment.likes.filter(
            (like) => like.toString() !== req.user._id.toString()
        );
        await comment.save();

        res.json({ message: "Comment unliked successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
const createReply = async (req, res) => {
    try {
        const { text } = req.body;

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Create reply
        const reply = {
            user: req.user._id,
            text,
            createdAt: Date.now(),
        };

        // Add reply to comment
        comment.replies.push(reply);
        await comment.save();

        // Populate user data
        const populatedComment = await Comment.findById(comment._id)
            .populate("user", "username profilePicture")
            .populate("replies.user", "username profilePicture");

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createComment,
    getPostComments,
    getStoryComments,
    deleteComment,
    likeComment,
    unlikeComment,
    createReply,
};
