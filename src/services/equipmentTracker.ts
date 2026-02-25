// services/equipmentTracker.ts
// Track mileage on shoes and other equipment, alert when replacement is due

export interface Equipment {
  id: string;
  userId: string;
  type: 'running_shoes' | 'trail_shoes' | 'racing_flats' | 'gym_shoes' | 'cycling_shoes';
  brand: string;
  model: string;
  nickname?: string; // e.g. "My blue Nikes"
  purchaseDate?: string;
  totalDistanceKm: number;
  totalActivities: number;
  maxDistanceKm: number; // recommended replacement distance
  isDefault: boolean; // auto-assign to new activities
  isRetired: boolean;
  createdAt: string;
  updatedAt: string;
}

// Recommended replacement distances by shoe type
export const REPLACEMENT_THRESHOLDS: Record<string, { warningKm: number; replaceKm: number }> = {
  running_shoes: { warningKm: 600, replaceKm: 800 },
  trail_shoes: { warningKm: 500, replaceKm: 700 },
  racing_flats: { warningKm: 300, replaceKm: 400 },
  gym_shoes: { warningKm: 800, replaceKm: 1000 },
  cycling_shoes: { warningKm: 5000, replaceKm: 8000 },
};

export type ShoeStatus = 'good' | 'warning' | 'replace';

export function getEquipmentStatus(equipment: Equipment): {
  status: ShoeStatus;
  percentUsed: number;
  remainingKm: number;
  message: string;
} {
  const threshold = REPLACEMENT_THRESHOLDS[equipment.type] || REPLACEMENT_THRESHOLDS.running_shoes;
  const maxKm = equipment.maxDistanceKm || threshold.replaceKm;
  const percentUsed = (equipment.totalDistanceKm / maxKm) * 100;
  const remainingKm = Math.max(0, maxKm - equipment.totalDistanceKm);

  if (equipment.totalDistanceKm >= maxKm) {
    return {
      status: 'replace',
      percentUsed: Math.min(100, percentUsed),
      remainingKm: 0,
      message: `These ${equipment.type === 'running_shoes' ? 'shoes' : 'shoes'} have done ${equipment.totalDistanceKm.toFixed(0)} km. Time for a new pair.`,
    };
  }

  if (equipment.totalDistanceKm >= threshold.warningKm) {
    return {
      status: 'warning',
      percentUsed,
      remainingKm,
      message: `${remainingKm.toFixed(0)} km remaining. Start thinking about replacements.`,
    };
  }

  return {
    status: 'good',
    percentUsed,
    remainingKm,
    message: `${remainingKm.toFixed(0)} km remaining. Plenty of life left.`,
  };
}

// Add distance to equipment after a completed activity
export function addDistanceToEquipment(
  equipment: Equipment,
  distanceKm: number
): Equipment {
  return {
    ...equipment,
    totalDistanceKm: equipment.totalDistanceKm + distanceKm,
    totalActivities: equipment.totalActivities + 1,
    updatedAt: new Date().toISOString(),
  };
}

// SQL migration for equipment table
export const EQUIPMENT_MIGRATION = `
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  brand text not null,
  model text not null,
  nickname text,
  purchase_date date,
  total_distance_km numeric default 0,
  total_activities integer default 0,
  max_distance_km numeric default 800,
  is_default boolean default false,
  is_retired boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add equipment_id to activities table
alter table activities add column if not exists equipment_id uuid references equipment(id);

-- Index for user lookups
create index if not exists idx_equipment_user_id on equipment(user_id);
`;
