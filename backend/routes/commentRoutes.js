// backend/routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createComment,
    getPostComments,
    getStoryComments,
    deleteComment,
    likeComment,
    unlikeComment,
    createReply,
} = require("../controllers/commentController");

router.post("/post/:postId", protect, createComment);
router.post("/story/:storyId", protect, createComment);
router.get("/post/:postId", getPostComments);
router.get("/story/:storyId", getStoryComments);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);
router.post("/:id/unlike", protect, unlikeComment);
router.post("/:id/reply", protect, createReply);

module.exports = router;
