const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Middleware to ensure user is logged in
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}

router.get("/", requireLogin, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.json({ tasks: user.tasks || [] });
});

router.post("/", requireLogin, async (req, res) => {
    const { title, priority, dueDate } = req.body;
    const user = await User.findById(req.session.userId);
    user.tasks.push({ title, priority, dueDate });
    await user.save();
    res.json({ message: "Task saved" });
});

router.put("/complete", requireLogin, async (req, res) => {
    const { title, dueDate } = req.body;

    const user = await User.findById(req.session.userId);
    const task = user.tasks.find(t => t.title === title && t.dueDate === dueDate);

    if (task) {
        task.completed = true;
        await user.save();
        return res.json({ message: "Task marked complete" });
    }

    res.status(404).json({ message: "Task not found" });
});

module.exports = router;
