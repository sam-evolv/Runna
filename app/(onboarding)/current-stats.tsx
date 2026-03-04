import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius, withOpacity } from '@/constants/theme';
import type { GoalType } from '@/types/plan';

export default function CurrentStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalType: string;
    goalSubtype: string;
    targetValue: string;
    fitnessLevel: string;
    equipment: string;
    daysPerWeek: string;
  }>();

  // Running stats
  const [recent5k, setRecent5k] = useState('');
  const [recent10k, setRecent10k] = useState('');
  const [recentHalf, setRecentHalf] = useState('');
  const [recentMarathon, setRecentMarathon] = useState('');
  const [weeklyMileage, setWeeklyMileage] = useState('');

  // Strength stats
  const [benchPress, setBenchPress] = useState('');
  const [squat, setSquat] = useState('');
  const [deadlift, setDeadlift] = useState('');

  const isRunning = params.goalType === 'running' || params.goalType === 'triathlon' || params.goalType === 'endurance';
  const isStrength = params.goalType === 'strength';
  const isHyrox = params.goalType === 'hyrox';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 3 OF 5
          </Typography>
          <Typography variant="largeTitle" color={colors.textPrimary}>
            Current stats
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Skip anything you don't know — we'll figure it out
          </Typography>
        </Animated.View>

        {isRunning && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Recent Times (optional)
            </Typography>
            <Input
              label="5K Time"
              placeholder="e.g. 25:30"
              value={recent5k}
              onChangeText={setRecent5k}
              containerStyle={styles.input}
            />
            <Input
              label="10K Time"
              placeholder="e.g. 55:00"
              value={recent10k}
              onChangeText={setRecent10k}
              containerStyle={styles.input}
            />
            <Input
              label="Half Marathon Time"
              placeholder="e.g. 1:55:00"
              value={recentHalf}
              onChangeText={setRecentHalf}
              containerStyle={styles.input}
            />
            <Input
              label="Marathon Time"
              placeholder="e.g. 4:00:00"
              value={recentMarathon}
              onChangeText={setRecentMarathon}
              containerStyle={styles.input}
            />
            <View style={styles.divider} />
            <Input
              label="Weekly Mileage (km)"
              placeholder="e.g. 30"
              value={weeklyMileage}
              onChangeText={setWeeklyMileage}
              keyboardType="numeric"
              suffix="km"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}

        {(isStrength || isHyrox) && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Current 1RMs (optional)
            </Typography>
            <Input
              label="Bench Press"
              placeholder="e.g. 80"
              value={benchPress}
              onChangeText={setBenchPress}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Squat"
              placeholder="e.g. 100"
              value={squat}
              onChangeText={setSquat}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Deadlift"
              placeholder="e.g. 120"
              value={deadlift}
              onChangeText={setDeadlift}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}

        {isHyrox && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.divider} />
            <Input
              label="Weekly Running (km)"
              placeholder="e.g. 20"
              value={weeklyMileage}
              onChangeText={setWeeklyMileage}
              keyboardType="numeric"
              suffix="km"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}

        {!isRunning && !isStrength && !isHyrox && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Current Activity (optional)
            </Typography>
            <Input
              label="Weekly Exercise Hours"
              placeholder="e.g. 4"
              value={weeklyMileage}
              onChangeText={setWeeklyMileage}
              keyboardType="numeric"
              suffix="hrs"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/profile-details',
              params: {
                ...params,
                recent5k,
                recent10k,
                weeklyMileage,
                benchPress,
                squat,
                deadlift,
              },
            });
          }}
          size="lg"
          fullWidth
        />
        <Button
          title="Skip — I'll enter these later"
          variant="ghost"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/profile-details',
              params: { ...params },
            });
          }}
          size="md"
          fullWidth
          style={{ marginTop: spacing.sm }}
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
    marginTop: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
