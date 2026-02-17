CREATE TABLE IF NOT EXISTS board_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'inprogress', 'done')),
  position INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_columns_project ON board_columns(project_id);

ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_columns_read" ON board_columns;
DROP POLICY IF EXISTS "board_columns_write" ON board_columns;

CREATE POLICY "board_columns_read"
  ON board_columns
  FOR SELECT
  USING (is_project_member(project_id));

CREATE POLICY "board_columns_write"
  ON board_columns
  FOR ALL
  USING (is_project_admin(project_id))
  WITH CHECK (is_project_admin(project_id));

ALTER TABLE issues
  ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES board_columns(id) ON DELETE SET NULL;

-- Seed default columns for existing projects if missing
INSERT INTO board_columns (project_id, name, status, position, is_default)
SELECT p.id, 'To Do', 'todo', 0, TRUE
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM board_columns c WHERE c.project_id = p.id
);

INSERT INTO board_columns (project_id, name, status, position, is_default)
SELECT p.id, 'In Progress', 'inprogress', 1, TRUE
FROM projects p
WHERE (
  SELECT COUNT(*) FROM board_columns c WHERE c.project_id = p.id
) = 1;

INSERT INTO board_columns (project_id, name, status, position, is_default)
SELECT p.id, 'Done', 'done', 2, TRUE
FROM projects p
WHERE (
  SELECT COUNT(*) FROM board_columns c WHERE c.project_id = p.id
) = 2;

-- Backfill column_id for existing issues based on status
UPDATE issues
SET column_id = (
  SELECT c.id
  FROM board_columns c
  WHERE c.project_id = issues.project_id
    AND c.status = issues.status
  ORDER BY c.position ASC
  LIMIT 1
)
WHERE column_id IS NULL;

CREATE TRIGGER trg_board_columns_updated_at BEFORE UPDATE ON board_columns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
