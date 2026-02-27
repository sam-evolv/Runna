/**
 * Feeling-based workout adjustment service.
 * Allows users to report how they feel before a workout
 * and automatically adjusts intensity accordingly.
 */

import type { Workout, RunningWorkoutData, RunSegment } from '@/types/workout';

export type FeelingLevel = 'great' | 'good' | 'okay' | 'tired' | 'sore';

export interface FeelingOption {
  id: FeelingLevel;
  label: string;
  emoji: string;
  description: string;
}

export const FEELING_OPTIONS: FeelingOption[] = [
  { id: 'great', label: 'Great', emoji: '💪', description: 'Full energy, ready to push' },
  { id: 'good', label: 'Good', emoji: '👍', description: 'Normal, feeling ready' },
  { id: 'okay', label: 'Okay', emoji: '😐', description: 'A bit low but can manage' },
  { id: 'tired', label: 'Tired', emoji: '😴', description: 'Fatigued or didn\'t sleep well' },
  { id: 'sore', label: 'Sore', emoji: '🤕', description: 'Muscles aching or minor niggles' },
];

export type SpecificIssue =
  | 'poor_sleep'
  | 'muscle_soreness'
  | 'stress'
  | 'mild_illness'
  | 'previous_hard_session'
  | 'nutrition';

export interface SpecificIssueOption {
  id: SpecificIssue;
  label: string;
  emoji: string;
}

export const SPECIFIC_ISSUES: SpecificIssueOption[] = [
  { id: 'poor_sleep', label: 'Poor Sleep', emoji: '🌙' },
  { id: 'muscle_soreness', label: 'Muscle Soreness', emoji: '🦵' },
  { id: 'stress', label: 'Work / Life Stress', emoji: '😤' },
  { id: 'mild_illness', label: 'Feeling Under the Weather', emoji: '🤒' },
  { id: 'previous_hard_session', label: 'Still Recovering from Last Session', emoji: '🔄' },
  { id: 'nutrition', label: 'Haven\'t Eaten Well', emoji: '🍽️' },
];

export interface AdjustmentResult {
  adjustedWorkout: Workout;
  explanation: string;
  paceReduction: number; // percentage, e.g., 0.1 = 10% slower
  distanceReduction: number; // percentage
  wasAdjusted: boolean;
}

function getAdjustmentFactors(
  feeling: FeelingLevel,
  issues: SpecificIssue[],
): { paceSlowdown: number; distanceCut: number } {
  let paceSlowdown = 0;
  let distanceCut = 0;

  switch (feeling) {
    case 'great':
      return { paceSlowdown: 0, distanceCut: 0 };
    case 'good':
      return { paceSlowdown: 0, distanceCut: 0 };
    case 'okay':
      paceSlowdown = 0.05;
      distanceCut = 0;
      break;
    case 'tired':
      paceSlowdown = 0.1;
      distanceCut = 0.1;
      break;
    case 'sore':
      paceSlowdown = 0.12;
      distanceCut = 0.15;
      break;
  }

  // Additional adjustments for specific issues
  if (issues.includes('poor_sleep')) {
    paceSlowdown += 0.03;
  }
  if (issues.includes('mild_illness')) {
    paceSlowdown += 0.08;
    distanceCut += 0.15;
  }
  if (issues.includes('previous_hard_session')) {
    paceSlowdown += 0.05;
    distanceCut += 0.05;
  }
  if (issues.includes('muscle_soreness')) {
    paceSlowdown += 0.03;
  }
  if (issues.includes('nutrition')) {
    paceSlowdown += 0.02;
    distanceCut += 0.05;
  }

  return {
    paceSlowdown: Math.min(paceSlowdown, 0.25), // Cap at 25% slower
    distanceCut: Math.min(distanceCut, 0.3), // Cap at 30% shorter
  };
}

function adjustSegment(segment: RunSegment, paceSlowdown: number, distanceCut: number): RunSegment {
  return {
    ...segment,
    target_pace_min_km: segment.target_pace_min_km * (1 + paceSlowdown),
    distance_km: segment.distance_km * (1 - distanceCut),
  };
}

function generateExplanation(
  feeling: FeelingLevel,
  issues: SpecificIssue[],
  paceSlowdown: number,
  distanceCut: number,
): string {
  if (paceSlowdown === 0 && distanceCut === 0) {
    return 'You\'re feeling good — no adjustments needed. Let\'s go!';
  }

  const parts: string[] = [];

  if (paceSlowdown > 0) {
    parts.push(`Pace targets slowed by ${Math.round(paceSlowdown * 100)}%`);
  }
  if (distanceCut > 0) {
    parts.push(`Distance reduced by ${Math.round(distanceCut * 100)}%`);
  }

  const issueLabels = issues.map((i) => SPECIFIC_ISSUES.find((s) => s.id === i)?.label).filter(Boolean);
  const reasonText = issueLabels.length > 0
    ? ` Based on: ${issueLabels.join(', ').toLowerCase()}.`
    : '';

  return `Adjusted for how you're feeling today. ${parts.join('. ')}.${reasonText} Listen to your body — it's okay to take it easier.`;
}

export function adjustWorkout(
  workout: Workout,
  feeling: FeelingLevel,
  issues: SpecificIssue[] = [],
): AdjustmentResult {
  if (feeling === 'great' || feeling === 'good') {
    return {
      adjustedWorkout: workout,
      explanation: generateExplanation(feeling, issues, 0, 0),
      paceReduction: 0,
      distanceReduction: 0,
      wasAdjusted: false,
    };
  }

  const { paceSlowdown, distanceCut } = getAdjustmentFactors(feeling, issues);

  const workoutData = workout.workout_data;
  if ('segments' in workoutData) {
    const runData = workoutData as RunningWorkoutData;
    const adjustedSegments = runData.segments.map((seg) =>
      adjustSegment(seg, paceSlowdown, distanceCut),
    );
    const adjustedTotalDistance = adjustedSegments.reduce((sum, s) => sum + s.distance_km, 0);

    const adjustedWorkout: Workout = {
      ...workout,
      workout_data: {
        ...runData,
        segments: adjustedSegments,
        total_distance_km: adjustedTotalDistance,
      },
    };

    return {
      adjustedWorkout,
      explanation: generateExplanation(feeling, issues, paceSlowdown, distanceCut),
      paceReduction: paceSlowdown,
      distanceReduction: distanceCut,
      wasAdjusted: true,
    };
  }

  // Non-running workouts — no adjustment for now
  return {
    adjustedWorkout: workout,
    explanation: generateExplanation(feeling, issues, 0, 0),
    paceReduction: 0,
    distanceReduction: 0,
    wasAdjusted: false,
  };
}
