ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issue_labels_read" ON issue_labels;
DROP POLICY IF EXISTS "issue_labels_write" ON issue_labels;

CREATE POLICY "issue_labels_read"
  ON issue_labels
  FOR SELECT
  USING (is_project_member((SELECT project_id FROM issues WHERE id = issue_labels.issue_id)));

CREATE POLICY "issue_labels_write"
  ON issue_labels
  FOR ALL
  USING (is_project_admin((SELECT project_id FROM issues WHERE id = issue_labels.issue_id)))
  WITH CHECK (is_project_admin((SELECT project_id FROM issues WHERE id = issue_labels.issue_id)));
