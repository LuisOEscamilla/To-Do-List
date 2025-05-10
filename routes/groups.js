const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const User = require("../models/User");

// Create a new group
router.post("/create", async (req, res) => {
    const userId = req.session.userId;
    const { name, friendIds } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const members = [userId, ...friendIds];
        const group = new Group({ name, members });
        await group.save();
        res.json({ message: "Group created", group });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating group" });
    }
});

// Add a task to a group
router.post("/add-task", async (req, res) => {
    const { groupId, task } = req.body;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const group = await Group.findById(groupId);
        if (!group.members.includes(userId)) {
            return res.status(403).json({ message: "Not a group member" });
        }

        // Fix date formatting
        task.dueDate = new Date(task.dueDate).toISOString().split("T")[0];

        group.tasks.push(task);
        await group.save();

        res.json({ message: "Task added", task });
    } catch (err) {
        res.status(500).json({ message: "Error adding task" });
    }
});


// List groups user belongs to
router.get("/list", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const groups = await Group.find({ members: userId });
        res.json({ groups });
    } catch (err) {
        res.status(500).json({ message: "Error fetching groups" });
    }
});

// Mark a task complete in a group
router.put("/complete-task", async (req, res) => {
    const userId = req.session.userId;
    const { groupId, title, dueDate } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const task = group.tasks.find(t => t.title === title && t.dueDate === dueDate);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.completed = true;
        await group.save();

        res.json({ message: "Task marked complete" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error completing task" });
    }
});

module.exports = router;