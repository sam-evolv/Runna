// services/bRaceSupport.ts
// B-race support - add secondary events with automatic taper and recovery adjustments

export interface BRace {
  id: string;
  planId: string;
  userId: string;
  name: string;
  date: string;
  distance: string; // '5k', '10k', 'half_marathon', 'marathon', 'other'
  distanceKm?: number; // for custom distances
  priority: 'low' | 'medium' | 'high'; // how much to taper for it
  effort: 'easy' | 'moderate' | 'race'; // what effort level to run at
  notes?: string;
  createdAt: string;
}

export interface BRacePlanAdjustment {
  taperDays: number;
  recoveryDays: number;
  workoutsModified: number;
  description: string;
  preTaperAdjustments: Array<{
    date: string;
    originalType: string;
    adjustedType: string;
    reason: string;
  }>;
  postRaceAdjustments: Array<{
    date: string;
    originalType: string;
    adjustedType: string;
    reason: string;
  }>;
}

// Calculate taper and recovery based on B-race priority and distance
export function calculateBRaceAdjustment(bRace: BRace): BRacePlanAdjustment {
  const { priority, effort, distance } = bRace;

  // Taper days before race
  let taperDays: number;
  if (priority === 'low') {
    taperDays = effort === 'race' ? 2 : 0;
  } else if (priority === 'medium') {
    taperDays = distance === 'marathon' ? 5 : distance === 'half_marathon' ? 3 : 2;
  } else {
    taperDays = distance === 'marathon' ? 7 : distance === 'half_marathon' ? 5 : 3;
  }

  // Recovery days after race
  let recoveryDays: number;
  if (effort === 'easy') {
    recoveryDays = 1;
  } else if (effort === 'moderate') {
    recoveryDays = distance === 'marathon' ? 5 : distance === 'half_marathon' ? 3 : 2;
  } else {
    // Full race effort
    recoveryDays = distance === 'marathon' ? 10 : distance === 'half_marathon' ? 5 : distance === '10k' ? 3 : 2;
  }

  const preTaperAdjustments: BRacePlanAdjustment['preTaperAdjustments'] = [];
  const postRaceAdjustments: BRacePlanAdjustment['postRaceAdjustments'] = [];

  // Pre-race taper adjustments
  if (taperDays >= 1) {
    preTaperAdjustments.push({
      date: '', // Calculated by caller relative to race date
      originalType: 'any_hard_session',
      adjustedType: 'easy_run',
      reason: 'Day before race - easy run or rest only',
    });
  }
  if (taperDays >= 3) {
    preTaperAdjustments.push({
      date: '',
      originalType: 'interval_run',
      adjustedType: 'easy_run_with_strides',
      reason: '2-3 days before - replace intervals with easy run + 4-6 strides',
    });
  }
  if (taperDays >= 5) {
    preTaperAdjustments.push({
      date: '',
      originalType: 'long_run',
      adjustedType: 'moderate_run',
      reason: 'Long run shortened in race week',
    });
  }

  // Post-race recovery adjustments
  postRaceAdjustments.push({
    date: '',
    originalType: 'any',
    adjustedType: 'rest',
    reason: 'Rest day after race',
  });
  if (recoveryDays >= 2) {
    postRaceAdjustments.push({
      date: '',
      originalType: 'any',
      adjustedType: 'easy_run',
      reason: 'Easy recovery run - very short and slow',
    });
  }
  if (recoveryDays >= 3) {
    postRaceAdjustments.push({
      date: '',
      originalType: 'interval_run',
      adjustedType: 'easy_run',
      reason: 'No hard sessions in the recovery window',
    });
  }

  let description: string;
  if (priority === 'low' && effort === 'easy') {
    description = `Minimal impact on your plan. Treat ${bRace.name} as a training run at easy effort.`;
  } else if (priority === 'low') {
    description = `Light adjustment around ${bRace.name}. ${taperDays} day${taperDays !== 1 ? 's' : ''} taper, ${recoveryDays} day${recoveryDays !== 1 ? 's' : ''} recovery.`;
  } else if (priority === 'medium') {
    description = `Moderate adjustment for ${bRace.name}. Key sessions preserved but volume reduced around race day.`;
  } else {
    description = `Significant plan adjustment for ${bRace.name}. Full taper and recovery protocol applied. This may slightly impact your A-race preparation.`;
  }

  return {
    taperDays,
    recoveryDays,
    workoutsModified: preTaperAdjustments.length + postRaceAdjustments.length,
    description,
    preTaperAdjustments,
    postRaceAdjustments,
  };
}

// Estimate race time based on current training data
export function estimateBRaceTime(params: {
  distance: string;
  distanceKm?: number;
  recent5kTime?: number; // seconds
  recent10kTime?: number;
  recentHalfTime?: number;
}): { estimatedSeconds: number; estimatedFormatted: string; confidence: 'low' | 'medium' | 'high' } | null {
  const { distance, recent5kTime, recent10kTime, recentHalfTime } = params;

  // Use Riegel formula: T2 = T1 * (D2/D1)^1.06
  let referenceTime: number | undefined;
  let referenceDistance: number;

  if (recent5kTime) {
    referenceTime = recent5kTime;
    referenceDistance = 5;
  } else if (recent10kTime) {
    referenceTime = recent10kTime;
    referenceDistance = 10;
  } else if (recentHalfTime) {
    referenceTime = recentHalfTime;
    referenceDistance = 21.1;
  }

  if (!referenceTime) return null;

  const targetDistance = distance === '5k' ? 5 : distance === '10k' ? 10 : distance === 'half_marathon' ? 21.1 : distance === 'marathon' ? 42.2 : params.distanceKm || 10;

  const estimatedSeconds = Math.round(referenceTime * Math.pow(targetDistance / referenceDistance, 1.06));

  const hrs = Math.floor(estimatedSeconds / 3600);
  const mins = Math.floor((estimatedSeconds % 3600) / 60);
  const secs = estimatedSeconds % 60;
  const estimatedFormatted = hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;

  // Confidence based on how close the reference distance is to target
  const ratio = targetDistance / referenceDistance;
  const confidence = ratio <= 2.5 ? 'high' : ratio <= 5 ? 'medium' : 'low';

  return { estimatedSeconds, estimatedFormatted, confidence };
}

// SQL migration
export const B_RACE_MIGRATION = `
create table if not exists b_races (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  name text not null,
  date date not null,
  distance text not null,
  distance_km numeric,
  priority text not null default 'medium',
  effort text not null default 'race',
  notes text,
  created_at timestamptz default now()
);
`;
