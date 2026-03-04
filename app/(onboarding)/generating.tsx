import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { usePlanStore } from '@/stores/planStore';
import { parseTimeToSeconds } from '@/utils/paceCalculator';
import { colors, spacing, withOpacity } from '@/constants/theme';
import type { GoalType, GoalSubtype, FitnessLevel } from '@/types/plan';

const loadingMessages = [
  'Analysing your fitness level...',
  'Building your personalised plan...',
  'Scheduling your sessions...',
  'Optimising workout intensities...',
  'Almost ready...',
];

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = useAuthStore((s) => s.user);
  const { createGoalAndGeneratePlan, isGenerating, generationProgress } = usePlanStore();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      setProgress((prev) => Math.min(prev + 0.15, 0.95));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const generate = useCallback(async () => {
    if (!user) return;
    setError('');
    setHasStarted(true);

    try {
      let availableDays: number[] = [];
      try {
        availableDays = JSON.parse((params.availableDays as string) || '[]');
      } catch {
        availableDays = [];
      }
      const longSessionDay = params.longSessionDay && params.longSessionDay !== ''
        ? Number(params.longSessionDay)
        : null;

      const goalData = {
        goal_type: params.goalType as GoalType,
        goal_subtype: (params.goalSubtype as GoalSubtype) || null,
        target_value: (params.targetValue as string) || null,
        target_event: null,
        target_date: null,
        current_level: (params.fitnessLevel as FitnessLevel) || 'beginner',
        available_days: availableDays,
        preferred_long_session_day: longSessionDay,
      };

      const statsData = {
        recent_5k_time: params.recent5k ? secondsToInterval(params.recent5k as string) : null,
        recent_10k_time: params.recent10k ? secondsToInterval(params.recent10k as string) : null,
        recent_half_time: null,
        recent_marathon_time: null,
        weekly_mileage_km: params.weeklyMileage ? Number(params.weeklyMileage) : null,
        max_heart_rate: null,
        resting_heart_rate: null,
        bench_press_1rm: params.benchPress ? Number(params.benchPress) : null,
        squat_1rm: params.squat ? Number(params.squat) : null,
        deadlift_1rm: params.deadlift ? Number(params.deadlift) : null,
        overhead_press_1rm: null,
        injury_history: (params.injuries as string) || null,
        equipment_available: null,
        gym_access: true,
        notes: null,
      };

      const profileUpdates: Record<string, unknown> = {};
      if (params.weight) profileUpdates.weight_kg = Number(params.weight);
      if (params.height) profileUpdates.height_cm = Number(params.height);
      if (params.gender) profileUpdates.gender = params.gender;
      if (params.age) {
        const birthYear = new Date().getFullYear() - Number(params.age);
        profileUpdates.date_of_birth = `${birthYear}-01-01`;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await useAuthStore.getState().updateProfile(profileUpdates as any);
      }

      const freshUser = useAuthStore.getState().user;
      if (!freshUser) {
        setError('User session expired. Please sign in again.');
        return;
      }

      const result = await createGoalAndGeneratePlan(freshUser, goalData as any, statsData as any);

      if (result.error) {
        setError(result.error);
      } else {
        setProgress(1);
        setOnboarded(true);
        setTimeout(() => {
          router.replace('/(tabs)/today');
        }, 600);
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    }
  }, [user?.id, params]);

  useEffect(() => {
    if (!hasStarted && user) {
      generate();
    }
  }, [user?.id]);

  const handleRetry = () => {
    setProgress(0);
    setMessageIndex(0);
    setHasStarted(false);
    setError('');
    generate();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>
          <Typography variant="caption1" color={colors.primary} align="center" style={styles.step}>
            CREATING YOUR PLAN
          </Typography>
          <Typography variant="largeTitle" align="center" style={styles.title}>
            Building Your{'\n'}Training Plan
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.progressArea}>
          <View style={styles.percentContainer}>
            <Typography
              variant="mono"
              color={error ? colors.error : colors.primary}
              align="center"
            >
              {error ? '!' : `${Math.round(progress * 100)}%`}
            </Typography>
          </View>

          <ProgressBar
            progress={progress}
            height={4}
            color={error ? colors.error : colors.primary}
            style={styles.progressBar}
          />

          <Typography variant="callout" color={colors.textSecondary} align="center" style={styles.message}>
            {error ? '' : (generationProgress || loadingMessages[messageIndex])}
          </Typography>
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.errorArea}>
            <View style={styles.errorCard}>
              <Typography variant="headline" color={colors.error} align="center" style={{ marginBottom: spacing.sm }}>
                Generation Failed
              </Typography>
              <Typography variant="footnote" color={colors.textSecondary} align="center">
                {error}
              </Typography>
            </View>
            <Button
              title="Try Again"
              onPress={handleRetry}
              size="lg"
              fullWidth
              style={{ marginTop: spacing.lg }}
            />
            <Button
              title="Go Back"
              variant="ghost"
              onPress={() => router.back()}
              size="md"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function secondsToInterval(timeStr: string): string {
  const totalSeconds = parseTimeToSeconds(timeStr);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  step: {
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xxl,
  },
  progressArea: {
    width: '100%',
    alignItems: 'center',
  },
  percentContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    marginBottom: spacing.lg,
  },
  message: {
    minHeight: 44,
  },
  errorArea: {
    width: '100%',
    marginTop: spacing.lg,
  },
  errorCard: {
    backgroundColor: withOpacity(colors.error, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.15),
    borderRadius: 16,
    padding: spacing.lg,
  },
});
