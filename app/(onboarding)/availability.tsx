import React, { useState, useCallback } from 'react';
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
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity, sportColors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DAYS = [
  { key: 1, label: 'M', full: 'Monday' },
  { key: 2, label: 'T', full: 'Tuesday' },
  { key: 3, label: 'W', full: 'Wednesday' },
  { key: 4, label: 'T', full: 'Thursday' },
  { key: 5, label: 'F', full: 'Friday' },
  { key: 6, label: 'S', full: 'Saturday' },
  { key: 7, label: 'S', full: 'Sunday' },
];

const DURATION_OPTIONS = ['45 min', '60 min', '75 min', '90+ min'];

function DayButton({
  day,
  isSelected,
  onToggle,
  accentColor,
}: {
  day: { key: number; label: string; full: string };
  isSelected: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, animation.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.dayButton,
        animatedStyle,
        isSelected && {
          backgroundColor: accentColor,
          borderColor: accentColor,
          ...shadows.glow(accentColor),
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
      ]}
    >
      <Text
        style={[
          styles.dayLabel,
          isSelected && { color: colors.textPrimary, fontWeight: '700' },
        ]}
      >
        {day.label}
      </Text>
    </AnimatedPressable>
  );
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { goalType, fitnessData, targetData } = useLocalSearchParams<{
    goalType: string;
    fitnessData: string;
    targetData: string;
  }>();

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Default Mon, Wed, Fri
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [duration, setDuration] = useState('60 min');
  const buttonScale = useSharedValue(1);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const toggleDay = (dayKey: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey],
    );
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/physical-profile',
      params: {
        goalType: goalType || 'general_fitness',
        fitnessData: fitnessData || '{}',
        targetData: targetData || '{}',
        availabilityData: JSON.stringify({
          selectedDays,
          sessionsPerWeek,
          duration,
        }),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Sessions per week slider
  const sessionRange = { min: 3, max: 7 };
  const sessionPercentage =
    ((sessionsPerWeek - sessionRange.min) / (sessionRange.max - sessionRange.min)) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.backRow}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'\u2190'}</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 5 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '62.5%', backgroundColor: accentColor }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Your availability</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            When can you train? We{'\u2019'}ll build around your schedule.
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Picker */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionLabelText, { color: accentColor }]}>Available days</Text>
          </View>
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <DayButton
                key={day.key}
                day={day}
                isSelected={selectedDays.includes(day.key)}
                onToggle={() => toggleDay(day.key)}
                accentColor={accentColor}
              />
            ))}
          </View>
          <Text style={styles.daysHint}>
            {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
          </Text>
        </Animated.View>

        {/* Sessions per week */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.inputLabel, { color: accentColor }]}>Sessions per week</Text>
              <Text style={styles.sessionCount}>{sessionsPerWeek}</Text>
            </View>
            <Pressable
              onPress={(e) => {
                const locationX = e.nativeEvent.locationX;
                // Estimate based on card width minus padding
                const trackWidth = 300;
                const ratio = Math.max(0, Math.min(1, locationX / trackWidth));
                const newVal = Math.round(
                  sessionRange.min + ratio * (sessionRange.max - sessionRange.min),
                );
                setSessionsPerWeek(Math.max(sessionRange.min, Math.min(sessionRange.max, newVal)));
              }}
              style={styles.sliderTrack}
            >
              <View
                style={[
                  styles.sliderFill,
                  { width: `${sessionPercentage}%`, backgroundColor: accentColor },
                ]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  {
                    left: `${sessionPercentage}%`,
                    backgroundColor: accentColor,
                    ...shadows.glow(accentColor),
                  },
                ]}
              />
            </Pressable>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinMax}>3</Text>
              <Text style={styles.sliderMinMax}>7</Text>
            </View>
          </View>
        </Animated.View>

        {/* Session Duration */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionLabelText, { color: accentColor }]}>Session duration</Text>
          </View>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setDuration(option)}
                style={[
                  styles.durationPill,
                  duration === option && {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === option && { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          style={[styles.continueButton, buttonAnimatedStyle, { backgroundColor: accentColor, ...shadows.glow(accentColor) }]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  backRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  backArrow: {
    ...typography.title3,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionLabelText: {
    ...typography.footnote,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  daysHint: {
    ...typography.caption1,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sessionCount: {
    ...typography.title1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: -11,
    top: -8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sliderMinMax: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationPill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
