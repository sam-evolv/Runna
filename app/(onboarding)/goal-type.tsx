import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { GoalType } from '@/types/plan';

const goalTypes: Array<{ type: GoalType; icon: string; title: string; subtitle: string }> = [
  { type: 'running', icon: '🏃', title: 'Running', subtitle: '5k, 10k, half marathon, marathon, ultra' },
  { type: 'strength', icon: '💪', title: 'Strength', subtitle: 'Hypertrophy, powerlifting, general strength' },
  { type: 'triathlon', icon: '🏊', title: 'Triathlon', subtitle: 'Sprint, Olympic, half Ironman, Ironman' },
  { type: 'general_fitness', icon: '🎯', title: 'General Fitness', subtitle: 'Couch-to-5k, weight loss, flexibility' },
];

export default function GoalTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="caption1" color={colors.primary} style={styles.step}>
          STEP 1 OF 5
        </Typography>
        <Typography variant="largeTitle">
          What's your goal?
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Choose the type of training you want to focus on
        </Typography>
      </View>

      <View style={styles.options}>
        {goalTypes.map((goal) => (
          <TouchableOpacity
            key={goal.type}
            onPress={() => setSelected(goal.type)}
            activeOpacity={0.7}
            style={[
              styles.option,
              selected === goal.type && styles.optionSelected,
            ]}
          >
            <Typography variant="title2" style={styles.optionIcon}>
              {goal.icon}
            </Typography>
            <View style={styles.optionText}>
              <Typography variant="headline">{goal.title}</Typography>
              <Typography variant="footnote" color={colors.textSecondary}>
                {goal.subtitle}
              </Typography>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flex: 1,
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
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
  optionIcon: {
    width: 48,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  footer: {
    paddingVertical: spacing.xxl,
  },
});
