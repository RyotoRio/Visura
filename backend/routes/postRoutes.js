// backend/routes/postRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
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
} = require("../controllers/postController");

router.post("/", protect, upload.single("media"), createPost);
router.get("/feed", protect, getFeedPosts);
router.get("/explore", getExplorePosts);
router.get("/hashtag/:tag", getPostsByHashtag);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/unlike", protect, unlikePost);

module.exports = router;
