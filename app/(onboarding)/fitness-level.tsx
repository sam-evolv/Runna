import React, { useState } from 'react';
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
import type { GoalType, FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Shared sub-components ──────────────────────────────────────────────────

function StepHeader({ accentColor }: { accentColor: string }) {
  return (
    <View style={styles.header}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 3 OF 8</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: '37.5%', backgroundColor: accentColor }]} />
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={styles.title}>Your current fitness</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <Text style={styles.headerSubtitle}>
          Tell us where you are so we can build the perfect plan
        </Text>
      </Animated.View>
    </View>
  );
}

function NumberInputCard({
  label,
  value,
  onChangeText,
  placeholder,
  accentColor,
  unit,
  keyboardType = 'numeric',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accentColor: string;
  unit?: string;
  keyboardType?: 'numeric' | 'default';
}) {
  return (
    <View style={styles.inputCard}>
      <Text style={[styles.inputLabel, { color: accentColor }]}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          selectionColor={accentColor}
        />
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
    </View>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  onValueChange,
  accentColor,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (val: number) => void;
  accentColor: string;
  unit?: string;
}) {
  const range = max - min;
  const percentage = range > 0 ? ((value - min) / range) * 100 : 0;

  const handlePress = (locationX: number, layoutWidth: number) => {
    if (layoutWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / layoutWidth));
    const newVal = Math.round(min + ratio * range);
    onValueChange(newVal);
  };

  return (
    <View style={styles.inputCard}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.inputLabel, { color: accentColor }]}>{label}</Text>
        <Text style={styles.sliderValue}>
          {value}{unit ? ` ${unit}` : ''}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          const target = e.nativeEvent;
          handlePress(target.locationX, target.locationX / (percentage / 100 || 1));
        }}
        style={styles.sliderTrack}
      >
        <View
          style={[
            styles.sliderFill,
            { width: `${percentage}%`, backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            {
              left: `${percentage}%`,
              backgroundColor: accentColor,
              ...shadows.glow(accentColor),
            },
          ]}
        />
      </Pressable>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderMinMax}>{min}</Text>
        <Text style={styles.sliderMinMax}>{max}</Text>
      </View>
    </View>
  );
}

function LevelCard({
  level,
  title,
  description,
  isSelected,
  onSelect,
  accentColor,
}: {
  level: FitnessLevel;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: string;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.levelCard,
        isSelected && {
          borderColor: accentColor,
          backgroundColor: withOpacity(accentColor, 0.08),
        },
      ]}
    >
      <View style={styles.levelCardContent}>
        <Text style={styles.levelTitle}>{title}</Text>
        <Text style={styles.levelDescription}>{description}</Text>
      </View>
      <View style={[styles.radioOuter, isSelected && { borderColor: accentColor }]}>
        {isSelected && <View style={[styles.radioInner, { backgroundColor: accentColor }]} />}
      </View>
    </Pressable>
  );
}

function PillSelector({
  options,
  selected,
  onSelect,
  accentColor,
}: {
  options: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  accentColor: string;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={[
            styles.pill,
            selected === option && {
              backgroundColor: accentColor,
              borderColor: accentColor,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              selected === option && { color: colors.textPrimary, fontWeight: '600' },
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Running Inputs ─────────────────────────────────────────────────────────

function RunningInputs({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  return (
    <>
      <SliderInput
        label="Weekly distance"
        value={parseInt(data.weeklyKm || '20', 10)}
        min={0}
        max={100}
        onValueChange={(v) => update('weeklyKm', String(v))}
        accentColor={accentColor}
        unit="km"
      />
      <NumberInputCard
        label="Longest recent run"
        value={data.longestRun || ''}
        onChangeText={(v) => update('longestRun', v)}
        placeholder="e.g. 15"
        accentColor={accentColor}
        unit="km"
      />
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Recent race times (optional)</Text>
      </View>
      <NumberInputCard
        label="5K time"
        value={data.time5k || ''}
        onChangeText={(v) => update('time5k', v)}
        placeholder="e.g. 25:00"
        accentColor={accentColor}
        keyboardType="default"
      />
      <NumberInputCard
        label="10K time"
        value={data.time10k || ''}
        onChangeText={(v) => update('time10k', v)}
        placeholder="e.g. 52:00"
        accentColor={accentColor}
        keyboardType="default"
      />
      <NumberInputCard
        label="Half marathon time"
        value={data.timeHalf || ''}
        onChangeText={(v) => update('timeHalf', v)}
        placeholder="e.g. 1:55:00"
        accentColor={accentColor}
        keyboardType="default"
      />
    </>
  );
}

// ─── Strength Inputs ────────────────────────────────────────────────────────

function StrengthInputs({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  return (
    <>
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Current lifts (1RM or estimated)</Text>
      </View>
      <NumberInputCard
        label="Squat"
        value={data.squat || ''}
        onChangeText={(v) => update('squat', v)}
        placeholder="e.g. 100"
        accentColor={accentColor}
        unit="kg"
      />
      <NumberInputCard
        label="Bench Press"
        value={data.bench || ''}
        onChangeText={(v) => update('bench', v)}
        placeholder="e.g. 80"
        accentColor={accentColor}
        unit="kg"
      />
      <NumberInputCard
        label="Deadlift"
        value={data.deadlift || ''}
        onChangeText={(v) => update('deadlift', v)}
        placeholder="e.g. 130"
        accentColor={accentColor}
        unit="kg"
      />
      <SliderInput
        label="Training experience"
        value={parseInt(data.trainingYears || '2', 10)}
        min={0}
        max={20}
        onValueChange={(v) => update('trainingYears', String(v))}
        accentColor={accentColor}
        unit="years"
      />
    </>
  );
}

// ─── HYROX Inputs ───────────────────────────────────────────────────────────

function HyroxInputs({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  return (
    <>
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Target category</Text>
      </View>
      <PillSelector
        options={['Singles', 'Doubles', 'Pro']}
        selected={data.category || null}
        onSelect={(v) => update('category', v)}
        accentColor={accentColor}
      />
      <NumberInputCard
        label="Previous HYROX time"
        value={data.previousTime || ''}
        onChangeText={(v) => update('previousTime', v)}
        placeholder="e.g. 1:25:00 (or leave blank)"
        accentColor={accentColor}
        keyboardType="default"
      />
      <NumberInputCard
        label="Current 5K run time"
        value={data.run5k || ''}
        onChangeText={(v) => update('run5k', v)}
        placeholder="e.g. 24:00"
        accentColor={accentColor}
        keyboardType="default"
      />
    </>
  );
}

// ─── Triathlon Inputs ───────────────────────────────────────────────────────

function TriathlonInputs({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  return (
    <>
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Target distance</Text>
      </View>
      <PillSelector
        options={['Sprint', 'Olympic', 'Half Ironman', 'Full Ironman']}
        selected={data.distance || null}
        onSelect={(v) => update('distance', v)}
        accentColor={accentColor}
      />
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Current discipline fitness</Text>
      </View>
      {(['Swim', 'Bike', 'Run'] as const).map((discipline) => {
        const key = `${discipline.toLowerCase()}Level`;
        return (
          <View key={discipline} style={styles.disciplineRow}>
            <Text style={styles.disciplineLabel}>{discipline}</Text>
            <PillSelector
              options={['Beginner', 'Intermediate', 'Advanced']}
              selected={data[key] || null}
              onSelect={(v) => update(key, v)}
              accentColor={accentColor}
            />
          </View>
        );
      })}
    </>
  );
}

// ─── General Fitness Inputs ─────────────────────────────────────────────────

function GeneralFitnessInputs({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const levels: { level: FitnessLevel; title: string; description: string }[] = [
    { level: 'beginner', title: 'Beginner', description: 'New to structured training' },
    { level: 'intermediate', title: 'Intermediate', description: '6-18 months of consistent training' },
    { level: 'advanced', title: 'Advanced', description: '2+ years of serious training' },
    { level: 'elite', title: 'Elite', description: 'Competitive athlete level' },
  ];

  return (
    <>
      <View style={styles.sectionLabel}>
        <Text style={[styles.sectionLabelText, { color: accentColor }]}>Fitness level</Text>
      </View>
      {levels.map((item) => (
        <Animated.View key={item.level} entering={FadeInDown.delay(100).duration(300)}>
          <LevelCard
            level={item.level}
            title={item.title}
            description={item.description}
            isSelected={data.fitnessLevel === item.level}
            onSelect={() => setData({ ...data, fitnessLevel: item.level })}
            accentColor={accentColor}
          />
        </Animated.View>
      ))}
    </>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function FitnessLevelScreen() {
  const router = useRouter();
  const { goalType } = useLocalSearchParams<{ goalType: GoalType }>();
  const [data, setData] = useState<Record<string, string>>({});
  const buttonScale = useSharedValue(1);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/target-goal',
      params: { goalType: goalType || 'general_fitness', fitnessData: JSON.stringify(data) },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const renderInputs = () => {
    switch (goalType) {
      case 'running':
        return <RunningInputs accentColor={accentColor} data={data} setData={setData} />;
      case 'strength':
        return <StrengthInputs accentColor={accentColor} data={data} setData={setData} />;
      case 'hyrox':
        return <HyroxInputs accentColor={accentColor} data={data} setData={setData} />;
      case 'triathlon':
        return <TriathlonInputs accentColor={accentColor} data={data} setData={setData} />;
      case 'general_fitness':
      default:
        return <GeneralFitnessInputs accentColor={accentColor} data={data} setData={setData} />;
    }
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

      <StepHeader accentColor={accentColor} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderInputs()}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.footer}>
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabelText: {
    ...typography.footnote,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sliderValue: {
    ...typography.title3,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    top: -7,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderMinMax: {
    ...typography.caption2,
    color: colors.textMuted,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  levelCardContent: {
    flex: 1,
  },
  levelTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  levelDescription: {
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillText: {
    ...typography.footnote,
    color: colors.textSecondary,
  },
  disciplineRow: {
    marginBottom: spacing.md,
  },
  disciplineLabel: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
