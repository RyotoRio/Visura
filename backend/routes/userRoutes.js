const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getUserByUsername,
    searchUsers,
    getSuggestedUsers,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);
router.get("/username/:username", getUserByUsername);
router.get("/search", searchUsers);
router.get("/suggested", protect, getSuggestedUsers);

module.exports = router;
