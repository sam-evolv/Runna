export interface PaceZone {
  name: string;
  label: string;
  description: string;
  color: string;
  /** Percentage of threshold pace (lower = faster) */
  paceRangePercent: [number, number];
}

export const paceZones: PaceZone[] = [
  {
    name: 'zone1',
    label: 'Easy / Recovery',
    description: 'Conversational pace. Should feel effortless.',
    color: '#30D158',
    paceRangePercent: [115, 135],
  },
  {
    name: 'zone2',
    label: 'Aerobic / Endurance',
    description: 'Comfortable but purposeful. Can still hold a conversation.',
    color: '#0A84FF',
    paceRangePercent: [105, 115],
  },
  {
    name: 'zone3',
    label: 'Tempo',
    description: 'Comfortably hard. Could speak in short sentences.',
    color: '#FF9F0A',
    paceRangePercent: [95, 105],
  },
  {
    name: 'zone4',
    label: 'Threshold',
    description: 'Hard effort. Sustainable for 30-60 minutes in a race.',
    color: '#FF6B6B',
    paceRangePercent: [88, 95],
  },
  {
    name: 'zone5',
    label: 'VO2max / Interval',
    description: 'Very hard. Only sustainable for a few minutes.',
    color: '#FF453A',
    paceRangePercent: [78, 88],
  },
  {
    name: 'zone6',
    label: 'Sprint / Repetition',
    description: 'All-out effort. Very short duration.',
    color: '#BF5AF2',
    paceRangePercent: [65, 78],
  },
];

/**
 * Calculate pace zones based on a threshold pace (e.g., recent 10k pace or lactate threshold).
 * Returns pace ranges in min/km for each zone.
 */
export function calculatePaceZones(thresholdPaceMinKm: number): Array<PaceZone & { minPace: number; maxPace: number }> {
  return paceZones.map((zone) => ({
    ...zone,
    minPace: thresholdPaceMinKm * (zone.paceRangePercent[0] / 100),
    maxPace: thresholdPaceMinKm * (zone.paceRangePercent[1] / 100),
  }));
}

/**
 * Get the zone for a given pace relative to threshold.
 */
export function getPaceZone(currentPace: number, thresholdPace: number): PaceZone {
  const ratio = currentPace / thresholdPace;
  for (let i = paceZones.length - 1; i >= 0; i--) {
    if (ratio * 100 <= paceZones[i].paceRangePercent[1]) {
      return paceZones[i];
    }
  }
  return paceZones[0];
}
