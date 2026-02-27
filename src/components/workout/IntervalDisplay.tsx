import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import {
  colors,
  spacing,
  borderRadius,
  glass,
  animation,
  shadows,
  withOpacity,
} from '@/constants/theme';
import { formatPace } from '@/utils/paceCalculator';
import { formatDistance } from '@/utils/formatters';
import type { RunSegment, RunSegmentType } from '@/types/workout';

interface IntervalDisplayProps {
  segments: RunSegment[];
}

const segmentColors: Record<RunSegmentType, string> = {
  warmup: colors.success,
  easy: colors.success,
  steady: colors.primary,
  tempo: colors.warning,
  interval: colors.error,
  recovery: colors.recoveryRun,
  cooldown: colors.success,
};

export function IntervalDisplay({ segments }: IntervalDisplayProps) {
  const totalDistance = segments.reduce((sum, s) => sum + s.distance_km, 0);

  return (
    <Animated.View
      entering={FadeInDown.duration(animation.entrance).springify().damping(18)}
      style={styles.container}
    >
      {/* Visual bar showing segment proportions */}
      <View style={styles.barContainer}>
        {/* Subtle inner top glow */}
        <View style={styles.barContainerGlow} />

        <View style={styles.bar}>
          {segments.map((segment, idx) => {
            const segColor = segmentColors[segment.type] || colors.primary;
            return (
              <Animated.View
                key={idx}
                entering={FadeInRight.delay(idx * 60).duration(animation.slow)}
                style={[
                  styles.barSegment,
                  {
                    flex: segment.distance_km / totalDistance,
                    backgroundColor: segColor,
                  },
                  idx === 0 && styles.barFirst,
                  idx === segments.length - 1 && styles.barLast,
                ]}
              >
                {/* Inner glow on each segment */}
                <View style={[styles.barSegmentGlow, { backgroundColor: withOpacity(segColor, 0.3) }]} />
              </Animated.View>
            );
          })}
        </View>

        {/* Total distance label */}
        <View style={styles.totalRow}>
          <Typography variant="caption2" color={colors.textTertiary} style={styles.totalLabel}>
            TOTAL
          </Typography>
          <Animated.View entering={FadeIn.delay(300).duration(animation.slow)}>
            <Typography variant="caption1" color={colors.textSecondary}>
              {formatDistance(totalDistance)}
            </Typography>
          </Animated.View>
        </View>
      </View>

      {/* Segment details */}
      <View style={styles.segments}>
        {segments.map((segment, idx) => {
          const segColor = segmentColors[segment.type] || colors.primary;
          return (
            <Animated.View
              key={idx}
              entering={FadeInDown.delay(100 + idx * 50).duration(animation.entrance).springify().damping(20)}
              style={styles.segmentRow}
            >
              {/* Left accent edge */}
              <View style={[styles.segmentAccent, { backgroundColor: withOpacity(segColor, 0.3) }]} />

              {/* Color indicator */}
              <View style={styles.segmentIndicator}>
                <View style={[styles.segmentDot, { backgroundColor: segColor }]} />
                <View
                  style={[
                    styles.segmentDotGlow,
                    { backgroundColor: withOpacity(segColor, 0.25) },
                  ]}
                />
              </View>

              {/* Segment info */}
              <View style={styles.segmentInfo}>
                <Typography variant="callout" color={colors.textPrimary}>
                  {segment.description}
                </Typography>
                <View style={styles.segmentMeta}>
                  <Typography variant="caption1" color={colors.textSecondary}>
                    {formatDistance(segment.distance_km)}
                  </Typography>
                  <Typography variant="caption1" color={colors.textTertiary}>
                    {' '}@{' '}
                  </Typography>
                  <Typography variant="caption1" color={segColor} style={styles.paceText}>
                    {formatPace(segment.target_pace_min_km)}/km
                  </Typography>
                </View>
              </View>

              {/* Large pace number on the right */}
              <View style={styles.segmentPace}>
                <Typography variant="headline" color={withOpacity(segColor, 0.7)}>
                  {formatPace(segment.target_pace_min_km)}
                </Typography>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  barContainer: {
    ...glass.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  barContainerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
  },
  barSegment: {
    height: '100%',
    overflow: 'hidden',
  },
  barSegmentGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  barFirst: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  barLast: {
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  segments: {
    gap: spacing.xs,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glass.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    overflow: 'hidden',
  },
  segmentAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  segmentIndicator: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  segmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  segmentDotGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  paceText: {
    fontWeight: '600',
  },
  segmentPace: {
    marginLeft: spacing.md,
    opacity: 0.8,
  },
});
