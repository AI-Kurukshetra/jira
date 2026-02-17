ALTER TABLE issue_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "issue_sequences_read" ON issue_sequences;
DROP POLICY IF EXISTS "issue_sequences_write" ON issue_sequences;

CREATE POLICY "issue_sequences_read"
  ON issue_sequences
  FOR SELECT
  USING (is_project_member(project_id));

CREATE POLICY "issue_sequences_write"
  ON issue_sequences
  FOR ALL
  USING (is_project_member(project_id))
  WITH CHECK (is_project_member(project_id));

DROP POLICY IF EXISTS "issues_read" ON issues;

CREATE POLICY "issues_read"
  ON issues
  FOR SELECT
  USING (
    is_project_member(project_id)
    OR assignee_id = auth.uid()
    OR reporter_id = auth.uid()
  );
