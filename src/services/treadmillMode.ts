// services/treadmillMode.ts
// Treadmill mode - convert outdoor workout segments to treadmill speed/incline

export interface TreadmillSegment {
  type: string;
  duration_minutes?: number;
  distance_km?: number;
  speed_kph: number;
  incline_percent: number;
  description: string;
  targetPaceMinKm: number;
}

export interface TreadmillSettings {
  useIncline: boolean; // simulate outdoor effort with incline
  baseIncline: number; // default 1% to simulate wind resistance
  maxIncline: number;
  speedUnit: 'kph' | 'mph';
  showPace: boolean; // show pace alongside speed
}

export const DEFAULT_TREADMILL_SETTINGS: TreadmillSettings = {
  useIncline: true,
  baseIncline: 1.0,
  maxIncline: 15.0,
  speedUnit: 'kph',
  showPace: true,
};

// Convert pace (min/km) to speed (kph)
export function paceToSpeed(paceMinPerKm: number): number {
  if (paceMinPerKm <= 0) return 0;
  return Math.round((60 / paceMinPerKm) * 10) / 10;
}

// Convert speed (kph) to pace (min/km)
export function speedToPace(speedKph: number): string {
  if (speedKph <= 0) return '--:--';
  const paceMin = 60 / speedKph;
  const mins = Math.floor(paceMin);
  const secs = Math.round((paceMin - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Convert kph to mph
export function kphToMph(kph: number): number {
  return Math.round(kph * 0.621371 * 10) / 10;
}

// Convert mph to kph
export function mphToKph(mph: number): number {
  return Math.round(mph * 1.60934 * 10) / 10;
}

// Convert outdoor running segments to treadmill segments
export function convertToTreadmill(
  segments: Array<{
    type: string;
    distance_km?: number;
    duration_minutes?: number;
    target_pace_min_km: number;
    description: string;
  }>,
  settings: TreadmillSettings = DEFAULT_TREADMILL_SETTINGS
): TreadmillSegment[] {
  return segments.map((seg) => {
    const speed = paceToSpeed(seg.target_pace_min_km);
    const duration = seg.duration_minutes || (seg.distance_km ? seg.distance_km * seg.target_pace_min_km : undefined);

    // Apply base incline (1% simulates outdoor wind resistance)
    let incline = settings.useIncline ? settings.baseIncline : 0;

    // For hill workouts, you could increase incline for harder segments
    if (seg.type === 'hill' || seg.type === 'hill_rep') {
      incline = Math.min(settings.maxIncline, 5.0);
    }

    return {
      type: seg.type,
      duration_minutes: duration ? Math.round(duration * 10) / 10 : undefined,
      distance_km: seg.distance_km,
      speed_kph: speed,
      incline_percent: incline,
      description: seg.description,
      targetPaceMinKm: seg.target_pace_min_km,
    };
  });
}

// Calculate estimated calories for a treadmill session
export function estimateTreadmillCalories(params: {
  segments: TreadmillSegment[];
  weightKg: number;
}): number {
  const { segments, weightKg } = params;
  let totalCalories = 0;

  for (const seg of segments) {
    if (!seg.duration_minutes) continue;
    // Simplified MET calculation based on speed and incline
    const speedMph = kphToMph(seg.speed_kph);
    let mets: number;

    if (speedMph < 4) mets = 3.5; // walking
    else if (speedMph < 5) mets = 6.0; // jogging
    else if (speedMph < 6) mets = 8.3;
    else if (speedMph < 7) mets = 9.8;
    else if (speedMph < 8) mets = 11.0;
    else if (speedMph < 9) mets = 11.8;
    else if (speedMph < 10) mets = 12.8;
    else mets = 14.5;

    // Incline adjustment (~1 MET per 2% grade)
    mets += seg.incline_percent * 0.5;

    // Calories = METs x weight(kg) x time(hours)
    const hours = seg.duration_minutes / 60;
    totalCalories += mets * weightKg * hours;
  }

  return Math.round(totalCalories);
}

// Format speed for display
export function formatSpeed(kph: number, unit: 'kph' | 'mph' = 'kph'): string {
  if (unit === 'mph') return `${kphToMph(kph)} mph`;
  return `${kph} km/h`;
}

// Generate treadmill-specific instructions
export function getTreadmillInstructions(segment: TreadmillSegment, settings: TreadmillSettings): string {
  const speedStr = formatSpeed(segment.speed_kph, settings.speedUnit);
  const paceStr = settings.showPace ? ` (${speedToPace(segment.speed_kph)}/km)` : '';
  const inclineStr = segment.incline_percent > 0 ? ` at ${segment.incline_percent}% incline` : '';

  switch (segment.type) {
    case 'warmup':
      return `Set treadmill to ${speedStr}${paceStr}${inclineStr}. Easy warmup.`;
    case 'interval':
    case 'tempo':
      return `Increase to ${speedStr}${paceStr}${inclineStr}. ${segment.description}`;
    case 'recovery':
      return `Drop to ${speedStr}${paceStr}. Active recovery - keep moving.`;
    case 'cooldown':
      return `Reduce to ${speedStr}${paceStr}. Easy cooldown, then walk for 2 minutes before stopping.`;
    default:
      return `Set to ${speedStr}${paceStr}${inclineStr}.`;
  }
}
