import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
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
import type { FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INJURY_OPTIONS = [
  { id: 'knee', label: 'Knee', emoji: '\u{1F9B5}' },
  { id: 'back', label: 'Back', emoji: '\u{1F9B4}' },
  { id: 'shoulder', label: 'Shoulder', emoji: '\u{1F4AA}' },
  { id: 'hip', label: 'Hip', emoji: '\u{1F9B6}' },
  { id: 'ankle', label: 'Ankle', emoji: '\u{1F9B6}' },
  { id: 'none', label: 'None', emoji: '\u2705' },
];

const EXPERIENCE_LEVELS: { level: FitnessLevel; title: string; description: string; emoji: string }[] = [
  { level: 'beginner', title: 'Beginner', description: 'Less than 6 months training', emoji: '\u{1F331}' },
  { level: 'intermediate', title: 'Intermediate', description: '6 months to 2 years', emoji: '\u{1F4AA}' },
  { level: 'advanced', title: 'Advanced', description: '2-5 years consistent', emoji: '\u{1F525}' },
  { level: 'elite', title: 'Elite', description: '5+ years, competitive', emoji: '\u{1F451}' },
];

export default function PhysicalProfileScreen() {
  const router = useRouter();
  const { goalType, fitnessData, targetData, availabilityData } = useLocalSearchParams<{
    goalType: string;
    fitnessData: string;
    targetData: string;
    availabilityData: string;
  }>();

  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [useMetric, setUseMetric] = useState(true);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<FitnessLevel | null>(null);
  const buttonScale = useSharedValue(1);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const toggleInjury = (injuryId: string) => {
    if (injuryId === 'none') {
      setInjuries((prev) => (prev.includes('none') ? [] : ['none']));
      return;
    }
    setInjuries((prev) => {
      const filtered = prev.filter((i) => i !== 'none');
      return filtered.includes(injuryId)
        ? filtered.filter((i) => i !== injuryId)
        : [...filtered, injuryId];
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/equipment',
      params: {
        goalType: goalType || 'general_fitness',
        fitnessData: fitnessData || '{}',
        targetData: targetData || '{}',
        availabilityData: availabilityData || '{}',
        profileData: JSON.stringify({
          age,
          height,
          weight,
          useMetric,
          injuries,
          experienceLevel,
        }),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

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
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 6 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '75%', backgroundColor: accentColor }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>About you</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            Help us personalise your training zones and recovery
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Age */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.inputCard}>
            <Text style={[styles.inputLabel, { color: accentColor }]}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 30"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              selectionColor={accentColor}
            />
          </View>
        </Animated.View>

        {/* Unit toggle */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <View style={styles.unitToggleRow}>
            <Pressable
              onPress={() => setUseMetric(true)}
              style={[
                styles.unitToggle,
                useMetric && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text style={[styles.unitToggleText, useMetric && { color: colors.textPrimary, fontWeight: '700' }]}>
                Metric
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setUseMetric(false)}
              style={[
                styles.unitToggle,
                !useMetric && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text style={[styles.unitToggleText, !useMetric && { color: colors.textPrimary, fontWeight: '700' }]}>
                Imperial
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Height */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <View style={styles.inputCard}>
            <Text style={[styles.inputLabel, { color: accentColor }]}>Height</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={height}
                onChangeText={setHeight}
                placeholder={useMetric ? 'e.g. 178' : 'e.g. 5\'10"'}
                placeholderTextColor={colors.textMuted}
                keyboardType={useMetric ? 'numeric' : 'default'}
                selectionColor={accentColor}
              />
              <Text style={styles.unitText}>{useMetric ? 'cm' : 'ft/in'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Weight */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <View style={styles.inputCard}>
            <Text style={[styles.inputLabel, { color: accentColor }]}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={weight}
                onChangeText={setWeight}
                placeholder={useMetric ? 'e.g. 75' : 'e.g. 165'}
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                selectionColor={accentColor}
              />
              <Text style={styles.unitText}>{useMetric ? 'kg' : 'lbs'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Injury History */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionLabelText, { color: accentColor }]}>Injury history</Text>
          </View>
          <View style={styles.chipsRow}>
            {INJURY_OPTIONS.map((injury) => {
              const isSelected = injuries.includes(injury.id);
              return (
                <Pressable
                  key={injury.id}
                  onPress={() => toggleInjury(injury.id)}
                  style={[
                    styles.chip,
                    isSelected && {
                      backgroundColor: withOpacity(accentColor, 0.15),
                      borderColor: accentColor,
                    },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{injury.emoji}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && { color: colors.textPrimary, fontWeight: '600' },
                    ]}
                  >
                    {injury.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Experience Level */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionLabelText, { color: accentColor }]}>Experience level</Text>
          </View>
          {EXPERIENCE_LEVELS.map((item) => (
            <Pressable
              key={item.level}
              onPress={() => setExperienceLevel(item.level)}
              style={[
                styles.experienceCard,
                experienceLevel === item.level && {
                  borderColor: accentColor,
                  backgroundColor: withOpacity(accentColor, 0.08),
                },
              ]}
            >
              <View style={[styles.experienceEmoji, { backgroundColor: withOpacity(accentColor, 0.1) }]}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </View>
              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>{item.title}</Text>
                <Text style={styles.experienceDescription}>{item.description}</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  experienceLevel === item.level && { borderColor: accentColor },
                ]}
              >
                {experienceLevel === item.level && (
                  <View style={[styles.radioInner, { backgroundColor: accentColor }]} />
                )}
              </View>
            </Pressable>
          ))}
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(800).duration(400)} style={styles.footer}>
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
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    ...typography.title3,
    color: colors.textPrimary,
    padding: 0,
    height: 36,
  },
  unitText: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  unitToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  unitToggle: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  unitToggleText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabelText: {
    ...typography.footnote,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 6,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  experienceEmoji: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  experienceDescription: {
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
