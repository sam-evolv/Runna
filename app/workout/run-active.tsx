import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, Mono } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PaceZoneIndicator } from '@/components/workout/PaceZoneIndicator';
import { useWorkout } from '@/hooks/useWorkout';
import { useLocation } from '@/hooks/useLocation';
import { audioCoaching } from '@/services/audioCoaching';
import { getZoneForHR, type ZoneConfig } from '@/services/heartRateZones';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { formatPace, formatDuration } from '@/utils/paceCalculator';
import { formatDistance } from '@/utils/formatters';
import type { RunningWorkoutData } from '@/types/workout';

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
        <Typography variant="body" color={colors.textSecondary} align="center">
          No active workout
        </Typography>
      </SafeAreaView>
    );
  }

  const currentPace = totalDistance > 0 ? (elapsedSeconds / 60) / totalDistance : 0;
  const totalProgress = runData.total_distance_km > 0 ? totalDistance / runData.total_distance_km : 0;
  const currentZone = currentHR && hrZoneConfig ? getZoneForHR(currentHR, hrZoneConfig) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Audio cue toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => setAudioCuesEnabled(!audioCuesEnabled)}
          activeOpacity={0.7}
          style={[styles.audioToggle, !audioCuesEnabled && styles.audioToggleOff]}
        >
          <Typography variant="caption2" color={audioCuesEnabled ? colors.primary : colors.textTertiary}>
            {audioCuesEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Current Segment */}
      {currentSegment && (
        <View style={styles.segmentHeader}>
          <Badge
            label={currentSegment.type.toUpperCase()}
            color={colors.primary}
            backgroundColor={`${colors.primary}20`}
            size="md"
          />
          <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
            {currentSegment.description}
          </Typography>
          <Typography variant="footnote" color={colors.textTertiary}>
            Segment {currentSegmentIndex + 1} of {totalSegments}
          </Typography>
        </View>
      )}

      {/* Main metrics */}
      <View style={styles.metrics}>
        <View style={styles.mainMetric}>
          <Mono align="center" style={styles.bigNumber}>
            {formatDuration(elapsedSeconds)}
          </Mono>
          <Typography variant="caption1" color={colors.textTertiary} align="center">
            DURATION
          </Typography>
        </View>

        <View style={styles.secondaryMetrics}>
          <View style={styles.metricBox}>
            <Typography variant="monoSmall" align="center">
              {formatDistance(totalDistance)}
            </Typography>
            <Typography variant="caption2" color={colors.textTertiary} align="center">
              DISTANCE
            </Typography>
          </View>
          <View style={styles.metricBox}>
            <Typography variant="monoSmall" align="center">
              {formatPace(currentPace)}/km
            </Typography>
            <Typography variant="caption2" color={colors.textTertiary} align="center">
              CURRENT PACE
            </Typography>
          </View>
        </View>

        {/* HR Zone overlay */}
        {currentZone && (
          <View style={[styles.hrZoneBanner, { backgroundColor: `${currentZone.color}20` }]}>
            <View style={[styles.hrZoneDot, { backgroundColor: currentZone.color }]} />
            <Typography variant="caption1" color={currentZone.color} style={{ fontWeight: '600' }}>
              Zone {currentZone.zone} — {currentZone.name}
            </Typography>
            <Typography variant="caption1" color={colors.textSecondary} style={{ marginLeft: 'auto' }}>
              {currentHR} bpm
            </Typography>
          </View>
        )}

        {/* Target pace */}
        {currentSegment && (
          <PaceZoneIndicator
            currentPace={currentPace}
            targetPace={currentSegment.target_pace_min_km}
            style={styles.paceIndicator}
          />
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <ProgressBar progress={totalProgress} height={6} />
        <Typography variant="caption2" color={colors.textTertiary} align="center" style={{ marginTop: spacing.xs }}>
          {formatDistance(totalDistance)} / {formatDistance(runData.total_distance_km)}
        </Typography>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="ghost"
          size="md"
        />
        <Button
          title={isPaused ? 'Resume' : 'Pause'}
          onPress={togglePause}
          variant="secondary"
          size="lg"
        />
        <Button
          title="Finish"
          onPress={handleFinish}
          variant="primary"
          size="md"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
  },
  audioToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
  },
  audioToggleOff: {
    backgroundColor: colors.surface,
  },
  segmentHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  metrics: {
    flex: 1,
    justifyContent: 'center',
  },
  mainMetric: {
    marginBottom: spacing.xxxl,
  },
  bigNumber: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
  },
  hrZoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  hrZoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paceIndicator: {
    marginTop: spacing.xxl,
  },
  progressSection: {
    paddingVertical: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
});
