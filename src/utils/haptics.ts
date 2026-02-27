import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function impactAsync(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export function notificationAsync(type: Haptics.NotificationFeedbackType) {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(type);
  }
}

export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
