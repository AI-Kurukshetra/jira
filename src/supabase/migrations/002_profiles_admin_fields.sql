ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'developer' CHECK (role IN ('system_admin', 'project_admin', 'developer', 'viewer')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);
