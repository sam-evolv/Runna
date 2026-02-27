/**
 * Treadmill mode service.
 * Converts outdoor running segments to treadmill speed/incline instructions.
 */

import type { RunSegment, RunningWorkoutData } from '@/types/workout';
import { paceToSpeed } from '@/utils/paceCalculator';

export interface TreadmillSegment {
  type: RunSegment['type'];
  durationMinutes: number;
  speedKmh: number;
  speedMph: number;
  inclinePercent: number;
  description: string;
  originalPaceMinKm: number;
}

export interface TreadmillWorkout {
  segments: TreadmillSegment[];
  totalDurationMinutes: number;
  totalDistanceKm: number;
}

/**
 * Default incline to simulate outdoor resistance.
 * Running on a flat treadmill is slightly easier than running outdoors,
 * so a 1% incline is generally recommended.
 */
const OUTDOOR_EQUIVALENT_INCLINE = 1.0;

const SEGMENT_TYPE_INCLINES: Record<string, number> = {
  warmup: 0.5,
  easy: 1.0,
  steady: 1.0,
  tempo: 1.0,
  interval: 1.0,
  recovery: 0.5,
  cooldown: 0.5,
};

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

export function convertToTreadmill(runData: RunningWorkoutData): TreadmillWorkout {
  const segments: TreadmillSegment[] = runData.segments.map((seg) => {
    const speedKmh = paceToSpeed(seg.target_pace_min_km);
    const speedMph = speedKmh / 1.60934;
    const durationMinutes = seg.distance_km / (speedKmh / 60);
    const incline = SEGMENT_TYPE_INCLINES[seg.type] ?? OUTDOOR_EQUIVALENT_INCLINE;

    return {
      type: seg.type,
      durationMinutes: Math.round(durationMinutes * 10) / 10,
      speedKmh: roundToHalf(speedKmh),
      speedMph: roundToHalf(speedMph),
      inclinePercent: incline,
      description: seg.description,
      originalPaceMinKm: seg.target_pace_min_km,
    };
  });

  const totalDurationMinutes = segments.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistanceKm = runData.total_distance_km;

  return { segments, totalDurationMinutes, totalDistanceKm };
}

export function getTreadmillInstructions(segment: TreadmillSegment, unit: 'metric' | 'imperial' = 'metric'): string {
  const speed = unit === 'imperial'
    ? `${segment.speedMph.toFixed(1)} mph`
    : `${segment.speedKmh.toFixed(1)} km/h`;

  const duration = segment.durationMinutes >= 1
    ? `${Math.round(segment.durationMinutes)} min`
    : `${Math.round(segment.durationMinutes * 60)} sec`;

  const incline = segment.inclinePercent > 0
    ? ` at ${segment.inclinePercent}% incline`
    : ' flat';

  return `Set speed to ${speed}${incline} for ${duration}`;
}

export function formatTreadmillSpeed(speedKmh: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    return `${(speedKmh / 1.60934).toFixed(1)} mph`;
  }
  return `${speedKmh.toFixed(1)} km/h`;
}
