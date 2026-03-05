import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  withOpacity,
} from '@/constants/theme';
import { useWorkoutStore } from '@/stores/workoutStore';
import { isRunningWorkout, isStrengthWorkout } from '@/types/workout';
import type {
  Workout,
  StrengthWorkoutData,
  Exercise,
  ExerciseSet,
} from '@/types/workout';
import type { CompletedSet } from '@/types/activity';

// ─── HYROX Stations ─────────────────────────────────────────────────────────

interface HyroxStation {
  name: string;
  target: string;
  isRun: boolean;
}

const HYROX_STATIONS: HyroxStation[] = [
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '1km SkiErg', target: '1,000 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '50m Sled Push', target: '50 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '50m Sled Pull', target: '50 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '80m Burpee Broad Jump', target: '80 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '1km Row', target: '1,000 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '200m Farmers Carry', target: '200 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: '100m Sandbag Lunges', target: '100 m', isRun: false },
  { name: '1km Run', target: '1 km', isRun: true },
  { name: 'Wall Balls', target: '75-100 reps', isRun: false },
];

// ─── Mock strength data for standalone demo ─────────────────────────────────

const MOCK_STRENGTH_DATA: StrengthWorkoutData = {
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
      ],
    },
    {
      name: 'Weighted Pull-ups',
      notes: 'Full dead hang at the bottom',
      sets: [
        { set_number: 1, reps: 8, weight_kg: null, type: 'warmup', rest_seconds: 60 },
        { set_number: 2, reps: 6, weight_kg: 10, type: 'working', rest_seconds: 120, rpe: 7 },
        { set_number: 3, reps: 6, weight_kg: 15, type: 'working', rest_seconds: 120, rpe: 8 },
      ],
    },
    {
      name: 'Overhead Press',
      sets: [
        { set_number: 1, reps: 8, weight_kg: 30, type: 'warmup', rest_seconds: 60 },
        { set_number: 2, reps: 8, weight_kg: 45, type: 'working', rest_seconds: 90, rpe: 8 },
        { set_number: 3, reps: 8, weight_kg: 45, type: 'working', rest_seconds: 90, rpe: 9 },
      ],
    },
  ],
  estimated_duration_minutes: 50,
  notes: 'Focus on controlled eccentrics.',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ActiveWorkoutScreen() {
  const router = useRouter();

  // Store
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const activeStrength = useWorkoutStore((s) => s.activeStrength);
  const logSetStore = useWorkoutStore((s) => s.logSet);
  const nextExerciseStore = useWorkoutStore((s) => s.nextExercise);
  const startRestStore = useWorkoutStore((s) => s.startRest);
  const finishStrength = useWorkoutStore((s) => s.finishStrength);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Strength-specific state
  const [localExerciseIndex, setLocalExerciseIndex] = useState(0);
  const [localCompletedSets, setLocalCompletedSets] = useState<Map<string, CompletedSet[]>>(new Map());
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  // Rest timer state
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // HYROX state
  const [hyroxStationIndex, setHyroxStationIndex] = useState(0);
  const [stationElapsed, setStationElapsed] = useState(0);
  const stationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine mode
  const isHyrox = activeWorkout?.workout_type === 'hyrox';
  const isStrengthMode = activeWorkout
    ? !isRunningWorkout(activeWorkout.workout_data) && !isHyrox
    : true; // default to strength for standalone

  // Resolve workout data
  const strengthData: StrengthWorkoutData =
    activeWorkout && isStrengthWorkout(activeWorkout.workout_data)
      ? (activeWorkout.workout_data as StrengthWorkoutData)
      : MOCK_STRENGTH_DATA;

  const exercises = strengthData.exercises;
  const currentExIdx = activeStrength?.currentExerciseIndex ?? localExerciseIndex;
  const currentExercise = exercises[currentExIdx];

  // Get completed sets for current exercise
  const storeCompletedSets = activeStrength?.completedSets ?? localCompletedSets;
  const currentCompletedSets: CompletedSet[] =
    (currentExercise ? storeCompletedSets.get(currentExercise.name) : undefined) ?? [];

  // Total progress
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalCompletedSets = Array.from(storeCompletedSets.values()).reduce(
    (sum, sets) => sum + sets.length,
    0
  );

  // ── Elapsed Timer ───────────────────────────────────────────────────────

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

  // ── Station timer for HYROX ─────────────────────────────────────────────

  useEffect(() => {
    if (!isHyrox) return;
    stationTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setStationElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => {
      if (stationTimerRef.current) clearInterval(stationTimerRef.current);
    };
  }, [isPaused, isHyrox, hyroxStationIndex]);

  // ── Rest Timer ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isResting || restSeconds <= 0) return;

    restTimerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, restSeconds > 0]);

  // Animated rest timer
  const restProgress = useSharedValue(1);

  useEffect(() => {
    if (isResting && restSeconds > 0) {
      restProgress.value = 1;
      restProgress.value = withTiming(0, {
        duration: restSeconds * 1000,
        easing: Easing.linear,
      });
    }
  }, [isResting]);

  const restBarStyle = useAnimatedStyle(() => ({
    width: `${restProgress.value * 100}%`,
  }));

  // Pre-fill weight/reps from the planned set
  useEffect(() => {
    if (!currentExercise) return;
    const nextSetIndex = currentCompletedSets.length;
    const plannedSet = currentExercise.sets[nextSetIndex];
    if (plannedSet) {
      setWeightInput(plannedSet.weight_kg !== null ? String(plannedSet.weight_kg) : '');
      setRepsInput(typeof plannedSet.reps === 'number' ? String(plannedSet.reps) : '');
    }
  }, [currentExIdx, currentCompletedSets.length]);

  // ── Strength Actions ────────────────────────────────────────────────────

  const handleLogSet = useCallback(() => {
    if (!currentExercise) return;

    const reps = parseInt(repsInput, 10);
    const weight = weightInput ? parseFloat(weightInput) : null;

    if (isNaN(reps) || reps <= 0) return;

    const completedSet: CompletedSet = {
      set_number: currentCompletedSets.length + 1,
      reps,
      weight_kg: weight,
      completed: true,
    };

    // Log to store
    logSetStore(currentExercise.name, completedSet);

    // Also update local state for standalone usage
    setLocalCompletedSets((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(currentExercise.name) || [];
      updated.set(currentExercise.name, [...existing, completedSet]);
      return updated;
    });

    // Start rest timer
    const currentSet = currentExercise.sets[currentCompletedSets.length];
    if (currentSet && currentSet.rest_seconds > 0) {
      setRestSeconds(currentSet.rest_seconds);
      setIsResting(true);
      startRestStore(currentSet.rest_seconds);
    }
  }, [currentExercise, repsInput, weightInput, currentCompletedSets.length, logSetStore, startRestStore]);

  const handleNextExercise = useCallback(() => {
    nextExerciseStore();
    setLocalExerciseIndex((prev) => prev + 1);
    setIsResting(false);
    setRestSeconds(0);
  }, [nextExerciseStore]);

  const handleSkipRest = useCallback(() => {
    setIsResting(false);
    setRestSeconds(0);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
  }, []);

  const handleFinish = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await finishStrength();
    router.back();
  }, [finishStrength, router]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelWorkout();
    router.back();
  }, [cancelWorkout, router]);

  // ── HYROX Actions ───────────────────────────────────────────────────────

  const handleCompleteStation = useCallback(() => {
    if (hyroxStationIndex < HYROX_STATIONS.length - 1) {
      setHyroxStationIndex((prev) => prev + 1);
      setStationElapsed(0);
    } else {
      // All stations done
      handleFinish();
    }
  }, [hyroxStationIndex, handleFinish]);

  // ── No active workout fallback ──────────────────────────────────────────

  if (!activeWorkout && !isStrengthMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active workout</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.goBackButton, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HYROX MODE
  // ═══════════════════════════════════════════════════════════════════════════

  if (isHyrox) {
    const currentStation = HYROX_STATIONS[hyroxStationIndex];
    const nextStation =
      hyroxStationIndex < HYROX_STATIONS.length - 1
        ? HYROX_STATIONS[hyroxStationIndex + 1]
        : null;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top Bar ─────────────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [styles.topBarButton, pressed && { opacity: 0.6 }]}
              hitSlop={12}
            >
              <Text style={styles.topBarButtonText}>Cancel</Text>
            </Pressable>
            <View style={styles.topBarCenter}>
              <Text style={styles.topBarTitle}>HYROX</Text>
            </View>
            <Pressable
              onPress={() => setIsPaused((p) => !p)}
              style={({ pressed }) => [styles.topBarButton, pressed && { opacity: 0.6 }]}
              hitSlop={12}
            >
              <Text style={[styles.topBarButtonText, { color: colors.warning }]}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* ── Total Elapsed ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hyroxTimerSection}>
            <Text style={styles.hyroxTotalTime}>{formatTime(elapsedSeconds)}</Text>
            <Text style={styles.hyroxTotalLabel}>TOTAL TIME</Text>
          </Animated.View>

          {/* ── Station Progress Dots ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stationDotsContainer}
            >
              {HYROX_STATIONS.map((station, idx) => {
                const isDone = idx < hyroxStationIndex;
                const isCurrent = idx === hyroxStationIndex;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.stationDot,
                      isDone && styles.stationDotDone,
                      isCurrent && styles.stationDotCurrent,
                      station.isRun && !isCurrent && !isDone && styles.stationDotRun,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stationDotText,
                        isDone && styles.stationDotTextDone,
                        isCurrent && styles.stationDotTextCurrent,
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* ── Current Station Card ────────────────────────────────────── */}
          {currentStation && (
            <Animated.View entering={FadeInDown.delay(250).duration(500)}>
              <View
                style={[
                  styles.hyroxStationCard,
                  {
                    borderLeftWidth: 3,
                    borderLeftColor: currentStation.isRun ? colors.running : colors.hyrox,
                  },
                ]}
              >
                <View style={styles.hyroxStationHeader}>
                  <View
                    style={[
                      styles.hyroxStationBadge,
                      {
                        backgroundColor: withOpacity(
                          currentStation.isRun ? colors.running : colors.hyrox,
                          0.12
                        ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.hyroxStationBadgeText,
                        { color: currentStation.isRun ? colors.running : colors.hyrox },
                      ]}
                    >
                      {currentStation.isRun ? 'RUN' : 'STATION'}
                    </Text>
                  </View>
                  <Text style={styles.hyroxStationProgress}>
                    {hyroxStationIndex + 1} / {HYROX_STATIONS.length}
                  </Text>
                </View>

                <Text style={styles.hyroxStationName}>{currentStation.name}</Text>
                <Text style={styles.hyroxStationTarget}>{currentStation.target}</Text>

                {/* Station Timer */}
                <View style={styles.hyroxStationTimerRow}>
                  <Text style={styles.hyroxStationTimer}>{formatTime(stationElapsed)}</Text>
                  <Text style={styles.hyroxStationTimerLabel}>STATION TIME</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* ── Complete Station Button ─────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(350).duration(500)}>
            <Pressable
              onPress={handleCompleteStation}
              style={({ pressed }) => [
                styles.completeStationButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.completeStationText}>
                {hyroxStationIndex >= HYROX_STATIONS.length - 1
                  ? 'Finish HYROX'
                  : 'Complete Station'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* ── Next Station Preview ────────────────────────────────────── */}
          {nextStation && (
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <View style={styles.nextStationPreview}>
                <Text style={styles.nextStationLabel}>NEXT</Text>
                <Text style={styles.nextStationName}>{nextStation.name}</Text>
                <Text style={styles.nextStationTarget}>{nextStation.target}</Text>
              </View>
            </Animated.View>
          )}

          {/* ── All Stations Overview ──────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.allStationsSection}>
            <Text style={styles.allStationsTitle}>ALL STATIONS</Text>
            {HYROX_STATIONS.map((station, idx) => {
              const isDone = idx < hyroxStationIndex;
              const isCurrent = idx === hyroxStationIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.allStationsRow,
                    isCurrent && styles.allStationsRowCurrent,
                  ]}
                >
                  <View
                    style={[
                      styles.allStationsNum,
                      isDone && styles.allStationsNumDone,
                      isCurrent && styles.allStationsNumCurrent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.allStationsNumText,
                        isDone && { color: colors.white },
                        isCurrent && { color: colors.white },
                      ]}
                    >
                      {isDone ? '\u2713' : String(idx + 1)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.allStationsName,
                      isDone && styles.allStationsNameDone,
                      isCurrent && styles.allStationsNameCurrent,
                    ]}
                  >
                    {station.name}
                  </Text>
                  <Text style={styles.allStationsTarget}>{station.target}</Text>
                </View>
              );
            })}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STRENGTH MODE
  // ═══════════════════════════════════════════════════════════════════════════

  const allSetsDone = currentExercise
    ? currentCompletedSets.length >= currentExercise.sets.length
    : false;
  const isLastExercise = currentExIdx >= exercises.length - 1;
  const progressPct = totalSets > 0 ? totalCompletedSets / totalSets : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Rest Timer Overlay ──────────────────────────────────────────── */}
      {isResting && (
        <View style={styles.restOverlay}>
          <View style={styles.restContent}>
            <Text style={styles.restTitle}>REST</Text>
            <Text style={styles.restTimer}>{formatTime(restSeconds)}</Text>

            {/* Animated progress bar */}
            <View style={styles.restBarTrack}>
              <Animated.View style={[styles.restBarFill, restBarStyle]} />
            </View>

            {/* Next set preview */}
            {currentExercise && currentCompletedSets.length < currentExercise.sets.length && (
              <View style={styles.restNextPreview}>
                <Text style={styles.restNextLabel}>NEXT SET</Text>
                <Text style={styles.restNextValue}>
                  Set {currentCompletedSets.length + 1}:{' '}
                  {currentExercise.sets[currentCompletedSets.length]?.reps} reps
                  {currentExercise.sets[currentCompletedSets.length]?.weight_kg
                    ? ` @ ${currentExercise.sets[currentCompletedSets.length]?.weight_kg} kg`
                    : ' @ BW'}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleSkipRest}
              style={({ pressed }) => [
                styles.skipRestButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [styles.topBarButton, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Text style={styles.topBarButtonText}>Cancel</Text>
          </Pressable>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTimer}>{formatTime(elapsedSeconds)}</Text>
          </View>
          <Pressable
            onPress={() => setIsPaused((p) => !p)}
            style={({ pressed }) => [styles.topBarButton, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Text style={[styles.topBarButtonText, { color: colors.warning }]}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* ── Progress Header ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressHeaderText}>
              Exercise {currentExIdx + 1} of {exercises.length}
            </Text>
            <Text style={styles.progressHeaderSets}>
              {totalCompletedSets}/{totalSets} sets
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.round(progressPct * 100)}%` },
              ]}
            />
          </View>
        </Animated.View>

        {/* ── Current Exercise ─────────────────────────────────────────── */}
        {currentExercise && (
          <>
            <Animated.View entering={FadeInDown.delay(180).duration(500)}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              {strengthData.focus ? (
                <Text style={styles.exerciseFocus}>{strengthData.focus}</Text>
              ) : null}
              {currentExercise.notes ? (
                <Text style={styles.exerciseNotes}>{currentExercise.notes}</Text>
              ) : null}
            </Animated.View>

            {/* ── Set Tracker Table ──────────────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(260).duration(500)}>
              <View style={styles.setTable}>
                {/* Header */}
                <View style={styles.setTableHeaderRow}>
                  <Text style={[styles.setHeaderCol, styles.colSet]}>SET</Text>
                  <Text style={[styles.setHeaderCol, styles.colPrevious]}>PREVIOUS</Text>
                  <Text style={[styles.setHeaderCol, styles.colWeight]}>WEIGHT</Text>
                  <Text style={[styles.setHeaderCol, styles.colReps]}>REPS</Text>
                  <Text style={[styles.setHeaderCol, styles.colStatus]}>
                    {/* checkmark column */}
                  </Text>
                </View>

                {/* Set Rows */}
                {currentExercise.sets.map((set, idx) => {
                  const isCompleted = idx < currentCompletedSets.length;
                  const isCurrent = idx === currentCompletedSets.length;
                  const completedData = currentCompletedSets[idx];

                  return (
                    <View
                      key={idx}
                      style={[
                        styles.setRow,
                        isCurrent && styles.setRowCurrent,
                        isCompleted && styles.setRowCompleted,
                      ]}
                    >
                      {/* Set number */}
                      <View style={styles.colSet}>
                        <View
                          style={[
                            styles.setNumberBadge,
                            isCompleted && styles.setNumberBadgeDone,
                            isCurrent && styles.setNumberBadgeCurrent,
                            set.type === 'warmup' && !isCompleted && styles.setNumberBadgeWarmup,
                          ]}
                        >
                          <Text
                            style={[
                              styles.setNumberText,
                              isCompleted && { color: colors.white },
                              isCurrent && { color: colors.primary },
                            ]}
                          >
                            {set.set_number}
                          </Text>
                        </View>
                      </View>

                      {/* Previous / Target */}
                      <View style={styles.colPrevious}>
                        <Text style={styles.setPreviousText}>
                          {set.weight_kg !== null ? `${set.weight_kg}kg` : 'BW'} x{' '}
                          {set.reps}
                        </Text>
                        {set.type !== 'working' ? (
                          <Text
                            style={[
                              styles.setTypeText,
                              {
                                color:
                                  set.type === 'warmup'
                                    ? '#F59E0B'
                                    : set.type === 'amrap'
                                    ? colors.primary
                                    : colors.secondary,
                              },
                            ]}
                          >
                            {set.type.toUpperCase()}
                          </Text>
                        ) : null}
                      </View>

                      {/* Weight */}
                      <View style={styles.colWeight}>
                        {isCompleted ? (
                          <Text style={styles.setCompletedValue}>
                            {completedData?.weight_kg !== null
                              ? `${completedData?.weight_kg}`
                              : 'BW'}
                          </Text>
                        ) : isCurrent ? (
                          <TextInput
                            style={styles.setInput}
                            value={weightInput}
                            onChangeText={setWeightInput}
                            keyboardType="numeric"
                            placeholder={set.weight_kg !== null ? String(set.weight_kg) : 'BW'}
                            placeholderTextColor={colors.textTertiary}
                            selectTextOnFocus
                          />
                        ) : (
                          <Text style={styles.setPlannedValue}>
                            {set.weight_kg !== null ? String(set.weight_kg) : '-'}
                          </Text>
                        )}
                      </View>

                      {/* Reps */}
                      <View style={styles.colReps}>
                        {isCompleted ? (
                          <Text style={styles.setCompletedValue}>
                            {completedData?.reps}
                          </Text>
                        ) : isCurrent ? (
                          <TextInput
                            style={styles.setInput}
                            value={repsInput}
                            onChangeText={setRepsInput}
                            keyboardType="numeric"
                            placeholder={String(set.reps)}
                            placeholderTextColor={colors.textTertiary}
                            selectTextOnFocus
                          />
                        ) : (
                          <Text style={styles.setPlannedValue}>{String(set.reps)}</Text>
                        )}
                      </View>

                      {/* Status */}
                      <View style={styles.colStatus}>
                        {isCompleted ? (
                          <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>{'\u2713'}</Text>
                          </View>
                        ) : (
                          <View style={styles.checkmarkEmpty} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* ── Log Set Button ─────────────────────────────────────────── */}
            {!allSetsDone && (
              <Animated.View entering={FadeInDown.delay(340).duration(500)}>
                <Pressable
                  onPress={handleLogSet}
                  style={({ pressed }) => [
                    styles.logSetButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.logSetButtonText}>
                    Log Set {currentCompletedSets.length + 1}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* ── Next Exercise / Finish ─────────────────────────────────── */}
            {allSetsDone && !isLastExercise && (
              <Animated.View entering={FadeInDown.delay(340).duration(500)}>
                <Pressable
                  onPress={handleNextExercise}
                  style={({ pressed }) => [
                    styles.nextExerciseButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.nextExerciseText}>
                    Next: {exercises[currentExIdx + 1]?.name}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {allSetsDone && isLastExercise && (
              <Animated.View entering={FadeInDown.delay(340).duration(500)}>
                <Pressable
                  onPress={handleFinish}
                  style={({ pressed }) => [
                    styles.finishButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.finishButtonText}>Finish Workout</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* ── Upcoming Exercises ─────────────────────────────────────── */}
            {currentExIdx < exercises.length - 1 && (
              <Animated.View
                entering={FadeInDown.delay(420).duration(500)}
                style={styles.upcomingSection}
              >
                <Text style={styles.upcomingSectionTitle}>UPCOMING</Text>
                {exercises.slice(currentExIdx + 1).map((ex, idx) => (
                  <View key={idx} style={styles.upcomingRow}>
                    <View style={styles.upcomingDot} />
                    <Text style={styles.upcomingName}>{ex.name}</Text>
                    <Text style={styles.upcomingSets}>
                      {ex.sets.length} sets
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  goBackButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goBackText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  topBarButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 56,
  },
  topBarButtonText: {
    ...typography.callout,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTimer: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  topBarTitle: {
    ...typography.headline,
    color: colors.hyrox,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Progress Header
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressHeaderText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressHeaderSets: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '600',
  },

  // Progress Bar (shared between run-active and strength)
  progressBarTrack: {
    height: 4,
    backgroundColor: withOpacity(colors.white, 0.06),
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Exercise
  exerciseName: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseFocus: {
    ...typography.callout,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseNotes: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },

  // Set Table
  setTable: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  setTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setHeaderCol: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  colSet: {
    width: 44,
    alignItems: 'center',
  },
  colPrevious: {
    flex: 1.2,
    paddingLeft: spacing.xs,
  },
  colWeight: {
    flex: 1,
    alignItems: 'center',
  },
  colReps: {
    flex: 0.8,
    alignItems: 'center',
  },
  colStatus: {
    width: 36,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withOpacity(colors.border, 0.5),
  },
  setRowCurrent: {
    backgroundColor: withOpacity(colors.primary, 0.04),
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  setRowCompleted: {
    opacity: 0.6,
  },

  // Set number badge
  setNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: withOpacity(colors.white, 0.06),
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberBadgeDone: {
    backgroundColor: colors.success,
  },
  setNumberBadgeCurrent: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    borderWidth: 1,
    borderColor: colors.primary,
  },
  setNumberBadgeWarmup: {
    backgroundColor: withOpacity('#F59E0B', 0.1),
  },
  setNumberText: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
  },

  setPreviousText: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  setTypeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  setInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs + 2 : spacing.xs,
    width: 56,
    textAlign: 'center',
    color: colors.textPrimary,
    ...typography.callout,
    fontWeight: '600',
  },
  setCompletedValue: {
    ...typography.callout,
    color: colors.success,
    fontWeight: '600',
  },
  setPlannedValue: {
    ...typography.callout,
    color: colors.textTertiary,
    fontWeight: '400',
  },

  // Checkmark
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkmarkEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: withOpacity(colors.white, 0.1),
  },

  // Log Set Button
  logSetButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logSetButtonText: {
    ...typography.headline,
    color: colors.white,
    fontWeight: '700',
  },

  // Next Exercise Button
  nextExerciseButton: {
    height: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nextExerciseText: {
    ...typography.headline,
    color: colors.primary,
    fontWeight: '700',
  },

  // Finish Button
  finishButton: {
    height: 52,
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  finishButtonText: {
    ...typography.headline,
    color: colors.white,
    fontWeight: '700',
  },

  // Upcoming
  upcomingSection: {
    marginTop: spacing.md,
  },
  upcomingSectionTitle: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withOpacity(colors.border, 0.5),
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textTertiary,
  },
  upcomingName: {
    ...typography.callout,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  upcomingSets: {
    ...typography.caption1,
    color: colors.textTertiary,
  },

  // ── Rest Timer Overlay ──────────────────────────────────────────────────
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  restContent: {
    width: '100%',
    alignItems: 'center',
  },
  restTitle: {
    ...typography.caption1,
    color: colors.secondary,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: '200',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    lineHeight: 80,
  },
  restBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: withOpacity(colors.white, 0.06),
    borderRadius: 2,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  restBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  restNextPreview: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  restNextLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  restNextValue: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  skipRestButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withOpacity(colors.white, 0.15),
  },
  skipRestText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HYROX Styles
  // ═══════════════════════════════════════════════════════════════════════════

  hyroxTimerSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  hyroxTotalTime: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  hyroxTotalLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },

  // Station dots
  stationDotsContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  stationDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stationDotCurrent: {
    backgroundColor: colors.hyrox,
    borderColor: colors.hyrox,
    ...shadows.sm,
  },
  stationDotRun: {
    borderColor: withOpacity(colors.running, 0.3),
  },
  stationDotText: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  stationDotTextDone: {
    color: colors.white,
  },
  stationDotTextCurrent: {
    color: colors.white,
    fontWeight: '700',
  },

  // Station card
  hyroxStationCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  hyroxStationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  hyroxStationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  hyroxStationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hyroxStationProgress: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  hyroxStationName: {
    ...typography.title1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hyroxStationTarget: {
    ...typography.title3,
    color: colors.hyrox,
    fontWeight: '700',
  },
  hyroxStationTimerRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hyroxStationTimer: {
    fontSize: 36,
    fontWeight: '300',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  hyroxStationTimerLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },

  // Complete station button
  completeStationButton: {
    height: 56,
    backgroundColor: colors.hyrox,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  completeStationText: {
    ...typography.headline,
    color: colors.white,
    fontWeight: '700',
  },

  // Next station preview
  nextStationPreview: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  nextStationLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  nextStationName: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  nextStationTarget: {
    ...typography.callout,
    color: colors.hyrox,
    fontWeight: '500',
    marginTop: 2,
  },

  // All stations overview
  allStationsSection: {
    marginTop: spacing.sm,
  },
  allStationsTitle: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  allStationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withOpacity(colors.border, 0.5),
  },
  allStationsRowCurrent: {
    backgroundColor: withOpacity(colors.hyrox, 0.04),
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    marginHorizontal: -spacing.xs,
  },
  allStationsNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: withOpacity(colors.white, 0.06),
    justifyContent: 'center',
    alignItems: 'center',
  },
  allStationsNumDone: {
    backgroundColor: colors.success,
  },
  allStationsNumCurrent: {
    backgroundColor: colors.hyrox,
  },
  allStationsNumText: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  allStationsName: {
    ...typography.callout,
    color: colors.textTertiary,
    flex: 1,
  },
  allStationsNameDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  allStationsNameCurrent: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  allStationsTarget: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '500',
  },
});
