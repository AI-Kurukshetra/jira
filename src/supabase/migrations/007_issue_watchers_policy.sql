ALTER TABLE issue_watchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issue_watchers_read" ON issue_watchers;
DROP POLICY IF EXISTS "issue_watchers_write" ON issue_watchers;

CREATE POLICY "issue_watchers_read"
  ON issue_watchers
  FOR SELECT
  USING (is_project_member((SELECT project_id FROM issues WHERE id = issue_watchers.issue_id)));

CREATE POLICY "issue_watchers_write"
  ON issue_watchers
  FOR ALL
  USING (is_project_member((SELECT project_id FROM issues WHERE id = issue_watchers.issue_id)))
  WITH CHECK (is_project_member((SELECT project_id FROM issues WHERE id = issue_watchers.issue_id)));
