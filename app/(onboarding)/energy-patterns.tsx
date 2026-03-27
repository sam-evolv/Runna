import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
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

interface EnergyOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  { id: 'morning', emoji: '\u{1F305}', label: 'Morning', description: 'I\'m an early bird — peak energy before noon' },
  { id: 'midday', emoji: '\u2600\uFE0F', label: 'Midday', description: 'I hit my stride around lunchtime' },
  { id: 'evening', emoji: '\u{1F307}', label: 'Evening', description: 'I come alive after work hours' },
  { id: 'varies', emoji: '\u{1F504}', label: 'It varies', description: 'My energy shifts day to day' },
];

const SLEEP_LABELS = ['Great', 'Good', 'OK', 'Poor', 'Terrible'];
const STRESS_LABELS = ['Low', 'Mild', 'Moderate', 'High', 'Very high'];

function EnergyCard({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: EnergyOption;
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
    <Animated.View entering={FadeInDown.delay(400 + index * 80).duration(300)}>
      <AnimatedPressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.energyCard,
          animatedStyle,
          isSelected && styles.energyCardSelected,
        ]}
      >
        <View
          style={[
            styles.emojiContainer,
            isSelected && { backgroundColor: withOpacity(colors.primary, 0.18) },
          ]}
        >
          <Text style={styles.emoji}>{option.emoji}</Text>
        </View>
        <View style={styles.energyTextContent}>
          <Text style={[styles.energyLabel, isSelected && { color: colors.primary }]}>
            {option.label}
          </Text>
          <Text style={styles.energyDescription}>{option.description}</Text>
        </View>
        <View
          style={[
            styles.radioOuter,
            isSelected && { borderColor: colors.primary },
          ]}
        >
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function ScaleSelector({
  labels,
  value,
  onSelect,
}: {
  labels: string[];
  value: number | null;
  onSelect: (v: number) => void;
}) {
  return (
    <View style={styles.scaleRow}>
      {labels.map((label, index) => {
        const isActive = value === index + 1;
        return (
          <Pressable
            key={label}
            onPress={() => onSelect(index + 1)}
            style={[
              styles.scalePill,
              isActive && styles.scalePillActive,
            ]}
          >
            <Text style={[styles.scaleNumber, isActive && { color: colors.textInverse }]}>
              {index + 1}
            </Text>
            <Text style={[styles.scaleLabel, isActive && { color: colors.textInverse }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function EnergyPatternsScreen() {
  const router = useRouter();
  const [energyTime, setEnergyTime] = useState<string | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [injuryNotes, setInjuryNotes] = useState('');
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const canContinue = energyTime !== null && sleepQuality !== null && stressLevel !== null;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push('/(onboarding)/plan-ready');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.stepLabel}>STEP 9 OF 10</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '90%' }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Your energy {'\u0026'} health</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            I{'\u2019'}ll schedule your hardest sessions when you{'\u2019'}re at peak energy.
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question 1: Energy time */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={styles.sectionTitle}>When do you feel most energised?</Text>
        </Animated.View>
        {ENERGY_OPTIONS.map((option, index) => (
          <EnergyCard
            key={option.id}
            option={option}
            isSelected={energyTime === option.id}
            onSelect={() => setEnergyTime(option.id)}
            index={index}
          />
        ))}

        {/* Question 2: Sleep quality */}
        <Animated.View entering={FadeInDown.delay(750).duration(400)}>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            How{'\u2019'}s your sleep quality?
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(800).duration(400)}>
          <ScaleSelector
            labels={SLEEP_LABELS}
            value={sleepQuality}
            onSelect={setSleepQuality}
          />
        </Animated.View>

        {/* Question 3: Stress level */}
        <Animated.View entering={FadeInDown.delay(900).duration(400)}>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            Current stress level?
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(950).duration(400)}>
          <ScaleSelector
            labels={STRESS_LABELS}
            value={stressLevel}
            onSelect={setStressLevel}
          />
        </Animated.View>

        {/* Optional injury notes */}
        <Animated.View entering={FadeInDown.delay(1050).duration(400)}>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
            Any injuries or conditions I should know about?
          </Text>
          <Text style={styles.optionalLabel}>Optional</Text>
          <TextInput
            style={styles.textInput}
            value={injuryNotes}
            onChangeText={setInjuryNotes}
            placeholder="e.g. old knee injury, lower back pain..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(1100).duration(500)} style={styles.footer}>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  energyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  energyCardSelected: {
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
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  energyTextContent: {
    flex: 1,
  },
  energyLabel: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  energyDescription: {
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
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  scalePill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scalePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scaleNumber: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  scaleLabel: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  optionalLabel: {
    ...typography.caption1,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
    minHeight: 80,
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
