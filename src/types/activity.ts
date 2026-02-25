export type ActivitySource = 'app' | 'apple_health' | 'garmin' | 'strava';

export interface Split {
  km: number;
  pace_min_km: number;
  heart_rate_avg?: number;
  elevation_change_m?: number;
}

export interface CompletedExercise {
  name: string;
  sets: CompletedSet[];
}

export interface CompletedSet {
  set_number: number;
  reps: number;
  weight_kg: number | null;
  rpe?: number;
  completed: boolean;
}

export interface Activity {
  id: string;
  user_id: string;
  workout_id: string | null;
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  // Running
  distance_km: number | null;
  avg_pace_min_km: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  elevation_gain_m: number | null;
  splits: Split[] | null;
  route_polyline: string | null;
  // Strength
  exercises_completed: CompletedExercise[] | null;
  // Source
  source: ActivitySource;
  external_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface WeeklyStats {
  week_start: string;
  total_distance_km: number;
  total_duration_minutes: number;
  workouts_completed: number;
  workouts_planned: number;
  avg_pace_min_km: number | null;
  total_volume_kg: number | null;
}
