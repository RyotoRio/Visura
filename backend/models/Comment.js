// backend/models/Comment.js
const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        story: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Story",
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        replies: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: "User",
                },
                text: {
                    type: String,
                    required: true,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                likes: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
