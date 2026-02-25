import { Platform } from 'react-native';
import { createStructuredWorkout, isHealthKitAvailable } from './healthkit';
import { pushWorkoutToGarmin } from './garmin';
import type { Workout, RunSegment, RunningWorkoutData } from '@/types/workout';
import { isRunningWorkout } from '@/types/workout';

export type WatchPlatform = 'apple' | 'garmin' | 'none';

/**
 * Determine which watch platform to sync to based on connected services.
 */
export function getWatchPlatform(connectedServices: string[]): WatchPlatform {
  if (Platform.OS === 'ios' && isHealthKitAvailable && connectedServices.includes('apple_health')) {
    return 'apple';
  }
  if (connectedServices.includes('garmin')) {
    return 'garmin';
  }
  return 'none';
}

/**
 * Push a running workout to the user's connected watch.
 * Creates a structured workout with pace alerts for each segment.
 */
export async function syncWorkoutToWatch(
  workout: Workout,
  platform: WatchPlatform,
): Promise<{ success: boolean; error?: string }> {
  if (!isRunningWorkout(workout.workout_data)) {
    return { success: false, error: 'Only running workouts can be synced to watch' };
  }

  const runData = workout.workout_data as RunningWorkoutData;

  switch (platform) {
    case 'apple': {
      const success = await createStructuredWorkout(
        workout.title,
        runData.segments,
        workout.scheduled_date,
      );
      return { success };
    }

    case 'garmin': {
      try {
        await pushWorkoutToGarmin(workout.id);
        return { success: true };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    }

    case 'none':
      return { success: false, error: 'No watch connected' };
  }
}

/**
 * Format segments for display in the sync preview.
 */
export function formatSegmentsForPreview(segments: RunSegment[]): string[] {
  return segments.map((seg) => {
    const paceMin = Math.floor(seg.target_pace_min_km);
    const paceSec = Math.round((seg.target_pace_min_km - paceMin) * 60);
    const paceStr = `${paceMin}:${String(paceSec).padStart(2, '0')}/km`;
    return `${seg.description} - ${seg.distance_km}km @ ${paceStr}`;
  });
}
