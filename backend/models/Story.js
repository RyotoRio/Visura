// backend/models/Story.js
const mongoose = require("mongoose");

const storySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        content: {
            type: String,
            required: true,
        },
        mediaUrl: {
            type: String,
        },
        mediaType: {
            type: String,
            enum: ["image", "video", "text"],
            default: "text",
        },
        storyType: {
            type: String,
            enum: ["ephemeral", "poetry", "thought"],
            required: true,
        },
        expireAt: {
            type: Date,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        hashtags: [
            {
                type: String,
            },
        ],
        views: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Middleware to set expiration date for ephemeral stories
storySchema.pre("save", function (next) {
    if (this.storyType === "ephemeral" && !this.expireAt) {
        // Set expiration date to 24 hours from now
        this.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    next();
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
