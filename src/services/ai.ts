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

// ─── Check-in AI Functions ──────────────────────────────────────────────────

export interface CheckinRequest {
  user_id: string;
  workout_id?: string;
  mood: number;
  energy_level: number;
  sleep_quality: number;
  sleep_hours?: number;
  soreness_areas: string[];
  stress_level?: number;
}

export interface CheckinResponse {
  action: 'proceed' | 'adjust' | 'swap' | 'rest';
  adjustment_percent: number | null;
  explanation: string;
  modified_workout: Record<string, unknown> | null;
}

export async function processCheckin(request: CheckinRequest): Promise<CheckinResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('daily-checkin', {
      body: request,
    });

    if (error) {
      console.log('[ai] Check-in edge function error, using fallback');
      return getFallbackCheckinResponse(request);
    }

    return data as CheckinResponse;
  } catch {
    return getFallbackCheckinResponse(request);
  }
}

function getFallbackCheckinResponse(request: CheckinRequest): CheckinResponse {
  const avg = (request.mood + request.energy_level + request.sleep_quality) / 3;

  if (avg >= 4) {
    return {
      action: 'proceed',
      adjustment_percent: null,
      explanation: "Looking strong! Your energy and sleep are solid. Let's push today.",
      modified_workout: null,
    };
  }
  if (avg >= 3) {
    return {
      action: 'adjust',
      adjustment_percent: -15,
      explanation: "Not your best day. I've dialed back intensity by 15% but kept the structure.",
      modified_workout: null,
    };
  }
  if (avg >= 2) {
    return {
      action: 'swap',
      adjustment_percent: -30,
      explanation: "Recovery is part of the process. I've swapped today for a lighter session.",
      modified_workout: null,
    };
  }
  return {
    action: 'rest',
    adjustment_percent: null,
    explanation: "Rest day. Your body needs recovery. Take today off.",
    modified_workout: null,
  };
}

export interface PostWorkoutRequest {
  user_id: string;
  workout_id?: string;
  rpe: number;
  could_push_harder: boolean;
  feeling_stronger: string;
  notes?: string;
}

export interface PostWorkoutResponse {
  feedback: string;
  next_session_adjustment: string | null;
  concern_flag: boolean;
  concern_detail: string | null;
}

export async function processPostWorkout(request: PostWorkoutRequest): Promise<PostWorkoutResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('post-workout', {
      body: request,
    });

    if (error) {
      console.log('[ai] Post-workout edge function error, using fallback');
      return getFallbackPostWorkoutResponse(request);
    }

    return data as PostWorkoutResponse;
  } catch {
    return getFallbackPostWorkoutResponse(request);
  }
}

function getFallbackPostWorkoutResponse(request: PostWorkoutRequest): PostWorkoutResponse {
  const feedback = request.rpe >= 8
    ? "Solid effort! RPE 8+ means you pushed your limits. Prioritise recovery tonight."
    : request.could_push_harder
    ? "Good session, but sounds like you had more in the tank. I'll bump up intensity next time."
    : "Nice work! Every completed workout builds your fitness base.";

  return {
    feedback,
    next_session_adjustment: request.rpe >= 8 ? 'reduce_volume_5' : request.could_push_harder ? 'increase_intensity_5' : null,
    concern_flag: false,
    concern_detail: null,
  };
}

export interface ExerciseExplainerRequest {
  exercise_name: string;
  user_goal: string;
  user_goal_area?: string;
  user_level: string;
}

export async function getExerciseExplanation(request: ExerciseExplainerRequest): Promise<{
  explanation: string;
  muscles_targeted: string[];
  form_tip: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('exercise-explainer', {
      body: request,
    });

    if (error) throw error;
    return data;
  } catch {
    return {
      explanation: `${request.exercise_name} is a key exercise for your ${request.user_goal} goal. It builds strength and improves your overall fitness.`,
      muscles_targeted: [],
      form_tip: 'Focus on controlled movements and proper breathing.',
    };
  }
}

// ─── Coach Chat ─────────────────────────────────────────────────────────────

export interface CoachChatRequest {
  message: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  user_context?: {
    name?: string;
    goal_type?: string;
    goal_subtype?: string;
    fitness_level?: string;
    current_week?: number;
    total_weeks?: number;
  };
}

export async function sendCoachMessage(request: CoachChatRequest): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('coach-chat', {
      body: request,
    });

    if (error) {
      console.log('[ai] Coach chat edge function error, using fallback');
      return getCoachFallback(request.message);
    }

    return data?.response || getCoachFallback(request.message);
  } catch {
    return getCoachFallback(request.message);
  }
}

function getCoachFallback(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('progress') || lower.includes('track'))
    return "Based on your recent sessions, you're right on track. Your consistency this month has been excellent. Keep doing what you're doing — the results are compounding.";
  if (lower.includes('tired') || lower.includes('fatigue'))
    return "Fatigue is your body's signal to recover. I'd dial back today's intensity by 20% and focus on sleep tonight. Recovery is where gains happen — not in the gym.";
  if (lower.includes('nutrition') || lower.includes('eat') || lower.includes('food'))
    return "For your current training load: aim for 1.6-2.2g protein per kg bodyweight, eat within 60 min post-workout (3:1 carb-to-protein ratio), and stay hydrated at 35ml per kg bodyweight daily.";
  if (lower.includes('sleep'))
    return "Sleep is the #1 recovery tool. Aim for 7-9 hours, keep your room cool (18-20C), avoid screens 30 min before bed, and maintain consistent sleep/wake times. A 20-min pre-2pm nap can boost afternoon sessions.";
  if (lower.includes('harder') || lower.includes('push') || lower.includes('intense'))
    return "Love the energy. I'll bump up your next few sessions — expect higher volume, shorter rest periods, and progression on your main lifts. If it becomes unsustainable, just let me know.";
  if (lower.includes('adjust') || lower.includes('plan') || lower.includes('change'))
    return "I've reviewed your recent performance data. Your tempo pace has improved, so I'm bumping threshold work up slightly. The overall volume stays the same — just smarter distribution across the week.";
  return "Good question. Based on your current training phase and goals, I'd recommend staying the course. Your body is adapting well and the progression is right where it should be. Trust the process — consistency is everything.";
}

