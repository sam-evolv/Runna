import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  withOpacity,
  workoutTypeColors,
  sportColors,
} from '@/constants/theme';
import { Lightbulb, ChevronUp, ChevronDown } from 'lucide-react-native';
import {
  isRunningWorkout,
  isStrengthWorkout,
} from '@/types/workout';
import type {
  Workout,
  WorkoutType,
  RunningWorkoutData,
  StrengthWorkoutData,
  RunSegment,
  Exercise,
} from '@/types/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

// ─── Mock Data for web demo / standalone usage ──────────────────────────────

const MOCK_RUNNING_WORKOUT: Workout = {
  id: 'mock-run-1',
  plan_id: 'plan-1',
  user_id: 'user-1',
  week_number: 3,
  day_of_week: 2,
  scheduled_date: new Date().toISOString().split('T')[0],
  workout_type: 'interval_run',
  title: 'Speed Intervals',
  description:
    'High-intensity interval session to build VO2max. Focus on maintaining consistent pace across all intervals with complete recovery between efforts.',
  workout_data: {
    type: 'interval_run',
    total_distance_km: 8.4,
    segments: [
      { type: 'warmup', distance_km: 1.6, target_pace_min_km: 6.0, description: 'Easy jog to warm up' },
      { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast — aim for 3:20' },
      { type: 'recovery', distance_km: 0.4, target_pace_min_km: 6.3, description: 'Slow jog recovery' },
      { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast — stay strong' },
      { type: 'recovery', distance_km: 0.4, target_pace_min_km: 6.3, description: 'Slow jog recovery' },
      { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast — dig deep' },
      { type: 'recovery', distance_km: 0.4, target_pace_min_km: 6.3, description: 'Slow jog recovery' },
      { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast — last one!' },
      { type: 'cooldown', distance_km: 2.0, target_pace_min_km: 6.2, description: 'Easy cooldown jog' },
    ],
    notes: 'Keep your form tall during intervals. Recover fully between each rep.',
  } as RunningWorkoutData,
  estimated_duration_minutes: 48,
  status: 'scheduled',
  completed_at: null,
  sort_order: 1,
  created_at: new Date().toISOString(),
};

const MOCK_STRENGTH_WORKOUT: Workout = {
  id: 'mock-str-1',
  plan_id: 'plan-1',
  user_id: 'user-1',
  week_number: 3,
  day_of_week: 3,
  scheduled_date: new Date().toISOString().split('T')[0],
  workout_type: 'strength',
  title: 'Upper Body Power',
  description:
    'Heavy compound movements targeting chest, shoulders, and back. Progressive overload week — push for new PRs on the working sets.',
  workout_data: {
    type: 'strength',
    focus: 'Upper Body',
    exercises: [
      {
        name: 'Barbell Bench Press',
        notes: 'Pause at the bottom for 1 second',
        sets: [
          { set_number: 1, reps: 8, weight_kg: 40, type: 'warmup', rest_seconds: 60 },
          { set_number: 2, reps: 5, weight_kg: 70, type: 'working', rest_seconds: 120, rpe: 7 },
          { set_number: 3, reps: 5, weight_kg: 75, type: 'working', rest_seconds: 120, rpe: 8 },
          { set_number: 4, reps: 5, weight_kg: 80, type: 'working', rest_seconds: 150, rpe: 9 },
          { set_number: 5, reps: 'AMRAP', weight_kg: 65, type: 'amrap', rest_seconds: 0 },
        ],
      },
      {
        name: 'Weighted Pull-ups',
        notes: 'Full dead hang at the bottom',
        sets: [
          { set_number: 1, reps: 8, weight_kg: null, type: 'warmup', rest_seconds: 60 },
          { set_number: 2, reps: 6, weight_kg: 10, type: 'working', rest_seconds: 120, rpe: 7 },
          { set_number: 3, reps: 6, weight_kg: 15, type: 'working', rest_seconds: 120, rpe: 8 },
          { set_number: 4, reps: 6, weight_kg: 15, type: 'working', rest_seconds: 120, rpe: 9 },
        ],
      },
      {
        name: 'Overhead Press',
        sets: [
          { set_number: 1, reps: 8, weight_kg: 30, type: 'warmup', rest_seconds: 60 },
          { set_number: 2, reps: 8, weight_kg: 45, type: 'working', rest_seconds: 90, rpe: 7 },
          { set_number: 3, reps: 8, weight_kg: 45, type: 'working', rest_seconds: 90, rpe: 8 },
          { set_number: 4, reps: 8, weight_kg: 45, type: 'working', rest_seconds: 90, rpe: 9 },
        ],
      },
      {
        name: 'Dumbbell Rows',
        superset_with: 'Lateral Raises',
        sets: [
          { set_number: 1, reps: 10, weight_kg: 30, type: 'working', rest_seconds: 60, rpe: 7 },
          { set_number: 2, reps: 10, weight_kg: 32.5, type: 'working', rest_seconds: 60, rpe: 8 },
          { set_number: 3, reps: 10, weight_kg: 32.5, type: 'working', rest_seconds: 60, rpe: 9 },
        ],
      },
    ],
    estimated_duration_minutes: 55,
    notes: 'Focus on controlled eccentrics. Rest fully between heavy sets.',
  } as StrengthWorkoutData,
  estimated_duration_minutes: 55,
  status: 'scheduled',
  completed_at: null,
  sort_order: 2,
  created_at: new Date().toISOString(),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPace(pace: number): string {
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function segmentColor(type: RunSegment['type']): string {
  switch (type) {
    case 'warmup':
      return '#F59E0B';
    case 'interval':
      return colors.running;
    case 'tempo':
      return '#EF4444';
    case 'recovery':
    case 'easy':
      return colors.success;
    case 'cooldown':
      return colors.secondary;
    case 'steady':
      return colors.primary;
    default:
      return colors.textSecondary;
  }
}

function setTypeLabel(type: string): string {
  switch (type) {
    case 'warmup':
      return 'W';
    case 'working':
      return '';
    case 'drop':
      return 'D';
    case 'amrap':
      return 'A';
    case 'failure':
      return 'F';
    default:
      return '';
  }
}

function formatWorkoutTypeLabel(type: WorkoutType): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function computeTotalVolume(exercises: Exercise[]): number {
  let total = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      const reps = typeof s.reps === 'number' ? s.reps : 0;
      total += reps * (s.weight_kg ?? 0);
    }
  }
  return total;
}

function computeTotalSets(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const startRunWorkout = useWorkoutStore((s) => s.startRunWorkout);
  const startStrengthWorkout = useWorkoutStore((s) => s.startStrengthWorkout);

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    // Attempt to load from Supabase
    try {
      const { supabase } = await import('@/services/api');
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setWorkout(data as Workout);
        setLoading(false);
        return;
      }
    } catch {
      // Supabase not available — fall through to mock
    }

    // Fallback: demo mock data
    if (id === 'mock-str-1' || id?.includes('str')) {
      setWorkout(MOCK_STRENGTH_WORKOUT);
    } else {
      setWorkout(MOCK_RUNNING_WORKOUT);
    }
    setLoading(false);
  };

  const handleStart = () => {
    if (!workout) return;
    // Navigate to pre-workout check-in first
    router.push({
      pathname: '/workout/checkin',
      params: { type: 'pre_workout', workoutId: workout.id },
    } as any);
  };

  const handleStartDirect = () => {
    if (!workout) return;
    const data = workout.workout_data;

    if (isRunningWorkout(data)) {
      startRunWorkout(workout);
      router.push('/workout/run-active');
    } else if (isStrengthWorkout(data)) {
      startStrengthWorkout(workout);
      router.push('/workout/active');
    }
  };

  // ── Loading State ───────────────────────────────────────────────────────

  if (loading || !workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrapper}>
          <View style={styles.loadingPulse}>
            <Text style={styles.loadingText}>Loading workout...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const data = workout.workout_data;
  const isRun = isRunningWorkout(data);
  const isStr = isStrengthWorkout(data);
  const accentColor = workoutTypeColors[workout.workout_type] || colors.primary;

  const runData = isRun ? (data as RunningWorkoutData) : null;
  const strData = isStr ? (data as StrengthWorkoutData) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={12}
          >
            <Text style={styles.backButtonText}>Close</Text>
          </Pressable>
        </Animated.View>

        {/* ── Type Badge ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <View style={[styles.badge, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
            <View style={[styles.badgeDot, { backgroundColor: accentColor }]} />
            <Text style={[styles.badgeText, { color: accentColor }]}>
              {formatWorkoutTypeLabel(workout.workout_type)}
            </Text>
          </View>
        </Animated.View>

        {/* ── Title ──────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <Text style={styles.title}>{workout.title}</Text>
        </Animated.View>

        {/* ── Meta Row ───────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.metaRow}>
          <Text style={styles.metaText}>{workout.estimated_duration_minutes} min</Text>
          {runData && (
            <>
              <Text style={styles.metaDot}> / </Text>
              <Text style={styles.metaText}>{runData.total_distance_km.toFixed(1)} km</Text>
              <Text style={styles.metaDot}> / </Text>
              <Text style={styles.metaText}>{runData.segments.length} segments</Text>
            </>
          )}
          {strData && (
            <>
              <Text style={styles.metaDot}> / </Text>
              <Text style={styles.metaText}>{strData.exercises.length} exercises</Text>
              <Text style={styles.metaDot}> / </Text>
              <Text style={styles.metaText}>{computeTotalSets(strData.exercises)} sets</Text>
            </>
          )}
        </Animated.View>

        {/* ── Description ────────────────────────────────────────────────── */}
        {workout.description ? (
          <Animated.View entering={FadeInDown.delay(260).duration(500)}>
            <Text style={styles.description}>{workout.description}</Text>
          </Animated.View>
        ) : null}

        {/* ── Summary Card ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <View style={styles.summaryCard}>
            {isRun && runData && (
              <View style={styles.summaryRow}>
                <SummaryItem label="Distance" value={`${runData.total_distance_km.toFixed(1)} km`} accent={accentColor} />
                <SummaryDivider />
                <SummaryItem label="Duration" value={`~${workout.estimated_duration_minutes} min`} accent={accentColor} />
                <SummaryDivider />
                <SummaryItem
                  label="Avg Pace"
                  value={`${formatPace(
                    runData.segments.reduce((s, seg) => s + seg.distance_km * seg.target_pace_min_km, 0) /
                      runData.total_distance_km
                  )}/km`}
                  accent={accentColor}
                />
              </View>
            )}
            {isStr && strData && (
              <View style={styles.summaryRow}>
                <SummaryItem label="Focus" value={strData.focus} accent={accentColor} />
                <SummaryDivider />
                <SummaryItem label="Volume" value={`${Math.round(computeTotalVolume(strData.exercises) / 1000)}t`} accent={accentColor} />
                <SummaryDivider />
                <SummaryItem label="Duration" value={`~${strData.estimated_duration_minutes} min`} accent={accentColor} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Running Segments ───────────────────────────────────────────── */}
        {isRun && runData && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionLabel}>WORKOUT STRUCTURE</Text>
            {runData.segments.map((seg, idx) => {
              const color = segmentColor(seg.type);
              return (
                <View key={idx} style={styles.segmentRow}>
                  <View style={[styles.segmentIndicator, { backgroundColor: color }]} />
                  <View style={styles.segmentContent}>
                    <View style={styles.segmentTopRow}>
                      <View style={[styles.segmentTypeBadge, { backgroundColor: withOpacity(color, 0.12) }]}>
                        <Text style={[styles.segmentTypeText, { color }]}>
                          {seg.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.segmentMeta}>
                        {seg.distance_km} km @ {formatPace(seg.target_pace_min_km)}/km
                      </Text>
                    </View>
                    {seg.description ? (
                      <Text style={styles.segmentDescription}>{seg.description}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </Animated.View>
        )}

        {/* ── Strength Exercises ─────────────────────────────────────────── */}
        {isStr && strData && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionLabel}>EXERCISES</Text>
            {strData.exercises.map((exercise, exIdx) => (
              <View key={exIdx} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumberCircle}>
                    <Text style={styles.exerciseNumberText}>{exIdx + 1}</Text>
                  </View>
                  <View style={styles.exerciseHeaderText}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.superset_with ? (
                      <Text style={styles.supersetLabel}>
                        Superset with {exercise.superset_with}
                      </Text>
                    ) : null}
                    {exercise.notes ? (
                      <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Exercise Education */}
                <ExerciseEducation exerciseName={exercise.name} />

                {/* Set Table */}
                <View style={styles.setTable}>
                  <View style={styles.setTableHeader}>
                    <Text style={[styles.setHeaderCell, styles.setColNum]}>SET</Text>
                    <Text style={[styles.setHeaderCell, styles.setColType]}>TYPE</Text>
                    <Text style={[styles.setHeaderCell, styles.setColReps]}>REPS</Text>
                    <Text style={[styles.setHeaderCell, styles.setColWeight]}>WEIGHT</Text>
                    <Text style={[styles.setHeaderCell, styles.setColRest]}>REST</Text>
                  </View>
                  {exercise.sets.map((set, sIdx) => (
                    <View
                      key={sIdx}
                      style={[
                        styles.setTableRow,
                        sIdx === exercise.sets.length - 1 && styles.setTableRowLast,
                      ]}
                    >
                      <Text style={[styles.setCell, styles.setColNum, styles.setCellNum]}>
                        {set.set_number}
                      </Text>
                      <View style={styles.setColType}>
                        {set.type !== 'working' ? (
                          <View
                            style={[
                              styles.setTypeBadge,
                              {
                                backgroundColor: withOpacity(
                                  set.type === 'warmup'
                                    ? '#F59E0B'
                                    : set.type === 'amrap'
                                    ? colors.primary
                                    : set.type === 'failure'
                                    ? colors.error
                                    : colors.secondary,
                                  0.12
                                ),
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.setTypeBadgeText,
                                {
                                  color:
                                    set.type === 'warmup'
                                      ? '#F59E0B'
                                      : set.type === 'amrap'
                                      ? colors.primary
                                      : set.type === 'failure'
                                      ? colors.error
                                      : colors.secondary,
                                },
                              ]}
                            >
                              {set.type.toUpperCase()}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.setCell}>-</Text>
                        )}
                      </View>
                      <Text style={[styles.setCell, styles.setColReps, styles.setCellValue]}>
                        {set.reps}
                      </Text>
                      <Text style={[styles.setCell, styles.setColWeight, styles.setCellValue]}>
                        {set.weight_kg !== null ? `${set.weight_kg} kg` : 'BW'}
                      </Text>
                      <Text style={[styles.setCell, styles.setColRest]}>
                        {set.rest_seconds > 0 ? `${set.rest_seconds}s` : '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Notes ──────────────────────────────────────────────────────── */}
        {(runData?.notes || strData?.notes) ? (
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>COACH NOTES</Text>
              <Text style={styles.notesText}>
                {runData?.notes || strData?.notes}
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* ── Start Button ──────────────────────────────────────────────────── */}
      {workout.status === 'scheduled' && (
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.bottomActions}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              { backgroundColor: accentColor },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── Exercise Education ──────────────────────────────────────────────────────

const EXERCISE_EXPLANATIONS: Record<string, { why: string; muscles: string; tip: string }> = {
  'Barbell Bench Press': {
    why: 'The bench press is the king of upper body pressing. It builds chest mass and strength while developing your anterior deltoids and triceps — essential for pushing power and a well-defined chest.',
    muscles: 'Pectorals (major & minor), anterior deltoids, triceps',
    tip: 'Keep shoulder blades pinched and feet flat. Lower the bar to mid-chest with control.',
  },
  'Weighted Pull-ups': {
    why: 'Pull-ups target your entire back with emphasis on the lats. Adding weight drives serious strength gains and builds the V-taper that makes your physique stand out.',
    muscles: 'Latissimus dorsi, biceps, rear deltoids, rhomboids',
    tip: 'Full dead hang at the bottom, chin over bar at the top. Control the negative.',
  },
  'Overhead Press': {
    why: 'Standing OHP builds boulder shoulders and core stability simultaneously. It targets all three deltoid heads with emphasis on the anterior and medial heads.',
    muscles: 'Deltoids (all heads), triceps, upper chest, core stabilisers',
    tip: 'Brace your core, squeeze glutes, press straight up. Avoid excessive back arch.',
  },
  'Dumbbell Rows': {
    why: 'Single-arm rows fix imbalances and build thick back muscles. They target the mid-back and lats from a different angle than pull-ups.',
    muscles: 'Latissimus dorsi, rhomboids, rear deltoids, biceps',
    tip: 'Pull to your hip, not your chest. Keep your core tight and avoid rotation.',
  },
  'Bench Press': {
    why: 'Builds chest size and pressing strength. The flat bench targets the mid-pec fibers — the foundation of chest development.',
    muscles: 'Pectorals, anterior deltoids, triceps',
    tip: 'Drive feet into floor, arch slightly, and control the eccentric.',
  },
};

function ExerciseEducation({ exerciseName }: { exerciseName: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const explanation = EXERCISE_EXPLANATIONS[exerciseName];

  if (!explanation) return null;

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={exerciseEducationStyles.container}
    >
      <View style={exerciseEducationStyles.header}>
        <Lightbulb size={14} color={colors.primary} />
        <Text style={exerciseEducationStyles.headerText}>Why this exercise?</Text>
        {expanded ? (
          <ChevronUp size={14} color={colors.primary} />
        ) : (
          <ChevronDown size={14} color={colors.primary} />
        )}
      </View>
      {expanded && (
        <Animated.View entering={FadeInDown.duration(200)}>
          <Text style={exerciseEducationStyles.whyText}>{explanation.why}</Text>
          <View style={exerciseEducationStyles.muscleRow}>
            <Text style={exerciseEducationStyles.muscleLabel}>TARGETS</Text>
            <Text style={exerciseEducationStyles.muscleText}>{explanation.muscles}</Text>
          </View>
          <View style={exerciseEducationStyles.tipRow}>
            <Text style={exerciseEducationStyles.tipLabel}>FORM TIP</Text>
            <Text style={exerciseEducationStyles.tipText}>{explanation.tip}</Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const exerciseEducationStyles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    backgroundColor: withOpacity(colors.primary, 0.04),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.08),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  whyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  muscleRow: {
    marginTop: spacing.sm,
  },
  muscleLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  muscleText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  tipRow: {
    marginTop: spacing.sm,
  },
  tipLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});

// ─── Sub-components ─────────────────────────────────────────────────────────

function SummaryItem({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color: accent }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function SummaryDivider() {
  return <View style={styles.summaryDivider} />;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
  },

  // Loading
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPulse: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
  },
  loadingText: {
    ...typography.callout,
    color: colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
    marginTop: spacing.md,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Title
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  metaText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.callout,
    color: colors.textTertiary,
  },

  // Description
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 24,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.headline,
    fontWeight: '700',
  },
  summaryLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Sections
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },

  // Segment rows (running)
  segmentRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  segmentIndicator: {
    width: 3,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  segmentContent: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  segmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  segmentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  segmentTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  segmentMeta: {
    ...typography.footnote,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  segmentDescription: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Exercise cards (strength)
  exerciseCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  exerciseNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity(colors.primary, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    ...typography.caption1,
    color: colors.primary,
    fontWeight: '700',
  },
  exerciseHeaderText: {
    flex: 1,
  },
  exerciseName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  supersetLabel: {
    ...typography.caption1,
    color: colors.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  exerciseNotes: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Set table
  setTable: {
    marginTop: spacing.md,
  },
  setTableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setHeaderCell: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  setTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withOpacity(colors.border, 0.5),
  },
  setTableRowLast: {
    borderBottomWidth: 0,
  },
  setCell: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  setCellNum: {
    color: colors.textTertiary,
    fontWeight: '500',
  },
  setCellValue: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  setColNum: {
    width: 36,
  },
  setColType: {
    width: 64,
  },
  setColReps: {
    flex: 1,
  },
  setColWeight: {
    flex: 1,
    textAlign: 'right',
  },
  setColRest: {
    width: 52,
    textAlign: 'right',
  },
  setTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  setTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Notes
  notesCard: {
    backgroundColor: withOpacity(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.12),
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  notesLabel: {
    ...typography.caption1,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.callout,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  startButtonText: {
    ...typography.headline,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
