import { create } from 'zustand';
import { supabase } from '@/services/api';
import type { Workout, RunningWorkoutData, StrengthWorkoutData, ExerciseSet } from '@/types/workout';
import type { Activity, CompletedExercise, CompletedSet } from '@/types/activity';

interface ActiveRunState {
  currentSegmentIndex: number;
  elapsedSeconds: number;
  distanceKm: number;
  currentPace: number;
  splits: Array<{ km: number; pace_min_km: number }>;
  isRunning: boolean;
}

interface ActiveStrengthState {
  currentExerciseIndex: number;
  currentSetIndex: number;
  completedSets: Map<string, CompletedSet[]>;
  restTimerSeconds: number;
  isResting: boolean;
}

interface WorkoutState {
  activeWorkout: Workout | null;
  activeRun: ActiveRunState | null;
  activeStrength: ActiveStrengthState | null;

  // Actions
  startRunWorkout: (workout: Workout) => void;
  updateRunProgress: (updates: Partial<ActiveRunState>) => void;
  completeRunSegment: () => void;
  finishRun: () => Promise<Activity | null>;

  startStrengthWorkout: (workout: Workout) => void;
  logSet: (exerciseName: string, set: CompletedSet) => void;
  nextExercise: () => void;
  startRest: (seconds: number) => void;
  finishStrength: () => Promise<Activity | null>;

  cancelWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  activeRun: null,
  activeStrength: null,

  startRunWorkout: (workout) => {
    set({
      activeWorkout: workout,
      activeRun: {
        currentSegmentIndex: 0,
        elapsedSeconds: 0,
        distanceKm: 0,
        currentPace: 0,
        splits: [],
        isRunning: true,
      },
      activeStrength: null,
    });
  },

  updateRunProgress: (updates) => {
    const current = get().activeRun;
    if (!current) return;
    set({ activeRun: { ...current, ...updates } });
  },

  completeRunSegment: () => {
    const run = get().activeRun;
    if (!run) return;
    set({
      activeRun: {
        ...run,
        currentSegmentIndex: run.currentSegmentIndex + 1,
      },
    });
  },

  finishRun: async () => {
    const { activeWorkout, activeRun } = get();
    if (!activeWorkout || !activeRun) return null;

    const runData = activeWorkout.workout_data as RunningWorkoutData;
    const activity: Omit<Activity, 'id' | 'created_at'> = {
      user_id: activeWorkout.user_id,
      workout_id: activeWorkout.id,
      activity_type: activeWorkout.workout_type,
      started_at: new Date(Date.now() - activeRun.elapsedSeconds * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: activeRun.elapsedSeconds,
      distance_km: activeRun.distanceKm,
      avg_pace_min_km: activeRun.distanceKm > 0
        ? (activeRun.elapsedSeconds / 60) / activeRun.distanceKm
        : null,
      avg_heart_rate: null,
      max_heart_rate: null,
      elevation_gain_m: null,
      splits: activeRun.splits,
      route_polyline: null,
      exercises_completed: null,
      source: 'app',
      external_id: null,
      raw_data: null,
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    // Mark workout as completed
    await supabase
      .from('workouts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeWorkout.id);

    set({ activeWorkout: null, activeRun: null });
    return data || null;
  },

  startStrengthWorkout: (workout) => {
    set({
      activeWorkout: workout,
      activeStrength: {
        currentExerciseIndex: 0,
        currentSetIndex: 0,
        completedSets: new Map(),
        restTimerSeconds: 0,
        isResting: false,
      },
      activeRun: null,
    });
  },

  logSet: (exerciseName, completedSet) => {
    const strength = get().activeStrength;
    if (!strength) return;

    const updated = new Map(strength.completedSets);
    const existing = updated.get(exerciseName) || [];
    updated.set(exerciseName, [...existing, completedSet]);

    set({
      activeStrength: {
        ...strength,
        completedSets: updated,
        currentSetIndex: strength.currentSetIndex + 1,
      },
    });
  },

  nextExercise: () => {
    const strength = get().activeStrength;
    if (!strength) return;
    set({
      activeStrength: {
        ...strength,
        currentExerciseIndex: strength.currentExerciseIndex + 1,
        currentSetIndex: 0,
      },
    });
  },

  startRest: (seconds) => {
    const strength = get().activeStrength;
    if (!strength) return;
    set({
      activeStrength: {
        ...strength,
        isResting: true,
        restTimerSeconds: seconds,
      },
    });
  },

  finishStrength: async () => {
    const { activeWorkout, activeStrength } = get();
    if (!activeWorkout || !activeStrength) return null;

    const exercisesCompleted: CompletedExercise[] = [];
    activeStrength.completedSets.forEach((sets, name) => {
      exercisesCompleted.push({ name, sets });
    });

    const activity: Omit<Activity, 'id' | 'created_at'> = {
      user_id: activeWorkout.user_id,
      workout_id: activeWorkout.id,
      activity_type: 'strength',
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: null,
      distance_km: null,
      avg_pace_min_km: null,
      avg_heart_rate: null,
      max_heart_rate: null,
      elevation_gain_m: null,
      splits: null,
      route_polyline: null,
      exercises_completed: exercisesCompleted,
      source: 'app',
      external_id: null,
      raw_data: null,
    };

    const { data } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    await supabase
      .from('workouts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activeWorkout.id);

    set({ activeWorkout: null, activeStrength: null });
    return data || null;
  },

  cancelWorkout: () => {
    set({ activeWorkout: null, activeRun: null, activeStrength: null });
  },
}));
