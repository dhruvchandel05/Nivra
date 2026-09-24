-- CampusConnect database schema (Postgres / Neon)
-- Safe to re-run: every statement is guarded with IF NOT EXISTS where the
-- Postgres syntax allows it, so scripts/migrate.js can be executed idempotently.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(160) UNIQUE,
  password_hash TEXT,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  registration_date TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS college_information (
  id SERIAL PRIMARY KEY,
  category VARCHAR(80),
  question TEXT,
  answer TEXT,
  keywords TEXT DEFAULT '',
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question TEXT,
  bot_response TEXT,
  confidence_score NUMERIC(4, 3),
  source VARCHAR(20) CHECK (source IN ('kb', 'llm')),
  matched_info_id INTEGER REFERENCES college_information(id),
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS unanswered_questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  question TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Trigram GIN indexes for fuzzy keyword/question matching.
CREATE INDEX IF NOT EXISTS idx_college_information_question_trgm
  ON college_information USING gin (question gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_college_information_keywords_trgm
  ON college_information USING gin (keywords gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_college_information_category
  ON college_information (category);
