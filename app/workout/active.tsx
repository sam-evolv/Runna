import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SetLogger } from '@/components/workout/SetLogger';
import { RestTimer } from '@/components/workout/RestTimer';
import { PlateCalculator } from '@/components/workout/PlateCalculator';
import { useWorkout } from '@/hooks/useWorkout';
import { colors, spacing, borderRadius, withOpacity } from '@/constants/theme';
import { isRunningWorkout, type StrengthWorkoutData, type RunningWorkoutData } from '@/types/workout';

// HYROX stations
const HYROX_STATIONS = [
  { name: 'Ski Erg', distance: '1000m', icon: '\u26F7\uFE0F' },
  { name: 'Sled Push', distance: '50m', icon: '\u{1F6D2}' },
  { name: 'Sled Pull', distance: '50m', icon: '\u{1FA9D}' },
  { name: 'Burpee Broad Jumps', reps: '80m', icon: '\u{1F4A5}' },
  { name: 'Rowing', distance: '1000m', icon: '\u{1F6A3}' },
  { name: "Farmer's Carry", distance: '200m', icon: '\u{1F4AA}' },
  { name: 'Sandbag Lunges', distance: '100m', icon: '\u{1F3CB}' },
  { name: 'Wall Balls', reps: '100', icon: '\u26BD' },
];

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    activeStrength,
    activeRun,
    logSet,
    nextExercise,
    startRest,
    finishStrength,
    finishRun,
    cancelWorkout,
  } = useWorkout();

  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hyroxStation, setHyroxStation] = useState(0);
  const [hyroxReps, setHyroxReps] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isStrengthMode = activeWorkout && !isRunningWorkout(activeWorkout.workout_data) && activeWorkout.workout_type !== 'hyrox';
  const isRunMode = activeWorkout && isRunningWorkout(activeWorkout.workout_data);
  const isHyroxMode = activeWorkout?.workout_type === 'hyrox';

  // Strength mode data
  const strengthData = activeWorkout?.workout_data as StrengthWorkoutData | undefined;
  const exercises = strengthData?.exercises ?? [];
  const currentExIdx = activeStrength?.currentExerciseIndex ?? 0;
  const currentExercise = exercises[currentExIdx];
  const completedSets = activeStrength?.completedSets.get(currentExercise?.name ?? '') ?? [];
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalCompletedSets = Array.from(activeStrength?.completedSets.values() ?? []).reduce(
    (sum, sets) => sum + sets.length, 0,
  );

  // Run mode data
  const runData = activeWorkout?.workout_data as RunningWorkoutData | undefined;

  const handleLogSet = useCallback(
    (reps: number, weight: number | null, rpe?: number) => {
      if (!currentExercise) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      logSet(currentExercise.name, {
        set_number: completedSets.length + 1,
        reps,
        weight_kg: weight,
        rpe,
        completed: true,
      });

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
          if (isStrengthMode) await finishStrength();
          else if (isRunMode) await finishRun();
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

  if (!activeWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body" color={colors.textSecondary} align="center">
            No active workout
          </Typography>
          <Button title="Go Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
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
            completedSets.length < (currentExercise?.sets.length ?? 0)
              ? `Set ${completedSets.length + 1}: ${currentExercise?.sets[completedSets.length]?.reps} reps @ ${currentExercise?.sets[completedSets.length]?.weight_kg ?? 'BW'}kg`
              : currentExIdx < exercises.length - 1
                ? `Next: ${exercises[currentExIdx + 1].name}`
                : 'Last exercise!'
          }
        />
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STRENGTH MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isStrengthMode && currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleCancel} style={styles.topButton}>
              <Typography variant="callout" color={colors.textMuted}>{'\u2190'} Back</Typography>
            </TouchableOpacity>
            <View style={styles.timerDisplay}>
              <Typography variant="monoSmall" color={colors.textPrimary}>{formatTime(elapsedSeconds)}</Typography>
            </View>
            <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.topButton}>
              <Typography variant="callout" color={colors.warning}>{isPaused ? '\u25B6' : '\u23F8'}</Typography>
            </TouchableOpacity>
          </View>

          {/* Exercise progress */}
          <Badge
            label={`Exercise ${currentExIdx + 1} of ${exercises.length}`}
            color={colors.primary}
            backgroundColor={withOpacity(colors.primary, 0.12)}
          />
          <ProgressBar
            progress={totalSets > 0 ? totalCompletedSets / totalSets : 0}
            style={{ marginVertical: spacing.sm }}
          />

          {/* Current Exercise */}
          <Typography variant="title1" style={styles.exerciseName}>
            {currentExercise.name}
          </Typography>
          <Typography variant="callout" color={colors.textSecondary}>
            Set {Math.min(completedSets.length + 1, currentExercise.sets.length)} of {currentExercise.sets.length}
          </Typography>

          {currentExercise.notes && (
            <Typography variant="footnote" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
              {currentExercise.notes}
            </Typography>
          )}

          {/* Previous performance hint */}
          {currentExercise.sets[0]?.weight_kg && (
            <View style={styles.previousPerf}>
              <Typography variant="caption1" color={colors.textMuted}>
                Target: {currentExercise.sets[0].weight_kg}kg x {currentExercise.sets[0].reps} reps
              </Typography>
            </View>
          )}

          {currentExercise.sets[0]?.weight_kg && (
            <PlateCalculator targetWeight={currentExercise.sets[0].weight_kg} />
          )}

          {/* Set Logger */}
          <SetLogger
            sets={currentExercise.sets}
            completedSets={completedSets}
            onLogSet={handleLogSet}
          />

          {/* Navigation */}
          <View style={styles.navigation}>
            {completedSets.length >= currentExercise.sets.length && currentExIdx < exercises.length - 1 && (
              <Button
                title={`Next: ${exercises[currentExIdx + 1].name}`}
                onPress={nextExercise}
                variant="primary"
                size="lg"
                fullWidth
              />
            )}
            {(completedSets.length >= currentExercise.sets.length && currentExIdx >= exercises.length - 1) && (
              <Button
                title="Finish Workout"
                onPress={handleFinish}
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

  // ═══════════════════════════════════════════════════════════════════════════
  // RUN MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isRunMode && runData) {
    const currentSegment = runData.segments?.[activeRun?.currentSegmentIndex ?? 0];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.runContainer}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleCancel} style={styles.topButton}>
              <Typography variant="callout" color={colors.textMuted}>{'\u2190'}</Typography>
            </TouchableOpacity>
            <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '600', letterSpacing: 1 }}>
              {activeWorkout.title.toUpperCase()}
            </Typography>
            <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.topButton}>
              <Typography variant="callout" color={colors.warning}>{isPaused ? '\u25B6' : '\u23F8'}</Typography>
            </TouchableOpacity>
          </View>

          {/* Large stats */}
          <View style={styles.runStats}>
            <View style={styles.runStatMain}>
              <Typography variant="mono" color={colors.textPrimary}>{formatTime(elapsedSeconds)}</Typography>
              <Typography variant="caption1" color={colors.textMuted}>TIME</Typography>
            </View>
            <View style={styles.runStatRow}>
              <View style={styles.runStatItem}>
                <Typography variant="title1" color={colors.run}>
                  {(activeRun?.distanceKm ?? 0).toFixed(2)}
                </Typography>
                <Typography variant="caption1" color={colors.textMuted}>KM</Typography>
              </View>
              <View style={styles.runStatItem}>
                <Typography variant="title1" color={colors.textPrimary}>
                  {activeRun?.currentPace ? `${Math.floor(activeRun.currentPace)}:${String(Math.round((activeRun.currentPace % 1) * 60)).padStart(2, '0')}` : '--:--'}
                </Typography>
                <Typography variant="caption1" color={colors.textMuted}>PACE</Typography>
              </View>
              <View style={styles.runStatItem}>
                <Typography variant="title1" color={colors.error}>
                  ---
                </Typography>
                <Typography variant="caption1" color={colors.textMuted}>HR</Typography>
              </View>
            </View>
          </View>

          {/* Current interval */}
          {currentSegment && (
            <View style={styles.intervalCard}>
              <Typography variant="caption1" color={colors.run} style={{ fontWeight: '700', letterSpacing: 1 }}>
                {currentSegment.type.toUpperCase()}
              </Typography>
              <Typography variant="headline" style={{ marginTop: spacing.xs }}>
                {currentSegment.distance_km}km @ {currentSegment.target_pace_min_km} min/km
              </Typography>
              {currentSegment.description && (
                <Typography variant="caption1" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
                  {currentSegment.description}
                </Typography>
              )}
            </View>
          )}

          {/* Map placeholder */}
          <View style={styles.mapPlaceholder}>
            <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '600' }}>
              GPS Active
            </Typography>
          </View>

          {/* End Run */}
          <View style={styles.runFooter}>
            <Button
              title="End Run"
              onPress={handleFinish}
              variant="danger"
              size="lg"
              fullWidth
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HYROX MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isHyroxMode) {
    const currentStation = HYROX_STATIONS[hyroxStation];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleCancel} style={styles.topButton}>
              <Typography variant="callout" color={colors.textMuted}>{'\u2190'}</Typography>
            </TouchableOpacity>
            <Typography variant="monoSmall" color={colors.textPrimary}>{formatTime(elapsedSeconds)}</Typography>
            <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.topButton}>
              <Typography variant="callout" color={colors.warning}>{isPaused ? '\u25B6' : '\u23F8'}</Typography>
            </TouchableOpacity>
          </View>

          {/* Station list */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stationList}>
            {HYROX_STATIONS.map((station, idx) => (
              <View
                key={idx}
                style={[
                  styles.stationPill,
                  idx === hyroxStation && styles.stationPillActive,
                  idx < hyroxStation && styles.stationPillDone,
                ]}
              >
                <Typography
                  variant="caption2"
                  color={idx === hyroxStation ? colors.textInverse : idx < hyroxStation ? colors.success : colors.textMuted}
                  style={{ fontWeight: '600' }}
                >
                  {idx + 1}
                </Typography>
              </View>
            ))}
          </ScrollView>

          {/* Current station */}
          {currentStation && (
            <View style={styles.hyroxStationCard}>
              <Typography variant="title1" align="center" style={{ marginBottom: spacing.xs }}>
                {currentStation.icon}
              </Typography>
              <Typography variant="title2" align="center">
                {currentStation.name}
              </Typography>
              <Typography variant="callout" color={colors.hyrox} align="center" style={{ marginTop: spacing.xs }}>
                {currentStation.distance || currentStation.reps}
              </Typography>

              <Button
                title="Complete Station"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  if (hyroxStation < HYROX_STATIONS.length - 1) {
                    setHyroxStation((prev) => prev + 1);
                  } else {
                    handleFinish();
                  }
                }}
                size="lg"
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )}

          {/* 1km run between stations */}
          <View style={styles.runBetween}>
            <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '700', letterSpacing: 1 }}>
              1KM RUN TO NEXT STATION
            </Typography>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback for unknown workout types
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Typography variant="title3" align="center">Workout Active</Typography>
        <Typography variant="monoSmall" color={colors.primary} align="center" style={{ marginVertical: spacing.lg }}>
          {formatTime(elapsedSeconds)}
        </Typography>
        <Button title="Finish" onPress={handleFinish} size="lg" fullWidth />
        <Button title="Cancel" variant="ghost" onPress={handleCancel} fullWidth style={{ marginTop: spacing.sm }} />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  topButton: {
    padding: spacing.sm,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
  },
  exerciseName: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  previousPerf: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: withOpacity(colors.primary, 0.08),
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  navigation: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  // Run mode
  runContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  runStats: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  runStatMain: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  runStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  runStatItem: {
    alignItems: 'center',
  },
  intervalCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  runFooter: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  // HYROX mode
  stationList: {
    marginBottom: spacing.md,
  },
  stationPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  stationPillActive: {
    backgroundColor: colors.hyrox,
    borderColor: colors.hyrox,
  },
  stationPillDone: {
    borderColor: colors.success,
  },
  hyroxStationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  runBetween: {
    backgroundColor: withOpacity(colors.run, 0.08),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
});
