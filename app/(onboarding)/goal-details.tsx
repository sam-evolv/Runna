import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
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
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';
import type { GoalType, GoalSubtype, FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const levels: Array<{ level: FitnessLevel; label: string; description: string }> = [
  { level: 'beginner', label: 'Beginner', description: 'New to this or returning after a long break' },
  { level: 'intermediate', label: 'Intermediate', description: 'Regular training for 6+ months' },
  { level: 'advanced', label: 'Advanced', description: '2+ years consistent training' },
  { level: 'elite', label: 'Elite', description: 'Competitive level athlete' },
];

const equipmentOptions = [
  { id: 'barbell', label: 'Barbell', icon: '\u{1F3CB}' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '\u{1F4AA}' },
  { id: 'cable_machine', label: 'Cables', icon: '\u{1FA9F}' },
  { id: 'machine', label: 'Machines', icon: '\u2699\uFE0F' },
  { id: 'none', label: 'Bodyweight', icon: '\u{1F9D8}' },
];

const triDistances = [
  { id: 'sprint_tri', label: 'Sprint', desc: '750m/20km/5km' },
  { id: 'olympic_tri', label: 'Olympic', desc: '1.5km/40km/10km' },
  { id: 'half_ironman', label: '70.3', desc: '1.9km/90km/21.1km' },
  { id: 'ironman', label: 'Ironman', desc: '3.8km/180km/42.2km' },
];

const daysPerWeekOptions = [2, 3, 4, 5, 6];

export default function GoalDetailsScreen() {
  const router = useRouter();
  const { goalType, goalSubtype } = useLocalSearchParams<{ goalType: string; goalSubtype: string }>();

  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [triDistance, setTriDistance] = useState<string | null>(null);

  const isRunning = goalType === 'running';
  const isStrength = goalType === 'strength';
  const isHyrox = goalType === 'hyrox';
  const isTri = goalType === 'triathlon' || goalType === 'endurance';

  const toggleEquipment = (id: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const canContinue = fitnessLevel !== null;

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/current-stats',
      params: {
        goalType: goalType as string,
        goalSubtype: (isTri && triDistance) ? triDistance : goalSubtype as string,
        targetValue,
        fitnessLevel: fitnessLevel || 'beginner',
        equipment: selectedEquipment.join(','),
        daysPerWeek: daysPerWeek ? String(daysPerWeek) : '4',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 2 OF 5
          </Typography>
          <Typography variant="largeTitle" color={colors.textPrimary}>
            Tell us more
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Help us personalise your plan
          </Typography>
        </Animated.View>

        {/* Fitness Level */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
            Experience Level
          </Typography>
          <View style={styles.levelGrid}>
            {levels.map((item) => (
              <Pressable
                key={item.level}
                style={[
                  styles.levelCard,
                  fitnessLevel === item.level && { borderColor: colors.primary, backgroundColor: withOpacity(colors.primary, 0.08) },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFitnessLevel(item.level);
                }}
              >
                <Typography variant="callout" style={{ fontWeight: '600' }}>{item.label}</Typography>
                <Typography variant="caption2" color={colors.textMuted} style={{ marginTop: 2 }}>{item.description}</Typography>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Running target */}
        {isRunning && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Target Time (optional)
            </Typography>
            <Input
              label=""
              placeholder="e.g. Sub 25:00 for 5K, sub 3:30 marathon"
              value={targetValue}
              onChangeText={setTargetValue}
            />
          </Animated.View>
        )}

        {/* Triathlon distance */}
        {isTri && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Race Distance
            </Typography>
            <View style={styles.triGrid}>
              {triDistances.map((d) => (
                <Pressable
                  key={d.id}
                  style={[
                    styles.triCard,
                    triDistance === d.id && { borderColor: colors.triathlon, backgroundColor: withOpacity(colors.triathlon, 0.08) },
                  ]}
                  onPress={() => setTriDistance(d.id)}
                >
                  <Typography variant="callout" style={{ fontWeight: '600' }}>{d.label}</Typography>
                  <Typography variant="caption2" color={colors.textMuted}>{d.desc}</Typography>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Strength / HYROX equipment */}
        {(isStrength || isHyrox) && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Available Equipment
            </Typography>
            <View style={styles.equipGrid}>
              {equipmentOptions.map((eq) => {
                const isSel = selectedEquipment.includes(eq.id);
                return (
                  <Pressable
                    key={eq.id}
                    style={[styles.equipCard, isSel && { borderColor: colors.primary, backgroundColor: withOpacity(colors.primary, 0.08) }]}
                    onPress={() => toggleEquipment(eq.id)}
                  >
                    <Typography variant="title3" style={{ textAlign: 'center' }}>{eq.icon}</Typography>
                    <Typography variant="caption2" color={isSel ? colors.primary : colors.textSecondary} style={{ textAlign: 'center', marginTop: 4 }}>
                      {eq.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Days per week */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
            Days Per Week
          </Typography>
          <View style={styles.daysRow}>
            {daysPerWeekOptions.map((d) => (
              <Pressable
                key={d}
                style={[
                  styles.dayPill,
                  daysPerWeek === d && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setDaysPerWeek(d)}
              >
                <Typography
                  variant="headline"
                  color={daysPerWeek === d ? colors.textInverse : colors.textPrimary}
                  style={{ textAlign: 'center' }}
                >
                  {d}
                </Typography>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Strength target */}
        {isStrength && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Target (optional)
            </Typography>
            <Input
              label=""
              placeholder="e.g. 100kg bench press, gain 5kg muscle"
              value={targetValue}
              onChangeText={setTargetValue}
            />
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
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
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  levelGrid: {
    gap: spacing.sm,
  },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  triCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  equipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  equipCard: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
