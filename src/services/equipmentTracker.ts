/**
 * Equipment tracking service — primarily for running shoes.
 * Tracks mileage, warns about replacement, and auto-assigns to runs.
 */

export interface Equipment {
  id: string;
  user_id: string;
  name: string;
  brand: string;
  model: string;
  purchase_date: string | null;
  total_distance_km: number;
  total_runs: number;
  max_distance_km: number; // recommended max (default 800)
  is_default: boolean;
  is_retired: boolean;
  notes: string | null;
  created_at: string;
}

export type EquipmentStatus = 'good' | 'warning' | 'replace';

export interface EquipmentStatusResult {
  status: EquipmentStatus;
  percentUsed: number;
  remainingKm: number;
  message: string;
}

export function getEquipmentStatus(equipment: Equipment): EquipmentStatusResult {
  const percentUsed = equipment.total_distance_km / equipment.max_distance_km;
  const remainingKm = equipment.max_distance_km - equipment.total_distance_km;

  if (percentUsed >= 1.0) {
    return {
      status: 'replace',
      percentUsed,
      remainingKm: Math.max(0, remainingKm),
      message: `${equipment.name} has exceeded ${equipment.max_distance_km}km — time for new shoes.`,
    };
  }

  if (percentUsed >= 0.8) {
    return {
      status: 'warning',
      percentUsed,
      remainingKm,
      message: `${equipment.name} at ${Math.round(percentUsed * 100)}% — ${Math.round(remainingKm)}km remaining.`,
    };
  }

  return {
    status: 'good',
    percentUsed,
    remainingKm,
    message: `${equipment.name}: ${Math.round(equipment.total_distance_km)}km of ${equipment.max_distance_km}km`,
  };
}

export function getDefaultShoe(equipment: Equipment[]): Equipment | null {
  return equipment.find((e) => e.is_default && !e.is_retired) ?? null;
}

export function getActiveShoes(equipment: Equipment[]): Equipment[] {
  return equipment.filter((e) => !e.is_retired);
}

export function getShoesNeedingReplacement(equipment: Equipment[]): Equipment[] {
  return equipment
    .filter((e) => !e.is_retired)
    .filter((e) => getEquipmentStatus(e).status === 'replace');
}

export function getShoesWithWarnings(equipment: Equipment[]): Equipment[] {
  return equipment
    .filter((e) => !e.is_retired)
    .filter((e) => {
      const status = getEquipmentStatus(e).status;
      return status === 'warning' || status === 'replace';
    });
}

export function createNewShoe(
  userId: string,
  data: { name: string; brand: string; model: string; maxDistanceKm?: number },
): Omit<Equipment, 'id' | 'created_at'> {
  return {
    user_id: userId,
    name: data.name,
    brand: data.brand,
    model: data.model,
    purchase_date: new Date().toISOString().split('T')[0],
    total_distance_km: 0,
    total_runs: 0,
    max_distance_km: data.maxDistanceKm ?? 800,
    is_default: false,
    is_retired: false,
    notes: null,
  };
}

export function addDistanceToShoe(equipment: Equipment, distanceKm: number): Partial<Equipment> {
  return {
    total_distance_km: equipment.total_distance_km + distanceKm,
    total_runs: equipment.total_runs + 1,
  };
}

export const EQUIPMENT_MIGRATION = `
-- Equipment tracking table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  purchase_date DATE,
  total_distance_km NUMERIC DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  max_distance_km NUMERIC DEFAULT 800,
  is_default BOOLEAN DEFAULT false,
  is_retired BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link activities to equipment
ALTER TABLE activities ADD COLUMN IF NOT EXISTS equipment_id UUID REFERENCES equipment(id);

CREATE INDEX IF NOT EXISTS idx_equipment_user ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(user_id, is_retired);
`;
