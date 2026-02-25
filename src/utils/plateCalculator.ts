/**
 * Weight plate calculator for strength workouts.
 * Calculates which plates to load on each side of the barbell.
 */

// Standard plate weights in kg
const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const STANDARD_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

// Standard barbell weights
export const BARBELL_WEIGHT_KG = 20;
export const BARBELL_WEIGHT_LB = 45;

export interface PlateResult {
  plates: number[];      // Plates per side, ordered largest to smallest
  totalWeight: number;   // Actual total weight achieved
  isExact: boolean;      // Whether the target was hit exactly
  barbellWeight: number;
}

/**
 * Calculate plates needed per side of a barbell to reach target weight.
 */
export function calculatePlates(
  targetWeight: number,
  unit: 'kg' | 'lb' = 'kg',
  barbellWeight?: number,
): PlateResult {
  const barbell = barbellWeight ?? (unit === 'kg' ? BARBELL_WEIGHT_KG : BARBELL_WEIGHT_LB);
  const availablePlates = unit === 'kg' ? STANDARD_PLATES_KG : STANDARD_PLATES_LB;

  if (targetWeight <= barbell) {
    return { plates: [], totalWeight: barbell, isExact: targetWeight === barbell, barbellWeight: barbell };
  }

  let remainingPerSide = (targetWeight - barbell) / 2;
  const plates: number[] = [];

  for (const plate of availablePlates) {
    while (remainingPerSide >= plate) {
      plates.push(plate);
      remainingPerSide -= plate;
    }
  }

  const totalPlateWeight = plates.reduce((sum, p) => sum + p, 0) * 2;
  const totalWeight = barbell + totalPlateWeight;

  return {
    plates,
    totalWeight,
    isExact: Math.abs(totalWeight - targetWeight) < 0.01,
    barbellWeight: barbell,
  };
}

/**
 * Format plate result for display.
 * e.g., "20kg + 10kg + 5kg per side"
 */
export function formatPlates(result: PlateResult, unit: 'kg' | 'lb' = 'kg'): string {
  if (result.plates.length === 0) {
    return `Empty bar (${result.barbellWeight}${unit})`;
  }

  const plateStr = result.plates.map((p) => `${p}${unit}`).join(' + ');
  return `${plateStr} per side`;
}

/**
 * Calculate total number of plates needed (both sides).
 */
export function totalPlateCount(result: PlateResult): Map<number, number> {
  const counts = new Map<number, number>();
  for (const plate of result.plates) {
    counts.set(plate, (counts.get(plate) || 0) + 2); // Both sides
  }
  return counts;
}

/**
 * Calculate the closest achievable weight with available plates.
 */
export function nearestAchievableWeight(
  targetWeight: number,
  unit: 'kg' | 'lb' = 'kg',
): number {
  const result = calculatePlates(targetWeight, unit);
  return result.totalWeight;
}

/**
 * Get weight increment suggestions for progressive overload.
 */
export function getProgressionWeights(
  currentWeight: number,
  unit: 'kg' | 'lb' = 'kg',
): number[] {
  const smallestPlate = unit === 'kg' ? 1.25 : 2.5;
  const increment = smallestPlate * 2; // Both sides

  return [
    nearestAchievableWeight(currentWeight + increment, unit),
    nearestAchievableWeight(currentWeight + increment * 2, unit),
    nearestAchievableWeight(currentWeight + increment * 3, unit),
  ];
}
