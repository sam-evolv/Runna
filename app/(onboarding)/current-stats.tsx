import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { GoalType, FitnessLevel } from '@/types/plan';

const levels: Array<{ level: FitnessLevel; label: string; description: string }> = [
  { level: 'beginner', label: 'Beginner', description: 'New to this or returning after a long break' },
  { level: 'intermediate', label: 'Intermediate', description: 'Regular training for 6+ months' },
  { level: 'advanced', label: 'Advanced', description: '2+ years consistent training' },
  { level: 'elite', label: 'Elite', description: 'Competitive level athlete' },
];

export default function CurrentStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalType: GoalType;
    goalSubtype: string;
    targetValue: string;
  }>();

  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);

  // Running stats
  const [recent5k, setRecent5k] = useState('');
  const [recent10k, setRecent10k] = useState('');
  const [weeklyMileage, setWeeklyMileage] = useState('');

  // Strength stats
  const [benchPress, setBenchPress] = useState('');
  const [squat, setSquat] = useState('');
  const [deadlift, setDeadlift] = useState('');

  const isRunning = params.goalType === 'running' || params.goalType === 'triathlon';
  const isStrength = params.goalType === 'strength';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 3 OF 5
          </Typography>
          <Typography variant="largeTitle">
            Where are you now?
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Help us understand your current fitness level
          </Typography>
        </View>

        <Typography variant="headline" style={styles.sectionTitle}>
          Experience Level
        </Typography>
        <View style={styles.levels}>
          {levels.map((item) => (
            <TouchableOpacity
              key={item.level}
              onPress={() => setFitnessLevel(item.level)}
              activeOpacity={0.7}
              style={[
                styles.levelOption,
                fitnessLevel === item.level && styles.levelSelected,
              ]}
            >
              <Typography variant="headline">{item.label}</Typography>
              <Typography variant="caption1" color={colors.textSecondary}>
                {item.description}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {isRunning && (
          <View style={styles.statsSection}>
            <Typography variant="headline" style={styles.sectionTitle}>
              Recent Times (optional)
            </Typography>
            <Input
              label="Recent 5k Time"
              placeholder="e.g. 25:30"
              value={recent5k}
              onChangeText={setRecent5k}
              containerStyle={styles.input}
            />
            <Input
              label="Recent 10k Time"
              placeholder="e.g. 55:00"
              value={recent10k}
              onChangeText={setRecent10k}
              containerStyle={styles.input}
            />
            <Input
              label="Weekly Mileage (km)"
              placeholder="e.g. 30"
              value={weeklyMileage}
              onChangeText={setWeeklyMileage}
              keyboardType="numeric"
              suffix="km"
              containerStyle={styles.input}
            />
          </View>
        )}

        {isStrength && (
          <View style={styles.statsSection}>
            <Typography variant="headline" style={styles.sectionTitle}>
              Current Maxes (optional)
            </Typography>
            <Input
              label="Bench Press 1RM"
              placeholder="e.g. 80"
              value={benchPress}
              onChangeText={setBenchPress}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Squat 1RM"
              placeholder="e.g. 100"
              value={squat}
              onChangeText={setSquat}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Deadlift 1RM"
              placeholder="e.g. 120"
              value={deadlift}
              onChangeText={setDeadlift}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/profile-details',
              params: {
                ...params,
                fitnessLevel: fitnessLevel || 'beginner',
                recent5k,
                recent10k,
                weeklyMileage,
                benchPress,
                squat,
                deadlift,
              },
            });
          }}
          disabled={!fitnessLevel}
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
    paddingBottom: spacing.xxl,
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
  sectionTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  levels: {
    gap: spacing.sm,
  },
  levelOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  statsSection: {
    marginTop: spacing.xxl,
  },
  input: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
