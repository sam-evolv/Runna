/**
 * Heart rate zones service.
 * Calculates HR zones and provides analysis for training.
 */

export interface HeartRateZone {
  zone: number;
  name: string;
  description: string;
  minBpm: number;
  maxBpm: number;
  color: string;
}

export interface ZoneConfig {
  maxHR: number;
  restingHR?: number;
  zones: HeartRateZone[];
}

const ZONE_DEFINITIONS = [
  { zone: 1, name: 'Recovery', description: 'Very easy, active recovery', color: '#8E8E93' },
  { zone: 2, name: 'Aerobic', description: 'Easy, conversational pace', color: '#30D158' },
  { zone: 3, name: 'Tempo', description: 'Moderate, comfortably hard', color: '#FF9F0A' },
  { zone: 4, name: 'Threshold', description: 'Hard, lactate threshold', color: '#FF453A' },
  { zone: 5, name: 'VO2max', description: 'Maximum effort, all-out', color: '#BF5AF2' },
];

/**
 * Standard zone percentages of max HR.
 */
const ZONE_PCTS_OF_MAX: Array<{ min: number; max: number }> = [
  { min: 0.50, max: 0.60 },
  { min: 0.60, max: 0.70 },
  { min: 0.70, max: 0.80 },
  { min: 0.80, max: 0.90 },
  { min: 0.90, max: 1.00 },
];

/**
 * Karvonen (HRR) zone percentages — more accurate when resting HR is known.
 */
const ZONE_PCTS_OF_HRR: Array<{ min: number; max: number }> = [
  { min: 0.40, max: 0.50 },
  { min: 0.50, max: 0.60 },
  { min: 0.60, max: 0.70 },
  { min: 0.70, max: 0.80 },
  { min: 0.80, max: 1.00 },
];

/**
 * Estimate max HR using the Tanaka formula (more accurate than 220 - age).
 * Tanaka et al., 2001: HRmax = 208 − 0.7 × age
 */
export function estimateMaxHR(age: number): number {
  return Math.round(208 - 0.7 * age);
}

/**
 * Calculate zones using percentage of max HR (standard method).
 */
export function calculateZonesFromMaxHR(maxHR: number): ZoneConfig {
  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map((def, i) => ({
    ...def,
    minBpm: Math.round(maxHR * ZONE_PCTS_OF_MAX[i].min),
    maxBpm: Math.round(maxHR * ZONE_PCTS_OF_MAX[i].max),
  }));

  return { maxHR, zones };
}

/**
 * Calculate zones using heart rate reserve (Karvonen method).
 * More accurate when resting HR is known.
 * Target HR = ((Max HR − Resting HR) × %Intensity) + Resting HR
 */
export function calculateZonesFromHRR(maxHR: number, restingHR: number): ZoneConfig {
  const hrr = maxHR - restingHR;

  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map((def, i) => ({
    ...def,
    minBpm: Math.round(ZONE_PCTS_OF_HRR[i].min * hrr + restingHR),
    maxBpm: Math.round(ZONE_PCTS_OF_HRR[i].max * hrr + restingHR),
  }));

  return { maxHR, restingHR, zones };
}

/**
 * Get the zone for a given heart rate.
 */
export function getZoneForHR(hr: number, config: ZoneConfig): HeartRateZone | null {
  for (let i = config.zones.length - 1; i >= 0; i--) {
    if (hr >= config.zones[i].minBpm) {
      return config.zones[i];
    }
  }
  return config.zones[0];
}

export interface TimeInZone {
  zone: HeartRateZone;
  durationSeconds: number;
  percentage: number;
}

/**
 * Calculate time spent in each zone from HR data samples.
 * @param hrSamples Array of { timestamp, hr } samples (1-second intervals assumed)
 */
export function calculateTimeInZones(
  hrSamples: Array<{ hr: number }>,
  config: ZoneConfig,
): TimeInZone[] {
  const zoneCounts = new Array(config.zones.length).fill(0);

  hrSamples.forEach(({ hr }) => {
    const zone = getZoneForHR(hr, config);
    if (zone) {
      zoneCounts[zone.zone - 1]++;
    }
  });

  const total = hrSamples.length || 1;

  return config.zones.map((zone, i) => ({
    zone,
    durationSeconds: zoneCounts[i],
    percentage: (zoneCounts[i] / total) * 100,
  }));
}

export interface PolarizedAnalysis {
  lowIntensityPercent: number; // Zone 1 + 2
  midIntensityPercent: number; // Zone 3
  highIntensityPercent: number; // Zone 4 + 5
  is8020: boolean;
  message: string;
}

/**
 * Analyze training distribution against 80/20 polarized model.
 * Ideal: ~80% in zones 1-2, ~20% in zones 4-5, minimal zone 3.
 */
export function analyze8020(timeInZones: TimeInZone[]): PolarizedAnalysis {
  const low = timeInZones
    .filter((t) => t.zone.zone <= 2)
    .reduce((sum, t) => sum + t.percentage, 0);

  const mid = timeInZones
    .filter((t) => t.zone.zone === 3)
    .reduce((sum, t) => sum + t.percentage, 0);

  const high = timeInZones
    .filter((t) => t.zone.zone >= 4)
    .reduce((sum, t) => sum + t.percentage, 0);

  const is8020 = low >= 75 && low <= 85;

  let message: string;
  if (low >= 75 && low <= 85) {
    message = 'Great balance — your training distribution follows the 80/20 model.';
  } else if (low > 85) {
    message = 'Very conservative — consider adding a bit more intensity to your hard sessions.';
  } else if (low >= 65) {
    message = 'Slightly intense — try keeping easy runs easier to recover better between hard sessions.';
  } else {
    message = 'Too much intensity — most of your running should be easy. Slow down on easy days.';
  }

  return {
    lowIntensityPercent: Math.round(low),
    midIntensityPercent: Math.round(mid),
    highIntensityPercent: Math.round(high),
    is8020,
    message,
  };
}
