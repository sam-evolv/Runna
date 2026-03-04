import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
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
import { colors, spacing, borderRadius, animation, shadows, withOpacity } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoalOption {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}

interface GoalCategory {
  title: string;
  color: string;
  goals: GoalOption[];
}

const categories: GoalCategory[] = [
  {
    title: 'RUNNING',
    color: colors.run,
    goals: [
      { id: 'running:couch_to_5k', icon: '\u{1F6B6}', title: 'Couch to 5K', subtitle: 'Start from zero', color: colors.run },
      { id: 'running:5k', icon: '\u{1F3C3}', title: '5K', subtitle: 'Speed up your 5K', color: colors.run },
      { id: 'running:10k', icon: '\u{1F3C3}', title: '10K', subtitle: 'Train for 10K', color: colors.run },
      { id: 'running:half_marathon', icon: '\u{1F3C5}', title: 'Half Marathon', subtitle: '21.1km / 13.1mi', color: colors.run },
      { id: 'running:marathon', icon: '\u{1F3C6}', title: 'Marathon', subtitle: '42.2km / 26.2mi', color: colors.run },
      { id: 'running:speed_training', icon: '\u26A1', title: 'Speed Training', subtitle: 'Get faster', color: colors.run },
    ],
  },
  {
    title: 'STRENGTH',
    color: colors.strength,
    goals: [
      { id: 'strength:beginner_strength', icon: '\u{1F476}', title: 'Beginner Strength', subtitle: 'Learn the lifts', color: colors.strength },
      { id: 'strength:general_hypertrophy', icon: '\u{1F4AA}', title: 'Muscle Building', subtitle: 'Hypertrophy focus', color: colors.strength },
      { id: 'strength:powerlifting', icon: '\u{1F3CB}', title: 'Powerlifting', subtitle: 'SBD focus', color: colors.strength },
      { id: 'strength:athletic_performance', icon: '\u{1F3AF}', title: 'Athletic Performance', subtitle: 'Sport-specific', color: colors.strength },
    ],
  },
  {
    title: 'HYROX',
    color: colors.hyrox,
    goals: [
      { id: 'hyrox:hyrox_singles', icon: '\u{1F525}', title: 'HYROX Singles', subtitle: 'Solo race prep', color: colors.hyrox },
      { id: 'hyrox:hyrox_doubles', icon: '\u{1F91D}', title: 'HYROX Doubles', subtitle: 'Partner race', color: colors.hyrox },
      { id: 'hyrox:hyrox_pro', icon: '\u{1F451}', title: 'HYROX Pro', subtitle: 'Elite division', color: colors.hyrox },
      { id: 'hyrox:hyrox_fitness', icon: '\u{1F3C3}', title: 'HYROX Fitness', subtitle: 'First timer', color: colors.hyrox },
    ],
  },
  {
    title: 'ENDURANCE',
    color: colors.triathlon,
    goals: [
      { id: 'triathlon:sprint_tri', icon: '\u{1F3CA}', title: 'Triathlon', subtitle: 'Sprint to Ironman', color: colors.triathlon },
      { id: 'endurance:swim', icon: '\u{1F3CA}', title: 'Swim', subtitle: 'Pool or open water', color: colors.triathlon },
      { id: 'endurance:cycling', icon: '\u{1F6B4}', title: 'Cycling', subtitle: 'Road or indoor', color: colors.triathlon },
      { id: 'general_fitness:general_fitness', icon: '\u{1F3AF}', title: 'General Fitness', subtitle: 'All-round improvement', color: colors.triathlon },
    ],
  },
];

function GoalCard({
  goal,
  isSelected,
  onSelect,
}: {
  goal: GoalOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [onSelect]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.goalCard,
        animatedStyle,
        isSelected && { borderColor: goal.color, backgroundColor: withOpacity(goal.color, 0.08) },
      ]}
    >
      <View style={[styles.goalIcon, isSelected && { backgroundColor: withOpacity(goal.color, 0.15) }]}>
        <Typography variant="title3" style={{ textAlign: 'center' }}>{goal.icon}</Typography>
      </View>
      <Typography variant="caption1" style={{ fontWeight: '600', textAlign: 'center', marginTop: spacing.xs }} numberOfLines={1}>
        {goal.title}
      </Typography>
      <Typography variant="caption2" color={colors.textMuted} style={{ textAlign: 'center' }} numberOfLines={1}>
        {goal.subtitle}
      </Typography>
    </AnimatedPressable>
  );
}

export default function GoalTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    const [goalType, goalSubtype] = selected.split(':');
    router.push({
      pathname: '/(onboarding)/goal-details',
      params: { goalType, goalSubtype },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 1 OF 5
          </Typography>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Typography variant="largeTitle" color={colors.textPrimary}>
            What's your goal?
          </Typography>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Choose the type of training you want to focus on
          </Typography>
        </Animated.View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {categories.map((category, catIdx) => (
          <Animated.View
            key={category.title}
            entering={FadeInDown.delay(300 + catIdx * 100).duration(400)}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Typography variant="caption1" color={category.color} style={styles.categoryTitle}>
                {category.title}
              </Typography>
            </View>
            <View style={styles.goalGrid}>
              {category.goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isSelected={selected === goal.id}
                  onSelect={() => setSelected(goal.id)}
                />
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  categoryTitle: {
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  goalCard: {
    width: '23%',
    flexGrow: 1,
    flexBasis: '22%',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
