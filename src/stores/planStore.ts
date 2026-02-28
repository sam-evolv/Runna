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
  // Fallback: raw AI plan kept in memory even if DB save fails
  _rawAiPlan: GeneratePlanResponse | null;

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
  _rawAiPlan: null,

  loadActivePlan: async (userId) => {
    set({ isLoading: true });
    try {
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
    } catch (err) {
      console.error('[planStore] loadActivePlan error:', err);
      set({ isLoading: false });
    }
  },

  createGoalAndGeneratePlan: async (user, goalData, statsData) => {
    set({ isGenerating: true, generationProgress: 'Creating your goal...' });
    console.log('[planStore] === Starting createGoalAndGeneratePlan ===');
    console.log('[planStore] User ID:', user.id);
    console.log('[planStore] Goal data:', JSON.stringify(goalData));

    let savedGoal: Goal | null = null;
    let savedPlan: Plan | null = null;
    let savedWorkouts: Workout[] = [];

    try {
      // ── Step 1: Create goal ──
      console.log('[planStore] Step 1: Inserting goal...');
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({ ...goalData, user_id: user.id, status: 'active' })
        .select()
        .single();

      if (goalError) {
        console.error('[planStore] Step 1 FAILED - goal insert error:', goalError.message, goalError.details, goalError.hint);
        set({ isGenerating: false });
        return { error: `Failed to create goal: ${goalError.message}` };
      }
      if (!goal) {
        console.error('[planStore] Step 1 FAILED - goal insert returned null');
        set({ isGenerating: false });
        return { error: 'Failed to create goal: no data returned' };
      }
      savedGoal = goal;
      console.log('[planStore] Step 1 OK - goal created:', goal.id);

      // ── Step 2: Save stats (non-blocking — don't abort if this fails) ──
      console.log('[planStore] Step 2: Inserting user_stats...');
      set({ generationProgress: 'Saving your fitness profile...' });
      try {
        const { error: statsError } = await supabase.from('user_stats').insert({
          ...statsData,
          user_id: user.id,
          goal_id: goal.id,
        });
        if (statsError) {
          console.error('[planStore] Step 2 WARN - stats insert error (continuing):', statsError.message, statsError.details, statsError.hint);
        } else {
          console.log('[planStore] Step 2 OK - stats saved');
        }
      } catch (statsErr) {
        console.error('[planStore] Step 2 WARN - stats insert threw (continuing):', statsErr);
      }

      // ── Step 3: Generate plan via AI ──
      console.log('[planStore] Step 3: Calling AI generate-plan edge function...');
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

      const totalWorkouts = aiPlan.weeks.reduce((n, w) => n + w.workouts.length, 0);
      console.log('[planStore] Step 3 OK - AI plan received:', aiPlan.plan_name, '| weeks:', aiPlan.total_weeks, '| workouts:', totalWorkouts);
      // Keep a copy in memory as fallback
      set({ _rawAiPlan: aiPlan });

      // ── Step 4: Save plan to DB ──
      console.log('[planStore] Step 4: Inserting plan row...');
      set({ generationProgress: 'Saving your plan...' });
      const startDate = new Date();
      try {
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
            ai_model: 'meta/llama-3.3-70b-instruct',
          })
          .select()
          .single();

        if (planError) {
          console.error('[planStore] Step 4 FAILED - plan insert error:', planError.message, planError.details, planError.hint);
        } else if (!plan) {
          console.error('[planStore] Step 4 FAILED - plan insert returned null');
        } else {
          savedPlan = plan;
          console.log('[planStore] Step 4 OK - plan saved:', plan.id);
        }
      } catch (planErr) {
        console.error('[planStore] Step 4 THREW:', planErr);
      }

      // ── Step 5: Save individual workouts (only if plan was saved) ──
      if (savedPlan) {
        console.log('[planStore] Step 5: Inserting workout rows...');
        set({ generationProgress: 'Scheduling your workouts...' });
        try {
          const workoutRows = aiPlan.weeks.flatMap((week) =>
            week.workouts.map((w, idx) => ({
              plan_id: savedPlan!.id,
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

          console.log('[planStore] Step 5: inserting', workoutRows.length, 'workouts...');

          const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .insert(workoutRows)
            .select();

          if (workoutsError) {
            console.error('[planStore] Step 5 FAILED - workouts insert error:', workoutsError.message, workoutsError.details, workoutsError.hint);
          } else {
            savedWorkouts = workouts || [];
            console.log('[planStore] Step 5 OK -', savedWorkouts.length, 'workouts saved');
          }
        } catch (workoutErr) {
          console.error('[planStore] Step 5 THREW:', workoutErr);
        }
      } else {
        console.warn('[planStore] Step 5 SKIPPED - no plan was saved to attach workouts to');
      }

      // ── All done — always succeed if we got the AI plan ──
      console.log('[planStore] === Complete. goal:', !!savedGoal, 'plan:', !!savedPlan, 'workouts:', savedWorkouts.length, '===');
      set({
        currentGoal: savedGoal,
        currentPlan: savedPlan,
        workouts: savedWorkouts,
        isGenerating: false,
        generationProgress: '',
      });

      return {};
    } catch (err) {
      console.error('[planStore] === UNCAUGHT ERROR in createGoalAndGeneratePlan ===', err);
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
