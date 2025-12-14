const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// Middleware
// app.use(cors());
app.use(cors({
  origin:"*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend from project root (index.html, task.html, etc.)
// app.use(express.static(path.join(__dirname, '..','examination')));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      auth: req.headers.authorization
    });
    next();
  });
// ----------------------------
// ROUTES: Declare first
// ----------------------------
const authRoutes = require("./routes/auth");
const teamsRoutes = require("./routes/teams");
const taskRoutes = require("./routes/task");

// ----------------------------
// ROUTES: Use them after declaration
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/task", taskRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

