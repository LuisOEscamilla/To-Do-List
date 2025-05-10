const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tasks: [{
        title: String,
        priority: String,
        dueDate: String,
        completed: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model("Group", groupSchema);
