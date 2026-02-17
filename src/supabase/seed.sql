-- Seed data for ProjectHub Phase 1.
-- This script is safe to run even if no users exist (it will no-op in that case).

WITH first_profile AS (
  SELECT id
  FROM profiles
  ORDER BY created_at
  LIMIT 1
),
core_project AS (
  INSERT INTO projects (name, key, description, project_type, lead_user_id, created_by)
  SELECT
    'ProjectHub Core',
    'PROJ',
    'Core platform workstreams',
    'software',
    first_profile.id,
    first_profile.id
  FROM first_profile
  ON CONFLICT (key) DO NOTHING
  RETURNING id
),
design_project AS (
  INSERT INTO projects (name, key, description, project_type, lead_user_id, created_by)
  SELECT
    'Design System',
    'DES',
    'Design system and UX polish',
    'business',
    first_profile.id,
    first_profile.id
  FROM first_profile
  ON CONFLICT (key) DO NOTHING
  RETURNING id
),
ops_project AS (
  INSERT INTO projects (name, key, description, project_type, lead_user_id, created_by)
  SELECT
    'Ops Readiness',
    'OPS',
    'Operational readiness and tooling',
    'ops',
    first_profile.id,
    first_profile.id
  FROM first_profile
  ON CONFLICT (key) DO NOTHING
  RETURNING id
),
project_rows AS (
  SELECT id, 'PROJ' AS key FROM core_project
  UNION ALL SELECT id, 'DES' AS key FROM design_project
  UNION ALL SELECT id, 'OPS' AS key FROM ops_project
  UNION ALL SELECT id, key FROM projects WHERE key IN ('PROJ', 'DES', 'OPS')
),
member_rows AS (
  INSERT INTO project_members (project_id, user_id, role)
  SELECT project_rows.id, first_profile.id, 'project_admin'
  FROM project_rows
  JOIN first_profile ON true
  ON CONFLICT DO NOTHING
  RETURNING project_id
),
board_columns_seed AS (
  INSERT INTO board_columns (project_id, name, status, position, is_default)
  SELECT id, 'To Do', 'todo', 0, TRUE FROM project_rows
  ON CONFLICT DO NOTHING
  RETURNING id
),
board_columns_seed_2 AS (
  INSERT INTO board_columns (project_id, name, status, position, is_default)
  SELECT id, 'In Progress', 'inprogress', 1, TRUE FROM project_rows
  ON CONFLICT DO NOTHING
  RETURNING id
),
board_columns_seed_3 AS (
  INSERT INTO board_columns (project_id, name, status, position, is_default)
  SELECT id, 'Done', 'done', 2, TRUE FROM project_rows
  ON CONFLICT DO NOTHING
  RETURNING id
),
active_sprint AS (
  INSERT INTO sprints (project_id, name, goal, status, start_date, end_date, created_by)
  SELECT
    project_rows.id,
    'Sprint 12',
    'Deliver Phase 1 shell',
    'active',
    CURRENT_DATE - INTERVAL '7 day',
    CURRENT_DATE + INTERVAL '7 day',
    first_profile.id
  FROM project_rows
  JOIN first_profile ON true
  WHERE project_rows.key = 'PROJ'
  ON CONFLICT DO NOTHING
  RETURNING id
),
completed_sprint AS (
  INSERT INTO sprints (project_id, name, goal, status, start_date, end_date, completed_at, created_by)
  SELECT
    project_rows.id,
    'Sprint 11',
    'Polish dashboard baseline',
    'completed',
    CURRENT_DATE - INTERVAL '28 day',
    CURRENT_DATE - INTERVAL '14 day',
    CURRENT_DATE - INTERVAL '14 day',
    first_profile.id
  FROM project_rows
  JOIN first_profile ON true
  WHERE project_rows.key = 'PROJ'
  ON CONFLICT DO NOTHING
  RETURNING id
),
labels_seed AS (
  INSERT INTO labels (project_id, name, color_hex)
  SELECT project_rows.id, label.name, label.color
  FROM project_rows
  CROSS JOIN (
    VALUES
      ('Design', '#8B5CF6'),
      ('Frontend', '#3B82F6'),
      ('Backend', '#10B981'),
      ('Bug', '#EF4444'),
      ('Ops', '#F59E0B')
  ) AS label(name, color)
  ON CONFLICT DO NOTHING
  RETURNING id
),
issue_rows AS (
  INSERT INTO issues (project_id, sprint_id, issue_type, summary, status, priority, assignee_id, reporter_id, story_points, due_date)
  SELECT
    project_rows.id,
    active_sprint.id,
    'story',
    'Finalize onboarding flow',
    'inprogress',
    'high',
    first_profile.id,
    first_profile.id,
    5,
    CURRENT_DATE + INTERVAL '5 day'
  FROM project_rows
  JOIN active_sprint ON true
  JOIN first_profile ON true
  WHERE project_rows.key = 'PROJ'
  UNION ALL
  SELECT
    project_rows.id,
    active_sprint.id,
    'task',
    'Integrate notification preferences',
    'todo',
    'medium',
    first_profile.id,
    first_profile.id,
    3,
    CURRENT_DATE + INTERVAL '10 day'
  FROM project_rows
  JOIN active_sprint ON true
  JOIN first_profile ON true
  WHERE project_rows.key = 'PROJ'
  UNION ALL
  SELECT
    project_rows.id,
    completed_sprint.id,
    'bug',
    'Fix auth callback edge cases',
    'done',
    'high',
    first_profile.id,
    first_profile.id,
    NULL,
    CURRENT_DATE - INTERVAL '10 day'
  FROM project_rows
  JOIN completed_sprint ON true
  JOIN first_profile ON true
  WHERE project_rows.key = 'PROJ'
  UNION ALL
  SELECT
    project_rows.id,
    NULL,
    'story',
    'Design issue detail polish',
    'todo',
    'medium',
    first_profile.id,
    first_profile.id,
    8,
    CURRENT_DATE + INTERVAL '20 day'
  FROM project_rows
  JOIN first_profile ON true
  WHERE project_rows.key = 'DES'
  UNION ALL
  SELECT
    project_rows.id,
    NULL,
    'task',
    'Prepare incident response checklist',
    'inprogress',
    'low',
    first_profile.id,
    first_profile.id,
    2,
    CURRENT_DATE + INTERVAL '14 day'
  FROM project_rows
  JOIN first_profile ON true
  WHERE project_rows.key = 'OPS'
  RETURNING id, project_id
),
time_entries_seed AS (
  INSERT INTO time_entries (issue_id, user_id, work_date, minutes, description)
  SELECT issue_rows.id, first_profile.id, CURRENT_DATE - INTERVAL '1 day', 90, 'Wireframe review'
  FROM issue_rows
  JOIN first_profile ON true
  ON CONFLICT DO NOTHING
  RETURNING id
),
comments_seed AS (
  INSERT INTO comments (issue_id, author_id, body)
  SELECT issue_rows.id, first_profile.id, 'Initial notes added during planning.'
  FROM issue_rows
  JOIN first_profile ON true
  ON CONFLICT DO NOTHING
  RETURNING id
),
notifications_seed AS (
  INSERT INTO notifications (recipient_id, type, title, message)
  SELECT first_profile.id, 'seed', 'Welcome to ProjectHub', 'Your workspace is ready to explore.'
  FROM first_profile
  ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT 1;
