/**
 * Workout briefing service.
 * Generates a pre-workout briefing with purpose, tips, nutrition, and mental cues.
 */

import type { Workout, RunningWorkoutData, StrengthWorkoutData } from '@/types/workout';
import { isRunningWorkout } from '@/types/workout';

export interface WorkoutBriefing {
  purpose: string;
  keyTips: string[];
  nutrition: string;
  warmupAdvice: string;
  mentalCue: string;
}

const RUN_TYPE_PURPOSES: Record<string, string> = {
  easy_run: 'Build aerobic base and promote recovery. This run should feel comfortable — you should be able to hold a conversation throughout.',
  tempo_run: 'Improve your lactate threshold. This sustained effort teaches your body to clear lactate more efficiently, making you faster over time.',
  interval_run: 'Boost VO2max and running economy. High-intensity repeats push your cardiovascular system to adapt and improve.',
  long_run: 'Build endurance and mental toughness. The long run is the backbone of your training — it teaches your body to use fat as fuel and strengthens your aerobic engine.',
  recovery_run: 'Active recovery to flush out metabolic waste. Keep this genuinely easy — the purpose is recovery, not fitness.',
  fartlek: 'Develop speed with play. Fartlek adds variety and teaches your body to change pace, which is valuable for racing.',
  hill_run: 'Build strength and power. Hills recruit more muscle fibres and improve your running economy on flat ground too.',
  race_pace: 'Practice your race-day effort. This session builds confidence and teaches your body exactly what race pace feels like.',
};

const RUN_TYPE_TIPS: Record<string, string[]> = {
  easy_run: [
    'Keep your breathing relaxed — nose breathing is a good check',
    'Focus on smooth, relaxed form. Shoulders down, hands loose',
    'Don\'t chase a pace — go by feel today',
  ],
  tempo_run: [
    'Start conservatively — tempo effort builds through the session',
    'Breathe rhythmically. 3-2 or 2-2 breathing pattern works well',
    'Stay relaxed in your upper body even as effort increases',
    'Think "comfortably hard" — you could speak in short phrases',
  ],
  interval_run: [
    'Use the warm-up fully — don\'t start intervals cold',
    'Focus on form during recoveries, not just the fast reps',
    'Each repeat should be controlled, not all-out',
    'Recovery jogs should be genuinely easy — walking is fine',
  ],
  long_run: [
    'Start slower than you think you need to',
    'Fuel early — don\'t wait until you\'re hungry',
    'Break it into mental segments if it feels daunting',
    'The last few km should be the strongest',
  ],
  recovery_run: [
    'Slower than you think. Then slow down more',
    'If in doubt, walk. This run is about recovery',
    'Keep it short — more is not better today',
  ],
  fartlek: [
    'Use landmarks for your surges — lampposts, trees, junctions',
    'Vary the length and intensity of surges',
    'Have fun with it — fartlek means "speed play"',
  ],
  hill_run: [
    'Shorten your stride on the uphill, increase cadence',
    'Drive your arms — they power you up the hill',
    'Use the downhill for recovery, not speed',
    'Lean slightly into the hill from your ankles',
  ],
  race_pace: [
    'Treat this like a dress rehearsal for race day',
    'Wear the gear you plan to race in',
    'Practice your fuelling strategy',
    'Focus on even splits throughout',
  ],
};

const NUTRITION_BY_DURATION: Array<{ maxMinutes: number; advice: string }> = [
  { maxMinutes: 30, advice: 'A light snack 30-60 minutes before is enough. Stay hydrated.' },
  { maxMinutes: 45, advice: 'Have a small carb-rich snack 1-2 hours before. Water is fine — no need for gels.' },
  { maxMinutes: 60, advice: 'Eat a balanced meal 2-3 hours before, or a carb snack 60 minutes before. Bring water.' },
  { maxMinutes: 90, advice: 'Eat a proper meal 2-3 hours before. Consider a gel or energy chew at 45 minutes. Hydrate throughout.' },
  { maxMinutes: Infinity, advice: 'Carb-load the night before. Eat 2-3 hours before. Plan your fuelling — aim for 30-60g carbs per hour after the first 45 minutes.' },
];

const WARMUP_ADVICE: Record<string, string> = {
  easy_run: '5 minutes of walking or very light jogging. No dynamic stretches needed — the run itself is the warm-up.',
  tempo_run: '10 minutes easy jog, then 4-6 dynamic stretches (leg swings, high knees, butt kicks). Add 2-3 strides to wake up your legs.',
  interval_run: '10-15 minutes easy jog building to moderate. Dynamic stretches, then 3-4 strides at increasing pace. Your legs should feel springy before the first rep.',
  long_run: 'Start the first mile very easy — let your body wake up naturally. No need for a separate warm-up.',
  recovery_run: 'Just start walking and gradually transition to a very easy jog. Your body will warm up on its own.',
  fartlek: '8-10 minutes easy jog with a few strides. Save the fast stuff for the session.',
  hill_run: '10 minutes easy jog on flat ground, then dynamic stretches. Do 2-3 easy hill strides before the main set.',
  race_pace: '10-15 minutes easy jog. Dynamic stretches. 4-5 strides building to race pace. You should feel sharp and ready.',
};

const MENTAL_CUES: Record<string, string[]> = {
  easy_run: [
    'This is active recovery. Enjoy the movement.',
    'Easy running is an investment — trust the process.',
    'Relax your face, relax your pace.',
  ],
  tempo_run: [
    'Find your rhythm and lock in. You\'re stronger than you think.',
    'Controlled intensity. This is where breakthroughs happen.',
    'Embrace the discomfort — it\'s making you faster.',
  ],
  interval_run: [
    'Each rep is a deposit in your fitness bank.',
    'Attack the intervals, respect the recoveries.',
    'Short and sharp. Give each one full focus.',
  ],
  long_run: [
    'One km at a time. The miles will take care of themselves.',
    'You\'re building something today. Stay patient.',
    'When it gets tough, remember why you started.',
  ],
  recovery_run: [
    'Less is more today. Trust recovery.',
    'Your body builds fitness at rest, not during hard sessions.',
  ],
  fartlek: [
    'Play with your pace. Have fun out there.',
    'Speed play — emphasis on play.',
  ],
  hill_run: [
    'Hills are strength training in disguise.',
    'Attack the climb, recover on the descent.',
  ],
  race_pace: [
    'This is what race day will feel like. Own it.',
    'Confidence comes from preparation. You\'re prepared.',
  ],
};

export function generateBriefing(workout: Workout): WorkoutBriefing {
  if (!isRunningWorkout(workout.workout_data)) {
    // Strength briefing
    const strengthData = workout.workout_data as StrengthWorkoutData;
    return {
      purpose: `Strength session focusing on ${strengthData.focus.toLowerCase()}. Complementary strength work improves running economy and reduces injury risk.`,
      keyTips: [
        'Focus on form over weight — quality reps matter most',
        'Breathe through each rep — exhale on exertion',
        'Rest fully between sets for strength work',
      ],
      nutrition: 'Have a balanced meal 1-2 hours before. Protein-rich snack within 30 minutes after.',
      warmupAdvice: '5 minutes light cardio (walking, jumping jacks), then activation exercises targeting today\'s muscle groups.',
      mentalCue: 'Strong legs make fast runners. This is part of the plan.',
    };
  }

  const runData = workout.workout_data as RunningWorkoutData;
  const runType = runData.type;
  const durationMin = workout.estimated_duration_minutes;

  const purpose = RUN_TYPE_PURPOSES[runType] || 'Build fitness and enjoy the run.';
  const keyTips = RUN_TYPE_TIPS[runType] || ['Focus on form', 'Stay relaxed', 'Enjoy the run'];
  const warmupAdvice = WARMUP_ADVICE[runType] || 'Start easy and build gradually.';

  const nutritionEntry = NUTRITION_BY_DURATION.find((n) => durationMin <= n.maxMinutes);
  const nutrition = nutritionEntry?.advice || 'Stay hydrated and fuel appropriately.';

  const cues = MENTAL_CUES[runType] || ['Stay focused and enjoy the run.'];
  const mentalCue = cues[Math.floor(Math.random() * cues.length)];

  return {
    purpose,
    keyTips,
    nutrition,
    warmupAdvice,
    mentalCue,
  };
}
