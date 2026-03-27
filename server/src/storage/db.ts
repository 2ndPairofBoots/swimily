import { Pool, type QueryResult, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // eslint-disable-next-line no-console
  console.warn('DATABASE_URL is not set; create server/.env from server/.env.example to enable DB-backed endpoints.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
  connectionTimeoutMillis: 20_000,
  idleTimeoutMillis: 30_000,
});

const TRANSIENT_DB_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; cause?: { code?: string } };
  if (e.code && TRANSIENT_DB_CODES.has(e.code)) return true;
  if (e.cause?.code && TRANSIENT_DB_CODES.has(e.cause.code)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries transient TCP/SSL drops (common with VPNs + hosted Postgres). */
export async function queryWithRetry<R extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[],
  options?: { retries?: number }
): Promise<QueryResult<R>> {
  const maxAttempts = options?.retries ?? 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (values === undefined) {
        return await pool.query<R>(text);
      }
      return await pool.query<R>(text, values);
    } catch (err) {
      lastErr = err;
      if (!isTransientDbError(err) || attempt === maxAttempts) {
        throw err;
      }
      const delayMs = Math.min(200 * 2 ** (attempt - 1), 2000);
      // eslint-disable-next-line no-console
      console.warn(`[db] transient error (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms`, err);
      await sleep(delayMs);
    }
  }
  throw lastErr;
}

export const SCHEMA_SQL = `
  -- Neon typically allows pgcrypto; uuid-ossp may be blocked.
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_premium BOOLEAN DEFAULT FALSE,

    -- Onboarding fields
    team VARCHAR(255),
    gender VARCHAR(1),
    age INTEGER,
    birthday DATE
  );

  -- Backfill for existing databases created before gender existed.
  ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(1);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;

  -- Password reset tokens (store hashed token only)
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    refresh_token_sha256 TEXT,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Backfill for existing databases created before refresh_token_sha256 existed.
  ALTER TABLE sessions ADD COLUMN IF NOT EXISTS refresh_token_sha256 TEXT;
  CREATE INDEX IF NOT EXISTS sessions_refresh_token_sha256_idx ON sessions (refresh_token_sha256);

  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferred_course VARCHAR(10) NOT NULL,
    preferred_courses TEXT[],
    units VARCHAR(20) NOT NULL,
    haptics BOOLEAN NOT NULL DEFAULT true,
    analytics BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_courses TEXT[];
  UPDATE user_preferences
  SET preferred_courses = ARRAY[preferred_course]
  WHERE preferred_courses IS NULL OR cardinality(preferred_courses) = 0;

  CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    push_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    practice_reminders BOOLEAN NOT NULL DEFAULT true,
    achievements BOOLEAN NOT NULL DEFAULT true,
    weekly_reports BOOLEAN NOT NULL DEFAULT true,
    meet_reminders BOOLEAN NOT NULL DEFAULT true,
    pr_alerts BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE user_notification_settings ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;
  UPDATE user_notification_settings
  SET notifications_enabled = true
  WHERE notifications_enabled IS NULL;

  -- Practices + sets
  CREATE TABLE IF NOT EXISTS practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_yards INTEGER NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL,
    course VARCHAR(10) NOT NULL DEFAULT 'SCY',
    focus VARCHAR(50),
    intensity VARCHAR(20),
    notes TEXT,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS practice_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    set_order INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    interval VARCHAR(20),
    stroke VARCHAR(50),
    effort VARCHAR(20),
    notes TEXT
  );

  -- Personal records (time + goal)
  CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event VARCHAR(50) NOT NULL,
    course VARCHAR(10) NOT NULL,
    time_seconds DECIMAL(10, 2),
    goal_time_seconds DECIMAL(10, 2),
    fina_points INTEGER,
    cuts TEXT[],
    meet_name VARCHAR(255),
    meet_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event, course)
  );

  -- Meets
  CREATE TABLE IF NOT EXISTS meets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    meet_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Dryland logs
  CREATE TABLE IF NOT EXISTS dryland_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_type VARCHAR(20) NOT NULL,
    exercises TEXT[] NOT NULL,
    duration INTEGER NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- AI workouts + OCR scans (minimal MVP tables)
  CREATE TABLE IF NOT EXISTS ai_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_type TEXT NOT NULL,
    focus TEXT,
    duration_minutes INTEGER NOT NULL,
    total_yards INTEGER DEFAULT 0,
    sets_json JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ocr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_hash TEXT NOT NULL,
    storage_path TEXT,
    result_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, image_hash)
  );
`;

let initialized = false;

export async function initDb() {
  if (initialized) return;
  if (!connectionString) return;
  await queryWithRetry(SCHEMA_SQL, undefined, { retries: 5 });
  initialized = true;
}

export { pool };

