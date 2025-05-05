console.log("Starting server initialization...");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const MongoStore = require("connect-mongo");

const app = express();
app.use("/login"    , express.static(path.join(__dirname, "login")));
app.use("/dashboard", express.static(path.join(__dirname, "dashboard")));
app.use("/shared"   , express.static(path.join(__dirname, "shared")));
const PORT = 3000;

// Database setup
mongoose.connect("mongodb://127.0.0.1:27017/todoapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB error:", err));

console.log("Setting up middleware...");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: "mongodb://127.0.0.1:27017/todoapp"
      })
}));

// Serve existing files
app.use(express.static("shared"));
app.use("/login", express.static("login"));
app.use("/dashboard", express.static("dashboard"));

// Add the exact routes from LoginSystem
const authRoutes = require("./routes/auth");
const friendsRoutes = require("./routes/friends");
const tasksRoutes = require("./routes/tasks");
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/tasks", tasksRoutes);

// Existing page routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "login", "index.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "dashboard", "index.html")));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});