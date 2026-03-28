import { format, addDays } from 'date-fns';
import type { Workout, WorkoutType } from '@/types/workout';

function makeDemoDate(offsetDays: number): string {
  return format(addDays(new Date(), offsetDays), 'yyyy-MM-dd');
}

export const DEMO_WORKOUTS: Workout[] = [
  {
    id: 'demo-1',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: new Date().getDay() || 7,
    scheduled_date: makeDemoDate(0),
    workout_type: 'tempo_run' as WorkoutType,
    title: 'Tempo Run',
    description:
      'Build lactate threshold with sustained effort. Warm up 10 min, then 20 min at tempo pace, cool down 10 min.',
    workout_data: {
      type: 'tempo_run' as const,
      total_distance_km: 8.5,
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Easy warm-up jog' },
        { type: 'tempo' as const, distance_km: 4.5, target_pace_min_km: 4.45, description: 'Tempo effort' },
        { type: 'cooldown' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Cool down' },
      ],
      notes: 'Keep tempo effort controlled — you should be able to say short sentences.',
    },
    estimated_duration_minutes: 45,
    status: 'scheduled',
    completed_at: null,
    sort_order: 1,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-2',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) % 7) + 1,
    scheduled_date: makeDemoDate(1),
    workout_type: 'strength' as WorkoutType,
    title: 'Upper Body Strength',
    description: 'Compound pushing and pulling with core work. Focus on controlled tempo.',
    workout_data: {
      type: 'strength' as const,
      focus: 'Upper Body',
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { set_number: 1, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
            { set_number: 2, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
            { set_number: 3, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
          ],
        },
        {
          name: 'Weighted Pull-ups',
          sets: [
            { set_number: 1, reps: 6, weight_kg: 10, type: 'working' as const, rest_seconds: 120 },
            { set_number: 2, reps: 6, weight_kg: 10, type: 'working' as const, rest_seconds: 120 },
            { set_number: 3, reps: 6, weight_kg: 10, type: 'working' as const, rest_seconds: 120 },
          ],
        },
        {
          name: 'Overhead Press',
          sets: [
            { set_number: 1, reps: 8, weight_kg: 40, type: 'working' as const, rest_seconds: 90 },
            { set_number: 2, reps: 8, weight_kg: 40, type: 'working' as const, rest_seconds: 90 },
            { set_number: 3, reps: 8, weight_kg: 40, type: 'working' as const, rest_seconds: 90 },
          ],
        },
        {
          name: 'Dumbbell Rows',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 25, type: 'working' as const, rest_seconds: 60 },
            { set_number: 2, reps: 10, weight_kg: 25, type: 'working' as const, rest_seconds: 60 },
            { set_number: 3, reps: 10, weight_kg: 25, type: 'working' as const, rest_seconds: 60 },
          ],
        },
      ],
      estimated_duration_minutes: 50,
      notes: 'Superset accessories to save time. Focus on controlled eccentrics.',
    },
    estimated_duration_minutes: 50,
    status: 'scheduled',
    completed_at: null,
    sort_order: 2,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-3',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 1) % 7 + 1,
    scheduled_date: makeDemoDate(2),
    workout_type: 'easy_run' as WorkoutType,
    title: 'Easy Recovery Run',
    description: 'Keep it conversational. This run builds aerobic base without fatigue.',
    workout_data: {
      type: 'easy_run' as const,
      total_distance_km: 6,
      segments: [
        { type: 'easy' as const, distance_km: 6, target_pace_min_km: 5.8, description: 'Easy pace' },
      ],
      notes: 'Heart rate zone 2. Enjoy the run.',
    },
    estimated_duration_minutes: 35,
    status: 'scheduled',
    completed_at: null,
    sort_order: 3,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-4',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 2) % 7 + 1,
    scheduled_date: makeDemoDate(3),
    workout_type: 'interval_run' as WorkoutType,
    title: 'Speed Intervals',
    description: '6x800m at 5K pace with 400m recovery jogs between.',
    workout_data: {
      type: 'interval_run' as const,
      total_distance_km: 10,
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 5.5, description: 'Warm up' },
        { type: 'interval' as const, distance_km: 0.8, target_pace_min_km: 4.0, description: '800m hard' },
        { type: 'recovery' as const, distance_km: 0.4, target_pace_min_km: 6.5, description: 'Recovery jog' },
        { type: 'interval' as const, distance_km: 0.8, target_pace_min_km: 4.0, description: '800m hard' },
        { type: 'recovery' as const, distance_km: 0.4, target_pace_min_km: 6.5, description: 'Recovery jog' },
        { type: 'cooldown' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Cool down' },
      ],
      notes: 'Focus on even splits across all intervals.',
    },
    estimated_duration_minutes: 55,
    status: 'scheduled',
    completed_at: null,
    sort_order: 4,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-5',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 3) % 7 + 1,
    scheduled_date: makeDemoDate(4),
    workout_type: 'long_run' as WorkoutType,
    title: 'Long Run',
    description: 'Weekly long run to build endurance. Negative split the second half.',
    workout_data: {
      type: 'long_run' as const,
      total_distance_km: 16,
      segments: [
        { type: 'easy' as const, distance_km: 8, target_pace_min_km: 5.5, description: 'Easy first half' },
        { type: 'steady' as const, distance_km: 8, target_pace_min_km: 5.0, description: 'Faster second half' },
      ],
      notes: 'Take a gel at km 10. Stay hydrated.',
    },
    estimated_duration_minutes: 85,
    status: 'scheduled',
    completed_at: null,
    sort_order: 5,
    created_at: makeDemoDate(-7),
  },
];

export const DEMO_COMPLETED_COUNT = 3;
export const DEMO_TOTAL_WEEK = 6;
