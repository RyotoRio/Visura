// backend/routes/storyRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
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
} = require("../controllers/storyController");

router.post("/", protect, upload.single("media"), createStory);
router.get("/feed", protect, getFeedStories);
router.get("/poetry", getPoetryStories);
router.get("/thoughts", getThoughtStories);
router.get("/user/:userId", getUserStories);
router.get("/:id", getStoryById);
router.delete("/:id", protect, deleteStory);
router.post("/:id/like", protect, likeStory);
router.post("/:id/unlike", protect, unlikeStory);
router.post("/:id/view", protect, viewStory);

module.exports = router;
