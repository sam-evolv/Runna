import { supabase } from './api';

/**
 * Garmin Connect integration.
 *
 * Garmin uses OAuth 1.0a, so all token exchange happens server-side
 * via Supabase Edge Functions. This module handles the client-side flow.
 */

const GARMIN_CONNECT_BASE = 'https://connect.garmin.com';

/**
 * Initiate Garmin OAuth flow. Returns the authorization URL to open in browser.
 */
export async function getGarminAuthUrl(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('sync-activity', {
    body: { action: 'garmin_auth_init' },
  });

  if (error) throw new Error(`Garmin auth init failed: ${error.message}`);
  return data.auth_url;
}

/**
 * Complete Garmin OAuth flow with the verifier from callback.
 */
export async function completeGarminAuth(oauthVerifier: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('sync-activity', {
    body: { action: 'garmin_auth_complete', oauth_verifier: oauthVerifier },
  });
  return !error;
}

/**
 * Push a structured workout to Garmin Connect.
 * This creates a FIT workout file and uploads it via the Garmin API.
 * The workout then syncs to the user's Garmin watch automatically.
 */
export async function pushWorkoutToGarmin(workoutId: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('sync-activity', {
    body: {
      action: 'garmin_push_workout',
      workout_id: workoutId,
    },
  });

  if (error) {
    throw new Error(`Failed to push workout to Garmin: ${error.message}`);
  }
  return true;
}

/**
 * Fetch recent activities from Garmin Connect.
 */
export async function fetchGarminActivities(days: number = 7): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke('sync-activity', {
    body: {
      action: 'garmin_fetch',
      days,
    },
  });

  if (error) throw new Error(`Garmin sync failed: ${error.message}`);
  return data?.activities ?? [];
}
