import { supabase } from './api';
import type { Goal, UserStats } from '@/types/plan';
import type { User } from '@/types/user';
import type { Workout } from '@/types/workout';

export interface GeneratePlanRequest {
  user: Pick<User, 'date_of_birth' | 'gender' | 'height_cm' | 'weight_kg' | 'unit_preference'>;
  goal: Goal;
  stats: UserStats;
}

export interface GeneratePlanResponse {
  plan_name: string;
  description: string;
  total_weeks: number;
  philosophy: string;
  key_sessions: string[];
  progression_notes: string;
  weeks: GeneratedWeek[];
}

export interface GeneratedWeek {
  week_number: number;
  theme: string;
  total_distance_km?: number;
  total_volume?: string;
  notes: string;
  workouts: GeneratedWorkout[];
}

export interface GeneratedWorkout {
  day_of_week: number;
  workout_type: string;
  title: string;
  description: string;
  workout_data: Record<string, unknown>;
  estimated_duration_minutes: number;
}

/**
 * Call the Supabase Edge Function to generate a training plan using Claude AI.
 */
export async function generatePlan(request: GeneratePlanRequest): Promise<GeneratePlanResponse> {
  const { data, error } = await supabase.functions.invoke('generate-plan', {
    body: request,
  });

  if (error) {
    throw new Error(`Failed to generate plan: ${error.message}`);
  }

  // Edge function 500 responses may arrive in data with an error field
  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.weeks) {
    throw new Error('Invalid plan response: missing weeks data');
  }

  return data as GeneratePlanResponse;
}

/**
 * Adapt an existing plan based on recent performance.
 */
export async function adaptPlan(
  planId: string,
  recentActivities: Array<{
    workout_id: string;
    actual_pace?: number;
    target_pace?: number;
    completed: boolean;
    rpe?: number;
  }>,
): Promise<{ adjustments: string; updated_workouts: Partial<Workout>[] }> {
  const { data, error } = await supabase.functions.invoke('adapt-plan', {
    body: { plan_id: planId, recent_activities: recentActivities },
  });

  if (error) {
    throw new Error(`Failed to adapt plan: ${error.message}`);
  }

  return data;
}

/**
 * Handle a missed workout by realigning the plan.
 */
export async function realignPlan(
  planId: string,
  missedWorkoutId: string,
): Promise<{ message: string; updated_workouts: Partial<Workout>[] }> {
  const { data, error } = await supabase.functions.invoke('adapt-plan', {
    body: {
      plan_id: planId,
      action: 'realign',
      missed_workout_id: missedWorkoutId,
    },
  });

  if (error) {
    throw new Error(`Failed to realign plan: ${error.message}`);
  }

  return data;
}
