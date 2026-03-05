import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity } from '@/constants/theme';
import type { GoalType } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoalOption {
  id: GoalType;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

const goalOptions: GoalOption[] = [
  {
    id: 'running',
    emoji: '\u{1F3C3}',
    title: 'Running',
    subtitle: 'C25K to Marathon and beyond',
    color: colors.running,
  },
  {
    id: 'strength',
    emoji: '\u{1F4AA}',
    title: 'Strength Training',
    subtitle: 'Build muscle, get stronger',
    color: colors.strength,
  },
  {
    id: 'hyrox',
    emoji: '\u{1F3CB}\uFE0F',
    title: 'HYROX',
    subtitle: 'Race-day ready hybrid fitness',
    color: colors.hyrox,
  },
  {
    id: 'triathlon',
    emoji: '\u{1F3CA}',
    title: 'Triathlon / Ironman',
    subtitle: 'Swim, bike, run — conquer it all',
    color: colors.triathlon,
  },
  {
    id: 'general_fitness',
    emoji: '\u26A1',
    title: 'General Fitness',
    subtitle: 'All-round health and performance',
    color: colors.general,
  },
];

function GoalCard({
  goal,
  isSelected,
  onSelect,
  index,
}: {
  goal: GoalOption;
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
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, [scale]);

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).duration(400)}>
      <AnimatedPressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.goalCard,
          animatedStyle,
          isSelected && {
            borderColor: goal.color,
            backgroundColor: withOpacity(goal.color, 0.08),
          },
        ]}
      >
        {/* Left accent border */}
        <View
          style={[
            styles.accentBorder,
            { backgroundColor: isSelected ? goal.color : withOpacity(goal.color, 0.3) },
          ]}
        />

        {/* Emoji */}
        <View style={[styles.emojiContainer, { backgroundColor: withOpacity(goal.color, 0.12) }]}>
          <Text style={styles.emoji}>{goal.emoji}</Text>
        </View>

        {/* Text content */}
        <View style={styles.goalTextContent}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
        </View>

        {/* Selection indicator */}
        <View
          style={[
            styles.radioOuter,
            isSelected && { borderColor: goal.color },
          ]}
        >
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: goal.color }]} />
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function GoalSelectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType | null>(null);
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    if (!selected) return;
    router.push({
      pathname: '/(onboarding)/fitness-level',
      params: { goalType: selected },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.stepLabel}>STEP 2 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '25%' }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>What{'\u2019'}s your goal?</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            Choose the type of training you want to focus on
          </Text>
        </Animated.View>
      </View>

      {/* Goal Cards */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {goalOptions.map((goal, index) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isSelected={selected === goal.id}
            onSelect={() => setSelected(goal.id)}
            index={index}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          disabled={!selected}
          style={[
            styles.continueButton,
            buttonAnimatedStyle,
            !selected && styles.continueButtonDisabled,
          ]}
        >
          <Text style={[styles.continueButtonText, !selected && { opacity: 0.5 }]}>
            Continue
          </Text>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  stepLabel: {
    ...typography.caption1,
    color: colors.primary,
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
    backgroundColor: colors.primary,
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
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingRight: spacing.lg,
    paddingLeft: 0,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  accentBorder: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    marginRight: spacing.md,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  goalTextContent: {
    flex: 1,
  },
  goalTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  goalSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.primary),
  },
  continueButtonDisabled: {
    opacity: 0.35,
  },
  continueButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
