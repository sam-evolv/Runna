import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed: number | null;
  altitude: number | null;
}

// Lazily-loaded expo-location (not used on web)
let _Location: typeof import('expo-location') | null = null;
let _locationLoaded = false;

async function loadLocation() {
  if (_locationLoaded) return _Location;
  _locationLoaded = true;
  if (Platform.OS === 'web') return null;
  try {
    _Location = await import('expo-location');
  } catch {
    // expo-location not available
  }
  return _Location;
}

// Kick off loading on native
loadLocation();

/**
 * Hook for GPS location tracking during runs.
 * On web this is a no-op that returns safe defaults.
 */
export function useLocation() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [routePoints, setRoutePoints] = useState<LocationPoint[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const watchRef = useRef<{ remove: () => void } | null>(null);

  const startTracking = useCallback(async () => {
    const Location = await loadLocation();
    if (!Location) {
      console.warn('[useLocation] Location tracking is not available on this platform');
      return false;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return false;
    } catch {
      return false;
    }

    setRoutePoints([]);
    setTotalDistance(0);
    setIsTracking(true);

    try {
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          const point: LocationPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            speed: location.coords.speed,
            altitude: location.coords.altitude,
          };

          setCurrentLocation(point);
          setRoutePoints((prev) => {
            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              const dist = haversineDistance(
                last.latitude, last.longitude,
                point.latitude, point.longitude,
              );
              setTotalDistance((d) => d + dist);
            }
            return [...prev, point];
          });
        },
      );
    } catch {
      setIsTracking(false);
      return false;
    }

    return true;
  }, []);

  const stopTracking = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    setIsTracking(false);
  }, []);

  return {
    isTracking,
    currentLocation,
    routePoints,
    totalDistance, // in km
    startTracking,
    stopTracking,
  };
}

/**
 * Calculate distance between two GPS points using the Haversine formula.
 * Returns distance in kilometers.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
