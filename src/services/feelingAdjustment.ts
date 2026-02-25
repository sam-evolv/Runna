// services/feelingAdjustment.ts
// "Not Feeling 100%" feature - adjusts today's workout based on how the user feels

export type FeelingLevel = 'great' | 'good' | 'okay' | 'tired' | 'sore' | 'unwell';

export interface FeelingAdjustment {
  level: FeelingLevel;
  specificIssues?: string[]; // 'legs_heavy', 'upper_body_sore', 'poor_sleep', 'stressed', 'minor_ache', 'coming_down_with_something'
  adjustedWorkout: AdjustedWorkoutResult | null;
}

export interface AdjustedWorkoutResult {
  originalType: string;
  adjustedType: string;
  paceMultiplier: number; // 1.0 = no change, 1.1 = 10% slower
  volumeMultiplier: number; // 1.0 = no change, 0.7 = 30% less volume
  weightMultiplier: number; // for strength - 1.0 = no change, 0.85 = 15% lighter
  explanation: string;
  swapSuggestion?: string; // e.g. "Consider swapping to an easy run instead"
}

export const FEELING_OPTIONS: { level: FeelingLevel; emoji: string; label: string; description: string }[] = [
  { level: 'great', emoji: '💪', label: 'Feeling great', description: 'Fully recovered, ready to push' },
  { level: 'good', emoji: '👍', label: 'Good to go', description: 'Normal energy, no issues' },
  { level: 'okay', emoji: '😐', label: 'Okay', description: 'A bit flat but can train' },
  { level: 'tired', emoji: '😴', label: 'Tired', description: 'Low energy, poor sleep or busy week' },
  { level: 'sore', emoji: '🤕', label: 'Sore or aching', description: 'Muscle soreness or minor ache' },
  { level: 'unwell', emoji: '🤒', label: 'Under the weather', description: 'Coming down with something' },
];

export const SPECIFIC_ISSUES = [
  { id: 'legs_heavy', label: 'Legs feel heavy' },
  { id: 'upper_body_sore', label: 'Upper body sore' },
  { id: 'poor_sleep', label: 'Poor sleep' },
  { id: 'stressed', label: 'Stressed / busy week' },
  { id: 'minor_ache', label: 'Minor ache or niggle' },
  { id: 'coming_down', label: 'Coming down with something' },
  { id: 'stomach', label: 'Stomach issues' },
  { id: 'headache', label: 'Headache' },
];

// Adjust a running workout based on feeling
function adjustRunningWorkout(
  workoutType: string,
  feeling: FeelingLevel,
  specificIssues: string[]
): AdjustedWorkoutResult {
  const hasLegIssues = specificIssues.includes('legs_heavy') || specificIssues.includes('minor_ache');

  switch (feeling) {
    case 'great':
    case 'good':
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 1.0,
        weightMultiplier: 1.0,
        explanation: 'No adjustments needed. You\'re good to go as planned.',
      };

    case 'okay':
      if (workoutType === 'interval_run' || workoutType === 'tempo_run') {
        return {
          originalType: workoutType,
          adjustedType: workoutType,
          paceMultiplier: 1.05, // 5% slower
          volumeMultiplier: 0.9, // 10% less volume
          weightMultiplier: 1.0,
          explanation: 'Paces reduced by 5% and volume cut slightly. Focus on completing the session rather than hitting targets.',
        };
      }
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 1.0,
        weightMultiplier: 1.0,
        explanation: 'Easy run stays as planned. Listen to your body and cut it short if needed.',
      };

    case 'tired':
      if (workoutType === 'interval_run' || workoutType === 'tempo_run') {
        return {
          originalType: workoutType,
          adjustedType: 'easy_run',
          paceMultiplier: 1.15,
          volumeMultiplier: 0.7,
          weightMultiplier: 1.0,
          explanation: 'Swapped to an easy run. When you\'re tired, hard sessions do more harm than good. Better to bank an easy run and hit the intervals when you\'re fresh.',
          swapSuggestion: 'Your interval session has been moved to later in the week.',
        };
      }
      if (workoutType === 'long_run') {
        return {
          originalType: workoutType,
          adjustedType: 'easy_run',
          paceMultiplier: 1.1,
          volumeMultiplier: 0.6,
          weightMultiplier: 1.0,
          explanation: 'Long run shortened significantly. Get out the door and move, but don\'t push distance today.',
        };
      }
      return {
        originalType: workoutType,
        adjustedType: 'easy_run',
        paceMultiplier: 1.1,
        volumeMultiplier: 0.8,
        weightMultiplier: 1.0,
        explanation: 'Paces eased off. Just get moving and keep it comfortable.',
      };

    case 'sore':
      if (hasLegIssues) {
        return {
          originalType: workoutType,
          adjustedType: workoutType === 'rest' ? 'rest' : 'easy_run',
          paceMultiplier: 1.15,
          volumeMultiplier: 0.5,
          weightMultiplier: 0.8,
          explanation: 'Significantly reduced to protect your legs. Short easy movement only. If the ache gets worse during the run, stop immediately.',
          swapSuggestion: 'Consider a mobility or stretching session instead if the soreness persists.',
        };
      }
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.1,
        volumeMultiplier: 0.75,
        weightMultiplier: 0.85,
        explanation: 'Volume and intensity reduced. Focus on movement quality and stop if anything feels wrong.',
      };

    case 'unwell':
      return {
        originalType: workoutType,
        adjustedType: 'rest',
        paceMultiplier: 0,
        volumeMultiplier: 0,
        weightMultiplier: 0,
        explanation: 'Rest day. Training when unwell delays recovery and risks making things worse. Take the day off and come back stronger.',
        swapSuggestion: 'Your plan will be realigned when you\'re feeling better.',
      };

    default:
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 1.0,
        weightMultiplier: 1.0,
        explanation: 'No adjustments applied.',
      };
  }
}

// Adjust a strength workout based on feeling
function adjustStrengthWorkout(
  workoutType: string,
  feeling: FeelingLevel,
  specificIssues: string[]
): AdjustedWorkoutResult {
  const hasUpperIssues = specificIssues.includes('upper_body_sore');
  const hasLegIssues = specificIssues.includes('legs_heavy');

  switch (feeling) {
    case 'great':
    case 'good':
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 1.0,
        weightMultiplier: 1.0,
        explanation: 'Full session as planned.',
      };

    case 'okay':
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 0.85,
        weightMultiplier: 0.95,
        explanation: 'Weights reduced by 5% and one set dropped from each exercise. Focus on form.',
      };

    case 'tired':
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 0.65,
        weightMultiplier: 0.85,
        explanation: 'Lighter session with reduced volume. Hit the main compound lifts and skip accessories.',
      };

    case 'sore':
      if (hasUpperIssues && workoutType.includes('upper')) {
        return {
          originalType: workoutType,
          adjustedType: 'mobility',
          paceMultiplier: 1.0,
          volumeMultiplier: 0,
          weightMultiplier: 0,
          explanation: 'Swapped to mobility work. Your upper body needs recovery, not more load.',
          swapSuggestion: 'Upper body session moved to later in the week.',
        };
      }
      if (hasLegIssues && workoutType.includes('lower')) {
        return {
          originalType: workoutType,
          adjustedType: 'mobility',
          paceMultiplier: 1.0,
          volumeMultiplier: 0,
          weightMultiplier: 0,
          explanation: 'Swapped to mobility work. Let your legs recover properly.',
          swapSuggestion: 'Lower body session moved to later in the week.',
        };
      }
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 0.7,
        weightMultiplier: 0.8,
        explanation: 'Reduced weights and volume. Stop any exercise that aggravates the soreness.',
      };

    case 'unwell':
      return {
        originalType: workoutType,
        adjustedType: 'rest',
        paceMultiplier: 0,
        volumeMultiplier: 0,
        weightMultiplier: 0,
        explanation: 'Rest day. Your body needs recovery, not training stress right now.',
      };

    default:
      return {
        originalType: workoutType,
        adjustedType: workoutType,
        paceMultiplier: 1.0,
        volumeMultiplier: 1.0,
        weightMultiplier: 1.0,
        explanation: 'No adjustments.',
      };
  }
}

// Main adjustment function
export function adjustWorkout(
  workoutType: string,
  activityType: 'running' | 'strength' | 'swim' | 'bike' | 'mobility',
  feeling: FeelingLevel,
  specificIssues: string[] = []
): AdjustedWorkoutResult {
  if (activityType === 'running' || activityType === 'bike') {
    return adjustRunningWorkout(workoutType, feeling, specificIssues);
  }
  if (activityType === 'strength') {
    return adjustStrengthWorkout(workoutType, feeling, specificIssues);
  }
  // Mobility/swim - minimal adjustment
  if (feeling === 'unwell') {
    return {
      originalType: workoutType,
      adjustedType: 'rest',
      paceMultiplier: 0,
      volumeMultiplier: 0,
      weightMultiplier: 0,
      explanation: 'Rest day recommended.',
    };
  }
  return {
    originalType: workoutType,
    adjustedType: workoutType,
    paceMultiplier: 1.0,
    volumeMultiplier: feeling === 'tired' ? 0.7 : 1.0,
    weightMultiplier: 1.0,
    explanation: feeling === 'tired' ? 'Shortened session.' : 'No adjustments needed.',
  };
}

// Apply adjustment multipliers to a running workout's segments
export function applyRunningAdjustment(
  segments: Array<{ type: string; distance_km: number; target_pace_min_km: number; description: string }>,
  adjustment: AdjustedWorkoutResult
): Array<{ type: string; distance_km: number; target_pace_min_km: number; description: string }> {
  if (adjustment.adjustedType === 'rest') return [];

  return segments.map((seg) => ({
    ...seg,
    distance_km: Math.round(seg.distance_km * adjustment.volumeMultiplier * 100) / 100,
    target_pace_min_km: Math.round(seg.target_pace_min_km * adjustment.paceMultiplier * 100) / 100,
  }));
}

// Apply adjustment multipliers to a strength workout's exercises
export function applyStrengthAdjustment(
  exercises: Array<{
    name: string;
    sets: Array<{ set_number: number; reps: number; weight_kg: number; type: string; rest_seconds: number }>;
  }>,
  adjustment: AdjustedWorkoutResult
): Array<{
  name: string;
  sets: Array<{ set_number: number; reps: number; weight_kg: number; type: string; rest_seconds: number }>;
}> {
  if (adjustment.adjustedType === 'rest' || adjustment.adjustedType === 'mobility') return [];

  return exercises.map((exercise) => {
    // Reduce number of sets based on volume multiplier
    const targetSets = Math.max(1, Math.round(exercise.sets.length * adjustment.volumeMultiplier));
    const adjustedSets = exercise.sets.slice(0, targetSets).map((set) => ({
      ...set,
      weight_kg: Math.round(set.weight_kg * adjustment.weightMultiplier * 2) / 2, // Round to nearest 0.5kg
    }));
    return { ...exercise, sets: adjustedSets };
  });
}
