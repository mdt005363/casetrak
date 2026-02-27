// server/db/init.js
// Run: node db/init.js
// Creates all tables for CaseTrak

require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres',
});

const schema = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════
-- USERS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  avatar        VARCHAR(10),
  role          VARCHAR(20) NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin','manager','user','viewer')),
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- CATEGORIES
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(255) UNIQUE NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- CASES
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS cases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  category    VARCHAR(255),
  priority    VARCHAR(20) NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('critical','high','medium','low')),
  status      VARCHAR(20) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','assigned','in_progress','completed','verified')),
  created_by  UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_assigned ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at DESC);

-- ══════════════════════════════════════
-- CASE COMMENTS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS case_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_case ON case_comments(case_id);

-- ══════════════════════════════════════
-- CASE ATTACHMENTS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS case_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES users(id),
  filename      VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  mime_type     VARCHAR(100),
  size_bytes    BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_case ON case_attachments(case_id);

-- ══════════════════════════════════════
-- SOPs
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS sops (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          VARCHAR(500) NOT NULL,
  category       VARCHAR(255),
  tags           TEXT[] DEFAULT '{}',
  version        VARCHAR(20) NOT NULL DEFAULT '1.0',
  estimated_time VARCHAR(100),
  tools          TEXT[] DEFAULT '{}',
  safety         TEXT[] DEFAULT '{}',
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- SOP STEPS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS sop_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id      UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  step_order  INT NOT NULL,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  UNIQUE(sop_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_sop_steps ON sop_steps(sop_id, step_order);

-- ══════════════════════════════════════
-- SOP VERSION HISTORY
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS sop_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id     UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  version    VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_sop_versions ON sop_versions(sop_id);

-- ══════════════════════════════════════
-- SOP SUGGESTIONS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS sop_suggestions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id     UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  text       TEXT NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- WIKI ARTICLES
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS wiki_articles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(500) NOT NULL,
  category   VARCHAR(255),
  tags       TEXT[] DEFAULT '{}',
  content    TEXT,
  version    VARCHAR(20) NOT NULL DEFAULT '1.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- WIKI VERSION HISTORY
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS wiki_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
  version    VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes      TEXT,
  date       DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ══════════════════════════════════════
-- WIKI SUGGESTIONS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS wiki_suggestions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id),
  text       TEXT NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- RECURRING TASKS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(500) NOT NULL,
  category    VARCHAR(255),
  priority    VARCHAR(20) NOT NULL DEFAULT 'medium',
  type        VARCHAR(20) NOT NULL CHECK (type IN ('daily','weekly','monthly','yearly','custom')),
  custom_days INT,
  assign_to   UUID REFERENCES users(id),
  next_run    DATE,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════
-- NOTIFICATIONS
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  ref_id     UUID,
  ref_type   VARCHAR(50),
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id, read, created_at DESC);

-- ══════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ══════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_sops_updated BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_wiki_updated BEFORE UPDATE ON wiki_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function init() {
  console.log('🔧 CaseTrak Database Initialization\n');

  // Create database if it doesn't exist
  try {
    const check = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [process.env.DB_NAME]
    );
    if (check.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database "${process.env.DB_NAME}" created`);
    } else {
      console.log(`✅ Database "${process.env.DB_NAME}" exists`);
    }
  } catch (err) {
    // If user doesn't have createdb permission, database must exist
    console.log(`⚠  Could not check/create database (may need to create manually): ${err.message}`);
  }
  await adminPool.end();

  // Connect to the app database and create tables
  const appPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await appPool.query(schema);
    console.log('✅ All tables created');

    // Show table count
    const res = await appPool.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log(`\n📋 Tables (${res.rows.length}):`);
    res.rows.forEach(r => console.log(`   • ${r.tablename}`));
    console.log('\n✅ Database ready! Run "npm run db:seed" to add demo data.');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
  } finally {
    await appPool.end();
  }
}

init();
