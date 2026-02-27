import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from '@/utils/haptics';
import { Typography, Mono } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PaceZoneIndicator } from '@/components/workout/PaceZoneIndicator';
import { useWorkout } from '@/hooks/useWorkout';
import { useLocation } from '@/hooks/useLocation';
import { audioCoaching } from '@/services/audioCoaching';
import { getZoneForHR, type ZoneConfig } from '@/services/heartRateZones';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';
import { formatPace, formatDuration } from '@/utils/paceCalculator';
import { formatDistance } from '@/utils/formatters';
import type { RunningWorkoutData } from '@/types/workout';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Circular Control Button ─────────────────────────────────────────────────
function ControlButton({
  onPress,
  size,
  backgroundColor,
  borderColor,
  label,
  labelColor,
  glowColor,
}: {
  onPress: () => void;
  size: number;
  backgroundColor: string;
  borderColor?: string;
  label: string;
  labelColor: string;
  glowColor?: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: borderColor ? 1.5 : 0,
          borderColor: borderColor || 'transparent',
        },
        glowColor ? shadows.glow(glowColor) : undefined,
        animatedStyle,
      ]}
    >
      <Typography
        variant="headline"
        color={labelColor}
        align="center"
        style={{ fontWeight: '600', letterSpacing: 0.3 }}
      >
        {label}
      </Typography>
    </AnimatedPressable>
  );
}

export default function RunActiveScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    activeRun,
    updateRunProgress,
    completeRunSegment,
    finishRun,
    cancelWorkout,
  } = useWorkout();
  const { startTracking, stopTracking, totalDistance, currentLocation, isTracking } = useLocation();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioCuesEnabled, setAudioCuesEnabled] = useState(true);
  const [currentHR, setCurrentHR] = useState<number | null>(null);
  const [hrZoneConfig, setHRZoneConfig] = useState<ZoneConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSegmentRef = useRef(0);

  const runData = activeWorkout?.workout_data as RunningWorkoutData | undefined;
  const currentSegmentIndex = activeRun?.currentSegmentIndex ?? 0;
  const currentSegment = runData?.segments[currentSegmentIndex];
  const totalSegments = runData?.segments.length ?? 0;

  // Initialize audio coaching
  useEffect(() => {
    audioCoaching.initialize({ enabled: audioCuesEnabled });
    return () => {
      audioCoaching.reset();
    };
  }, []);

  useEffect(() => {
    audioCoaching.updateConfig({ enabled: audioCuesEnabled });
  }, [audioCuesEnabled]);

  useEffect(() => {
    startTracking();
    startTimer();
    return () => {
      stopTracking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Announce segment transitions
  useEffect(() => {
    if (currentSegment && currentSegmentIndex !== prevSegmentRef.current) {
      audioCoaching.announceSegmentStart(currentSegment, currentSegmentIndex, totalSegments);
      prevSegmentRef.current = currentSegmentIndex;
    }
  }, [currentSegmentIndex, currentSegment, totalSegments]);

  // Announce first segment on start
  useEffect(() => {
    if (currentSegment && prevSegmentRef.current === 0 && elapsedSeconds === 1) {
      audioCoaching.announceSegmentStart(currentSegment, 0, totalSegments);
    }
  }, [elapsedSeconds, currentSegment, totalSegments]);

  useEffect(() => {
    if (totalDistance > 0) {
      updateRunProgress({
        distanceKm: totalDistance,
        currentPace: elapsedSeconds > 0 ? (elapsedSeconds / 60) / totalDistance : 0,
      });
    }
  }, [totalDistance]);

  // Audio pace & distance checks every second
  useEffect(() => {
    if (currentSegment && totalDistance > 0 && !isPaused) {
      const currentPace = elapsedSeconds > 0 ? (elapsedSeconds / 60) / totalDistance : 0;
      audioCoaching.checkPace(currentPace, currentSegment.target_pace_min_km, elapsedSeconds);
      audioCoaching.checkDistance(totalDistance, runData?.total_distance_km ?? 0);
    }
  }, [elapsedSeconds]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isPaused) {
      startTimer();
      setIsPaused(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  const handleFinish = () => {
    Alert.alert('Finish Run', 'Are you sure you want to finish this run?', [
      { text: 'Continue Running', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          stopTracking();
          if (timerRef.current) clearInterval(timerRef.current);
          audioCoaching.announceWorkoutComplete(elapsedSeconds, totalDistance);
          updateRunProgress({ elapsedSeconds, isRunning: false });
          await finishRun();
          router.replace('/(tabs)/today');
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Run', 'Your progress will be lost.', [
      { text: 'Keep Running', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => {
          stopTracking();
          if (timerRef.current) clearInterval(timerRef.current);
          cancelWorkout();
          router.back();
        },
      },
    ]);
  };

  if (!activeWorkout || !runData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Typography variant="body" color={colors.textSecondary} align="center">
            No active workout
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const currentPace = totalDistance > 0 ? (elapsedSeconds / 60) / totalDistance : 0;
  const totalProgress = runData.total_distance_km > 0 ? totalDistance / runData.total_distance_km : 0;
  const currentZone = currentHR && hrZoneConfig ? getZoneForHR(currentHR, hrZoneConfig) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top Bar: Audio Toggle ────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.topBar}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAudioCuesEnabled(!audioCuesEnabled);
          }}
          style={({ pressed }) => [
            styles.audioToggle,
            !audioCuesEnabled && styles.audioToggleOff,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Typography
            variant="caption1"
            color={audioCuesEnabled ? colors.primary : colors.textTertiary}
            style={{ fontWeight: '600' }}
          >
            {audioCuesEnabled ? 'AUDIO ON' : 'AUDIO OFF'}
          </Typography>
        </Pressable>

        {/* Paused indicator */}
        {isPaused && (
          <View style={styles.pausedBadge}>
            <Typography variant="caption1" color={colors.warning} style={{ fontWeight: '700', letterSpacing: 1 }}>
              PAUSED
            </Typography>
          </View>
        )}
      </Animated.View>

      {/* ── Segment Card ─────────────────────────────────────────────────── */}
      {currentSegment && (
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify().damping(18)} style={styles.segmentCard}>
          <View style={styles.segmentCardInner}>
            <Badge
              label={currentSegment.type.toUpperCase()}
              color={colors.primary}
              backgroundColor={withOpacity(colors.primary, 0.15)}
              size="md"
            />
            <Typography
              variant="callout"
              color={colors.textSecondary}
              style={{ marginTop: spacing.sm }}
            >
              {currentSegment.description}
            </Typography>
            <Typography variant="caption1" color={colors.textTertiary} style={{ marginTop: spacing.xs }}>
              Segment {currentSegmentIndex + 1} of {totalSegments}
            </Typography>
          </View>
        </Animated.View>
      )}

      {/* ── Main Metrics ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.metricsArea}>
        {/* Duration - hero metric */}
        <View style={styles.heroMetric}>
          <Mono align="center" style={styles.heroTime}>
            {formatDuration(elapsedSeconds)}
          </Mono>
          <Typography variant="caption1" color={colors.textTertiary} align="center" style={styles.metricLabel}>
            DURATION
          </Typography>
        </View>

        {/* Secondary metrics in glass cards */}
        <Animated.View entering={FadeInDown.delay(400).duration(500).springify().damping(18)} style={styles.secondaryRow}>
          <View style={styles.metricCard}>
            <Typography
              variant="mono"
              color={colors.textPrimary}
              align="center"
              style={styles.metricValue}
            >
              {formatDistance(totalDistance)}
            </Typography>
            <Typography variant="caption2" color={colors.textTertiary} align="center" style={styles.metricLabel}>
              DISTANCE
            </Typography>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCard}>
            <Typography
              variant="mono"
              color={colors.textPrimary}
              align="center"
              style={styles.metricValue}
            >
              {formatPace(currentPace)}/km
            </Typography>
            <Typography variant="caption2" color={colors.textTertiary} align="center" style={styles.metricLabel}>
              CURRENT PACE
            </Typography>
          </View>
        </Animated.View>

        {/* HR Zone Banner */}
        {currentZone && (
          <Animated.View
            entering={FadeInDown.delay(450).duration(400)}
            style={[styles.hrZoneBanner, { backgroundColor: withOpacity(currentZone.color, 0.1) }]}
          >
            <View style={[styles.hrZoneDot, { backgroundColor: currentZone.color }]} />
            <Typography variant="caption1" color={currentZone.color} style={{ fontWeight: '600', flex: 1 }}>
              Zone {currentZone.zone} — {currentZone.name}
            </Typography>
            <Typography variant="caption1" color={colors.textSecondary}>
              {currentHR} bpm
            </Typography>
          </Animated.View>
        )}

        {/* Target pace indicator */}
        {currentSegment && (
          <Animated.View entering={FadeInDown.delay(500).duration(500).springify().damping(18)}>
            <PaceZoneIndicator
              currentPace={currentPace}
              targetPace={currentSegment.target_pace_min_km}
              style={styles.paceIndicator}
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.delay(550).duration(400)} style={styles.progressSection}>
        <ProgressBar
          progress={totalProgress}
          height={4}
          color={colors.primary}
          trackColor="rgba(255,255,255,0.06)"
        />
        <Typography
          variant="caption2"
          color={colors.textTertiary}
          align="center"
          style={{ marginTop: spacing.sm }}
        >
          {formatDistance(totalDistance)} / {formatDistance(runData.total_distance_km)}
        </Typography>
      </Animated.View>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(600).duration(500).springify().damping(18)} style={styles.controls}>
        {/* Cancel button */}
        <ControlButton
          onPress={handleCancel}
          size={60}
          backgroundColor="rgba(255,255,255,0.03)"
          borderColor="rgba(255,255,255,0.08)"
          label="End"
          labelColor={colors.textSecondary}
        />

        {/* Pause / Resume - large center button */}
        <ControlButton
          onPress={togglePause}
          size={80}
          backgroundColor={isPaused ? withOpacity(colors.primary, 0.15) : 'rgba(255,255,255,0.06)'}
          borderColor={isPaused ? colors.primary : 'rgba(255,255,255,0.1)'}
          label={isPaused ? 'Go' : 'Pause'}
          labelColor={isPaused ? colors.primary : colors.textPrimary}
          glowColor={isPaused ? colors.primaryDark : undefined}
        />

        {/* Finish button */}
        <ControlButton
          onPress={handleFinish}
          size={60}
          backgroundColor={colors.primary}
          label="Done"
          labelColor={colors.textInverse}
          glowColor={colors.primaryDark}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingHorizontal: spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top bar ──────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  audioToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  audioToggleOff: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pausedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.warning, 0.1),
    borderWidth: 1,
    borderColor: withOpacity(colors.warning, 0.2),
  },

  // ── Segment card ─────────────────────────────────────────
  segmentCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    ...glass.card,
    overflow: 'hidden',
  },
  segmentCardInner: {
    padding: spacing.lg,
    alignItems: 'center',
  },

  // ── Metrics area ─────────────────────────────────────────
  metricsArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  heroMetric: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  heroTime: {
    fontSize: 64,
    fontWeight: '200',
    lineHeight: 72,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    ...glass.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  metricLabel: {
    letterSpacing: 1.2,
    marginTop: spacing.xs,
    fontWeight: '500',
  },

  // ── HR Zone ──────────────────────────────────────────────
  hrZoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  hrZoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Pace indicator ───────────────────────────────────────
  paceIndicator: {
    marginTop: spacing.lg,
  },

  // ── Progress ─────────────────────────────────────────────
  progressSection: {
    paddingVertical: spacing.md,
  },

  // ── Controls ─────────────────────────────────────────────
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
});
