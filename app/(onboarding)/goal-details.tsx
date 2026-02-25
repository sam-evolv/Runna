import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { GoalType, GoalSubtype } from '@/types/plan';

const subtypesByGoalType: Record<GoalType, Array<{ subtype: GoalSubtype; label: string; description: string }>> = {
  running: [
    { subtype: 'couch_to_5k', label: 'Couch to 5k', description: 'Start from scratch' },
    { subtype: '5k', label: '5k', description: 'Speed up your 5k time' },
    { subtype: '10k', label: '10k', description: 'Train for a 10k race' },
    { subtype: 'half_marathon', label: 'Half Marathon', description: '21.1km / 13.1 miles' },
    { subtype: 'marathon', label: 'Marathon', description: '42.2km / 26.2 miles' },
    { subtype: 'ultra', label: 'Ultra Marathon', description: '50k, 100k, or beyond' },
  ],
  strength: [
    { subtype: 'general_hypertrophy', label: 'Build Muscle', description: 'General hypertrophy program' },
    { subtype: 'powerlifting', label: 'Powerlifting', description: 'Squat, bench, deadlift focus' },
    { subtype: 'bench_press', label: 'Bench Press Goal', description: 'Hit a bench press target' },
    { subtype: 'squat', label: 'Squat Goal', description: 'Hit a squat target' },
    { subtype: 'deadlift', label: 'Deadlift Goal', description: 'Hit a deadlift target' },
  ],
  triathlon: [
    { subtype: 'sprint_tri', label: 'Sprint Triathlon', description: '750m/20km/5km' },
    { subtype: 'olympic_tri', label: 'Olympic Triathlon', description: '1.5km/40km/10km' },
    { subtype: 'half_ironman', label: 'Half Ironman (70.3)', description: '1.9km/90km/21.1km' },
    { subtype: 'ironman', label: 'Ironman', description: '3.8km/180km/42.2km' },
  ],
  general_fitness: [
    { subtype: 'couch_to_5k', label: 'Couch to 5k', description: 'Get running from zero' },
    { subtype: 'weight_loss', label: 'Weight Loss', description: 'Burn fat with cardio & strength' },
    { subtype: 'flexibility', label: 'Flexibility & Mobility', description: 'Improve range of motion' },
    { subtype: 'general_fitness', label: 'General Fitness', description: 'All-round fitness improvement' },
  ],
};

export default function GoalDetailsScreen() {
  const router = useRouter();
  const { goalType } = useLocalSearchParams<{ goalType: GoalType }>();
  const [selected, setSelected] = useState<GoalSubtype | null>(null);
  const [targetValue, setTargetValue] = useState('');

  const subtypes = subtypesByGoalType[goalType as GoalType] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 2 OF 5
          </Typography>
          <Typography variant="largeTitle">
            What specifically?
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Choose your specific goal
          </Typography>
        </View>

        <View style={styles.options}>
          {subtypes.map((item) => (
            <TouchableOpacity
              key={item.subtype}
              onPress={() => setSelected(item.subtype)}
              activeOpacity={0.7}
              style={[
                styles.option,
                selected === item.subtype && styles.optionSelected,
              ]}
            >
              <View>
                <Typography variant="headline">{item.label}</Typography>
                <Typography variant="footnote" color={colors.textSecondary}>
                  {item.description}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selected && (
          <Input
            label="Target (optional)"
            placeholder="e.g. Sub 3:30 marathon, 100kg bench press"
            value={targetValue}
            onChangeText={setTargetValue}
            containerStyle={styles.targetInput}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            if (selected) {
              router.push({
                pathname: '/(onboarding)/current-stats',
                params: { goalType, goalSubtype: selected, targetValue },
              });
            }
          }}
          disabled={!selected}
          size="lg"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  step: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  targetInput: {
    marginTop: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
