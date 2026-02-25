import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { IntervalDisplay } from '@/components/workout/IntervalDisplay';
import { PlateCalculator } from '@/components/workout/PlateCalculator';
import { useWorkout } from '@/hooks/useWorkout';
import { usePlanStore } from '@/stores/planStore';
import { supabase } from '@/services/api';
import { generateBriefing, type WorkoutBriefing } from '@/services/workoutBriefing';
import { convertToTreadmill, getTreadmillInstructions, formatTreadmillSpeed, type TreadmillWorkout } from '@/services/treadmillMode';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { formatPace } from '@/utils/paceCalculator';
import { isRunningWorkout, isStrengthWorkout } from '@/types/workout';
import type { Workout, RunningWorkoutData, StrengthWorkoutData } from '@/types/workout';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { startWorkout } = useWorkout();
  const { skipWorkout } = usePlanStore();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<WorkoutBriefing | null>(null);
  const [briefingExpanded, setBriefingExpanded] = useState(false);
  const [treadmillEnabled, setTreadmillEnabled] = useState(false);
  const [treadmillData, setTreadmillData] = useState<TreadmillWorkout | null>(null);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  useEffect(() => {
    if (workout) {
      setBriefing(generateBriefing(workout));
    }
  }, [workout]);

  useEffect(() => {
    if (workout && treadmillEnabled && isRunningWorkout(workout.workout_data)) {
      setTreadmillData(convertToTreadmill(workout.workout_data as RunningWorkoutData));
    } else {
      setTreadmillData(null);
    }
  }, [workout, treadmillEnabled]);

  const loadWorkout = async () => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .single();
    setWorkout(data);
    setLoading(false);
  };

  if (loading || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Typography variant="body" color={colors.textSecondary}>Loading...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const workoutColor = workoutTypeColors[workout.workout_type] || colors.primary;
  const isRun = isRunningWorkout(workout.workout_data);
  const isStrength = isStrengthWorkout(workout.workout_data);

  const handleStart = () => {
    startWorkout(workout);
    if (isRun) {
      router.push('/workout/run-active');
    } else {
      router.push('/workout/active');
    }
  };

  const handleSkip = () => {
    Alert.alert('Skip Workout', 'Are you sure you want to skip this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        style: 'destructive',
        onPress: () => {
          skipWorkout(workout.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Button title="Close" onPress={() => router.back()} variant="ghost" size="sm" />
        </View>

        <Badge
          label={formatWorkoutType(workout.workout_type)}
          color={workoutColor}
          backgroundColor={`${workoutColor}20`}
          size="md"
        />

        <Typography variant="largeTitle" style={styles.title}>
          {workout.title}
        </Typography>

        <View style={styles.metaRow}>
          <Typography variant="callout" color={colors.textSecondary}>
            {formatDate(workout.scheduled_date)}
          </Typography>
          <Typography variant="callout" color={colors.textTertiary}> · </Typography>
          <Typography variant="callout" color={colors.textSecondary}>
            {formatWorkoutDuration(workout.estimated_duration_minutes)}
          </Typography>
          {isRun && (
            <>
              <Typography variant="callout" color={colors.textTertiary}> · </Typography>
              <Typography variant="callout" color={colors.textSecondary}>
                {formatDistance((workout.workout_data as RunningWorkoutData).total_distance_km)}
              </Typography>
            </>
          )}
        </View>

        {workout.description && (
          <Typography variant="body" color={colors.textSecondary} style={styles.description}>
            {workout.description}
          </Typography>
        )}

        {/* Workout Briefing */}
        {briefing && (
          <Card style={styles.briefingCard}>
            <TouchableOpacity
              onPress={() => setBriefingExpanded(!briefingExpanded)}
              activeOpacity={0.7}
              style={styles.briefingHeader}
            >
              <View style={styles.briefingTitleRow}>
                <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600' }}>
                  SESSION BRIEFING
                </Typography>
                <Typography variant="caption2" color={colors.textTertiary}>
                  {briefingExpanded ? '▲' : '▼'}
                </Typography>
              </View>
              <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                {briefing.purpose.length > 100 && !briefingExpanded
                  ? briefing.purpose.slice(0, 100) + '...'
                  : briefing.purpose}
              </Typography>
            </TouchableOpacity>

            {briefingExpanded && (
              <View style={styles.briefingBody}>
                {/* Key Tips */}
                <View style={styles.briefingSection}>
                  <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                    KEY TIPS
                  </Typography>
                  {briefing.keyTips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View style={styles.tipDot} />
                      <Typography variant="footnote" color={colors.textSecondary}>
                        {tip}
                      </Typography>
                    </View>
                  ))}
                </View>

                {/* Nutrition */}
                <View style={styles.briefingSection}>
                  <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                    NUTRITION
                  </Typography>
                  <Typography variant="footnote" color={colors.textSecondary}>
                    {briefing.nutrition}
                  </Typography>
                </View>

                {/* Warm-up */}
                <View style={styles.briefingSection}>
                  <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                    WARM-UP
                  </Typography>
                  <Typography variant="footnote" color={colors.textSecondary}>
                    {briefing.warmupAdvice}
                  </Typography>
                </View>

                {/* Mental Cue */}
                <Card style={styles.mentalCueCard}>
                  <Typography variant="footnote" color={colors.primary} style={{ fontWeight: '600', fontStyle: 'italic' }}>
                    "{briefing.mentalCue}"
                  </Typography>
                </Card>
              </View>
            )}
          </Card>
        )}

        {/* Treadmill toggle for running workouts */}
        {isRun && (
          <View style={styles.treadmillToggle}>
            <View style={styles.treadmillLabel}>
              <Typography variant="callout" style={{ fontWeight: '500' }}>
                🏃 Treadmill Mode
              </Typography>
              <Typography variant="caption2" color={colors.textTertiary}>
                Show speed & incline instead of pace
              </Typography>
            </View>
            <Switch
              value={treadmillEnabled}
              onValueChange={setTreadmillEnabled}
              trackColor={{ false: colors.surfaceLight, true: `${colors.primary}60` }}
              thumbColor={treadmillEnabled ? colors.primary : colors.surfaceElevated}
            />
          </View>
        )}

        {/* Treadmill segments view */}
        {treadmillData && (
          <View style={styles.section}>
            <Typography variant="headline" style={styles.sectionTitle}>
              Treadmill Instructions
            </Typography>
            {treadmillData.segments.map((seg, i) => (
              <Card key={i} style={styles.treadmillSegCard}>
                <View style={styles.treadmillSegRow}>
                  <Badge
                    label={seg.type.toUpperCase()}
                    color={workoutColor}
                    backgroundColor={`${workoutColor}15`}
                  />
                  <Typography variant="caption2" color={colors.textTertiary}>
                    {Math.round(seg.durationMinutes)} min
                  </Typography>
                </View>
                <View style={styles.treadmillMetrics}>
                  <View style={styles.treadmillMetric}>
                    <Typography variant="headline" color={colors.textPrimary}>
                      {formatTreadmillSpeed(seg.speedKmh)}
                    </Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>SPEED</Typography>
                  </View>
                  <View style={styles.treadmillDivider} />
                  <View style={styles.treadmillMetric}>
                    <Typography variant="headline" color={colors.textPrimary}>
                      {seg.inclinePercent}%
                    </Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>INCLINE</Typography>
                  </View>
                  <View style={styles.treadmillDivider} />
                  <View style={styles.treadmillMetric}>
                    <Typography variant="headline" color={colors.textTertiary}>
                      {formatPace(seg.originalPaceMinKm)}/km
                    </Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>PACE</Typography>
                  </View>
                </View>
                <Typography variant="caption1" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                  {seg.description}
                </Typography>
              </Card>
            ))}
          </View>
        )}

        {/* Running segments (when not in treadmill mode) */}
        {isRun && !treadmillData && (
          <View style={styles.section}>
            <Typography variant="headline" style={styles.sectionTitle}>Workout Structure</Typography>
            <IntervalDisplay segments={(workout.workout_data as RunningWorkoutData).segments} />
          </View>
        )}

        {/* Strength exercises */}
        {isStrength && (
          <View style={styles.section}>
            <Typography variant="headline" style={styles.sectionTitle}>Exercises</Typography>
            {(workout.workout_data as StrengthWorkoutData).exercises.map((exercise, idx) => (
              <Card key={idx} style={styles.exerciseCard}>
                <Typography variant="headline">{exercise.name}</Typography>
                {exercise.notes && (
                  <Typography variant="caption1" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    {exercise.notes}
                  </Typography>
                )}
                <View style={styles.setsList}>
                  {exercise.sets.map((set, setIdx) => (
                    <View key={setIdx} style={styles.setRow}>
                      <Typography variant="callout" color={colors.textTertiary} style={styles.setNum}>
                        {set.set_number}
                      </Typography>
                      <Typography variant="callout">
                        {set.reps} reps
                      </Typography>
                      {set.weight_kg !== null && (
                        <Typography variant="callout" color={colors.primary}>
                          {set.weight_kg} kg
                        </Typography>
                      )}
                      <Typography variant="caption1" color={colors.textTertiary}>
                        {set.rest_seconds}s rest
                      </Typography>
                    </View>
                  ))}
                </View>
                {exercise.sets[0]?.weight_kg && (
                  <PlateCalculator targetWeight={exercise.sets[0].weight_kg} />
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Notes */}
        {(isRun ? (workout.workout_data as RunningWorkoutData).notes : (workout.workout_data as StrengthWorkoutData).notes) && (
          <Card style={styles.notesCard}>
            <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: 4 }}>
              COACH NOTES
            </Typography>
            <Typography variant="callout" color={colors.textSecondary}>
              {isRun
                ? (workout.workout_data as RunningWorkoutData).notes
                : (workout.workout_data as StrengthWorkoutData).notes}
            </Typography>
          </Card>
        )}
      </ScrollView>

      {/* Action buttons */}
      {workout.status === 'scheduled' && (
        <View style={styles.actions}>
          <Button
            title="Start Workout"
            onPress={handleStart}
            size="lg"
            fullWidth
          />
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="ghost"
            size="sm"
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: spacing.sm,
  },
  title: {
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.md,
  },
  // Briefing
  briefingCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  briefingHeader: {
    // touchable area
  },
  briefingTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  briefingBody: {
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  briefingSection: {
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  tipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  mentalCueCard: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
    marginTop: spacing.sm,
  },
  // Treadmill
  treadmillToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  treadmillLabel: {
    flex: 1,
  },
  treadmillSegCard: {
    marginBottom: spacing.sm,
  },
  treadmillSegRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  treadmillMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treadmillMetric: {
    flex: 1,
    alignItems: 'center',
  },
  treadmillDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  // Existing
  section: {
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  exerciseCard: {
    marginBottom: spacing.sm,
  },
  setsList: {
    marginTop: spacing.md,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  setNum: {
    width: 24,
  },
  notesCard: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surfaceLight,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
