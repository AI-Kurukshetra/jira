CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  minutes INTEGER NOT NULL CHECK (minutes > 0 AND minutes <= 1440),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_issue ON time_entries(issue_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "time_entries_read" ON time_entries;
DROP POLICY IF EXISTS "time_entries_write" ON time_entries;

CREATE POLICY "time_entries_read"
  ON time_entries
  FOR SELECT
  USING (is_project_member((SELECT project_id FROM issues WHERE id = time_entries.issue_id)));

CREATE POLICY "time_entries_write"
  ON time_entries
  FOR ALL
  USING (is_project_member((SELECT project_id FROM issues WHERE id = time_entries.issue_id)))
  WITH CHECK (is_project_member((SELECT project_id FROM issues WHERE id = time_entries.issue_id)));

CREATE TRIGGER trg_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
