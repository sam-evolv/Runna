export type GoalType = 'running' | 'strength' | 'triathlon' | 'general_fitness' | 'hyrox' | 'endurance';

export type GoalSubtype =
  | 'marathon'
  | 'half_marathon'
  | '10k'
  | '5k'
  | 'couch_to_5k'
  | 'ultra'
  | 'bench_press'
  | 'squat'
  | 'deadlift'
  | 'general_hypertrophy'
  | 'powerlifting'
  | 'ironman'
  | 'half_ironman'
  | 'olympic_tri'
  | 'sprint_tri'
  | 'weight_loss'
  | 'flexibility'
  | 'general_fitness'
  | 'hyrox_singles'
  | 'hyrox_doubles'
  | 'hyrox_pro'
  | 'hyrox_fitness'
  | 'speed_training'
  | 'beginner_strength'
  | 'athletic_performance'
  | 'swim'
  | 'cycling';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type PlanStatus = 'active' | 'completed' | 'paused' | 'abandoned';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  goal_subtype: GoalSubtype | null;
  target_value: string | null;
  target_event: string | null;
  target_date: string | null;
  current_level: FitnessLevel;
  available_days: number[];
  preferred_long_session_day: number | null;
  status: GoalStatus;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  goal_id: string;
  // Running stats
  recent_5k_time: string | null;
  recent_10k_time: string | null;
  recent_half_time: string | null;
  recent_marathon_time: string | null;
  weekly_mileage_km: number | null;
  max_heart_rate: number | null;
  resting_heart_rate: number | null;
  // Strength stats
  bench_press_1rm: number | null;
  squat_1rm: number | null;
  deadlift_1rm: number | null;
  overhead_press_1rm: number | null;
  // General
  injury_history: string | null;
  equipment_available: string[] | null;
  gym_access: boolean;
  gym_limitations: string | null;
  physique_goal: string | null;
  body_fat_estimate: number | null;
  notes: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  goal_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  total_weeks: number;
  current_week: number;
  plan_data: PlanData;
  status: PlanStatus;
  ai_model: string | null;
  ai_prompt_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanData {
  weeks: PlanWeek[];
  philosophy: string;
  key_sessions: string[];
  progression_notes: string;
}

export interface PlanWeek {
  week_number: number;
  theme: string;
  total_distance_km?: number;
  total_volume?: string;
  notes: string;
}
