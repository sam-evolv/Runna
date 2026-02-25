import { useState } from 'react';
import { Linking } from 'react-native';
import { getStravaAuthUrl, exchangeStravaToken, fetchStravaActivities, convertStravaActivity } from '@/services/strava';
import { supabase } from '@/services/api';

/**
 * Hook for Strava integration.
 */
export function useStrava() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const connect = async () => {
    const url = getStravaAuthUrl();
    await Linking.openURL(url);
    // Auth completion is handled via deep link callback
  };

  const handleAuthCallback = async (code: string) => {
    const success = await exchangeStravaToken(code);
    setIsConnected(success);
    return success;
  };

  const syncActivities = async () => {
    setIsSyncing(true);
    try {
      const activities = await fetchStravaActivities();
      const converted = activities.map(convertStravaActivity);

      // Upsert activities (avoid duplicates via external_id)
      for (const activity of converted) {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) break;

        await supabase.from('activities').upsert(
          { ...activity, user_id: session.session.user.id },
          { onConflict: 'external_id' },
        );
      }

      setIsSyncing(false);
      return converted.length;
    } catch {
      setIsSyncing(false);
      return 0;
    }
  };

  return {
    isConnected,
    isSyncing,
    connect,
    handleAuthCallback,
    syncActivities,
  };
}
