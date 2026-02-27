import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { usePlanStore } from '@/stores/planStore';
import { parseTimeToSeconds } from '@/utils/paceCalculator';
import { colors, spacing } from '@/constants/theme';
import type { GoalType, GoalSubtype, FitnessLevel } from '@/types/plan';

const loadingMessages = [
  'Analysing your fitness profile...',
  'Designing your periodisation...',
  'Building your weekly structure...',
  'Optimising workout intensities...',
  'Adding recovery sessions...',
  'Fine-tuning your paces...',
  'Finalising your plan...',
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

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      setProgress((prev) => Math.min(prev + 0.12, 0.95));
    }, 2500);
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

      // Update user profile first, then use fresh user for plan generation
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

      // Get fresh user from store AFTER profile update so AI has correct weight/height/age
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
              style={{ marginTop: spacing.xl }}
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
  content: {
    paddingHorizontal: spacing.xxxl,
    alignItems: 'center',
  },
  step: {
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.huge,
  },
  progressArea: {
    width: '100%',
    alignItems: 'center',
  },
  percentContainer: {
    marginBottom: spacing.xxl,
  },
  progressBar: {
    marginBottom: spacing.xxl,
  },
  message: {
    minHeight: 44,
  },
  errorArea: {
    width: '100%',
    marginTop: spacing.xxl,
  },
  errorCard: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.15)',
    borderRadius: 16,
    padding: spacing.xl,
  },
});
