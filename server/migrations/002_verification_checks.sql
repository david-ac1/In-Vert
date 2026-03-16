CREATE TABLE IF NOT EXISTS verification_checks (
  id TEXT PRIMARY KEY,
  verification_id TEXT NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  check_name TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  score INTEGER NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_checks_verification_id
  ON verification_checks(verification_id);

CREATE INDEX IF NOT EXISTS idx_verification_checks_created_at
  ON verification_checks(created_at DESC);
