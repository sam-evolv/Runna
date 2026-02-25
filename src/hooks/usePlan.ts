import { useEffect } from 'react';
import { usePlanStore } from '@/stores/planStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to access the active training plan and its workouts.
 */
export function usePlan() {
  const user = useAuthStore((s) => s.user);
  const store = usePlanStore();

  useEffect(() => {
    if (user?.id) {
      store.loadActivePlan(user.id);
    }
  }, [user?.id]);

  return {
    plan: store.currentPlan,
    goal: store.currentGoal,
    workouts: store.workouts,
    isLoading: store.isLoading,
    isGenerating: store.isGenerating,
    generationProgress: store.generationProgress,
    todayWorkout: store.getTodayWorkout(),
    getWorkoutsForWeek: store.getWorkoutsForWeek,
    completeWorkout: store.completeWorkout,
    skipWorkout: store.skipWorkout,
    createGoalAndGeneratePlan: store.createGoalAndGeneratePlan,
  };
}
