import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity, sportColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import type { GoalType } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Plan name generation ───────────────────────────────────────────────────

function getPlanDetails(goalType: string, targetData: string) {
  let parsed: Record<string, string> = {};
  try {
    parsed = JSON.parse(targetData || '{}');
  } catch {
    // ignore parse errors
  }

  switch (goalType as GoalType) {
    case 'running': {
      const race = parsed.targetRace || 'Running';
      const weeks = race === 'Marathon' || race === 'Ultra' ? 16 : race === 'Half Marathon' ? 12 : 8;
      return {
        name: `${weeks}-Week ${race} Plan`,
        description: `Personalised ${race.toLowerCase()} training with progressive overload`,
        weeks,
        sessionsPerWeek: 4,
        estimatedDuration: '45-75 min',
      };
    }
    case 'strength': {
      const focus = parsed.focus || 'Strength';
      return {
        name: `12-Week ${focus} Program`,
        description: `Progressive ${focus.toLowerCase()} training with periodisation`,
        weeks: 12,
        sessionsPerWeek: 4,
        estimatedDuration: '60-75 min',
      };
    }
    case 'hyrox':
      return {
        name: '12-Week HYROX Race Prep',
        description: 'Hybrid running and functional fitness for race day',
        weeks: 12,
        sessionsPerWeek: 5,
        estimatedDuration: '60-90 min',
      };
    case 'triathlon': {
      const race = parsed.targetRace || 'Triathlon';
      const weeks = race.includes('Full') || race.includes('Ironman') ? 20 : race.includes('Half') ? 16 : 12;
      return {
        name: `${weeks}-Week ${race} Plan`,
        description: 'Balanced swim, bike, run training with brick sessions',
        weeks,
        sessionsPerWeek: 5,
        estimatedDuration: '45-120 min',
      };
    }
    case 'general_fitness':
    default:
      return {
        name: '8-Week Fitness Kickstart',
        description: 'Balanced strength, cardio, and mobility',
        weeks: 8,
        sessionsPerWeek: 4,
        estimatedDuration: '45-60 min',
      };
  }
}

function getMockWorkouts(goalType: string) {
  switch (goalType as GoalType) {
    case 'running':
      return [
        { day: 'Monday', title: 'Easy Run', subtitle: '5km easy pace + strides', type: 'easy_run', duration: '35 min' },
        { day: 'Wednesday', title: 'Tempo Intervals', subtitle: '4x1km at threshold', type: 'tempo_run', duration: '50 min' },
        { day: 'Friday', title: 'Recovery Run', subtitle: '4km very easy', type: 'recovery_run', duration: '30 min' },
        { day: 'Sunday', title: 'Long Run', subtitle: '12km steady', type: 'long_run', duration: '70 min' },
      ];
    case 'strength':
      return [
        { day: 'Monday', title: 'Upper Push', subtitle: 'Bench, OHP, Triceps', type: 'strength', duration: '60 min' },
        { day: 'Tuesday', title: 'Lower Strength', subtitle: 'Squat, RDL, Lunges', type: 'strength', duration: '65 min' },
        { day: 'Thursday', title: 'Upper Pull', subtitle: 'Rows, Pull-ups, Curls', type: 'strength', duration: '60 min' },
        { day: 'Friday', title: 'Lower Power', subtitle: 'Deadlift, Box Jumps', type: 'strength', duration: '55 min' },
      ];
    case 'hyrox':
      return [
        { day: 'Monday', title: 'Run + Sled', subtitle: '8km run with sled intervals', type: 'hyrox', duration: '70 min' },
        { day: 'Tuesday', title: 'Functional Strength', subtitle: 'Wall balls, burpees, rows', type: 'strength', duration: '55 min' },
        { day: 'Thursday', title: 'Race Simulation', subtitle: '4 station practice', type: 'hyrox', duration: '75 min' },
        { day: 'Saturday', title: 'Long Run', subtitle: '10km steady state', type: 'long_run', duration: '60 min' },
      ];
    case 'triathlon':
      return [
        { day: 'Monday', title: 'Swim Drills', subtitle: '1500m with technique focus', type: 'swim', duration: '45 min' },
        { day: 'Wednesday', title: 'Bike Intervals', subtitle: '60min with tempo blocks', type: 'bike', duration: '60 min' },
        { day: 'Thursday', title: 'Run Tempo', subtitle: '8km with 3km at pace', type: 'tempo_run', duration: '50 min' },
        { day: 'Saturday', title: 'Brick Session', subtitle: 'Bike 40min + Run 20min', type: 'bike', duration: '70 min' },
      ];
    case 'general_fitness':
    default:
      return [
        { day: 'Monday', title: 'Full Body Strength', subtitle: 'Compound movements', type: 'strength', duration: '50 min' },
        { day: 'Wednesday', title: 'Cardio + Core', subtitle: 'Intervals and abs', type: 'run', duration: '40 min' },
        { day: 'Friday', title: 'Upper Body + HIIT', subtitle: 'Push, pull, and circuits', type: 'strength', duration: '50 min' },
        { day: 'Sunday', title: 'Active Recovery', subtitle: 'Yoga and mobility', type: 'mobility', duration: '30 min' },
      ];
  }
}

function getWorkoutColor(type: string): string {
  const map: Record<string, string> = {
    easy_run: colors.running,
    tempo_run: colors.running,
    recovery_run: colors.hyrox,
    long_run: colors.running,
    strength: colors.strength,
    hyrox: colors.hyrox,
    swim: colors.triathlon,
    bike: colors.triathlon,
    run: colors.running,
    mobility: colors.secondary,
  };
  return map[type] || colors.general;
}

export default function PlanReadyScreen() {
  const router = useRouter();
  const { goalType, targetData } = useLocalSearchParams<{
    goalType: string;
    targetData: string;
  }>();

  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;
  const planDetails = getPlanDetails(goalType || 'general_fitness', targetData || '{}');
  const mockWorkouts = getMockWorkouts(goalType || 'general_fitness');

  const buttonScale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Celebration animation sequence
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    checkScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 200, mass: 0.8 }),
    );
    // Pulsing glow behind checkmark
    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [checkOpacity, checkScale, pulseScale]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleStartTraining = () => {
    setOnboarded(true);
    router.replace('/(tabs)/today');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Section */}
        <View style={styles.celebrationSection}>
          {/* Pulsing glow */}
          <Animated.View style={[styles.celebrationGlow, pulseAnimatedStyle, { backgroundColor: withOpacity(accentColor, 0.15) }]} />

          {/* Checkmark circle */}
          <Animated.View
            style={[
              styles.checkCircle,
              checkAnimatedStyle,
              { backgroundColor: accentColor, ...shadows.glow(accentColor) },
            ]}
          >
            <Text style={styles.checkEmoji}>{'\u2713'}</Text>
          </Animated.View>
        </View>

        {/* Progress bar - complete */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.progressSection}>
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 8 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '100%', backgroundColor: accentColor }]} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.title}>Your Plan is Ready</Text>
          <Text style={styles.subtitle}>
            We{'\u2019'}ve crafted a personalised program just for you
          </Text>
        </Animated.View>

        {/* Plan Name Card */}
        <Animated.View entering={FadeInDown.delay(800).duration(500)}>
          <View style={[styles.planCard, { borderColor: withOpacity(accentColor, 0.3) }]}>
            <View style={[styles.planCardAccent, { backgroundColor: accentColor }]} />
            <View style={styles.planCardContent}>
              <Text style={styles.planName}>{planDetails.name}</Text>
              <Text style={styles.planDescription}>{planDetails.description}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(1000).duration(500)}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {planDetails.sessionsPerWeek}
              </Text>
              <Text style={styles.statLabel}>Sessions/wk</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {planDetails.estimatedDuration.split('-')[0]}
              </Text>
              <Text style={styles.statLabel}>Min/session</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {planDetails.weeks}
              </Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
          </View>
        </Animated.View>

        {/* Week 1 Preview */}
        <Animated.View entering={FadeInDown.delay(1200).duration(500)}>
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview of Week 1</Text>
            <Text style={styles.previewSubtitle}>Here{'\u2019'}s what your first week looks like</Text>

            {mockWorkouts.map((workout, index) => {
              const workoutColor = getWorkoutColor(workout.type);
              return (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(1400 + index * 100).duration(300)}
                >
                  <View style={styles.workoutCard}>
                    <View style={[styles.workoutAccent, { backgroundColor: workoutColor }]} />
                    <View style={styles.workoutContent}>
                      <View style={styles.workoutHeader}>
                        <Text style={styles.workoutDay}>{workout.day}</Text>
                        <Text style={[styles.workoutDuration, { color: workoutColor }]}>
                          {workout.duration}
                        </Text>
                      </View>
                      <Text style={styles.workoutTitle}>{workout.title}</Text>
                      <Text style={styles.workoutSubtitle}>{workout.subtitle}</Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <View style={{ height: spacing.massive }} />
      </ScrollView>

      {/* Footer CTA */}
      <Animated.View entering={FadeInUp.delay(1600).duration(600)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleStartTraining}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          style={[styles.ctaButton, buttonAnimatedStyle]}
        >
          <Text style={styles.ctaText}>Start Training</Text>
        </AnimatedPressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  celebrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    position: 'relative',
  },
  celebrationGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmoji: {
    fontSize: 36,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  stepLabel: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  planCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  planCardAccent: {
    width: 5,
  },
  planCardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  planName: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title1,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  previewSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  workoutCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  workoutAccent: {
    width: 4,
  },
  workoutContent: {
    flex: 1,
    padding: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutDay: {
    ...typography.caption1,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutDuration: {
    ...typography.caption1,
    fontWeight: '700',
  },
  workoutTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  workoutSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  ctaButton: {
    width: '100%',
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.secondary),
    shadowRadius: 20,
    shadowOpacity: 0.35,
  },
  ctaText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
