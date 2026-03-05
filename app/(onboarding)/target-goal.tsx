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
import type { GoalType } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Shared Components ──────────────────────────────────────────────────────

function SectionTitle({ text, color: textColor }: { text: string; color: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={[styles.sectionLabelText, { color: textColor }]}>{text}</Text>
    </View>
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

function InputCard({
  label,
  value,
  onChangeText,
  placeholder,
  accentColor,
  unit,
  keyboardType = 'default',
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

function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
  accentColor,
}: {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
  accentColor: string;
}) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const years = [String(currentYear), String(currentYear + 1), String(currentYear + 2)];

  return (
    <View style={styles.datePickerContainer}>
      <View style={styles.dateSection}>
        <Text style={[styles.dateSectionLabel, { color: accentColor }]}>MONTH</Text>
        <View style={styles.monthGrid}>
          {months.map((m) => (
            <Pressable
              key={m}
              onPress={() => onMonthChange(m)}
              style={[
                styles.monthPill,
                month === m && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text
                style={[
                  styles.monthPillText,
                  month === m && { color: colors.textPrimary, fontWeight: '600' },
                ]}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.dateSection}>
        <Text style={[styles.dateSectionLabel, { color: accentColor }]}>YEAR</Text>
        <View style={styles.yearRow}>
          {years.map((y) => (
            <Pressable
              key={y}
              onPress={() => onYearChange(y)}
              style={[
                styles.yearPill,
                year === y && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text
                style={[
                  styles.yearPillText,
                  year === y && { color: colors.textPrimary, fontWeight: '600' },
                ]}
              >
                {y}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Running Target ─────────────────────────────────────────────────────────

function RunningTarget({
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
      <SectionTitle text="Target race" color={accentColor} />
      <PillSelector
        options={['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra']}
        selected={data.targetRace || null}
        onSelect={(v) => update('targetRace', v)}
        accentColor={accentColor}
      />
      <InputCard
        label="Target time"
        value={data.targetTime || ''}
        onChangeText={(v) => update('targetTime', v)}
        placeholder="e.g. 3:30:00"
        accentColor={accentColor}
      />
      <SectionTitle text="Race date" color={accentColor} />
      <MonthYearPicker
        month={data.raceMonth || ''}
        year={data.raceYear || ''}
        onMonthChange={(m) => update('raceMonth', m)}
        onYearChange={(y) => update('raceYear', y)}
        accentColor={accentColor}
      />
    </>
  );
}

// ─── Strength Target ────────────────────────────────────────────────────────

function StrengthTarget({
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
      <SectionTitle text="Training focus" color={accentColor} />
      <PillSelector
        options={['Powerlifting', 'Bodybuilding', 'Athletic Performance']}
        selected={data.focus || null}
        onSelect={(v) => update('focus', v)}
        accentColor={accentColor}
      />
      <SectionTitle text="Target lifts (kg)" color={accentColor} />
      <InputCard
        label="Target squat"
        value={data.targetSquat || ''}
        onChangeText={(v) => update('targetSquat', v)}
        placeholder="e.g. 140"
        accentColor={accentColor}
        unit="kg"
        keyboardType="numeric"
      />
      <InputCard
        label="Target bench press"
        value={data.targetBench || ''}
        onChangeText={(v) => update('targetBench', v)}
        placeholder="e.g. 100"
        accentColor={accentColor}
        unit="kg"
        keyboardType="numeric"
      />
      <InputCard
        label="Target deadlift"
        value={data.targetDeadlift || ''}
        onChangeText={(v) => update('targetDeadlift', v)}
        placeholder="e.g. 180"
        accentColor={accentColor}
        unit="kg"
        keyboardType="numeric"
      />
    </>
  );
}

// ─── HYROX Target ───────────────────────────────────────────────────────────

function HyroxTarget({
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
      <InputCard
        label="Target finish time"
        value={data.targetTime || ''}
        onChangeText={(v) => update('targetTime', v)}
        placeholder="e.g. 1:15:00"
        accentColor={accentColor}
      />
      <SectionTitle text="Event date" color={accentColor} />
      <MonthYearPicker
        month={data.eventMonth || ''}
        year={data.eventYear || ''}
        onMonthChange={(m) => update('eventMonth', m)}
        onYearChange={(y) => update('eventYear', y)}
        accentColor={accentColor}
      />
    </>
  );
}

// ─── Triathlon Target ───────────────────────────────────────────────────────

function TriathlonTarget({
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
      <SectionTitle text="Target race" color={accentColor} />
      <PillSelector
        options={['Sprint', 'Olympic', 'Half Ironman', 'Full Ironman']}
        selected={data.targetRace || null}
        onSelect={(v) => update('targetRace', v)}
        accentColor={accentColor}
      />
      <InputCard
        label="Target finish time"
        value={data.targetTime || ''}
        onChangeText={(v) => update('targetTime', v)}
        placeholder="e.g. 5:30:00"
        accentColor={accentColor}
      />
      <SectionTitle text="Race date" color={accentColor} />
      <MonthYearPicker
        month={data.raceMonth || ''}
        year={data.raceYear || ''}
        onMonthChange={(m) => update('raceMonth', m)}
        onYearChange={(y) => update('raceYear', y)}
        accentColor={accentColor}
      />
    </>
  );
}

// ─── General Target ─────────────────────────────────────────────────────────

function GeneralTarget({
  accentColor,
  data,
  setData,
}: {
  accentColor: string;
  data: Record<string, string>;
  setData: (d: Record<string, string>) => void;
}) {
  const update = (key: string, val: string) => setData({ ...data, [key]: val });

  const goals = [
    { id: 'lose_fat', emoji: '\u{1F525}', title: 'Lose Fat', subtitle: 'Body recomposition' },
    { id: 'build_muscle', emoji: '\u{1F4AA}', title: 'Build Muscle', subtitle: 'Increase lean mass' },
    { id: 'improve_cardio', emoji: '\u{2764}\uFE0F', title: 'Improve Cardio', subtitle: 'Better endurance' },
    { id: 'get_stronger', emoji: '\u{1F3CB}\uFE0F', title: 'Get Stronger', subtitle: 'Increase strength' },
    { id: 'stay_active', emoji: '\u{1F3AF}', title: 'Stay Active', subtitle: 'Maintain fitness' },
  ];

  return (
    <>
      <SectionTitle text="Primary focus" color={accentColor} />
      {goals.map((goal) => (
        <Pressable
          key={goal.id}
          onPress={() => update('primaryFocus', goal.id)}
          style={[
            styles.focusCard,
            data.primaryFocus === goal.id && {
              borderColor: accentColor,
              backgroundColor: withOpacity(accentColor, 0.08),
            },
          ]}
        >
          <Text style={styles.focusEmoji}>{goal.emoji}</Text>
          <View style={styles.focusTextContent}>
            <Text style={styles.focusTitle}>{goal.title}</Text>
            <Text style={styles.focusSubtitle}>{goal.subtitle}</Text>
          </View>
          <View style={[styles.radioOuter, data.primaryFocus === goal.id && { borderColor: accentColor }]}>
            {data.primaryFocus === goal.id && (
              <View style={[styles.radioInner, { backgroundColor: accentColor }]} />
            )}
          </View>
        </Pressable>
      ))}
    </>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function TargetGoalScreen() {
  const router = useRouter();
  const { goalType, fitnessData } = useLocalSearchParams<{ goalType: string; fitnessData: string }>();
  const [data, setData] = useState<Record<string, string>>({});
  const buttonScale = useSharedValue(1);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/availability',
      params: {
        goalType: goalType || 'general_fitness',
        fitnessData: fitnessData || '{}',
        targetData: JSON.stringify(data),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const renderTargets = () => {
    switch (goalType as GoalType) {
      case 'running':
        return <RunningTarget accentColor={accentColor} data={data} setData={setData} />;
      case 'strength':
        return <StrengthTarget accentColor={accentColor} data={data} setData={setData} />;
      case 'hyrox':
        return <HyroxTarget accentColor={accentColor} data={data} setData={setData} />;
      case 'triathlon':
        return <TriathlonTarget accentColor={accentColor} data={data} setData={setData} />;
      case 'general_fitness':
      default:
        return <GeneralTarget accentColor={accentColor} data={data} setData={setData} />;
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

      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 4 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '50%', backgroundColor: accentColor }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Set your target</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            Define what success looks like for you
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          {renderTargets()}
        </Animated.View>
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
  datePickerContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dateSection: {
    marginBottom: spacing.md,
  },
  dateSectionLabel: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  monthPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 48,
    alignItems: 'center',
  },
  monthPillText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  yearRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  yearPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  yearPillText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  focusEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  focusTextContent: {
    flex: 1,
  },
  focusTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  focusSubtitle: {
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
