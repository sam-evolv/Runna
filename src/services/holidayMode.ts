/**
 * Holiday mode service.
 * Handles plan adjustments when users go on holiday or need time off.
 */

import type { Workout } from '@/types/workout';
import { addDays, differenceInDays, format, parseISO, isWithinInterval } from 'date-fns';

export type HolidayReason = 'holiday' | 'illness' | 'injury' | 'personal' | 'travel';

export interface HolidayPeriod {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  reason: HolidayReason;
  strategy: RealignmentStrategy;
  notes: string | null;
  created_at: string;
}

export type RealignmentStrategy = 'skip' | 'compress' | 'extend' | 'maintain_easy';

export interface StrategyOption {
  id: RealignmentStrategy;
  label: string;
  description: string;
  emoji: string;
  recommended?: boolean;
}

export function getStrategyOptions(daysAway: number): StrategyOption[] {
  const options: StrategyOption[] = [
    {
      id: 'skip',
      label: 'Skip & Resume',
      description: 'Skip missed workouts and pick up where you left off. Best for short breaks.',
      emoji: '⏭️',
      recommended: daysAway <= 5,
    },
    {
      id: 'compress',
      label: 'Compress Plan',
      description: 'Fit remaining key sessions into fewer days. You won\'t lose progress but sessions will be closer together.',
      emoji: '📦',
      recommended: daysAway > 5 && daysAway <= 10,
    },
    {
      id: 'extend',
      label: 'Extend Plan',
      description: 'Push your plan end date back by the holiday duration. No sessions are lost.',
      emoji: '📅',
      recommended: daysAway > 10,
    },
    {
      id: 'maintain_easy',
      label: 'Easy Runs Only',
      description: 'Replace all workouts with short easy runs to maintain fitness while away.',
      emoji: '🐌',
    },
  ];

  return options;
}

export interface RealignmentResult {
  affectedWorkouts: Workout[];
  strategy: RealignmentStrategy;
  explanation: string;
  newEndDate?: string;
}

export function recommendRealignment(
  workouts: Workout[],
  startDate: string,
  endDate: string,
  reason: HolidayReason,
  strategy: RealignmentStrategy,
): RealignmentResult {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysAway = differenceInDays(end, start) + 1;

  const affectedWorkouts = workouts.filter((w) => {
    const date = parseISO(w.scheduled_date);
    return isWithinInterval(date, { start, end }) && w.status === 'scheduled';
  });

  switch (strategy) {
    case 'skip':
      return {
        affectedWorkouts: affectedWorkouts.map((w) => ({ ...w, status: 'skipped' as const })),
        strategy,
        explanation: `${affectedWorkouts.length} workouts will be skipped during your ${daysAway}-day break. Your plan will continue as normal when you return.`,
      };

    case 'compress': {
      // Move missed key sessions to after the break
      const keyTypes = ['tempo_run', 'interval_run', 'long_run', 'race_pace'];
      const keySessions = affectedWorkouts.filter((w) => keyTypes.includes(w.workout_type));
      const nonKey = affectedWorkouts.filter((w) => !keyTypes.includes(w.workout_type));

      const compressed = keySessions.map((w, i) => ({
        ...w,
        scheduled_date: format(addDays(end, i + 1), 'yyyy-MM-dd'),
      }));

      return {
        affectedWorkouts: [
          ...nonKey.map((w) => ({ ...w, status: 'skipped' as const })),
          ...compressed,
        ],
        strategy,
        explanation: `${nonKey.length} easy sessions skipped, ${keySessions.length} key sessions rescheduled to after your break.`,
      };
    }

    case 'extend': {
      // Shift all affected and future workouts by daysAway
      const shifted = affectedWorkouts.map((w) => ({
        ...w,
        scheduled_date: format(addDays(parseISO(w.scheduled_date), daysAway), 'yyyy-MM-dd'),
      }));

      const futureWorkouts = workouts
        .filter((w) => parseISO(w.scheduled_date) > end && w.status === 'scheduled')
        .map((w) => ({
          ...w,
          scheduled_date: format(addDays(parseISO(w.scheduled_date), daysAway), 'yyyy-MM-dd'),
        }));

      const allShifted = [...shifted, ...futureWorkouts];
      const latestDate = allShifted.length > 0
        ? allShifted.reduce((latest, w) => w.scheduled_date > latest ? w.scheduled_date : latest, allShifted[0].scheduled_date)
        : undefined;

      return {
        affectedWorkouts: allShifted,
        strategy,
        explanation: `Your entire plan has been pushed back by ${daysAway} days. No workouts lost.`,
        newEndDate: latestDate,
      };
    }

    case 'maintain_easy':
      return {
        affectedWorkouts: affectedWorkouts.map((w) => ({
          ...w,
          workout_type: 'easy_run' as const,
          title: 'Easy Maintenance Run',
          description: 'Keep moving with a short easy run while you\'re away',
          estimated_duration_minutes: 20,
          workout_data: {
            type: 'easy_run' as const,
            total_distance_km: 3,
            segments: [{
              type: 'easy' as const,
              distance_km: 3,
              target_pace_min_km: 7.0,
              description: 'Very easy maintenance run',
            }],
            notes: 'Holiday maintenance — keep it easy and enjoy',
          },
        })),
        strategy,
        explanation: `${affectedWorkouts.length} workouts converted to short easy runs to maintain your base fitness.`,
      };
  }
}

export interface ReturnAdjustment {
  firstSessionReduction: number; // percentage reduction in intensity
  rampUpDays: number;
  message: string;
}

export function getReturnAdjustment(daysAway: number, strategy: RealignmentStrategy): ReturnAdjustment {
  if (daysAway <= 3) {
    return {
      firstSessionReduction: 0,
      rampUpDays: 0,
      message: 'Short break — you can pick up right where you left off.',
    };
  }

  if (daysAway <= 7) {
    return {
      firstSessionReduction: 0.1,
      rampUpDays: 2,
      message: 'First 2 sessions eased by 10% to help you settle back in.',
    };
  }

  if (daysAway <= 14) {
    return {
      firstSessionReduction: 0.15,
      rampUpDays: 4,
      message: 'First 4 sessions eased by 15%. You\'ll be back to full pace within a week.',
    };
  }

  return {
    firstSessionReduction: 0.2,
    rampUpDays: 7,
    message: 'First week eased by 20%. Extended break — we\'ll build you back up gradually.',
  };
}

export const HOLIDAY_MIGRATION = `
-- Holiday periods table
CREATE TABLE IF NOT EXISTS holiday_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL DEFAULT 'holiday',
  strategy TEXT NOT NULL DEFAULT 'skip',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holiday_user ON holiday_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_holiday_plan ON holiday_periods(plan_id);
`;
