import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, Mono } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PaceZoneIndicator } from '@/components/workout/PaceZoneIndicator';
import { useWorkout } from '@/hooks/useWorkout';
import { useLocation } from '@/hooks/useLocation';
import { colors, spacing } from '@/constants/theme';
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runData = activeWorkout?.workout_data as RunningWorkoutData | undefined;
  const currentSegment = runData?.segments[activeRun?.currentSegmentIndex ?? 0];
  const totalSegments = runData?.segments.length ?? 0;

  useEffect(() => {
    startTracking();
    startTimer();
    return () => {
      stopTracking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (totalDistance > 0) {
      updateRunProgress({
        distanceKm: totalDistance,
        currentPace: elapsedSeconds > 0 ? (elapsedSeconds / 60) / totalDistance : 0,
      });
    }
  }, [totalDistance]);

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
  const segmentProgress = currentSegment
    ? Math.min(totalDistance / (runData.segments.slice(0, (activeRun?.currentSegmentIndex ?? 0) + 1).reduce((s, seg) => s + seg.distance_km, 0)), 1)
    : 0;
  const totalProgress = totalDistance / runData.total_distance_km;

  return (
    <SafeAreaView style={styles.container}>
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
            Segment {(activeRun?.currentSegmentIndex ?? 0) + 1} of {totalSegments}
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
  segmentHeader: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
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
