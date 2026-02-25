// services/instantWorkout.ts
// Generate on-the-spot workouts based on available time, mood, and type

export type InstantWorkoutType = 'easy_run' | 'tempo_run' | 'intervals' | 'fartlek' | 'strength_full' | 'strength_upper' | 'strength_lower' | 'core' | 'mobility' | 'hiit' | 'yoga';

export interface InstantWorkoutRequest {
  type: InstantWorkoutType;
  availableMinutes: number; // 15, 20, 30, 45, 60
  intensity: 'easy' | 'moderate' | 'hard';
  equipment?: string[]; // for strength
  userStats?: {
    recentEasyPace?: number; // min/km
    recent5kPace?: number;
    benchPress1rm?: number;
    squat1rm?: number;
  };
}

export interface InstantWorkoutResult {
  title: string;
  type: InstantWorkoutType;
  description: string;
  estimatedMinutes: number;
  warmupMinutes: number;
  cooldownMinutes: number;
  // Running
  segments?: Array<{
    type: string;
    distance_km?: number;
    duration_minutes?: number;
    target_pace_min_km?: number;
    description: string;
  }>;
  // Strength
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight_kg?: number;
    rest_seconds: number;
    notes?: string;
  }>;
  notes: string;
}

// Quick templates for common instant workouts
export function generateInstantWorkout(request: InstantWorkoutRequest): InstantWorkoutResult {
  const { type, availableMinutes, intensity, userStats } = request;

  switch (type) {
    case 'easy_run': {
      const pace = userStats?.recentEasyPace || 6.0;
      const runMinutes = availableMinutes - 5; // 5 min for warmup/cooldown
      const distanceKm = runMinutes / pace;
      return {
        title: 'Easy Run',
        type,
        description: `${distanceKm.toFixed(1)} km at a comfortable pace`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 2,
        cooldownMinutes: 3,
        segments: [
          { type: 'warmup', duration_minutes: 2, target_pace_min_km: pace + 0.5, description: 'Walk/easy jog' },
          { type: 'easy', distance_km: distanceKm, target_pace_min_km: pace, description: 'Comfortable conversational pace' },
          { type: 'cooldown', duration_minutes: 3, target_pace_min_km: pace + 0.5, description: 'Easy jog to walk' },
        ],
        notes: 'Keep it conversational. You should be able to hold a full sentence throughout.',
      };
    }

    case 'tempo_run': {
      const easyPace = userStats?.recentEasyPace || 6.0;
      const tempoPace = userStats?.recent5kPace ? userStats.recent5kPace + 0.5 : easyPace - 0.8;
      const warmup = Math.min(10, Math.floor(availableMinutes * 0.2));
      const cooldown = Math.min(10, Math.floor(availableMinutes * 0.15));
      const tempoMinutes = availableMinutes - warmup - cooldown;
      return {
        title: 'Tempo Run',
        type,
        description: `${tempoMinutes} minutes at threshold pace`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: warmup,
        cooldownMinutes: cooldown,
        segments: [
          { type: 'warmup', duration_minutes: warmup, target_pace_min_km: easyPace, description: 'Easy warmup jog' },
          { type: 'tempo', duration_minutes: tempoMinutes, target_pace_min_km: tempoPace, description: 'Comfortably hard. You can say short sentences but not hold a conversation.' },
          { type: 'cooldown', duration_minutes: cooldown, target_pace_min_km: easyPace + 0.3, description: 'Easy cooldown' },
        ],
        notes: 'Tempo pace should feel "comfortably hard". If you can chat easily, push harder. If you can\'t speak at all, back off.',
      };
    }

    case 'intervals': {
      const easyPace = userStats?.recentEasyPace || 6.0;
      const intervalPace = userStats?.recent5kPace || easyPace - 1.2;
      const numIntervals = availableMinutes <= 30 ? 4 : availableMinutes <= 45 ? 6 : 8;
      const intervalDist = intensity === 'hard' ? 0.8 : intensity === 'moderate' ? 0.6 : 0.4;
      const recoveryDist = intervalDist * 0.5;
      const segments: InstantWorkoutResult['segments'] = [
        { type: 'warmup', duration_minutes: 8, target_pace_min_km: easyPace, description: 'Easy warmup with strides' },
      ];
      for (let i = 0; i < numIntervals; i++) {
        segments.push({ type: 'interval', distance_km: intervalDist, target_pace_min_km: intervalPace, description: `Hard interval ${i + 1}/${numIntervals}` });
        if (i < numIntervals - 1) {
          segments.push({ type: 'recovery', distance_km: recoveryDist, target_pace_min_km: easyPace + 0.5, description: 'Recovery jog' });
        }
      }
      segments.push({ type: 'cooldown', duration_minutes: 5, target_pace_min_km: easyPace + 0.3, description: 'Easy cooldown jog' });
      return {
        title: `${numIntervals} x ${intervalDist * 1000}m Intervals`,
        type,
        description: `${numIntervals} fast reps with recovery jogs`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 8,
        cooldownMinutes: 5,
        segments,
        notes: 'Each interval should be at a consistent effort. Don\'t go out too hard on the first rep.',
      };
    }

    case 'fartlek': {
      const easyPace = userStats?.recentEasyPace || 6.0;
      const fastPace = userStats?.recent5kPace ? userStats.recent5kPace + 0.2 : easyPace - 1.0;
      return {
        title: 'Fartlek Run',
        type,
        description: 'Unstructured speed play',
        estimatedMinutes: availableMinutes,
        warmupMinutes: 5,
        cooldownMinutes: 5,
        segments: [
          { type: 'warmup', duration_minutes: 5, target_pace_min_km: easyPace, description: 'Easy warmup' },
          { type: 'fartlek', duration_minutes: availableMinutes - 10, description: `Alternate between easy (${formatPace(easyPace)}) and fast (${formatPace(fastPace)}) as you feel. Pick landmarks - lampposts, trees, corners - and surge to them.` },
          { type: 'cooldown', duration_minutes: 5, target_pace_min_km: easyPace + 0.3, description: 'Easy cooldown' },
        ],
        notes: 'Fartlek means "speed play". There\'s no rigid structure. Speed up when you feel good, ease off when you need to. It should be fun.',
      };
    }

    case 'strength_full':
    case 'strength_upper':
    case 'strength_lower': {
      const exercises = getStrengthExercises(type, availableMinutes, intensity, request.equipment, userStats);
      return {
        title: type === 'strength_full' ? 'Full Body' : type === 'strength_upper' ? 'Upper Body' : 'Lower Body',
        type,
        description: `${intensity} intensity ${type.replace('strength_', '')} body session`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 5,
        cooldownMinutes: 3,
        exercises,
        notes: intensity === 'hard' ? 'Last 1-2 reps should be a real grind. If you could do 3+ more reps, go heavier.' : 'Focus on form and controlled movement.',
      };
    }

    case 'core': {
      const exercises = getCoreExercises(availableMinutes, intensity);
      return {
        title: 'Core Session',
        type,
        description: `${availableMinutes} minute core circuit`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 2,
        cooldownMinutes: 1,
        exercises,
        notes: 'Move continuously between exercises. Rest only when needed.',
      };
    }

    case 'mobility': {
      return {
        title: 'Mobility Flow',
        type,
        description: `${availableMinutes} minute stretch and mobility`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 0,
        cooldownMinutes: 0,
        exercises: getMobilityExercises(availableMinutes),
        notes: 'Hold each stretch for at least 30 seconds. Breathe deeply and don\'t force any positions.',
      };
    }

    case 'hiit': {
      const rounds = Math.floor((availableMinutes - 5) / 4); // ~4 min per round
      return {
        title: 'HIIT Circuit',
        type,
        description: `${rounds} rounds of high intensity intervals`,
        estimatedMinutes: availableMinutes,
        warmupMinutes: 3,
        cooldownMinutes: 2,
        exercises: [
          { name: 'Burpees', sets: rounds, reps: 10, rest_seconds: 15 },
          { name: 'Mountain Climbers', sets: rounds, reps: 20, rest_seconds: 15 },
          { name: 'Jump Squats', sets: rounds, reps: 15, rest_seconds: 15 },
          { name: 'Push-ups', sets: rounds, reps: 12, rest_seconds: 60, notes: 'Rest 60s between rounds' },
        ],
        notes: 'Maximum effort on each exercise. The rest periods are short for a reason.',
      };
    }

    default:
      return {
        title: 'Quick Workout',
        type: 'easy_run',
        description: 'Easy session',
        estimatedMinutes: availableMinutes,
        warmupMinutes: 3,
        cooldownMinutes: 2,
        notes: '',
      };
  }
}

function formatPace(pace: number): string {
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getStrengthExercises(
  type: string,
  minutes: number,
  intensity: string,
  equipment?: string[],
  userStats?: InstantWorkoutRequest['userStats']
): InstantWorkoutResult['exercises'] {
  const hasBarbell = !equipment || equipment.includes('barbell');
  const hasDumbbells = !equipment || equipment.includes('dumbbells');
  const setsPerExercise = intensity === 'hard' ? 4 : intensity === 'moderate' ? 3 : 2;
  const restSeconds = intensity === 'hard' ? 120 : intensity === 'moderate' ? 90 : 60;

  if (type === 'strength_upper') {
    const exercises: InstantWorkoutResult['exercises'] = [];
    if (hasBarbell) {
      exercises.push({ name: 'Bench Press', sets: setsPerExercise, reps: intensity === 'hard' ? 5 : 8, weight_kg: userStats?.benchPress1rm ? Math.round(userStats.benchPress1rm * (intensity === 'hard' ? 0.8 : 0.65)) : undefined, rest_seconds: restSeconds });
      exercises.push({ name: 'Overhead Press', sets: setsPerExercise, reps: 8, rest_seconds: restSeconds });
      exercises.push({ name: 'Barbell Row', sets: setsPerExercise, reps: 8, rest_seconds: restSeconds });
    }
    if (hasDumbbells) {
      exercises.push({ name: 'Dumbbell Lateral Raise', sets: 3, reps: 12, rest_seconds: 60 });
      exercises.push({ name: 'Dumbbell Curl', sets: 3, reps: 10, rest_seconds: 60 });
    }
    exercises.push({ name: 'Tricep Dips', sets: 3, reps: 12, rest_seconds: 60 });
    return exercises.slice(0, Math.floor(minutes / 8)); // ~8 min per exercise
  }

  if (type === 'strength_lower') {
    const exercises: InstantWorkoutResult['exercises'] = [];
    if (hasBarbell) {
      exercises.push({ name: 'Squat', sets: setsPerExercise, reps: intensity === 'hard' ? 5 : 8, weight_kg: userStats?.squat1rm ? Math.round(userStats.squat1rm * (intensity === 'hard' ? 0.8 : 0.65)) : undefined, rest_seconds: restSeconds });
      exercises.push({ name: 'Romanian Deadlift', sets: setsPerExercise, reps: 8, rest_seconds: restSeconds });
    }
    exercises.push({ name: 'Bulgarian Split Squat', sets: 3, reps: 10, rest_seconds: 90, notes: 'Each leg' });
    exercises.push({ name: 'Leg Curl', sets: 3, reps: 12, rest_seconds: 60 });
    exercises.push({ name: 'Calf Raise', sets: 3, reps: 15, rest_seconds: 45 });
    return exercises.slice(0, Math.floor(minutes / 8));
  }

  // Full body
  const exercises: InstantWorkoutResult['exercises'] = [];
  if (hasBarbell) {
    exercises.push({ name: 'Squat', sets: setsPerExercise, reps: 6, rest_seconds: restSeconds });
    exercises.push({ name: 'Bench Press', sets: setsPerExercise, reps: 8, rest_seconds: restSeconds });
    exercises.push({ name: 'Deadlift', sets: setsPerExercise, reps: 5, rest_seconds: 150 });
  }
  exercises.push({ name: 'Pull-ups', sets: 3, reps: 8, rest_seconds: 90, notes: 'Use assistance band if needed' });
  exercises.push({ name: 'Plank', sets: 3, reps: 45, rest_seconds: 30, notes: '45 seconds hold' });
  return exercises.slice(0, Math.floor(minutes / 8));
}

function getCoreExercises(minutes: number, intensity: string): InstantWorkoutResult['exercises'] {
  const allExercises = [
    { name: 'Plank', sets: 3, reps: 45, rest_seconds: 15, notes: '45 second hold' },
    { name: 'Dead Bug', sets: 3, reps: 10, rest_seconds: 15, notes: 'Each side' },
    { name: 'Bird Dog', sets: 3, reps: 10, rest_seconds: 15, notes: 'Each side' },
    { name: 'Side Plank', sets: 2, reps: 30, rest_seconds: 15, notes: '30 seconds each side' },
    { name: 'Bicycle Crunch', sets: 3, reps: 20, rest_seconds: 15 },
    { name: 'Mountain Climber', sets: 3, reps: 20, rest_seconds: 15 },
    { name: 'Russian Twist', sets: 3, reps: 20, rest_seconds: 15 },
    { name: 'Leg Raise', sets: 3, reps: 12, rest_seconds: 15 },
  ];
  const count = Math.min(allExercises.length, Math.floor(minutes / 3));
  return allExercises.slice(0, count);
}

function getMobilityExercises(minutes: number): InstantWorkoutResult['exercises'] {
  const allExercises = [
    { name: 'Cat-Cow', sets: 1, reps: 10, rest_seconds: 0, notes: 'Slow, controlled movement' },
    { name: 'World\'s Greatest Stretch', sets: 1, reps: 5, rest_seconds: 0, notes: 'Each side, hold 10 seconds at each position' },
    { name: 'Hip 90/90', sets: 1, reps: 8, rest_seconds: 0, notes: 'Each side' },
    { name: 'Downward Dog to Cobra', sets: 1, reps: 8, rest_seconds: 0 },
    { name: 'Pigeon Pose', sets: 1, reps: 1, rest_seconds: 0, notes: '60 seconds each side' },
    { name: 'Couch Stretch', sets: 1, reps: 1, rest_seconds: 0, notes: '45 seconds each side' },
    { name: 'Thread the Needle', sets: 1, reps: 8, rest_seconds: 0, notes: 'Each side' },
    { name: 'Standing Quad Stretch', sets: 1, reps: 1, rest_seconds: 0, notes: '30 seconds each side' },
    { name: 'Hamstring Stretch', sets: 1, reps: 1, rest_seconds: 0, notes: '30 seconds each side' },
    { name: 'Child\'s Pose', sets: 1, reps: 1, rest_seconds: 0, notes: '60 seconds, breathe deeply' },
  ];
  const count = Math.min(allExercises.length, Math.floor(minutes / 2));
  return allExercises.slice(0, count);
}

// Available time options for instant workout UI
export const TIME_OPTIONS = [15, 20, 30, 45, 60];

// Workout type options for instant workout UI
export const WORKOUT_TYPE_OPTIONS: { id: InstantWorkoutType; label: string; icon: string; category: string }[] = [
  { id: 'easy_run', label: 'Easy Run', icon: '🏃', category: 'Running' },
  { id: 'tempo_run', label: 'Tempo Run', icon: '⚡', category: 'Running' },
  { id: 'intervals', label: 'Intervals', icon: '🔥', category: 'Running' },
  { id: 'fartlek', label: 'Fartlek', icon: '🎲', category: 'Running' },
  { id: 'strength_full', label: 'Full Body', icon: '💪', category: 'Strength' },
  { id: 'strength_upper', label: 'Upper Body', icon: '🏋️', category: 'Strength' },
  { id: 'strength_lower', label: 'Lower Body', icon: '🦵', category: 'Strength' },
  { id: 'core', label: 'Core', icon: '🎯', category: 'Strength' },
  { id: 'hiit', label: 'HIIT', icon: '💥', category: 'Cardio' },
  { id: 'mobility', label: 'Mobility', icon: '🧘', category: 'Recovery' },
];
