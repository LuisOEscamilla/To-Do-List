
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tasks: [{
        title: String,
        priority: String,
        dueDate: String,
        completed: { type: Boolean, default: false }
    }]      
});

module.exports = mongoose.model("User", userSchema);
