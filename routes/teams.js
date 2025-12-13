const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

// -------------------------
// LIST ALL TEAMS
// -------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, created_at FROM teams ORDER BY id ASC"
    );
    res.json({ teams: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// CREATE A NEW TEAM
// -------------------------
router.post("/create", authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Team name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO teams (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json({ message: "Team created successfully", team: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// JOIN A TEAM
// -------------------------
router.post("/join", authenticateToken, async (req, res) => {
  const { team_id, role } = req.body;
  const user_id = req.user.id;

  if (!team_id) {
    return res.status(400).json({ message: "Team ID is required" });
  }

  try {
    // Check if already a member
    const check = await pool.query(
      "SELECT * FROM team_members WHERE team_id=$1 AND user_id=$2",
      [team_id, user_id]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "User already in team" });
    }

    const result = await pool.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *",
      [team_id, user_id, role || "member"]
    );
    res.json({
      message: "Joined team successfully",
      membership: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// LIST TEAM MEMBERS
// -------------------------
router.get("/:team_id/members", async (req, res) => {
  const { team_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, tm.role
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1`,
      [team_id]
    );
    res.json({ members: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// TEAM DASHBOARD SUMMARY
// -------------------------
router.get("/:team_id/dashboard", async (req, res) => {
  const { team_id } = req.params;

  try {
    // Get all members of the team
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1`,
      [team_id]
    );

    // Get tasks and counts by status
    const tasksResult = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM tasks
       WHERE team_id = $1
       GROUP BY status`,
      [team_id]
    );

    // Total tasks
    const totalTasksResult = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE team_id = $1`,
      [team_id]
    );

    res.json({
      members: membersResult.rows,
      tasksByStatus: tasksResult.rows,
      totalTasks: parseInt(totalTasksResult.rows[0].total, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
