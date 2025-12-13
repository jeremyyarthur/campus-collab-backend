-- -------------------------
-- USERS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample user
INSERT INTO users (name, email, password)
VALUES ('Jeremy Bradley', 'jeremy@example.com', '123456')
ON CONFLICT (email) DO NOTHING;

-- -------------------------
-- TEAMS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample team
INSERT INTO teams (name)
VALUES ('Project Team 1')
ON CONFLICT (name) DO NOTHING;

-- -------------------------
-- TEAM MEMBERS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link sample user to team
INSERT INTO team_members (team_id, user_id, role)
VALUES (1, 1, 'member')
ON CONFLICT DO NOTHING;

-- -------------------------
-- TASKS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample task
INSERT INTO tasks (team_id, assigned_to, title, description)
VALUES (1, 1, 'Finish project report', 'Complete by Friday')
ON CONFLICT DO NOTHING;
