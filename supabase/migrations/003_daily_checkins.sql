-- Daily check-ins table for pre/post workout tracking
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('pre_workout', 'post_workout', 'daily_mood')),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  sleep_hours DECIMAL,
  soreness_areas TEXT[],
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  feeling_detail TEXT,
  ai_recommendation JSONB,
  post_workout_rpe INTEGER CHECK (post_workout_rpe BETWEEN 1 AND 10),
  post_workout_notes TEXT,
  could_push_harder BOOLEAN,
  feeling_stronger BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON daily_checkins(user_id);
CREATE INDEX idx_checkins_workout ON daily_checkins(workout_id);
CREATE INDEX idx_checkins_created ON daily_checkins(created_at DESC);

-- Add body focus and energy pattern columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS body_goal_area TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS energy_pattern TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sleep_quality_avg INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_training_times JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'beginner';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
