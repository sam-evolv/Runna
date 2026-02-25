import { useState, useEffect } from 'react';
import {
  isHealthKitAvailable,
  requestHealthKitPermissions,
  getRecentWorkouts,
  getRestingHeartRate,
} from '@/services/healthkit';

/**
 * Hook for Apple HealthKit integration.
 */
export function useHealthKit() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAvailable] = useState(isHealthKitAvailable);

  const connect = async (): Promise<boolean> => {
    const granted = await requestHealthKitPermissions();
    setIsConnected(granted);
    return granted;
  };

  const fetchRecentWorkouts = async (days?: number) => {
    if (!isConnected) return [];
    return getRecentWorkouts(days);
  };

  const fetchRestingHR = async () => {
    if (!isConnected) return null;
    return getRestingHeartRate();
  };

  return {
    isAvailable,
    isConnected,
    connect,
    fetchRecentWorkouts,
    fetchRestingHR,
  };
}
