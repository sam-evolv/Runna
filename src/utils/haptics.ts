import { Platform } from 'react-native';

// Enum values mirrored from expo-haptics so consumers don't need
// a direct dependency on the native module.
export enum ImpactFeedbackStyle {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
}

export enum NotificationFeedbackType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

let _Haptics: typeof import('expo-haptics') | null = null;
let _loadAttempted = false;

async function loadHaptics() {
  if (_loadAttempted) return;
  _loadAttempted = true;
  if (Platform.OS === 'web') return;
  try {
    _Haptics = await import('expo-haptics');
  } catch {
    // expo-haptics not available on this platform
  }
}

// Kick off loading immediately on native
loadHaptics();

export function impactAsync(style: ImpactFeedbackStyle = ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web' || !_Haptics) return;
  try {
    _Haptics.impactAsync(style as any);
  } catch {
    // silently ignore
  }
}

export function notificationAsync(type: NotificationFeedbackType) {
  if (Platform.OS === 'web' || !_Haptics) return;
  try {
    _Haptics.notificationAsync(type as any);
  } catch {
    // silently ignore
  }
}
