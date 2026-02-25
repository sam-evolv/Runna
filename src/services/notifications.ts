import { Platform } from 'react-native';

/**
 * Push notification service for workout reminders.
 *
 * Uses Expo Notifications API for cross-platform push notifications.
 */

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch {
  // expo-notifications not available
}

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule a workout reminder notification.
 */
export async function scheduleWorkoutReminder(
  workoutTitle: string,
  scheduledDate: string,
  minutesBefore: number = 30,
): Promise<string | null> {
  if (!Notifications) return null;

  const triggerDate = new Date(scheduledDate);
  triggerDate.setMinutes(triggerDate.getMinutes() - minutesBefore);

  // Don't schedule if it's in the past
  if (triggerDate <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Workout Time',
      body: `${workoutTitle} starts in ${minutesBefore} minutes`,
      sound: true,
    },
    trigger: {
      date: triggerDate,
    },
  });

  return id;
}

/**
 * Cancel a scheduled notification.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Set up notification handlers.
 */
export function setupNotificationHandlers(
  onNotificationReceived: (notification: any) => void,
  onNotificationResponse: (response: any) => void,
): () => void {
  if (!Notifications) return () => {};

  const receivedSub = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSub = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
