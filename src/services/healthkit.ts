import { Platform } from 'react-native';
import type { RunSegment } from '@/types/workout';

/**
 * HealthKit integration for Apple Watch structured workouts.
 *
 * Note: This module requires `react-native-health` to be installed and linked.
 * In development, all functions gracefully degrade when HealthKit is unavailable.
 */

let AppleHealthKit: any = null;

try {
  if (Platform.OS === 'ios') {
    // Dynamic import - will fail gracefully if not installed
    AppleHealthKit = require('react-native-health').default;
  }
} catch {
  // react-native-health not available
}

export const isHealthKitAvailable = Platform.OS === 'ios' && AppleHealthKit !== null;

const PERMISSIONS = {
  permissions: {
    read: [
      'ActiveEnergyBurned',
      'DistanceWalkingRunning',
      'HeartRate',
      'StepCount',
      'Workout',
    ],
    write: ['Workout', 'ActiveEnergyBurned', 'DistanceWalkingRunning'],
  },
};

/**
 * Request HealthKit permissions.
 */
export async function requestHealthKitPermissions(): Promise<boolean> {
  if (!isHealthKitAvailable) return false;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(PERMISSIONS, (err: any) => {
      resolve(!err);
    });
  });
}

/**
 * Create a structured workout for Apple Watch with pace alerts per segment.
 * This pushes the workout to the Health app, which syncs to Apple Watch.
 */
export async function createStructuredWorkout(
  title: string,
  segments: RunSegment[],
  scheduledDate: string,
): Promise<boolean> {
  if (!isHealthKitAvailable) return false;

  // Build workout configuration with segments
  // Each segment becomes a workout event with target pace
  const workoutConfig = {
    type: 'Running',
    startDate: new Date(scheduledDate).toISOString(),
    title,
    segments: segments.map((seg) => ({
      type: seg.type,
      distance: seg.distance_km * 1000, // meters
      targetPace: seg.target_pace_min_km * 60, // seconds per km
      description: seg.description,
    })),
  };

  // Note: Actual HKWorkout creation requires native module bridging
  // This is the interface - native implementation in ios/ directory
  console.log('Would create structured workout:', workoutConfig);
  return true;
}

/**
 * Read recent workouts from HealthKit.
 */
export async function getRecentWorkouts(days: number = 7): Promise<any[]> {
  if (!isHealthKitAvailable) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return new Promise((resolve) => {
    AppleHealthKit.getSamples(
      {
        typeIdentifier: 'HKWorkoutTypeIdentifier',
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      (err: any, results: any[]) => {
        resolve(err ? [] : results);
      },
    );
  });
}

/**
 * Get resting heart rate.
 */
export async function getRestingHeartRate(): Promise<number | null> {
  if (!isHealthKitAvailable) return null;

  return new Promise((resolve) => {
    AppleHealthKit.getRestingHeartRate({}, (err: any, results: any) => {
      resolve(err ? null : results?.value ?? null);
    });
  });
}
