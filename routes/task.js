const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/auth");

// -------------------------
// CREATE A TASK
//   Note: DB uses created_by instead of assigned_to
// -------------------------
router.post("/create", authenticateToken, async (req, res) => {
  const { team_id, title, description } = req.body;

  if (!team_id || !title) {
    return res
      .status(400)
      .json({ message: "Team and task title are required" });
  }

  try {
    const createdBy = req.user.id;
    const result = await pool.query(
      `INSERT INTO tasks (team_id, title, description, status, priority, created_by)
       VALUES ($1, $2, $3, 'Pending', 'Normal', $4) RETURNING *`,
      [team_id, title, description || null, createdBy]
    );
    res.json({ message: "Task created successfully", task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// UPDATE TASK STATUS
// -------------------------
router.put("/:task_id/status", authenticateToken, async (req, res) => {
  const { task_id } = req.params;
  const { status } = req.body; // Pending, In Progress, Completed

  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks SET status=$1, updated_at = CURRENT_TIMESTAMP
       WHERE id=$2 RETURNING *`,
      [status, task_id]
    );
    res.json({ message: "Task status updated", task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// DELETE TASK
// -------------------------
router.delete("/:task_id", authenticateToken, async (req, res) => {
  const { task_id } = req.params;

  try {
    await pool.query(`DELETE FROM tasks WHERE id=$1`, [task_id]);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------------
// LIST TASKS BY TEAM
// -------------------------
router.get("/team/:team_id", async (req, res) => {
  const { team_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.id,
              t.title,
              t.description,
              t.status,
              t.created_by,
              u.name AS created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.team_id = $1
       ORDER BY t.id ASC`,
      [team_id]
    );
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
