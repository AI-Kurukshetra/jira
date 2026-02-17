-- Seed data for ProjectHub Phase 1.
-- This script is safe to run even if no users exist (it will no-op in that case).

WITH first_profile AS (
  SELECT id
  FROM profiles
  ORDER BY created_at
  LIMIT 1
),
created_project AS (
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
project_row AS (
  SELECT id FROM created_project
  UNION ALL
  SELECT id FROM projects WHERE key = 'PROJ'
  LIMIT 1
),
member_row AS (
  INSERT INTO project_members (project_id, user_id, role)
  SELECT project_row.id, first_profile.id, 'project_admin'
  FROM project_row
  JOIN first_profile ON true
  ON CONFLICT DO NOTHING
  RETURNING project_id
),
created_sprint AS (
  INSERT INTO sprints (project_id, name, goal, status, start_date, end_date, created_by)
  SELECT
    project_row.id,
    'Sprint 12',
    'Deliver Phase 1 shell',
    'active',
    CURRENT_DATE - INTERVAL '7 day',
    CURRENT_DATE + INTERVAL '7 day',
    first_profile.id
  FROM project_row
  JOIN first_profile ON true
  ON CONFLICT DO NOTHING
  RETURNING id
),
issue_rows AS (
  INSERT INTO issues (project_id, sprint_id, issue_type, summary, status, priority, assignee_id, reporter_id, story_points)
  SELECT
    project_row.id,
    created_sprint.id,
    'story',
    'Finalize onboarding flow',
    'inprogress',
    'high',
    first_profile.id,
    first_profile.id,
    5
  FROM project_row
  JOIN created_sprint ON true
  JOIN first_profile ON true
  RETURNING id
)
SELECT 1;
