import { format, addDays } from 'date-fns';
import type { Workout, WorkoutType } from '@/types/workout';

function makeDemoDate(offsetDays: number): string {
  return format(addDays(new Date(), offsetDays), 'yyyy-MM-dd');
}

export const DEMO_WORKOUTS: Workout[] = [
  // ── Today: Tempo Run ─────────────────────────────────────────────────────
  {
    id: 'demo-1',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 3,
    day_of_week: new Date().getDay() || 7,
    scheduled_date: makeDemoDate(0),
    workout_type: 'tempo_run' as WorkoutType,
    title: 'Tempo Run',
    description: 'Build lactate threshold with sustained effort. This is the session that makes you faster at half marathon pace.',
    workout_data: {
      type: 'tempo_run' as const,
      total_distance_km: 10,
      session_purpose: 'Lactate threshold development — the single biggest predictor of half marathon performance. Today you build the engine.',
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 6.15, description: 'Easy jog, gradually increase pace. Include 4x20s strides in final 400m.' },
        { type: 'tempo' as const, distance_km: 5, target_pace_min_km: 5.05, description: 'Sustained tempo effort — comfortably hard. You should be able to say short phrases but not sentences.' },
        { type: 'easy' as const, distance_km: 1, target_pace_min_km: 6.3, description: 'Easy float — recover before the finish kick.' },
        { type: 'tempo' as const, distance_km: 1, target_pace_min_km: 4.55, description: 'Finish strong — race pace effort for the last km.' },
        { type: 'cooldown' as const, distance_km: 1, target_pace_min_km: 6.3, description: 'Easy jog, then 5 min of stretching.' },
      ],
      notes: 'Keep tempo effort at Zone 3-4. If you drift above 5:15/km, you started too fast. Negative split the tempo block if possible.',
    },
    estimated_duration_minutes: 52,
    status: 'scheduled',
    completed_at: null,
    sort_order: 1,
    created_at: makeDemoDate(-14),
  },

  // ── Tomorrow: Upper Body (Chest + Triceps) ───────────────────────────────
  {
    id: 'demo-2',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 3,
    day_of_week: ((new Date().getDay() || 7) % 7) + 1,
    scheduled_date: makeDemoDate(1),
    workout_type: 'strength' as WorkoutType,
    title: 'Upper Body — Chest & Triceps',
    description: 'Compound pressing followed by isolation work. Progressive overload week — push for rep PRs on working sets.',
    workout_data: {
      type: 'strength' as const,
      focus: 'Chest + Triceps',
      session_purpose: 'Build chest mass through multi-angle pressing and tricep volume. Week 3 of mesocycle — 1-2 RIR on working sets.',
      exercises: [
        {
          name: 'Barbell Bench Press',
          notes: 'Primary chest compound — builds pressing strength and overall chest mass. Pause 1s at chest.',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 40, type: 'warmup' as const, rest_seconds: 60 },
            { set_number: 2, reps: 6, weight_kg: 60, type: 'warmup' as const, rest_seconds: 90 },
            { set_number: 3, reps: 8, weight_kg: 75, type: 'working' as const, rest_seconds: 150, rpe: 7 },
            { set_number: 4, reps: 8, weight_kg: 80, type: 'working' as const, rest_seconds: 150, rpe: 8 },
            { set_number: 5, reps: 8, weight_kg: 80, type: 'working' as const, rest_seconds: 150, rpe: 9 },
          ],
        },
        {
          name: 'Incline Dumbbell Press',
          notes: 'Upper chest emphasis at 30-degree angle — builds the chest-shoulder tie-in for a complete look.',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 22, type: 'working' as const, rest_seconds: 90, rpe: 7 },
            { set_number: 2, reps: 10, weight_kg: 24, type: 'working' as const, rest_seconds: 90, rpe: 8 },
            { set_number: 3, reps: 10, weight_kg: 24, type: 'working' as const, rest_seconds: 90, rpe: 9 },
          ],
        },
        {
          name: 'Cable Flyes',
          notes: 'Peak contraction and stretch under load — targets inner chest fibres that presses miss.',
          sets: [
            { set_number: 1, reps: 12, weight_kg: 12, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 2, reps: 12, weight_kg: 12, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 3, reps: 15, weight_kg: 10, type: 'working' as const, rest_seconds: 60, rpe: 9 },
          ],
        },
        {
          name: 'Overhead Tricep Extension',
          notes: 'Long head triceps — the part that adds size to the back of your arm. Full stretch at the bottom.',
          sets: [
            { set_number: 1, reps: 12, weight_kg: 20, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 2, reps: 12, weight_kg: 20, type: 'working' as const, rest_seconds: 60, rpe: 9 },
            { set_number: 3, reps: 10, weight_kg: 22, type: 'working' as const, rest_seconds: 60, rpe: 9 },
          ],
        },
        {
          name: 'Tricep Pushdowns',
          notes: 'Lateral head triceps — superset with overhead extensions for maximum pump.',
          sets: [
            { set_number: 1, reps: 15, weight_kg: 25, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 2, reps: 15, weight_kg: 25, type: 'working' as const, rest_seconds: 60, rpe: 9 },
            { set_number: 3, reps: 12, weight_kg: 27, type: 'working' as const, rest_seconds: 60, rpe: 9 },
          ],
        },
        {
          name: 'Dips',
          notes: 'Lower chest and tricep finisher — lean forward for chest emphasis, stay upright for triceps.',
          sets: [
            { set_number: 1, reps: 12, weight_kg: null, type: 'working' as const, rest_seconds: 90, rpe: 8 },
            { set_number: 2, reps: 10, weight_kg: null, type: 'working' as const, rest_seconds: 90, rpe: 9 },
            { set_number: 3, reps: 'AMRAP', weight_kg: null, type: 'amrap' as const, rest_seconds: 0 },
          ],
        },
      ],
      estimated_duration_minutes: 55,
      notes: 'Week 3 of mesocycle — working at 1-2 RIR. Push hard on compounds, chase the pump on isolation. 26 working sets total.',
    },
    estimated_duration_minutes: 55,
    status: 'scheduled',
    completed_at: null,
    sort_order: 2,
    created_at: makeDemoDate(-14),
  },

  // ── Day 3: Easy Recovery Run ──────────────────────────────────────────────
  {
    id: 'demo-3',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 3,
    day_of_week: ((new Date().getDay() || 7) + 1) % 7 + 1,
    scheduled_date: makeDemoDate(2),
    workout_type: 'easy_run' as WorkoutType,
    title: 'Easy Recovery Run + Strides',
    description: 'Aerobic base building at conversational pace. Include 6 strides at the end.',
    workout_data: {
      type: 'easy_run' as const,
      total_distance_km: 7,
      session_purpose: 'Active recovery and aerobic base development. The easy runs are where your body adapts to the hard work.',
      segments: [
        { type: 'easy' as const, distance_km: 6, target_pace_min_km: 6.2, description: 'Conversational pace — Zone 2 heart rate. If you can\'t hold a conversation, slow down.' },
        { type: 'interval' as const, distance_km: 0.6, target_pace_min_km: 4.3, description: '6x100m strides with 100m walk recovery. Focus on form: high knees, fast turnover.' },
        { type: 'cooldown' as const, distance_km: 0.4, target_pace_min_km: 7.0, description: 'Walk and light stretching.' },
      ],
      notes: 'This should feel genuinely easy. If your legs are heavy from yesterday\'s tempo, take the first 2km at 6:30+.',
    },
    estimated_duration_minutes: 42,
    status: 'scheduled',
    completed_at: null,
    sort_order: 3,
    created_at: makeDemoDate(-14),
  },

  // ── Day 4: Lower Body (Quads + Glutes) ───────────────────────────────────
  {
    id: 'demo-4',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 3,
    day_of_week: ((new Date().getDay() || 7) + 2) % 7 + 1,
    scheduled_date: makeDemoDate(3),
    workout_type: 'strength' as WorkoutType,
    title: 'Lower Body — Quads & Glutes',
    description: 'Heavy compound leg work with targeted glute and quad isolation. This builds the foundation for running power.',
    workout_data: {
      type: 'strength' as const,
      focus: 'Quads + Glutes',
      session_purpose: 'Leg strength supports running economy and injury prevention. Strong quads protect your knees; strong glutes power your stride.',
      exercises: [
        {
          name: 'Barbell Back Squat',
          notes: 'King of leg exercises — builds quad, glute, and core strength simultaneously.',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 40, type: 'warmup' as const, rest_seconds: 60 },
            { set_number: 2, reps: 6, weight_kg: 70, type: 'warmup' as const, rest_seconds: 90 },
            { set_number: 3, reps: 6, weight_kg: 90, type: 'working' as const, rest_seconds: 180, rpe: 7 },
            { set_number: 4, reps: 6, weight_kg: 95, type: 'working' as const, rest_seconds: 180, rpe: 8 },
            { set_number: 5, reps: 6, weight_kg: 100, type: 'working' as const, rest_seconds: 180, rpe: 9 },
          ],
        },
        {
          name: 'Romanian Deadlift',
          notes: 'Hamstring and glute builder — essential for posterior chain balance and running injury prevention.',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 60, type: 'working' as const, rest_seconds: 120, rpe: 7 },
            { set_number: 2, reps: 10, weight_kg: 65, type: 'working' as const, rest_seconds: 120, rpe: 8 },
            { set_number: 3, reps: 10, weight_kg: 65, type: 'working' as const, rest_seconds: 120, rpe: 9 },
          ],
        },
        {
          name: 'Bulgarian Split Squat',
          notes: 'Unilateral quad and glute work — fixes left/right imbalances that cause running injuries.',
          sets: [
            { set_number: 1, reps: 10, weight_kg: 16, type: 'working' as const, rest_seconds: 90, rpe: 8 },
            { set_number: 2, reps: 10, weight_kg: 16, type: 'working' as const, rest_seconds: 90, rpe: 8 },
            { set_number: 3, reps: 10, weight_kg: 18, type: 'working' as const, rest_seconds: 90, rpe: 9 },
          ],
        },
        {
          name: 'Hip Thrust',
          notes: 'Glute isolation — directly improves hip extension power for running and sprinting.',
          sets: [
            { set_number: 1, reps: 12, weight_kg: 80, type: 'working' as const, rest_seconds: 90, rpe: 8 },
            { set_number: 2, reps: 12, weight_kg: 85, type: 'working' as const, rest_seconds: 90, rpe: 9 },
            { set_number: 3, reps: 12, weight_kg: 85, type: 'working' as const, rest_seconds: 90, rpe: 9 },
          ],
        },
        {
          name: 'Leg Extension',
          notes: 'Quad isolation — targets the VMO (inner quad) which stabilises your knee during running.',
          sets: [
            { set_number: 1, reps: 15, weight_kg: 40, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 2, reps: 15, weight_kg: 40, type: 'working' as const, rest_seconds: 60, rpe: 9 },
            { set_number: 3, reps: 12, weight_kg: 45, type: 'drop' as const, rest_seconds: 0 },
          ],
        },
        {
          name: 'Standing Calf Raises',
          notes: 'Gastrocnemius work — essential for push-off power and Achilles tendon health in runners.',
          sets: [
            { set_number: 1, reps: 15, weight_kg: 60, type: 'working' as const, rest_seconds: 60, rpe: 8 },
            { set_number: 2, reps: 15, weight_kg: 60, type: 'working' as const, rest_seconds: 60, rpe: 9 },
            { set_number: 3, reps: 20, weight_kg: 50, type: 'working' as const, rest_seconds: 60, rpe: 9 },
          ],
        },
      ],
      estimated_duration_minutes: 60,
      notes: 'Heavy day — take your rest on compounds. This session has 24 working sets. Foam roll quads and glutes after.',
    },
    estimated_duration_minutes: 60,
    status: 'scheduled',
    completed_at: null,
    sort_order: 4,
    created_at: makeDemoDate(-14),
  },

  // ── Day 5: Long Run ──────────────────────────────────────────────────────
  {
    id: 'demo-5',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 3,
    day_of_week: ((new Date().getDay() || 7) + 3) % 7 + 1,
    scheduled_date: makeDemoDate(4),
    workout_type: 'long_run' as WorkoutType,
    title: 'Long Run — Progressive Build',
    description: 'Build endurance with a negative split. Start easy, finish at half marathon pace.',
    workout_data: {
      type: 'long_run' as const,
      total_distance_km: 16,
      session_purpose: 'Aerobic endurance and mental toughness. The long run teaches your body to burn fat efficiently and your mind to push through fatigue.',
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 6.3, description: 'Very easy first 2km — let your body warm up naturally.' },
        { type: 'easy' as const, distance_km: 6, target_pace_min_km: 5.5, description: 'Settle into Zone 2 — comfortable, sustainable, conversational.' },
        { type: 'steady' as const, distance_km: 4, target_pace_min_km: 5.15, description: 'Pick it up to marathon pace. You should feel purposeful but controlled.' },
        { type: 'tempo' as const, distance_km: 3, target_pace_min_km: 5.0, description: 'Half marathon pace — this is where you practice racing on tired legs.' },
        { type: 'cooldown' as const, distance_km: 1, target_pace_min_km: 6.5, description: 'Easy jog, then walk 5 min. Stretch hamstrings, quads, calves.' },
      ],
      notes: 'Take a gel or energy chews at km 8 and km 12. Hydrate every 3-4 km. This is your key endurance session of the week.',
    },
    estimated_duration_minutes: 88,
    status: 'scheduled',
    completed_at: null,
    sort_order: 5,
    created_at: makeDemoDate(-14),
  },
];

export const DEMO_COMPLETED_COUNT = 3;
export const DEMO_TOTAL_WEEK = 5;
