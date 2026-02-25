// services/holidayMode.ts
// Holiday/vacation mode - pause training plan and realign when user returns

export interface HolidayPeriod {
  id: string;
  userId: string;
  planId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  reason: 'holiday' | 'vacation' | 'illness' | 'injury' | 'busy' | 'other';
  notes?: string;
  daysOff: number;
  realignmentStrategy: RealignmentStrategy;
  createdAt: string;
}

export type RealignmentStrategy = 'compress' | 'extend' | 'skip' | 'reduce';

export interface RealignmentResult {
  strategy: RealignmentStrategy;
  description: string;
  originalEndDate: string;
  newEndDate: string;
  weeksAffected: number;
  workoutsRemoved: number;
  workoutsCompressed: number;
  warnings: string[];
}

// Calculate days between two dates
function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

// Add days to a date
function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Determine best realignment strategy based on time off and remaining plan
export function recommendRealignment(params: {
  daysOff: number;
  weeksRemaining: number;
  hasTargetEvent: boolean;
  eventDate?: string;
  currentDate: string;
}): {
  recommended: RealignmentStrategy;
  options: Array<{ strategy: RealignmentStrategy; description: string; tradeoff: string }>;
} {
  const { daysOff, weeksRemaining, hasTargetEvent, eventDate, currentDate } = params;

  const options: Array<{ strategy: RealignmentStrategy; description: string; tradeoff: string }> = [];

  // If they have a target event
  if (hasTargetEvent && eventDate) {
    const daysToEvent = daysBetween(currentDate, eventDate);
    const daysAfterReturn = daysToEvent - daysOff;

    if (daysOff <= 3) {
      // Short break - just skip and continue
      options.push({
        strategy: 'skip',
        description: 'Skip missed workouts and pick up where you left off',
        tradeoff: 'Minimal impact. You won\'t miss much fitness in 3 days.',
      });
    }

    if (daysOff <= 7 && daysAfterReturn > 21) {
      // Compress - squeeze missed sessions into remaining weeks
      options.push({
        strategy: 'compress',
        description: 'Compress remaining plan to fit your event date',
        tradeoff: 'Higher weekly volume for a few weeks, but you stay on track for your event.',
      });
    }

    if (daysOff > 3) {
      // Extend - push event date or accept reduced fitness
      options.push({
        strategy: 'extend',
        description: `Extend plan by ${daysOff} days (new end date: ${addDays(eventDate, daysOff)})`,
        tradeoff: 'Keeps your training volume correct but pushes your peak fitness date.',
      });
    }

    if (daysOff > 7) {
      // Reduce - remove a training phase and lower targets
      options.push({
        strategy: 'reduce',
        description: 'Reduce plan intensity and adjust race targets',
        tradeoff: 'Your race targets may need to be adjusted, but you\'ll be properly trained for a revised goal.',
      });
    }
  } else {
    // No target event - simpler
    if (daysOff <= 5) {
      options.push({
        strategy: 'skip',
        description: 'Skip missed sessions and continue from where you are',
        tradeoff: 'No real impact on a general training plan.',
      });
    }
    options.push({
      strategy: 'extend',
      description: `Extend plan by ${daysOff} days`,
      tradeoff: 'No rush. Pick up exactly where you left off.',
    });
  }

  // Recommend the first option
  return {
    recommended: options[0]?.strategy || 'skip',
    options,
  };
}

// Apply realignment to a plan
export function applyRealignment(params: {
  planEndDate: string;
  daysOff: number;
  strategy: RealignmentStrategy;
  remainingWorkouts: Array<{ id: string; scheduled_date: string; workout_type: string }>;
}): RealignmentResult {
  const { planEndDate, daysOff, strategy, remainingWorkouts } = params;

  switch (strategy) {
    case 'skip': {
      // Remove workouts during the holiday period - rest stays as-is
      const workoutsToRemove = remainingWorkouts.filter((w) => {
        // This would be filtered by holiday dates in practice
        return false; // Placeholder - actual filtering happens in the caller
      });
      return {
        strategy: 'skip',
        description: 'Skipped missed workouts. Plan continues from where you left off.',
        originalEndDate: planEndDate,
        newEndDate: planEndDate,
        weeksAffected: Math.ceil(daysOff / 7),
        workoutsRemoved: Math.ceil(daysOff * 0.7), // Approx workouts in that period
        workoutsCompressed: 0,
        warnings: daysOff > 7
          ? ['You\'ve been off for more than a week. The first few sessions back may feel harder than expected. Ease into it.']
          : [],
      };
    }

    case 'extend': {
      const newEndDate = addDays(planEndDate, daysOff);
      return {
        strategy: 'extend',
        description: `Plan extended by ${daysOff} days. All remaining workouts shifted forward.`,
        originalEndDate: planEndDate,
        newEndDate,
        weeksAffected: Math.ceil(daysOff / 7),
        workoutsRemoved: 0,
        workoutsCompressed: 0,
        warnings: [],
      };
    }

    case 'compress': {
      const weeksToCompress = Math.ceil(daysOff / 7);
      return {
        strategy: 'compress',
        description: `Compressed ${weeksToCompress} weeks of training into remaining schedule. Some easy runs removed, key sessions preserved.`,
        originalEndDate: planEndDate,
        newEndDate: planEndDate,
        weeksAffected: weeksToCompress,
        workoutsRemoved: Math.ceil(daysOff * 0.3), // Remove ~30% of missed sessions
        workoutsCompressed: Math.ceil(daysOff * 0.4), // Compress ~40%
        warnings: [
          'Weekly volume will be higher than planned for the next few weeks.',
          'Listen to your body. If you feel overly fatigued, skip an easy run.',
        ],
      };
    }

    case 'reduce': {
      return {
        strategy: 'reduce',
        description: 'Plan intensity and targets have been reduced to account for the break. Race pace targets adjusted.',
        originalEndDate: planEndDate,
        newEndDate: planEndDate,
        weeksAffected: Math.ceil(daysOff / 7),
        workoutsRemoved: Math.ceil(daysOff * 0.5),
        workoutsCompressed: 0,
        warnings: [
          'Your race time targets have been adjusted based on the training break.',
          'This is the safest approach - it reduces injury risk while keeping you prepared.',
        ],
      };
    }

    default:
      return {
        strategy: 'skip',
        description: 'No changes applied.',
        originalEndDate: planEndDate,
        newEndDate: planEndDate,
        weeksAffected: 0,
        workoutsRemoved: 0,
        workoutsCompressed: 0,
        warnings: [],
      };
  }
}

// Return-from-holiday workout adjustment
// After a break, the first few sessions should be easier
export function getReturnAdjustment(daysOff: number): {
  sessionsToEase: number;
  paceMultiplier: number;
  volumeMultiplier: number;
  message: string;
} {
  if (daysOff <= 3) {
    return { sessionsToEase: 0, paceMultiplier: 1.0, volumeMultiplier: 1.0, message: 'Short break. Jump straight back in.' };
  }
  if (daysOff <= 7) {
    return { sessionsToEase: 2, paceMultiplier: 1.05, volumeMultiplier: 0.9, message: 'First 2 sessions eased off slightly. You\'ll be back to normal quickly.' };
  }
  if (daysOff <= 14) {
    return { sessionsToEase: 4, paceMultiplier: 1.1, volumeMultiplier: 0.8, message: 'First week back is at reduced intensity. Don\'t try to make up for lost time.' };
  }
  return { sessionsToEase: 6, paceMultiplier: 1.15, volumeMultiplier: 0.7, message: 'First 2 weeks back at reduced intensity. Rebuild gradually - rushing back risks injury.' };
}

// SQL for holiday tracking
export const HOLIDAY_MIGRATION = `
create table if not exists holiday_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan_id uuid references plans(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null,
  notes text,
  days_off integer not null,
  realignment_strategy text not null,
  created_at timestamptz default now()
);
`;
