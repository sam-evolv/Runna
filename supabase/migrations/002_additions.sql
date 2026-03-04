-- Add HYROX and expanded goal support
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_category TEXT;

-- Coach chat messages table
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'coach')),
  content TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_user ON coach_messages(user_id, created_at DESC);

-- Personal records table
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('weight', 'time', 'distance', 'reps')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  workout_id UUID REFERENCES workouts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id, achieved_at DESC);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  notifications_enabled BOOLEAN DEFAULT true,
  audio_cues_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
