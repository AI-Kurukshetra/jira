CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_prefs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  project_type TEXT DEFAULT 'software' CHECK (project_type IN ('software', 'business', 'ops')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  lead_user_id UUID REFERENCES profiles(id),
  avatar_url TEXT,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('project_admin', 'developer', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  start_date DATE,
  end_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_hex TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  parent_issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  issue_key TEXT NOT NULL,
  issue_type TEXT NOT NULL DEFAULT 'task' CHECK (issue_type IN ('story', 'task', 'bug', 'subtask')),
  summary TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('highest', 'high', 'medium', 'low', 'lowest')),
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  story_points INTEGER CHECK (story_points >= 0 AND story_points <= 99),
  due_date DATE,
  board_order INTEGER DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, issue_key)
);

CREATE TABLE issue_sequences (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  last_number INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION generate_issue_key()
RETURNS TRIGGER AS $$
DECLARE project_key TEXT; next_num INTEGER;
BEGIN
  SELECT key INTO project_key FROM projects WHERE id = NEW.project_id;
  INSERT INTO issue_sequences (project_id, last_number) VALUES (NEW.project_id, 1)
  ON CONFLICT (project_id) DO UPDATE SET last_number = issue_sequences.last_number + 1
  RETURNING last_number INTO next_num;
  NEW.issue_key := project_key || '-' || next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_issue_key BEFORE INSERT ON issues FOR EACH ROW EXECUTE FUNCTION generate_issue_key();

CREATE TABLE issue_labels (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  uploader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE issue_watchers (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, user_id)
);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_issues_updated_at   BEFORE UPDATE ON issues   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sprints_updated_at  BEFORE UPDATE ON sprints  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX idx_issues_project_id   ON issues(project_id);
CREATE INDEX idx_issues_sprint_id    ON issues(sprint_id);
CREATE INDEX idx_issues_assignee_id  ON issues(assignee_id);
CREATE INDEX idx_issues_status       ON issues(status);
CREATE INDEX idx_issues_deleted_at   ON issues(deleted_at);
CREATE INDEX idx_activity_issue_id   ON activity_logs(issue_id);
CREATE INDEX idx_notif_recipient     ON notifications(recipient_id);
CREATE INDEX idx_pm_user_id          ON project_members(user_id);
CREATE INDEX idx_issues_fts          ON issues USING GIN(to_tsvector('english', summary));

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_watchers   ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_project_member(p_project_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM project_members WHERE project_id = p_project_id AND user_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_project_admin(p_project_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM project_members WHERE project_id = p_project_id AND user_id = auth.uid() AND role = 'project_admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "profiles_read_all"     ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "projects_read"         ON projects FOR SELECT USING (is_project_member(id) OR created_by = auth.uid());
CREATE POLICY "projects_insert"       ON projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "projects_update"       ON projects FOR UPDATE USING (is_project_admin(id));
CREATE POLICY "projects_delete"       ON projects FOR DELETE USING (is_project_admin(id));
CREATE POLICY "pm_read"               ON project_members FOR SELECT USING (is_project_member(project_id));
CREATE POLICY "pm_insert"             ON project_members FOR INSERT WITH CHECK (is_project_admin(project_id) OR user_id = auth.uid());
CREATE POLICY "pm_update"             ON project_members FOR UPDATE USING (is_project_admin(project_id));
CREATE POLICY "pm_delete"             ON project_members FOR DELETE USING (is_project_admin(project_id));
CREATE POLICY "issues_read"           ON issues FOR SELECT USING (is_project_member(project_id));
CREATE POLICY "issues_insert"         ON issues FOR INSERT WITH CHECK (is_project_member(project_id));
CREATE POLICY "issues_update"         ON issues FOR UPDATE USING (is_project_member(project_id));
CREATE POLICY "issues_delete"         ON issues FOR DELETE USING (is_project_admin(project_id));
CREATE POLICY "sprints_read"          ON sprints FOR SELECT USING (is_project_member(project_id));
CREATE POLICY "sprints_write"         ON sprints FOR ALL USING (is_project_admin(project_id));
CREATE POLICY "comments_read"         ON comments FOR SELECT USING (is_project_member((SELECT project_id FROM issues WHERE id = comments.issue_id)));
CREATE POLICY "comments_insert"       ON comments FOR INSERT WITH CHECK (is_project_member((SELECT project_id FROM issues WHERE id = comments.issue_id)));
CREATE POLICY "comments_update"       ON comments FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "comments_delete"       ON comments FOR DELETE USING (author_id = auth.uid() OR is_project_admin((SELECT project_id FROM issues WHERE id = comments.issue_id)));
CREATE POLICY "notifications_own"     ON notifications FOR ALL USING (recipient_id = auth.uid());
CREATE POLICY "activity_read"         ON activity_logs FOR SELECT USING (is_project_member((SELECT project_id FROM issues WHERE id = activity_logs.issue_id)));
CREATE POLICY "activity_insert"       ON activity_logs FOR INSERT WITH CHECK (is_project_member((SELECT project_id FROM issues WHERE id = activity_logs.issue_id)));
CREATE POLICY "labels_read"           ON labels FOR SELECT USING (is_project_member(project_id));
CREATE POLICY "labels_write"          ON labels FOR ALL USING (is_project_admin(project_id));
