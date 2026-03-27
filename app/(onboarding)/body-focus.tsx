import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BodyArea {
  id: string;
  emoji: string;
  label: string;
}

const BODY_AREAS: BodyArea[] = [
  { id: 'core', emoji: '\u{1F525}', label: 'Core / Abs' },
  { id: 'chest', emoji: '\u{1F4AA}', label: 'Chest' },
  { id: 'arms', emoji: '\u{1F3CB}\uFE0F', label: 'Arms' },
  { id: 'shoulders', emoji: '\u{1F9BE}', label: 'Shoulders' },
  { id: 'back', emoji: '\u{1F9D8}', label: 'Back' },
  { id: 'glutes', emoji: '\u{1F351}', label: 'Glutes' },
  { id: 'hips', emoji: '\u{1F6B6}', label: 'Hips' },
  { id: 'thighs', emoji: '\u{1F9B5}', label: 'Thighs' },
  { id: 'calves', emoji: '\u{1F3C3}', label: 'Calves' },
  { id: 'full_body', emoji: '\u26A1', label: 'Full Body' },
];

const MAX_SELECTIONS = 3;

function BodyAreaCard({
  area,
  isSelected,
  onToggle,
  index,
}: {
  area: BodyArea;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, animation.spring.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, [scale]);

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(300)}
      style={styles.cardWrapper}
    >
      <AnimatedPressable
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.areaCard,
          animatedStyle,
          isSelected && styles.areaCardSelected,
        ]}
      >
        <View
          style={[
            styles.emojiContainer,
            isSelected && { backgroundColor: withOpacity(colors.primary, 0.18) },
          ]}
        >
          <Text style={styles.emoji}>{area.emoji}</Text>
        </View>
        <Text
          style={[
            styles.areaLabel,
            isSelected && { color: colors.primary },
          ]}
        >
          {area.label}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkMark}>{'\u2713'}</Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function BodyFocusScreen() {
  const router = useRouter();
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        if (next.size >= MAX_SELECTIONS) return prev;
        next.add(areaId);
      }
      return next;
    });
  };

  const canContinue = selectedAreas.size >= 1;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push('/(onboarding)/energy-patterns');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.stepLabel}>STEP 8 OF 10</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '80%' }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Where do you want to see the most change?</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            This helps me target your programming to the areas you care about most.
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={styles.selectionHint}>
            Select up to {MAX_SELECTIONS} areas ({selectedAreas.size}/{MAX_SELECTIONS})
          </Text>
        </Animated.View>
      </View>

      {/* Body Area Grid */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {BODY_AREAS.map((area, index) => (
            <BodyAreaCard
              key={area.id}
              area={area}
              isSelected={selectedAreas.has(area.id)}
              onToggle={() => toggleArea(area.id)}
              index={index}
            />
          ))}
        </View>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          disabled={!canContinue}
          style={[
            styles.continueButton,
            buttonAnimatedStyle,
            !canContinue && styles.continueButtonDisabled,
          ]}
        >
          <Text style={[styles.continueButtonText, !canContinue && { opacity: 0.5 }]}>
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
  selectionHint: {
    ...typography.footnote,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  areaCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  areaCardSelected: {
    backgroundColor: withOpacity('#22D3EE', 0.12),
    borderColor: withOpacity('#22D3EE', 0.3),
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: withOpacity(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 22,
  },
  areaLabel: {
    ...typography.headline,
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 14,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
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
