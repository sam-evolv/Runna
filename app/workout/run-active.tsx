import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
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
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
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
import type { RunningWorkoutData, RunSegment } from '@/types/workout';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SplitEntry {
  km: number;
  paceMinKm: number;
  elapsedSeconds: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const HR_ZONES = [
  { zone: 1, label: 'Recovery', color: '#6B7280', minPct: 0.5, maxPct: 0.6 },
  { zone: 2, label: 'Easy', color: '#3B82F6', minPct: 0.6, maxPct: 0.7 },
  { zone: 3, label: 'Aerobic', color: '#10B981', minPct: 0.7, maxPct: 0.8 },
  { zone: 4, label: 'Threshold', color: '#F97316', minPct: 0.8, maxPct: 0.9 },
  { zone: 5, label: 'Max', color: '#EF4444', minPct: 0.9, maxPct: 1.0 },
] as const;

// ─── Mock running state for standalone demo ─────────────────────────────────

const MOCK_RUN_DATA: RunningWorkoutData = {
  type: 'interval_run',
  total_distance_km: 8.4,
  segments: [
    { type: 'warmup', distance_km: 1.6, target_pace_min_km: 6.0, description: 'Easy jog to warm up' },
    { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast' },
    { type: 'recovery', distance_km: 0.4, target_pace_min_km: 6.3, description: 'Slow jog recovery' },
    { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast' },
    { type: 'recovery', distance_km: 0.4, target_pace_min_km: 6.3, description: 'Slow jog recovery' },
    { type: 'interval', distance_km: 0.8, target_pace_min_km: 4.15, description: '800m fast' },
    { type: 'cooldown', distance_km: 2.0, target_pace_min_km: 6.2, description: 'Easy cooldown' },
  ],
  notes: 'Focus on form during intervals.',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatPace(pace: number): string {
  if (!pace || pace <= 0 || !isFinite(pace)) return '--:--';
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

// ─── Component ──────────────────────────────────────────────────────────────

export default function RunActiveScreen() {
  const router = useRouter();

  // Store
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const activeRun = useWorkoutStore((s) => s.activeRun);
  const updateRunProgress = useWorkoutStore((s) => s.updateRunProgress);
  const completeRunSegment = useWorkoutStore((s) => s.completeRunSegment);
  const finishRun = useWorkoutStore((s) => s.finishRun);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);

  // State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [simulatedDistance, setSimulatedDistance] = useState(0);
  const [splits, setSplits] = useState<SplitEntry[]>([]);
  const [coachCue, setCoachCue] = useState<string | null>(null);
  const [simulatedHRZone, setSimulatedHRZone] = useState(2);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coachCueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSplitKm = useRef(0);

  // Resolve run data (from store or fallback mock)
  const runData: RunningWorkoutData =
    (activeWorkout?.workout_data as RunningWorkoutData | undefined) ?? MOCK_RUN_DATA;

  const currentSegmentIndex = activeRun?.currentSegmentIndex ?? 0;
  const currentSegment = runData.segments[currentSegmentIndex];
  const totalSegments = runData.segments.length;

  // Animated values
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Timer
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

  // Simulate distance for demo mode (when no real GPS)
  useEffect(() => {
    if (isPaused) return;
    if (!currentSegment) return;

    // Simulate ~1km per target_pace_min_km minutes
    const paceMinPerKm = currentSegment.target_pace_min_km;
    const kmPerSecond = 1 / (paceMinPerKm * 60);
    setSimulatedDistance((prev) => {
      const next = prev + kmPerSecond;
      return Math.round(next * 1000) / 1000;
    });
  }, [elapsedSeconds, isPaused, currentSegment]);

  // Update store with simulated distance
  useEffect(() => {
    const dist = activeRun?.distanceKm ?? simulatedDistance;
    const pace =
      simulatedDistance > 0 ? (elapsedSeconds / 60) / simulatedDistance : 0;

    updateRunProgress({
      elapsedSeconds,
      distanceKm: simulatedDistance,
      currentPace: pace,
    });

    // Track splits
    const currentKm = Math.floor(simulatedDistance);
    if (currentKm > lastSplitKm.current && currentKm > 0) {
      const splitPace = elapsedSeconds > 0 ? (elapsedSeconds / 60) / simulatedDistance : 0;
      setSplits((prev) => [
        ...prev,
        { km: currentKm, paceMinKm: splitPace, elapsedSeconds },
      ]);
      lastSplitKm.current = currentKm;
    }
  }, [simulatedDistance, elapsedSeconds]);

  // Simulate HR zone changes based on segment type
  useEffect(() => {
    if (!currentSegment) return;
    switch (currentSegment.type) {
      case 'warmup':
      case 'easy':
        setSimulatedHRZone(2);
        break;
      case 'recovery':
      case 'cooldown':
        setSimulatedHRZone(1);
        break;
      case 'steady':
        setSimulatedHRZone(3);
        break;
      case 'tempo':
        setSimulatedHRZone(4);
        break;
      case 'interval':
        setSimulatedHRZone(4);
        break;
      default:
        setSimulatedHRZone(2);
    }
  }, [currentSegment]);

  // Coach cue on segment change
  useEffect(() => {
    if (!currentSegment) return;
    const cueMessages: Record<string, string> = {
      warmup: 'Start easy. Let your body warm up gradually.',
      interval: 'Push it! Maintain strong, consistent form.',
      recovery: 'Ease off. Let your heart rate come down.',
      tempo: 'Find your rhythm. Controlled and steady.',
      cooldown: 'Nice work! Slow it down and recover.',
      easy: 'Keep it comfortable. Conversational pace.',
      steady: 'Hold this pace. Stay relaxed and efficient.',
    };

    const msg = cueMessages[currentSegment.type] || currentSegment.description;
    setCoachCue(msg);

    if (coachCueTimerRef.current) clearTimeout(coachCueTimerRef.current);
    coachCueTimerRef.current = setTimeout(() => {
      setCoachCue(null);
    }, 5000);

    return () => {
      if (coachCueTimerRef.current) clearTimeout(coachCueTimerRef.current);
    };
  }, [currentSegmentIndex, currentSegment]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleCompleteSegment = useCallback(() => {
    if (currentSegmentIndex < totalSegments - 1) {
      completeRunSegment();
    }
  }, [currentSegmentIndex, totalSegments, completeRunSegment]);

  const handleEndRun = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    finishRun();
    router.back();
  }, [finishRun, router]);

  const handleCancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelWorkout();
    router.back();
  }, [cancelWorkout, router]);

  // ── Computed values ─────────────────────────────────────────────────────

  const currentPace =
    simulatedDistance > 0 ? (elapsedSeconds / 60) / simulatedDistance : 0;
  const totalProgress =
    runData.total_distance_km > 0
      ? Math.min(simulatedDistance / runData.total_distance_km, 1)
      : 0;
  const segColor = currentSegment ? segmentColor(currentSegment.type) : colors.primary;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Coach Cue Toast ────────────────────────────────────────────── */}
      {coachCue && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.coachCueToast}>
          <View style={[styles.coachCueDot, { backgroundColor: segColor }]} />
          <Text style={styles.coachCueText} numberOfLines={2}>
            {coachCue}
          </Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Elapsed Timer ──────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.timerSection}>
          <Animated.View style={isPaused ? pulseStyle : undefined}>
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </Animated.View>
          <Text style={styles.timerLabel}>
            {isPaused ? 'PAUSED' : 'ELAPSED'}
          </Text>
        </Animated.View>

        {/* ── Segment Progress ───────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.segmentProgressRow}
        >
          <Text style={styles.segmentProgressText}>
            Segment {currentSegmentIndex + 1} of {totalSegments}
          </Text>
          <View style={[styles.segmentProgressBadge, { backgroundColor: withOpacity(segColor, 0.12) }]}>
            <Text style={[styles.segmentProgressBadgeText, { color: segColor }]}>
              {currentSegment?.type.toUpperCase() ?? 'DONE'}
            </Text>
          </View>
        </Animated.View>

        {/* ── Progress Bar ───────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(totalProgress * 100)}%`,
                  backgroundColor: segColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>
            {simulatedDistance.toFixed(2)} / {runData.total_distance_km.toFixed(1)} km
          </Text>
        </Animated.View>

        {/* ── Current Segment Card ───────────────────────────────────── */}
        {currentSegment && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={[styles.segmentCard, { borderLeftColor: segColor, borderLeftWidth: 3 }]}>
              <View style={styles.segmentCardHeader}>
                <Text style={[styles.segmentCardType, { color: segColor }]}>
                  {currentSegment.type.toUpperCase()}
                </Text>
                <Text style={styles.segmentCardDescription}>
                  {currentSegment.description}
                </Text>
              </View>

              <View style={styles.segmentCardMetrics}>
                <View style={styles.segmentMetric}>
                  <Text style={styles.segmentMetricValue}>
                    {currentSegment.distance_km} km
                  </Text>
                  <Text style={styles.segmentMetricLabel}>TARGET DIST</Text>
                </View>
                <View style={styles.segmentMetricDivider} />
                <View style={styles.segmentMetric}>
                  <Text style={styles.segmentMetricValue}>
                    {formatPace(currentSegment.target_pace_min_km)}/km
                  </Text>
                  <Text style={styles.segmentMetricLabel}>TARGET PACE</Text>
                </View>
                <View style={styles.segmentMetricDivider} />
                <View style={styles.segmentMetric}>
                  <Text style={[styles.segmentMetricValue, { color: segColor }]}>
                    {formatPace(currentPace)}/km
                  </Text>
                  <Text style={styles.segmentMetricLabel}>CURRENT</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── Distance & Pace Cards ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardValue, { color: colors.running }]}>
              {simulatedDistance.toFixed(2)}
            </Text>
            <Text style={styles.metricCardLabel}>DISTANCE (KM)</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricCardValue, { color: colors.textPrimary }]}>
              {formatPace(currentPace)}
            </Text>
            <Text style={styles.metricCardLabel}>AVG PACE (/KM)</Text>
          </View>
        </Animated.View>

        {/* ── Heart Rate Zone Indicator ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(380).duration(500)}>
          <View style={styles.hrSection}>
            <Text style={styles.hrSectionTitle}>HEART RATE ZONE</Text>
            <View style={styles.hrBars}>
              {HR_ZONES.map((zone) => {
                const isActive = zone.zone === simulatedHRZone;
                return (
                  <View key={zone.zone} style={styles.hrBarRow}>
                    <Text
                      style={[
                        styles.hrBarLabel,
                        isActive && { color: zone.color, fontWeight: '700' },
                      ]}
                    >
                      Z{zone.zone}
                    </Text>
                    <View style={styles.hrBarTrack}>
                      <View
                        style={[
                          styles.hrBarFill,
                          {
                            backgroundColor: isActive ? zone.color : withOpacity(zone.color, 0.15),
                            width: isActive ? '100%' : '40%',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.hrBarName,
                        isActive && { color: zone.color, fontWeight: '600' },
                      ]}
                    >
                      {zone.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── Split Times ────────────────────────────────────────────── */}
        {splits.length > 0 && (
          <Animated.View entering={FadeInDown.delay(440).duration(500)}>
            <View style={styles.splitsSection}>
              <Text style={styles.splitsSectionTitle}>SPLITS</Text>
              {splits.map((split, idx) => (
                <View key={idx} style={styles.splitRow}>
                  <Text style={styles.splitKm}>KM {split.km}</Text>
                  <Text style={styles.splitPace}>
                    {formatPace(split.paceMinKm)}/km
                  </Text>
                  <Text style={styles.splitTime}>
                    {formatTime(split.elapsedSeconds)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Spacer for bottom buttons */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* ── Bottom Controls ────────────────────────────────────────────── */}
      <View style={styles.bottomControls}>
        {/* Complete Segment */}
        {currentSegment && currentSegmentIndex < totalSegments - 1 && (
          <Pressable
            onPress={handleCompleteSegment}
            style={({ pressed }) => [
              styles.completeSegmentButton,
              { backgroundColor: segColor },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.completeSegmentText}>Complete Segment</Text>
          </Pressable>
        )}

        <View style={styles.bottomButtonRow}>
          {/* Pause */}
          <Pressable
            onPress={handleTogglePause}
            style={({ pressed }) => [
              styles.pauseButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.pauseButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>

          {/* End Run */}
          <Pressable
            onPress={handleEndRun}
            style={({ pressed }) => [
              styles.endButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.endButtonText}>End Run</Text>
          </Pressable>
        </View>
      </View>
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
  },

  // Coach Cue Toast
  coachCueToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    ...shadows.md,
  },
  coachCueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coachCueText: {
    ...typography.footnote,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  // Timer
  timerSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    lineHeight: 72,
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: spacing.xs,
  },

  // Segment Progress
  segmentProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  segmentProgressText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  segmentProgressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  segmentProgressBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Progress Bar
  progressBarWrapper: {
    marginBottom: spacing.lg,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: withOpacity(colors.white, 0.06),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressBarLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Segment Card
  segmentCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  segmentCardHeader: {
    marginBottom: spacing.md,
  },
  segmentCardType: {
    ...typography.headline,
    fontWeight: '700',
    letterSpacing: 1,
  },
  segmentCardDescription: {
    ...typography.footnote,
    color: colors.textTertiary,
    marginTop: 4,
  },
  segmentCardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentMetric: {
    flex: 1,
    alignItems: 'center',
  },
  segmentMetricValue: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  segmentMetricLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  segmentMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  metricCardValue: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  metricCardLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: spacing.xs,
  },

  // HR Zone
  hrSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  hrSectionTitle: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  hrBars: {
    gap: spacing.sm,
  },
  hrBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hrBarLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    width: 24,
    fontWeight: '500',
  },
  hrBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: withOpacity(colors.white, 0.04),
    borderRadius: 4,
    overflow: 'hidden',
  },
  hrBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  hrBarName: {
    ...typography.caption2,
    color: colors.textTertiary,
    width: 68,
    textAlign: 'right',
  },

  // Splits
  splitsSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  splitsSectionTitle: {
    ...typography.caption1,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: withOpacity(colors.border, 0.5),
  },
  splitKm: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
    width: 60,
  },
  splitPace: {
    ...typography.callout,
    color: colors.running,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  splitTime: {
    ...typography.callout,
    color: colors.textTertiary,
    width: 70,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  // Bottom Controls
  bottomControls: {
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
    gap: spacing.sm,
  },
  completeSegmentButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeSegmentText: {
    ...typography.headline,
    color: colors.white,
    fontWeight: '700',
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pauseButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseButtonText: {
    ...typography.headline,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  endButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: withOpacity(colors.error, 0.15),
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.3),
  },
  endButtonText: {
    ...typography.headline,
    color: colors.error,
    fontWeight: '700',
  },
});
