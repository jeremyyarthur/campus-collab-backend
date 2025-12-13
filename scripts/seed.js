// scripts/seed.js
require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // create tables if not exist by running schema (optional)
    const schema = require('fs').readFileSync(__dirname + '/../schema.sql', 'utf8');
    await db.query(schema);

    const pw = await bcrypt.hash('Password123', 10);
    const adminPw = await bcrypt.hash('AdminPass123', 10);

    // Upsert users
    await db.query('INSERT INTO users (name,email,password_hash,is_admin) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING', ['Test Student', 'teststudent@example.com', pw, false]);
    await db.query('INSERT INTO users (name,email,password_hash,is_admin) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING', ['Alice Example', 'alice@example.com', pw, false]);
    await db.query('INSERT INTO users (name,email,password_hash,is_admin) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING', ['Admin User', 'admin@example.com', adminPw, true]);

    // create team
    const t = await db.query('INSERT INTO teams (name, description, created_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *', ['Web Dev Group', 'Group for CS3139 project', 1]);
    // ensure team id exists
    const teamIdRow = await db.query('SELECT id FROM teams WHERE name=$1', ['Web Dev Group']);
    const teamId = teamIdRow.rows[0].id;

    // add members
    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [teamId, 1, 'owner']);
    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [teamId, 2, 'member']);

    // create sample tasks
    await db.query(`INSERT INTO tasks (team_id, title, description, status, priority, created_by) VALUES
      ($1,$2,$3,'Pending','Normal',1),
      ($1,$4,$5,'In Progress','High',2),
      ($1,$6,$7,'Completed','Low',1)
    ON CONFLICT DO NOTHING`,
    [teamId,
     'Set up repo','Initialize GitHub repo and create branches',
     'Build UI','Create the starter HTML/CSS/JS',
     'Write README','Prepare README and deployment notes'
    ]);

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
