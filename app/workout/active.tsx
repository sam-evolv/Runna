import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SetLogger } from '@/components/workout/SetLogger';
import { RestTimer } from '@/components/workout/RestTimer';
import { PlateCalculator } from '@/components/workout/PlateCalculator';
import { useWorkout } from '@/hooks/useWorkout';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { StrengthWorkoutData } from '@/types/workout';

export default function ActiveStrengthScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    activeStrength,
    logSet,
    nextExercise,
    startRest,
    finishStrength,
    cancelWorkout,
  } = useWorkout();

  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);

  const strengthData = activeWorkout?.workout_data as StrengthWorkoutData | undefined;
  const exercises = strengthData?.exercises ?? [];
  const currentExIdx = activeStrength?.currentExerciseIndex ?? 0;
  const currentExercise = exercises[currentExIdx];
  const completedSets = activeStrength?.completedSets.get(currentExercise?.name ?? '') ?? [];

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalCompletedSets = Array.from(activeStrength?.completedSets.values() ?? []).reduce(
    (sum, sets) => sum + sets.length,
    0,
  );

  const handleLogSet = useCallback(
    (reps: number, weight: number | null, rpe?: number) => {
      if (!currentExercise) return;

      logSet(currentExercise.name, {
        set_number: completedSets.length + 1,
        reps,
        weight_kg: weight,
        rpe,
        completed: true,
      });

      // Show rest timer
      const currentSet = currentExercise.sets[completedSets.length];
      if (currentSet) {
        setRestDuration(currentSet.rest_seconds);
        setShowRestTimer(true);
      }
    },
    [currentExercise, completedSets.length, logSet],
  );

  const handleRestComplete = () => {
    setShowRestTimer(false);
    // Auto-advance to next exercise if all sets done
    if (currentExercise && completedSets.length >= currentExercise.sets.length) {
      if (currentExIdx < exercises.length - 1) {
        nextExercise();
      }
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Save this workout and mark as complete?', [
      { text: 'Keep Training', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          await finishStrength();
          router.replace('/(tabs)/today');
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Workout', 'Your progress will be lost.', [
      { text: 'Keep Training', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          router.back();
        },
      },
    ]);
  };

  if (!activeWorkout || !strengthData || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Typography variant="body" color={colors.textSecondary} align="center">
          No active workout
        </Typography>
      </SafeAreaView>
    );
  }

  // Rest timer overlay
  if (showRestTimer) {
    return (
      <SafeAreaView style={styles.container}>
        <RestTimer
          duration={restDuration}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
          nextSetInfo={
            completedSets.length < currentExercise.sets.length
              ? `Set ${completedSets.length + 1}: ${currentExercise.sets[completedSets.length]?.reps} reps @ ${currentExercise.sets[completedSets.length]?.weight_kg ?? 'BW'}kg`
              : currentExIdx < exercises.length - 1
                ? `Next: ${exercises[currentExIdx + 1].name}`
                : 'Last exercise!'
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Button title="Cancel" onPress={handleCancel} variant="ghost" size="sm" />
          <Typography variant="headline">{strengthData.focus.replace(/_/g, ' ').toUpperCase()}</Typography>
          <Button title="Finish" onPress={handleFinish} variant="ghost" size="sm" />
        </View>

        {/* Progress */}
        <ProgressBar
          progress={totalSets > 0 ? totalCompletedSets / totalSets : 0}
          style={styles.progress}
        />
        <Typography variant="caption2" color={colors.textTertiary} align="center">
          {totalCompletedSets} / {totalSets} sets completed
        </Typography>

        {/* Current Exercise */}
        <View style={styles.currentExercise}>
          <Badge
            label={`Exercise ${currentExIdx + 1}/${exercises.length}`}
            color={colors.primary}
            backgroundColor={`${colors.primary}20`}
          />
          <Typography variant="title1" style={styles.exerciseName}>
            {currentExercise.name}
          </Typography>
          {currentExercise.notes && (
            <Typography variant="callout" color={colors.textSecondary}>
              {currentExercise.notes}
            </Typography>
          )}

          {currentExercise.sets[0]?.weight_kg && (
            <PlateCalculator targetWeight={currentExercise.sets[0].weight_kg} />
          )}
        </View>

        {/* Set Logger */}
        <SetLogger
          sets={currentExercise.sets}
          completedSets={completedSets}
          onLogSet={handleLogSet}
        />

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentExIdx > 0 && (
            <Button
              title="Previous Exercise"
              onPress={() => {/* Would need a previousExercise action */}}
              variant="ghost"
              size="sm"
            />
          )}
          {completedSets.length >= currentExercise.sets.length && currentExIdx < exercises.length - 1 && (
            <Button
              title="Next Exercise"
              onPress={nextExercise}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}
        </View>
      </ScrollView>
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
    paddingBottom: spacing.huge,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  progress: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  currentExercise: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  exerciseName: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  navigation: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
});
