import { create } from 'zustand';
import { supabase } from '@/services/api';
import { generatePlan, type GeneratePlanResponse } from '@/services/ai';
import type { Plan, Goal, UserStats } from '@/types/plan';
import type { Workout } from '@/types/workout';
import type { User } from '@/types/user';
import { addDays, format } from 'date-fns';

interface PlanState {
  currentPlan: Plan | null;
  currentGoal: Goal | null;
  workouts: Workout[];
  isLoading: boolean;
  isGenerating: boolean;
  generationProgress: string;

  // Actions
  loadActivePlan: (userId: string) => Promise<void>;
  createGoalAndGeneratePlan: (
    user: User,
    goal: Omit<Goal, 'id' | 'user_id' | 'status' | 'created_at'>,
    stats: Omit<UserStats, 'id' | 'user_id' | 'goal_id' | 'created_at'>,
  ) => Promise<{ error?: string }>;
  loadWorkouts: (planId: string) => Promise<void>;
  getWorkoutsForWeek: (weekNumber: number) => Workout[];
  getTodayWorkout: () => Workout | null;
  completeWorkout: (workoutId: string) => Promise<void>;
  skipWorkout: (workoutId: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  currentGoal: null,
  workouts: [],
  isLoading: false,
  isGenerating: false,
  generationProgress: '',

  loadActivePlan: async (userId) => {
    set({ isLoading: true });
    try {
      // Load active goal
      const { data: goal } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!goal) {
        set({ isLoading: false });
        return;
      }

      // Load active plan
      const { data: plan } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .eq('goal_id', goal.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (plan) {
        // Load workouts
        const { data: workouts } = await supabase
          .from('workouts')
          .select('*')
          .eq('plan_id', plan.id)
          .order('scheduled_date', { ascending: true })
          .order('sort_order', { ascending: true });

        set({
          currentGoal: goal,
          currentPlan: plan,
          workouts: workouts || [],
          isLoading: false,
        });
      } else {
        set({ currentGoal: goal, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  createGoalAndGeneratePlan: async (user, goalData, statsData) => {
    set({ isGenerating: true, generationProgress: 'Creating your goal...' });

    try {
      // 1. Create goal
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({ ...goalData, user_id: user.id, status: 'active' })
        .select()
        .single();

      if (goalError || !goal) {
        set({ isGenerating: false });
        return { error: goalError?.message || 'Failed to create goal' };
      }

      // 2. Save stats
      set({ generationProgress: 'Saving your fitness profile...' });
      await supabase.from('user_stats').insert({
        ...statsData,
        user_id: user.id,
        goal_id: goal.id,
      });

      // 3. Generate plan via AI
      set({ generationProgress: 'AI is building your personalised plan...' });
      const aiPlan = await generatePlan({
        user: {
          date_of_birth: user.date_of_birth,
          gender: user.gender,
          height_cm: user.height_cm,
          weight_kg: user.weight_kg,
          unit_preference: user.unit_preference,
        },
        goal,
        stats: { ...statsData, id: '', user_id: user.id, goal_id: goal.id, created_at: '' } as UserStats,
      });

      // 4. Save plan
      set({ generationProgress: 'Saving your plan...' });
      const startDate = new Date();
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          goal_id: goal.id,
          name: aiPlan.plan_name,
          description: aiPlan.description,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(addDays(startDate, aiPlan.total_weeks * 7), 'yyyy-MM-dd'),
          total_weeks: aiPlan.total_weeks,
          current_week: 1,
          plan_data: {
            weeks: aiPlan.weeks.map((w) => ({
              week_number: w.week_number,
              theme: w.theme,
              total_distance_km: w.total_distance_km,
              total_volume: w.total_volume,
              notes: w.notes,
            })),
            philosophy: aiPlan.philosophy,
            key_sessions: aiPlan.key_sessions,
            progression_notes: aiPlan.progression_notes,
          },
          status: 'active',
          ai_model: 'claude-sonnet-4-20250514',
        })
        .select()
        .single();

      if (planError || !plan) {
        set({ isGenerating: false });
        return { error: planError?.message || 'Failed to save plan' };
      }

      // 5. Save individual workouts
      set({ generationProgress: 'Scheduling your workouts...' });
      const workoutRows = aiPlan.weeks.flatMap((week) =>
        week.workouts.map((w, idx) => ({
          plan_id: plan.id,
          user_id: user.id,
          week_number: week.week_number,
          day_of_week: w.day_of_week,
          scheduled_date: format(
            addDays(startDate, (week.week_number - 1) * 7 + (w.day_of_week - 1)),
            'yyyy-MM-dd',
          ),
          workout_type: w.workout_type,
          title: w.title,
          description: w.description,
          workout_data: w.workout_data,
          estimated_duration_minutes: w.estimated_duration_minutes,
          status: 'scheduled',
          sort_order: idx,
        })),
      );

      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .insert(workoutRows)
        .select();

      if (workoutsError) {
        set({ isGenerating: false });
        return { error: workoutsError.message };
      }

      set({
        currentGoal: goal,
        currentPlan: plan,
        workouts: workouts || [],
        isGenerating: false,
        generationProgress: '',
      });

      return {};
    } catch (err) {
      set({ isGenerating: false, generationProgress: '' });
      return { error: (err as Error).message };
    }
  },

  loadWorkouts: async (planId) => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('plan_id', planId)
      .order('scheduled_date', { ascending: true })
      .order('sort_order', { ascending: true });

    set({ workouts: data || [] });
  },

  getWorkoutsForWeek: (weekNumber) => {
    return get().workouts.filter((w) => w.week_number === weekNumber);
  },

  getTodayWorkout: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return get().workouts.find(
      (w) => w.scheduled_date === today && w.status === 'scheduled',
    ) || null;
  },

  completeWorkout: async (workoutId) => {
    const now = new Date().toISOString();
    await supabase
      .from('workouts')
      .update({ status: 'completed', completed_at: now })
      .eq('id', workoutId);

    set({
      workouts: get().workouts.map((w) =>
        w.id === workoutId ? { ...w, status: 'completed' as const, completed_at: now } : w,
      ),
    });
  },

  skipWorkout: async (workoutId) => {
    await supabase
      .from('workouts')
      .update({ status: 'skipped' })
      .eq('id', workoutId);

    set({
      workouts: get().workouts.map((w) =>
        w.id === workoutId ? { ...w, status: 'skipped' as const } : w,
      ),
    });
  },
}));
