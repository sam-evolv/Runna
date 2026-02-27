import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
import * as Haptics from '@/utils/haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';
import type { GoalType } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const goalTypes: Array<{ type: GoalType; icon: string; title: string; subtitle: string }> = [
  { type: 'running', icon: '\u{1F3C3}', title: 'Running', subtitle: '5k, 10k, half marathon, marathon, ultra' },
  { type: 'strength', icon: '\u{1F4AA}', title: 'Strength', subtitle: 'Hypertrophy, powerlifting, general strength' },
  { type: 'triathlon', icon: '\u{1F3CA}', title: 'Triathlon', subtitle: 'Sprint, Olympic, half Ironman, Ironman' },
  { type: 'general_fitness', icon: '\u{1F3AF}', title: 'General Fitness', subtitle: 'Couch-to-5k, weight loss, flexibility' },
];

function GoalCard({
  goal,
  isSelected,
  onSelect,
  index,
}: {
  goal: (typeof goalTypes)[number];
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
    <Animated.View entering={FadeInUp.delay(300 + index * 100).duration(500).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.option,
          animatedStyle,
          isSelected && styles.optionSelected,
          isSelected && shadows.glow(colors.primaryDark),
        ]}
      >
        <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
          <Typography variant="title2" style={styles.iconText}>
            {goal.icon}
          </Typography>
        </View>
        <View style={styles.optionText}>
          <Typography variant="headline" color={isSelected ? colors.textPrimary : colors.textPrimary}>
            {goal.title}
          </Typography>
          <Typography
            variant="footnote"
            color={isSelected ? colors.textSecondary : colors.textTertiary}
            style={styles.optionSubtitle}
          >
            {goal.subtitle}
          </Typography>
        </View>
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

export default function GoalTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType | null>(null);

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

      <View style={styles.options}>
        {goalTypes.map((goal, index) => (
          <GoalCard
            key={goal.type}
            goal={goal}
            isSelected={selected === goal.type}
            onSelect={() => setSelected(goal.type)}
            index={index}
          />
        ))}
      </View>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            if (selected) {
              router.push({
                pathname: '/(onboarding)/goal-details',
                params: { goalType: selected },
              });
            }
          }}
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
    backgroundColor: '#050505',
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxl,
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
  options: {
    flex: 1,
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconSelected: {
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  iconText: {
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  optionSubtitle: {
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.xxl,
  },
});
