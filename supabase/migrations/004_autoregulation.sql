-- V3 Autoregulation: Volume tracking, running load tracking, enhanced check-in fields
-- Adds RP-inspired autoregulation tables and extends daily_checkins

-- ─── Volume Tracking (per muscle group per week) ────────────────────────────────
CREATE TABLE IF NOT EXISTS volume_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  mesocycle_number INTEGER NOT NULL DEFAULT 1,
  mesocycle_week INTEGER NOT NULL DEFAULT 1,
  muscle_group TEXT NOT NULL,
  prescribed_sets INTEGER NOT NULL DEFAULT 0,
  completed_sets INTEGER NOT NULL DEFAULT 0,
  avg_rir DECIMAL,
  avg_pump DECIMAL,
  avg_soreness DECIMAL,
  joint_pain_flag BOOLEAN DEFAULT FALSE,
  volume_adjustment TEXT CHECK (volume_adjustment IN ('increase', 'maintain', 'decrease', 'deload')),
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_volume_user ON volume_tracking(user_id);
CREATE INDEX idx_volume_plan_week ON volume_tracking(plan_id, week_number);
CREATE INDEX idx_volume_muscle ON volume_tracking(muscle_group);

-- ─── Running Load Tracking (weekly aggregates) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS running_load_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  total_distance_km DECIMAL NOT NULL DEFAULT 0,
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  easy_km DECIMAL NOT NULL DEFAULT 0,
  hard_km DECIMAL NOT NULL DEFAULT 0,
  easy_hard_ratio DECIMAL,
  avg_leg_fatigue DECIMAL,
  avg_rpe DECIMAL,
  niggle_areas TEXT[],
  volume_change_percent DECIMAL,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_running_load_user ON running_load_tracking(user_id);
CREATE INDEX idx_running_load_plan_week ON running_load_tracking(plan_id, week_number);

-- ─── Enhance daily_checkins with RP-inspired fields ─────────────────────────────
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS soreness_ratings JSONB;
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS post_workout_rir INTEGER CHECK (post_workout_rir BETWEEN 0 AND 5);
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS pump_ratings JSONB;
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS performance_vs_target TEXT CHECK (performance_vs_target IN ('hit_all', 'missed_some', 'fell_short', 'exceeded'));
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS joint_pain_areas TEXT[];
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS joint_pain_severity INTEGER CHECK (joint_pain_severity BETWEEN 1 AND 5);
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS leg_fatigue INTEGER CHECK (leg_fatigue BETWEEN 1 AND 5);
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS breathing_difficulty INTEGER CHECK (breathing_difficulty BETWEEN 1 AND 5);
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS pace_felt TEXT CHECK (pace_felt IN ('too_easy', 'right', 'slightly_hard', 'too_hard', 'impossible'));
ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS energy_post_session INTEGER CHECK (energy_post_session BETWEEN 1 AND 5);
