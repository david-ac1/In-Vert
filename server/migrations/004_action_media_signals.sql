CREATE TABLE IF NOT EXISTS action_media_signals (
  action_id TEXT PRIMARY KEY REFERENCES actions(id) ON DELETE CASCADE,
  source_kind TEXT NOT NULL,
  image_hash TEXT,
  stock_risk_score INTEGER NOT NULL DEFAULT 0,
  stock_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  exif_latitude DOUBLE PRECISION,
  exif_longitude DOUBLE PRECISION,
  exif_captured_at TIMESTAMPTZ,
  claimed_latitude DOUBLE PRECISION,
  claimed_longitude DOUBLE PRECISION,
  location_distance_km DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_media_signals_image_hash
  ON action_media_signals(image_hash);

CREATE INDEX IF NOT EXISTS idx_action_media_signals_stock_risk
  ON action_media_signals(stock_risk_score DESC);
