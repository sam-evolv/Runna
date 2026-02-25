// services/heartRateZones.ts
// Heart rate zone calculation and zone-based training guidance

export interface HeartRateZones {
  maxHR: number;
  restingHR: number;
  method: 'max_hr' | 'heart_rate_reserve' | 'lactate_threshold';
  zones: Zone[];
}

export interface Zone {
  number: number;
  name: string;
  minBpm: number;
  maxBpm: number;
  minPercent: number;
  maxPercent: number;
  description: string;
  fuelSource: string;
  typicalWorkouts: string[];
  color: string;
}

// Calculate max HR using different formulas
export function estimateMaxHR(age: number, method: 'standard' | 'tanaka' | 'gulati' = 'tanaka'): number {
  switch (method) {
    case 'standard':
      return Math.round(220 - age);
    case 'tanaka':
      // Tanaka et al. (2001) - more accurate for trained athletes
      return Math.round(208 - 0.7 * age);
    case 'gulati':
      // Gulati et al. (2010) - more accurate for women
      return Math.round(206 - 0.88 * age);
    default:
      return Math.round(208 - 0.7 * age);
  }
}

// Calculate 5 HR zones based on max HR (simple percentage method)
export function calculateZonesFromMaxHR(maxHR: number): HeartRateZones {
  return {
    maxHR,
    restingHR: 0,
    method: 'max_hr',
    zones: [
      {
        number: 1,
        name: 'Recovery',
        minBpm: Math.round(maxHR * 0.50),
        maxBpm: Math.round(maxHR * 0.60),
        minPercent: 50,
        maxPercent: 60,
        description: 'Very easy effort. Walking or very slow jogging. Full recovery.',
        fuelSource: 'Primarily fat',
        typicalWorkouts: ['Recovery walks', 'Warm-up', 'Cool-down'],
        color: '#94a3b8',
      },
      {
        number: 2,
        name: 'Easy / Aerobic',
        minBpm: Math.round(maxHR * 0.60),
        maxBpm: Math.round(maxHR * 0.70),
        minPercent: 60,
        maxPercent: 70,
        description: 'Comfortable pace. Can hold a full conversation. This is where most of your running should be.',
        fuelSource: 'Mostly fat, some carbohydrate',
        typicalWorkouts: ['Easy runs', 'Long runs', 'Base building'],
        color: '#22d3ee',
      },
      {
        number: 3,
        name: 'Tempo / Threshold',
        minBpm: Math.round(maxHR * 0.70),
        maxBpm: Math.round(maxHR * 0.80),
        minPercent: 70,
        maxPercent: 80,
        description: 'Comfortably hard. Can say short sentences. Sustainable for 20-60 minutes.',
        fuelSource: 'Mix of fat and carbohydrate',
        typicalWorkouts: ['Tempo runs', 'Marathon pace runs', 'Steady state'],
        color: '#34d399',
      },
      {
        number: 4,
        name: 'Threshold / Hard',
        minBpm: Math.round(maxHR * 0.80),
        maxBpm: Math.round(maxHR * 0.90),
        minPercent: 80,
        maxPercent: 90,
        description: 'Hard effort. Can only say a few words. Sustainable for 10-30 minutes.',
        fuelSource: 'Primarily carbohydrate',
        typicalWorkouts: ['Threshold intervals', '10K pace', 'Cruise intervals'],
        color: '#fbbf24',
      },
      {
        number: 5,
        name: 'VO2max / Maximum',
        minBpm: Math.round(maxHR * 0.90),
        maxBpm: maxHR,
        minPercent: 90,
        maxPercent: 100,
        description: 'Maximum effort. Cannot speak. Sustainable for 1-5 minutes.',
        fuelSource: 'Almost entirely carbohydrate',
        typicalWorkouts: ['VO2max intervals', 'Short repeats', 'Sprint finish'],
        color: '#ef4444',
      },
    ],
  };
}

// Calculate zones using Karvonen method (Heart Rate Reserve)
// More accurate when resting HR is known
export function calculateZonesFromHRR(maxHR: number, restingHR: number): HeartRateZones {
  const hrr = maxHR - restingHR;

  const calcBpm = (percent: number) => Math.round(restingHR + hrr * (percent / 100));

  return {
    maxHR,
    restingHR,
    method: 'heart_rate_reserve',
    zones: [
      {
        number: 1, name: 'Recovery',
        minBpm: calcBpm(50), maxBpm: calcBpm(60),
        minPercent: 50, maxPercent: 60,
        description: 'Very easy. Active recovery only.',
        fuelSource: 'Primarily fat',
        typicalWorkouts: ['Recovery walks', 'Warm-up', 'Cool-down'],
        color: '#94a3b8',
      },
      {
        number: 2, name: 'Easy / Aerobic',
        minBpm: calcBpm(60), maxBpm: calcBpm(70),
        minPercent: 60, maxPercent: 70,
        description: 'Comfortable conversational pace. Majority of training.',
        fuelSource: 'Mostly fat',
        typicalWorkouts: ['Easy runs', 'Long runs'],
        color: '#22d3ee',
      },
      {
        number: 3, name: 'Tempo',
        minBpm: calcBpm(70), maxBpm: calcBpm(80),
        minPercent: 70, maxPercent: 80,
        description: 'Comfortably hard. Short sentences only.',
        fuelSource: 'Mix of fat and carbohydrate',
        typicalWorkouts: ['Tempo runs', 'Marathon pace'],
        color: '#34d399',
      },
      {
        number: 4, name: 'Threshold',
        minBpm: calcBpm(80), maxBpm: calcBpm(90),
        minPercent: 80, maxPercent: 90,
        description: 'Hard. A few words at most.',
        fuelSource: 'Primarily carbohydrate',
        typicalWorkouts: ['Threshold work', '10K pace intervals'],
        color: '#fbbf24',
      },
      {
        number: 5, name: 'VO2max',
        minBpm: calcBpm(90), maxBpm: maxHR,
        minPercent: 90, maxPercent: 100,
        description: 'Maximum effort. Cannot speak.',
        fuelSource: 'Carbohydrate only',
        typicalWorkouts: ['VO2max intervals', 'Sprints'],
        color: '#ef4444',
      },
    ],
  };
}

// Determine which zone a given HR falls into
export function getZoneForHR(heartRate: number, zones: HeartRateZones): Zone | null {
  for (const zone of zones.zones) {
    if (heartRate >= zone.minBpm && heartRate <= zone.maxBpm) {
      return zone;
    }
  }
  // Above max
  if (heartRate > zones.maxHR) return zones.zones[4]; // Zone 5
  // Below zone 1
  return zones.zones[0]; // Zone 1
}

// Calculate time in zones from a completed activity
export function calculateTimeInZones(
  heartRateData: Array<{ timestamp: number; bpm: number }>,
  zones: HeartRateZones
): Array<{ zone: Zone; seconds: number; percent: number }> {
  const zoneTime = new Map<number, number>();
  zones.zones.forEach(z => zoneTime.set(z.number, 0));

  for (let i = 1; i < heartRateData.length; i++) {
    const duration = heartRateData[i].timestamp - heartRateData[i - 1].timestamp;
    const zone = getZoneForHR(heartRateData[i].bpm, zones);
    if (zone) {
      zoneTime.set(zone.number, (zoneTime.get(zone.number) || 0) + duration);
    }
  }

  const totalTime = Array.from(zoneTime.values()).reduce((a, b) => a + b, 0);

  return zones.zones.map(zone => ({
    zone,
    seconds: zoneTime.get(zone.number) || 0,
    percent: totalTime > 0 ? Math.round(((zoneTime.get(zone.number) || 0) / totalTime) * 100) : 0,
  }));
}

// Check if training distribution follows the 80/20 rule
export function analyze8020Distribution(
  timeInZones: Array<{ zone: Zone; seconds: number; percent: number }>
): {
  easyPercent: number;
  hardPercent: number;
  isBalanced: boolean;
  feedback: string;
} {
  const easyPercent = timeInZones
    .filter(t => t.zone.number <= 2)
    .reduce((sum, t) => sum + t.percent, 0);

  const hardPercent = timeInZones
    .filter(t => t.zone.number >= 4)
    .reduce((sum, t) => sum + t.percent, 0);

  const isBalanced = easyPercent >= 75 && easyPercent <= 85;

  let feedback: string;
  if (easyPercent < 70) {
    feedback = 'Too much hard running. You need more easy sessions to recover properly and avoid injury.';
  } else if (easyPercent < 75) {
    feedback = 'Slightly too intense overall. Try slowing your easy runs down a notch.';
  } else if (easyPercent > 85) {
    feedback = 'Could push harder on your quality sessions. Your easy runs are good but your hard sessions might not be hard enough.';
  } else {
    feedback = 'Great distribution. You\'re following the 80/20 principle well.';
  }

  return { easyPercent, hardPercent, isBalanced, feedback };
}
