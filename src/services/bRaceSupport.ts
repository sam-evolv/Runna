/**
 * B-Race support service.
 * Allows users to add secondary races to their plan with
 * automatic taper/recovery adjustments.
 */

import type { Workout } from '@/types/workout';
import { addDays, differenceInDays, format, parseISO, subDays } from 'date-fns';

export type RaceDistance = '5k' | '10k' | 'half_marathon' | 'marathon' | 'other';

export type RacePriority = 'a' | 'b' | 'c';

export type RaceEffort = 'all_out' | 'hard' | 'moderate' | 'fun_run';

export interface BRace {
  id: string;
  user_id: string;
  plan_id: string;
  name: string;
  race_date: string;
  distance: RaceDistance;
  custom_distance_km?: number;
  priority: RacePriority;
  effort: RaceEffort;
  notes: string | null;
  created_at: string;
}

export interface TaperRecoveryPlan {
  taperDays: number;
  recoveryDays: number;
  taperWorkouts: WorkoutAdjustment[];
  recoveryWorkouts: WorkoutAdjustment[];
  explanation: string;
}

export interface WorkoutAdjustment {
  workoutId: string;
  originalDate: string;
  adjustmentType: 'reduce_volume' | 'reduce_intensity' | 'skip' | 'replace_easy' | 'race_day';
  volumeReduction: number; // 0-1 percentage
  intensityReduction: number; // 0-1 percentage
  note: string;
}

function getDistanceKm(distance: RaceDistance, customKm?: number): number {
  switch (distance) {
    case '5k': return 5;
    case '10k': return 10;
    case 'half_marathon': return 21.1;
    case 'marathon': return 42.2;
    case 'other': return customKm ?? 10;
  }
}

function getTaperDays(distance: RaceDistance, effort: RaceEffort): number {
  if (effort === 'fun_run') return 1;
  if (effort === 'moderate') return 2;

  const baseTaper: Record<RaceDistance, number> = {
    '5k': 3,
    '10k': 4,
    'half_marathon': 7,
    'marathon': 14,
    'other': 4,
  };

  const days = baseTaper[distance] ?? 4;
  return effort === 'hard' ? Math.ceil(days * 0.7) : days;
}

function getRecoveryDays(distance: RaceDistance, effort: RaceEffort): number {
  if (effort === 'fun_run') return 1;
  if (effort === 'moderate') return 2;

  const baseRecovery: Record<RaceDistance, number> = {
    '5k': 2,
    '10k': 3,
    'half_marathon': 5,
    'marathon': 10,
    'other': 3,
  };

  const days = baseRecovery[distance] ?? 3;
  return effort === 'hard' ? Math.ceil(days * 0.7) : days;
}

export function calculateBRaceAdjustment(
  race: Omit<BRace, 'id' | 'user_id' | 'plan_id' | 'created_at'>,
  workouts: Workout[],
): TaperRecoveryPlan {
  const raceDate = parseISO(race.race_date);
  const taperDays = getTaperDays(race.distance, race.effort);
  const recoveryDays = getRecoveryDays(race.distance, race.effort);

  const taperStart = subDays(raceDate, taperDays);
  const recoveryEnd = addDays(raceDate, recoveryDays);

  const taperWorkouts: WorkoutAdjustment[] = [];
  const recoveryWorkouts: WorkoutAdjustment[] = [];

  workouts
    .filter((w) => w.status === 'scheduled')
    .forEach((w) => {
      const wDate = parseISO(w.scheduled_date);
      const daysToRace = differenceInDays(raceDate, wDate);
      const daysAfterRace = differenceInDays(wDate, raceDate);

      // Race day
      if (format(wDate, 'yyyy-MM-dd') === format(raceDate, 'yyyy-MM-dd')) {
        taperWorkouts.push({
          workoutId: w.id,
          originalDate: w.scheduled_date,
          adjustmentType: 'race_day',
          volumeReduction: 0,
          intensityReduction: 0,
          note: `Race day: ${race.name}`,
        });
        return;
      }

      // Taper period
      if (daysToRace > 0 && daysToRace <= taperDays) {
        const taperProgress = daysToRace / taperDays; // 1 = start of taper, 0 = race day
        const volumeReduction = 0.15 + (1 - taperProgress) * 0.35; // 15% → 50%

        const isKeySession = ['interval_run', 'tempo_run', 'race_pace'].includes(w.workout_type);

        if (daysToRace <= 1) {
          taperWorkouts.push({
            workoutId: w.id,
            originalDate: w.scheduled_date,
            adjustmentType: 'replace_easy',
            volumeReduction: 0.6,
            intensityReduction: 0.3,
            note: 'Day before race — short shakeout only',
          });
        } else if (isKeySession && daysToRace > 2) {
          taperWorkouts.push({
            workoutId: w.id,
            originalDate: w.scheduled_date,
            adjustmentType: 'reduce_volume',
            volumeReduction,
            intensityReduction: 0,
            note: `Taper: volume reduced ${Math.round(volumeReduction * 100)}%, keep intensity sharp`,
          });
        } else {
          taperWorkouts.push({
            workoutId: w.id,
            originalDate: w.scheduled_date,
            adjustmentType: 'reduce_volume',
            volumeReduction,
            intensityReduction: 0.1,
            note: `Taper: reduced volume (${Math.round(volumeReduction * 100)}%)`,
          });
        }
        return;
      }

      // Recovery period
      if (daysAfterRace > 0 && daysAfterRace <= recoveryDays) {
        const recoveryProgress = daysAfterRace / recoveryDays; // 0 = day after, 1 = end of recovery

        if (daysAfterRace <= 2) {
          recoveryWorkouts.push({
            workoutId: w.id,
            originalDate: w.scheduled_date,
            adjustmentType: 'replace_easy',
            volumeReduction: 0.7,
            intensityReduction: 0.5,
            note: 'Post-race recovery — easy movement only',
          });
        } else {
          const reduction = 0.4 * (1 - recoveryProgress);
          recoveryWorkouts.push({
            workoutId: w.id,
            originalDate: w.scheduled_date,
            adjustmentType: 'reduce_intensity',
            volumeReduction: reduction,
            intensityReduction: reduction,
            note: `Recovery: easing back in (${Math.round((1 - reduction) * 100)}% normal)`,
          });
        }
      }
    });

  const distanceKm = getDistanceKm(race.distance, race.custom_distance_km);
  const explanation =
    `${race.name} (${distanceKm}km) on ${format(raceDate, 'MMM d')}. ` +
    `${taperDays}-day taper, ${recoveryDays}-day recovery. ` +
    `${taperWorkouts.length + recoveryWorkouts.length} workouts adjusted.`;

  return {
    taperDays,
    recoveryDays,
    taperWorkouts,
    recoveryWorkouts,
    explanation,
  };
}

export function getDistanceLabel(distance: RaceDistance): string {
  const labels: Record<RaceDistance, string> = {
    '5k': '5K',
    '10k': '10K',
    'half_marathon': 'Half Marathon',
    'marathon': 'Marathon',
    'other': 'Custom Distance',
  };
  return labels[distance];
}

export const B_RACE_MIGRATION = `
-- B-Race tracking table
CREATE TABLE IF NOT EXISTS races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  race_date DATE NOT NULL,
  distance TEXT NOT NULL,
  custom_distance_km NUMERIC,
  priority TEXT NOT NULL DEFAULT 'b',
  effort TEXT NOT NULL DEFAULT 'hard',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_races_user ON races(user_id);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(race_date);
`;
