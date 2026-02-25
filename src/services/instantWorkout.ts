/**
 * Instant workout generator.
 * Creates on-demand workouts not tied to the training plan.
 */

import type { Workout, RunningWorkoutData, StrengthWorkoutData, RunSegment } from '@/types/workout';

export type InstantWorkoutCategory = 'run' | 'strength' | 'recovery';

export interface WorkoutTypeOption {
  id: string;
  label: string;
  category: InstantWorkoutCategory;
  description: string;
  emoji: string;
}

export const WORKOUT_TYPE_OPTIONS: WorkoutTypeOption[] = [
  // Run
  { id: 'easy_run', label: 'Easy Run', category: 'run', description: 'Relaxed conversational pace', emoji: '🏃' },
  { id: 'tempo_run', label: 'Tempo Run', category: 'run', description: 'Sustained hard effort', emoji: '⚡' },
  { id: 'interval_run', label: 'Intervals', category: 'run', description: 'Fast repeats with recovery', emoji: '🔥' },
  { id: 'fartlek', label: 'Fartlek', category: 'run', description: 'Unstructured speed play', emoji: '🎲' },
  // Strength
  { id: 'strength_full', label: 'Full Body', category: 'strength', description: 'Total body strength', emoji: '💪' },
  { id: 'strength_upper', label: 'Upper Body', category: 'strength', description: 'Push, pull, and core', emoji: '🏋️' },
  { id: 'strength_lower', label: 'Lower Body', category: 'strength', description: 'Legs and glutes', emoji: '🦵' },
  { id: 'strength_core', label: 'Core', category: 'strength', description: 'Abs and stability', emoji: '🎯' },
  // Recovery
  { id: 'recovery_run', label: 'Recovery Run', category: 'recovery', description: 'Very easy movement', emoji: '🐌' },
  { id: 'mobility', label: 'Mobility', category: 'recovery', description: 'Stretch and foam roll', emoji: '🧘' },
];

export interface TimeOption {
  minutes: number;
  label: string;
}

export const TIME_OPTIONS: TimeOption[] = [
  { minutes: 15, label: '15 min' },
  { minutes: 20, label: '20 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '60 min' },
];

export type IntensityLevel = 'easy' | 'moderate' | 'hard';

export interface InstantWorkoutConfig {
  workoutTypeId: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  userPaceEasyMinKm?: number; // user's easy pace for calibration
}

function generateRunSegments(
  config: InstantWorkoutConfig,
): { segments: RunSegment[]; totalDistanceKm: number } {
  const basePace = config.userPaceEasyMinKm ?? 6.0;
  const durationMin = config.durationMinutes;

  const paces: Record<string, Record<IntensityLevel, number>> = {
    easy_run: { easy: basePace * 1.05, moderate: basePace, hard: basePace * 0.95 },
    tempo_run: { easy: basePace * 0.9, moderate: basePace * 0.85, hard: basePace * 0.8 },
    interval_run: { easy: basePace * 0.78, moderate: basePace * 0.73, hard: basePace * 0.68 },
    fartlek: { easy: basePace * 0.92, moderate: basePace * 0.85, hard: basePace * 0.78 },
    recovery_run: { easy: basePace * 1.2, moderate: basePace * 1.15, hard: basePace * 1.1 },
  };

  const targetPace = paces[config.workoutTypeId]?.[config.intensity] ?? basePace;
  const segments: RunSegment[] = [];

  if (config.workoutTypeId === 'interval_run') {
    // Warm up (20%), intervals (60%), cool down (20%)
    const warmupMin = durationMin * 0.2;
    const intervalMin = durationMin * 0.6;
    const cooldownMin = durationMin * 0.2;
    const warmupPace = basePace * 1.1;
    const recoveryPace = basePace * 1.05;

    segments.push({
      type: 'warmup',
      distance_km: warmupMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy warm up',
    });

    const intervalCount = Math.max(3, Math.round(intervalMin / 4));
    const intervalDuration = intervalMin / (intervalCount * 2);

    for (let i = 0; i < intervalCount; i++) {
      segments.push({
        type: 'interval',
        distance_km: intervalDuration / targetPace,
        target_pace_min_km: targetPace,
        description: `Hard interval ${i + 1}`,
      });
      if (i < intervalCount - 1) {
        segments.push({
          type: 'recovery',
          distance_km: intervalDuration / recoveryPace,
          target_pace_min_km: recoveryPace,
          description: 'Recovery jog',
        });
      }
    }

    segments.push({
      type: 'cooldown',
      distance_km: cooldownMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy cool down',
    });
  } else if (config.workoutTypeId === 'tempo_run') {
    const warmupMin = Math.min(durationMin * 0.15, 8);
    const tempoMin = durationMin - warmupMin * 2;
    const warmupPace = basePace * 1.1;

    segments.push({
      type: 'warmup',
      distance_km: warmupMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy warm up',
    });
    segments.push({
      type: 'tempo',
      distance_km: tempoMin / targetPace,
      target_pace_min_km: targetPace,
      description: 'Tempo effort — controlled and strong',
    });
    segments.push({
      type: 'cooldown',
      distance_km: warmupMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy cool down',
    });
  } else if (config.workoutTypeId === 'fartlek') {
    const warmupMin = durationMin * 0.15;
    const mainMin = durationMin * 0.7;
    const cooldownMin = durationMin * 0.15;
    const warmupPace = basePace * 1.1;
    const fastPace = targetPace;
    const slowPace = basePace;

    segments.push({
      type: 'warmup',
      distance_km: warmupMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy warm up',
    });

    const blockCount = Math.round(mainMin / 5);
    const blockDuration = mainMin / (blockCount * 2);

    for (let i = 0; i < blockCount; i++) {
      segments.push({
        type: 'interval',
        distance_km: blockDuration / fastPace,
        target_pace_min_km: fastPace,
        description: 'Pick up the pace',
      });
      segments.push({
        type: 'easy',
        distance_km: blockDuration / slowPace,
        target_pace_min_km: slowPace,
        description: 'Easy jog recovery',
      });
    }

    segments.push({
      type: 'cooldown',
      distance_km: cooldownMin / warmupPace,
      target_pace_min_km: warmupPace,
      description: 'Easy cool down',
    });
  } else {
    // Simple steady run (easy or recovery)
    segments.push({
      type: config.workoutTypeId === 'recovery_run' ? 'easy' : 'steady',
      distance_km: durationMin / targetPace,
      target_pace_min_km: targetPace,
      description: config.workoutTypeId === 'recovery_run'
        ? 'Very easy recovery pace — keep it relaxed'
        : 'Steady comfortable effort',
    });
  }

  const totalDistanceKm = segments.reduce((sum, s) => sum + s.distance_km, 0);
  return { segments, totalDistanceKm };
}

export function generateInstantWorkout(config: InstantWorkoutConfig): Workout {
  const typeOption = WORKOUT_TYPE_OPTIONS.find((t) => t.id === config.workoutTypeId);
  const isRun = typeOption?.category === 'run' || typeOption?.category === 'recovery' && config.workoutTypeId !== 'mobility';
  const now = new Date().toISOString();

  if (isRun) {
    const { segments, totalDistanceKm } = generateRunSegments(config);
    const runData: RunningWorkoutData = {
      type: config.workoutTypeId as RunningWorkoutData['type'],
      total_distance_km: Math.round(totalDistanceKm * 100) / 100,
      segments,
      notes: `Instant ${typeOption?.label ?? 'Run'} — ${config.durationMinutes} minutes, ${config.intensity} intensity`,
    };

    return {
      id: `instant_${Date.now()}`,
      plan_id: '',
      user_id: '',
      week_number: 0,
      day_of_week: new Date().getDay() || 7,
      scheduled_date: now.split('T')[0],
      workout_type: config.workoutTypeId as Workout['workout_type'],
      title: `${typeOption?.label ?? 'Quick Run'} (${config.durationMinutes}min)`,
      description: typeOption?.description ?? null,
      workout_data: runData,
      estimated_duration_minutes: config.durationMinutes,
      status: 'scheduled',
      completed_at: null,
      sort_order: 0,
      created_at: now,
    };
  }

  // Strength / mobility workout
  const strengthData: StrengthWorkoutData = {
    type: 'strength',
    focus: typeOption?.label ?? 'General',
    exercises: [],
    estimated_duration_minutes: config.durationMinutes,
    notes: `Instant ${typeOption?.label ?? 'Workout'} — ${config.durationMinutes} minutes`,
  };

  return {
    id: `instant_${Date.now()}`,
    plan_id: '',
    user_id: '',
    week_number: 0,
    day_of_week: new Date().getDay() || 7,
    scheduled_date: now.split('T')[0],
    workout_type: config.workoutTypeId.startsWith('strength') ? 'strength' : 'mobility',
    title: `${typeOption?.label ?? 'Quick Workout'} (${config.durationMinutes}min)`,
    description: typeOption?.description ?? null,
    workout_data: strengthData,
    estimated_duration_minutes: config.durationMinutes,
    status: 'scheduled',
    completed_at: null,
    sort_order: 0,
    created_at: now,
  };
}
