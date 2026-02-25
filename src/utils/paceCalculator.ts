/**
 * Pace and speed conversion utilities for running workouts.
 */

/**
 * Convert pace (min/km) to speed (km/h).
 */
export function paceToSpeed(paceMinPerKm: number): number {
  if (paceMinPerKm <= 0) return 0;
  return 60 / paceMinPerKm;
}

/**
 * Convert speed (km/h) to pace (min/km).
 */
export function speedToPace(speedKmH: number): number {
  if (speedKmH <= 0) return 0;
  return 60 / speedKmH;
}

/**
 * Convert pace from min/km to min/mile.
 */
export function paceKmToMile(paceMinPerKm: number): number {
  return paceMinPerKm * 1.60934;
}

/**
 * Convert pace from min/mile to min/km.
 */
export function paceMileToKm(paceMinPerMile: number): number {
  return paceMinPerMile / 1.60934;
}

/**
 * Format pace as "M:SS" string (e.g., 5.25 -> "5:15").
 */
export function formatPace(paceMinPerKm: number): string {
  if (paceMinPerKm <= 0) return '--:--';
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parse a pace string "M:SS" to decimal minutes (e.g., "5:15" -> 5.25).
 */
export function parsePace(paceString: string): number {
  const parts = paceString.split(':');
  if (parts.length !== 2) return 0;
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  return minutes + seconds / 60;
}

/**
 * Format duration in seconds to "H:MM:SS" or "MM:SS".
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Parse a time string "H:MM:SS" or "MM:SS" to total seconds.
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/**
 * Estimate finish time for a given distance at a given pace.
 */
export function estimateFinishTime(distanceKm: number, paceMinPerKm: number): number {
  return distanceKm * paceMinPerKm * 60; // seconds
}

/**
 * Use Jack Daniels' VDOT formula to estimate equivalent race times.
 * Given a recent race time, estimate pace for other distances.
 */
export function estimateEquivalentPace(
  knownDistanceKm: number,
  knownTimeMinutes: number,
  targetDistanceKm: number,
): number {
  // Simplified Riegel formula: T2 = T1 * (D2/D1)^1.06
  const ratio = targetDistanceKm / knownDistanceKm;
  const estimatedTime = knownTimeMinutes * Math.pow(ratio, 1.06);
  return estimatedTime / targetDistanceKm;
}

/**
 * Calculate training paces from a recent race time.
 */
export function calculateTrainingPaces(raceDistanceKm: number, raceTimeMinutes: number) {
  const racePace = raceTimeMinutes / raceDistanceKm;

  return {
    easy: racePace * 1.25,        // ~25% slower than race pace
    long: racePace * 1.20,        // ~20% slower
    tempo: racePace * 1.05,       // ~5% slower (sustainable hard effort)
    threshold: racePace * 0.97,   // ~3% faster (lactate threshold)
    interval: racePace * 0.88,    // ~12% faster (VO2max)
    repetition: racePace * 0.80,  // ~20% faster (short reps)
  };
}

/**
 * Convert km to miles.
 */
export function kmToMiles(km: number): number {
  return km / 1.60934;
}

/**
 * Convert miles to km.
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}
