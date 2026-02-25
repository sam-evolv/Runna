import { useState } from 'react';
import { Linking } from 'react-native';
import { getGarminAuthUrl, completeGarminAuth, fetchGarminActivities, pushWorkoutToGarmin } from '@/services/garmin';

/**
 * Hook for Garmin Connect integration.
 */
export function useGarmin() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await getGarminAuthUrl();
      await Linking.openURL(authUrl);
      // Auth completion is handled via deep link callback
    } catch (err) {
      setIsConnecting(false);
    }
  };

  const handleAuthCallback = async (verifier: string) => {
    const success = await completeGarminAuth(verifier);
    setIsConnected(success);
    setIsConnecting(false);
    return success;
  };

  const syncActivities = async (days?: number) => {
    if (!isConnected) return [];
    return fetchGarminActivities(days);
  };

  const pushWorkout = async (workoutId: string) => {
    if (!isConnected) return false;
    return pushWorkoutToGarmin(workoutId);
  };

  return {
    isConnected,
    isConnecting,
    connect,
    handleAuthCallback,
    syncActivities,
    pushWorkout,
  };
}
