export type WorkoutType =
  | 'easy_run'
  | 'tempo_run'
  | 'interval_run'
  | 'long_run'
  | 'recovery_run'
  | 'fartlek'
  | 'hill_run'
  | 'race_pace'
  | 'strength'
  | 'mobility'
  | 'swim'
  | 'bike'
  | 'rest';

export type WorkoutStatus = 'scheduled' | 'completed' | 'skipped' | 'modified';

export interface Workout {
  id: string;
  plan_id: string;
  user_id: string;
  week_number: number;
  day_of_week: number;
  scheduled_date: string;
  workout_type: WorkoutType;
  title: string;
  description: string | null;
  workout_data: RunningWorkoutData | StrengthWorkoutData;
  estimated_duration_minutes: number;
  status: WorkoutStatus;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

// Running workout types
export type RunSegmentType = 'warmup' | 'interval' | 'recovery' | 'steady' | 'tempo' | 'cooldown' | 'easy';

export interface RunSegment {
  type: RunSegmentType;
  distance_km: number;
  target_pace_min_km: number;
  description: string;
}

export interface RunningWorkoutData {
  type: 'easy_run' | 'tempo_run' | 'interval_run' | 'long_run' | 'recovery_run' | 'fartlek' | 'hill_run' | 'race_pace';
  total_distance_km: number;
  segments: RunSegment[];
  notes: string;
}

// Strength workout types
export type SetType = 'warmup' | 'working' | 'drop' | 'amrap' | 'failure';

export interface ExerciseSet {
  set_number: number;
  reps: number | string; // string for "AMRAP" or "8-12"
  weight_kg: number | null;
  type: SetType;
  rest_seconds: number;
  rpe?: number;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
  notes?: string;
  superset_with?: string;
}

export interface StrengthWorkoutData {
  type: 'strength';
  focus: string;
  exercises: Exercise[];
  estimated_duration_minutes: number;
  notes: string;
}

// Type guard
export function isRunningWorkout(data: RunningWorkoutData | StrengthWorkoutData): data is RunningWorkoutData {
  return data.type !== 'strength';
}

export function isStrengthWorkout(data: RunningWorkoutData | StrengthWorkoutData): data is StrengthWorkoutData {
  return data.type === 'strength';
}
