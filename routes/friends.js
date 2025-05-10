const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/add", async (req, res) => {
    const { friendUsername } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const friend = await User.findOne({ username: friendUsername });
        if (!friend) return res.status(404).json({ message: "Friend not found" });

        const user = await User.findById(userId);

        // Prevent duplicate
        if (user.friends.includes(friend._id)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Add each other
        user.friends.push(friend._id);
        friend.friends.push(user._id);

        await user.save();
        await friend.save();

        res.json({ message: "Friend added" });
    } catch (err) {
        res.status(500).json({ message: "Error adding friend" });
    }
});

router.get("/list", async (req, res) => {
    console.log("Getting friend list for:", req.session.userId);
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const user = await User.findById(userId).populate("friends", "username");
        res.json({ friends: user.friends });
    } catch (err) {
        res.status(500).json({ message: "Error fetching friends" });
    }
});

router.get("/search", async (req, res) => {
    const userId = req.session.userId;
    const query = req.query.query;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const users = await User.find({
            username: { $regex: query, $options: "i" },
            _id: { $ne: userId }
        }).select("username");

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Search failed" });
    }
});

module.exports = router;