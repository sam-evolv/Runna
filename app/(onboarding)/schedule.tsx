import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
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
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const days = [
  { num: 1, short: 'Mon', full: 'Monday' },
  { num: 2, short: 'Tue', full: 'Tuesday' },
  { num: 3, short: 'Wed', full: 'Wednesday' },
  { num: 4, short: 'Thu', full: 'Thursday' },
  { num: 5, short: 'Fri', full: 'Friday' },
  { num: 6, short: 'Sat', full: 'Saturday' },
  { num: 7, short: 'Sun', full: 'Sunday' },
];

function DayButton({
  day,
  isSelected,
  onToggle,
  index,
}: {
  day: (typeof days)[number];
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [onToggle]);

  return (
    <Animated.View entering={FadeInUp.delay(300 + index * 50).duration(400).springify()} style={styles.dayWrapper}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.dayButton,
          animatedStyle,
          isSelected && styles.daySelected,
          isSelected && shadows.glow(colors.primaryDark),
        ]}
      >
        <Typography
          variant="headline"
          color={isSelected ? colors.primary : colors.textSecondary}
        >
          {day.short}
        </Typography>
      </AnimatedPressable>
    </Animated.View>
  );
}

function LongRunCard({
  day,
  isSelected,
  onSelect,
  index,
}: {
  day: (typeof days)[number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [onSelect]);

  return (
    <Animated.View entering={FadeInUp.delay(100 + index * 60).duration(400).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.longRunOption,
          animatedStyle,
          isSelected && styles.longRunSelected,
          isSelected && shadows.glow(colors.primaryDark),
        ]}
      >
        <Typography
          variant="callout"
          color={isSelected ? colors.primary : colors.textSecondary}
          style={{ fontWeight: '600' }}
        >
          {day.full}
        </Typography>
        {isSelected && (
          <View style={styles.checkmark}>
            <Typography variant="caption1" color={colors.primary}>
              {'\u2713'}
            </Typography>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [longSessionDay, setLongSessionDay] = useState<number | null>(null);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    if (longSessionDay === day) setLongSessionDay(null);
  };

  const isRunningOrTri = params.goalType === 'running' || params.goalType === 'triathlon';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Typography variant="caption1" color={colors.primary} style={styles.step}>
              STEP 5 OF 5
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="largeTitle" color={colors.textPrimary}>
              Your schedule
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Which days can you train?
            </Typography>
          </Animated.View>
        </Animated.View>

        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <DayButton
              key={day.num}
              day={day}
              isSelected={selectedDays.includes(day.num)}
              onToggle={() => toggleDay(day.num)}
              index={index}
            />
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(700).duration(400)}>
          <Typography variant="footnote" color={colors.textTertiary} align="center" style={styles.hint}>
            {selectedDays.length === 0
              ? 'Select at least 3 days for best results'
              : `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''} selected`}
          </Typography>
        </Animated.View>

        {isRunningOrTri && selectedDays.length >= 3 && (
          <Animated.View entering={FadeInUp.duration(450).springify()} style={styles.longRunSection}>
            <View style={styles.sectionDivider} />
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Long run day
            </Typography>
            <Typography variant="footnote" color={colors.textSecondary} style={styles.longRunHint}>
              Which day works best for your longest session?
            </Typography>
            <View style={styles.longRunOptions}>
              {[...selectedDays].sort().map((dayNum, index) => {
                const day = days.find((d) => d.num === dayNum)!;
                return (
                  <LongRunCard
                    key={dayNum}
                    day={day}
                    isSelected={longSessionDay === dayNum}
                    onSelect={() => setLongSessionDay(dayNum)}
                    index={index}
                  />
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <Button
          title="Generate My Plan"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/generating',
              params: {
                ...params,
                availableDays: JSON.stringify(selectedDays),
                longSessionDay: String(longSessionDay || ''),
              },
            });
          }}
          disabled={selectedDays.length < 2}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  step: {
    marginBottom: spacing.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayWrapper: {
    flex: 1,
  },
  dayButton: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  daySelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  hint: {
    marginTop: spacing.lg,
  },
  longRunSection: {
    marginTop: spacing.xl,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  longRunHint: {
    marginBottom: spacing.md,
  },
  longRunOptions: {
    gap: spacing.sm,
  },
  longRunOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  longRunSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
