-- Add metadata JSONB column to store LP qualification answers
ALTER TABLE internal_leads
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Index for querying by source-specific metadata (e.g. specialty, timeline)
CREATE INDEX IF NOT EXISTS internal_leads_metadata_gin
  ON internal_leads USING gin(metadata);
