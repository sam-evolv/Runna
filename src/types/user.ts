export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type UnitPreference = 'metric' | 'imperial';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  height_cm: number | null;
  weight_kg: number | null;
  unit_preference: UnitPreference;
  created_at: string;
  updated_at: string;
}

export interface ConnectedService {
  id: string;
  user_id: string;
  service: 'apple_health' | 'garmin' | 'strava' | 'google_fit';
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  service_user_id: string | null;
  connected_at: string;
}
