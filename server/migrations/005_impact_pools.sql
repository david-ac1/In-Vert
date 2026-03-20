CREATE TABLE IF NOT EXISTS impact_pools (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  total_actions INTEGER NOT NULL,
  total_quantity INTEGER NOT NULL,
  avg_confidence INTEGER NOT NULL,
  geo_count INTEGER NOT NULL,
  pool_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_pool_actions (
  pool_id TEXT NOT NULL REFERENCES impact_pools(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL UNIQUE REFERENCES actions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (pool_id, action_id)
);

CREATE INDEX IF NOT EXISTS idx_impact_pools_created_at ON impact_pools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_pool_actions_pool_id ON impact_pool_actions(pool_id);
