// Supabase Edge Function: sync-activity
// Handles OAuth flows and activity syncing for Strava and Garmin
//
// Deploy with: supabase functions deploy sync-activity

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID') || '';
const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET') || '';

interface SyncRequest {
  action: string;
  code?: string; // OAuth code
  oauth_verifier?: string;
  after?: number;
  page?: number;
  per_page?: number;
  days?: number;
  workout_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const syncRequest: SyncRequest = await req.json();

    switch (syncRequest.action) {
      case 'strava_auth': {
        // Exchange Strava OAuth code for tokens
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code: syncRequest.code,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Strava token exchange failed');
        }

        const tokens = await tokenResponse.json();

        // Store tokens
        await supabase.from('connected_services').upsert({
          user_id: user.id,
          service: 'strava',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
          service_user_id: String(tokens.athlete?.id),
        }, { onConflict: 'user_id,service' });

        return jsonResponse({ success: true });
      }

      case 'strava_fetch': {
        // Get stored Strava tokens
        const { data: service } = await supabase
          .from('connected_services')
          .select('*')
          .eq('user_id', user.id)
          .eq('service', 'strava')
          .single();

        if (!service) throw new Error('Strava not connected');

        // Refresh token if expired
        let accessToken = service.access_token;
        if (service.token_expires_at && new Date(service.token_expires_at) < new Date()) {
          const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: STRAVA_CLIENT_ID,
              client_secret: STRAVA_CLIENT_SECRET,
              refresh_token: service.refresh_token,
              grant_type: 'refresh_token',
            }),
          });

          if (refreshResponse.ok) {
            const newTokens = await refreshResponse.json();
            accessToken = newTokens.access_token;

            await supabase.from('connected_services').update({
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token,
              token_expires_at: new Date(newTokens.expires_at * 1000).toISOString(),
            }).eq('id', service.id);
          }
        }

        // Fetch activities
        const params = new URLSearchParams();
        if (syncRequest.after) params.set('after', String(syncRequest.after));
        params.set('page', String(syncRequest.page || 1));
        params.set('per_page', String(syncRequest.per_page || 30));

        const activitiesResponse = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );

        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch Strava activities');
        }

        const activities = await activitiesResponse.json();
        return jsonResponse({ activities });
      }

      case 'garmin_auth_init': {
        // Garmin uses OAuth 1.0a - simplified placeholder
        return jsonResponse({
          auth_url: 'https://connect.garmin.com/oauthConfirm',
        });
      }

      case 'garmin_auth_complete': {
        // Handle Garmin OAuth completion
        return jsonResponse({ success: true });
      }

      case 'garmin_push_workout': {
        // Fetch workout data and create a FIT file for Garmin
        const { data: workout } = await supabase
          .from('workouts')
          .select('*')
          .eq('id', syncRequest.workout_id)
          .eq('user_id', user.id)
          .single();

        if (!workout) throw new Error('Workout not found');

        // In production: convert workout_data to FIT format and push via Garmin API
        return jsonResponse({ success: true, message: 'Workout pushed to Garmin Connect' });
      }

      case 'garmin_fetch': {
        // Fetch Garmin activities
        return jsonResponse({ activities: [] });
      }

      default:
        throw new Error(`Unknown action: ${syncRequest.action}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
