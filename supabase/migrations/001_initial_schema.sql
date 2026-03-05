-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Riddles table
CREATE TABLE riddles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  answer text,
  is_active boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  answer_revealed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Submissions table
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  riddle_id uuid REFERENCES riddles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  is_correct boolean,
  time_taken_seconds integer,
  UNIQUE(riddle_id, user_id)
);

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  COUNT(*) FILTER (WHERE s.is_correct = true) AS correct_count,
  COALESCE(SUM(s.time_taken_seconds) FILTER (WHERE s.is_correct = true), 0) AS total_time_seconds
FROM profiles p
LEFT JOIN submissions s ON s.user_id = p.id
WHERE p.is_admin = false
GROUP BY p.id, p.username
ORDER BY correct_count DESC, total_time_seconds ASC;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Riddles RLS
CREATE POLICY "riddles_select" ON riddles FOR SELECT TO authenticated USING (true);
CREATE POLICY "riddles_insert_admin" ON riddles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "riddles_update_admin" ON riddles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Submissions RLS
CREATE POLICY "submissions_select_own" ON submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "submissions_insert_auth" ON submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions_update_admin" ON submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Storage bucket for riddle images
INSERT INTO storage.buckets (id, name, public) VALUES ('riddle-images', 'riddle-images', true);

-- Storage RLS
CREATE POLICY "storage_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'riddle-images');
CREATE POLICY "storage_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'riddle-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
