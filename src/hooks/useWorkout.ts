import { useWorkoutStore } from '@/stores/workoutStore';
import type { Workout } from '@/types/workout';
import { isRunningWorkout, isStrengthWorkout } from '@/types/workout';

/**
 * Hook to manage active workout execution.
 */
export function useWorkout() {
  const store = useWorkoutStore();

  const startWorkout = (workout: Workout) => {
    if (isRunningWorkout(workout.workout_data)) {
      store.startRunWorkout(workout);
    } else if (isStrengthWorkout(workout.workout_data)) {
      store.startStrengthWorkout(workout);
    }
  };

  return {
    activeWorkout: store.activeWorkout,
    activeRun: store.activeRun,
    activeStrength: store.activeStrength,
    isActive: !!store.activeWorkout,
    startWorkout,
    // Run actions
    updateRunProgress: store.updateRunProgress,
    completeRunSegment: store.completeRunSegment,
    finishRun: store.finishRun,
    // Strength actions
    logSet: store.logSet,
    nextExercise: store.nextExercise,
    startRest: store.startRest,
    finishStrength: store.finishStrength,
    // General
    cancelWorkout: store.cancelWorkout,
  };
}
