import { formatPace, formatDuration, kmToMiles } from './paceCalculator';

/**
 * Format distance for display.
 */
export function formatDistance(km: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const miles = kmToMiles(km);
    return miles >= 10 ? `${miles.toFixed(1)} mi` : `${miles.toFixed(2)} mi`;
  }
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
}

/**
 * Format pace with unit.
 */
export function formatPaceWithUnit(paceMinKm: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const paceMinMile = paceMinKm * 1.60934;
    return `${formatPace(paceMinMile)}/mi`;
  }
  return `${formatPace(paceMinKm)}/km`;
}

/**
 * Format weight for display.
 */
export function formatWeight(kg: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const lbs = kg * 2.20462;
    return `${Math.round(lbs)} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format height for display.
 */
export function formatHeight(cm: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}

/**
 * Format workout duration in a human-friendly way.
 */
export function formatWorkoutDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format workout type for display.
 */
export function formatWorkoutType(type: string): string {
  const labels: Record<string, string> = {
    easy_run: 'Easy Run',
    tempo_run: 'Tempo Run',
    interval_run: 'Intervals',
    long_run: 'Long Run',
    recovery_run: 'Recovery Run',
    fartlek: 'Fartlek',
    hill_run: 'Hill Session',
    race_pace: 'Race Pace',
    strength: 'Strength',
    mobility: 'Mobility',
    swim: 'Swim',
    bike: 'Bike',
    rest: 'Rest Day',
  };
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format a number as ordinal (1st, 2nd, 3rd, etc.).
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format completion percentage.
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Format a number with appropriate precision.
 */
export function formatNumber(n: number, decimals: number = 1): string {
  return n.toFixed(decimals);
}
