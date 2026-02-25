import { supabase } from './api';

const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || '';
const STRAVA_REDIRECT_URI = process.env.EXPO_PUBLIC_STRAVA_REDIRECT_URI || '';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  elapsed_time: number;
  moving_time: number;
  distance: number; // meters
  average_speed: number; // m/s
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain: number;
  map?: {
    summary_polyline: string;
  };
  splits_metric?: Array<{
    distance: number;
    elapsed_time: number;
    elevation_difference: number;
    moving_time: number;
    average_speed: number;
    average_heartrate?: number;
    pace_zone: number;
  }>;
}

/**
 * Build the Strava OAuth authorization URL.
 */
export function getStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all,activity:write',
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange OAuth code for tokens via Edge Function (to keep client_secret server-side).
 */
export async function exchangeStravaToken(code: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('sync-activity', {
    body: { action: 'strava_auth', code },
  });
  return !error;
}

/**
 * Fetch recent activities from Strava via Edge Function.
 */
export async function fetchStravaActivities(
  after?: number,
  page: number = 1,
  perPage: number = 30,
): Promise<StravaActivity[]> {
  const { data, error } = await supabase.functions.invoke('sync-activity', {
    body: {
      action: 'strava_fetch',
      after,
      page,
      per_page: perPage,
    },
  });

  if (error) throw new Error(`Strava sync failed: ${error.message}`);
  return data?.activities ?? [];
}

/**
 * Convert a Strava activity to our Activity format for storage.
 */
export function convertStravaActivity(strava: StravaActivity) {
  return {
    activity_type: mapStravaType(strava.type),
    started_at: strava.start_date,
    duration_seconds: strava.moving_time,
    distance_km: strava.distance / 1000,
    avg_pace_min_km: strava.distance > 0 ? (strava.moving_time / 60) / (strava.distance / 1000) : null,
    avg_heart_rate: strava.average_heartrate ?? null,
    max_heart_rate: strava.max_heartrate ?? null,
    elevation_gain_m: strava.total_elevation_gain,
    route_polyline: strava.map?.summary_polyline ?? null,
    splits: strava.splits_metric?.map((s, i) => ({
      km: i + 1,
      pace_min_km: s.distance > 0 ? (s.moving_time / 60) / (s.distance / 1000) : 0,
      heart_rate_avg: s.average_heartrate,
      elevation_change_m: s.elevation_difference,
    })) ?? null,
    source: 'strava' as const,
    external_id: String(strava.id),
  };
}

function mapStravaType(type: string): string {
  const map: Record<string, string> = {
    Run: 'easy_run',
    Ride: 'bike',
    Swim: 'swim',
    Walk: 'easy_run',
    Hike: 'easy_run',
    WeightTraining: 'strength',
    Yoga: 'mobility',
  };
  return map[type] || 'easy_run';
}
