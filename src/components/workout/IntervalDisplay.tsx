import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';
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
    <View style={styles.container}>
      {/* Visual bar */}
      <View style={styles.bar}>
        {segments.map((segment, idx) => (
          <View
            key={idx}
            style={[
              styles.barSegment,
              {
                flex: segment.distance_km / totalDistance,
                backgroundColor: segmentColors[segment.type] || colors.primary,
              },
              idx === 0 && styles.barFirst,
              idx === segments.length - 1 && styles.barLast,
            ]}
          />
        ))}
      </View>

      {/* Segment details */}
      <View style={styles.segments}>
        {segments.map((segment, idx) => (
          <View key={idx} style={styles.segmentRow}>
            <View
              style={[
                styles.segmentDot,
                { backgroundColor: segmentColors[segment.type] || colors.primary },
              ]}
            />
            <View style={styles.segmentInfo}>
              <Typography variant="callout">
                {segment.description}
              </Typography>
              <View style={styles.segmentMeta}>
                <Typography variant="caption1" color={colors.textSecondary}>
                  {formatDistance(segment.distance_km)}
                </Typography>
                <Typography variant="caption1" color={colors.textTertiary}> @ </Typography>
                <Typography variant="caption1" color={segmentColors[segment.type] || colors.primary}>
                  {formatPace(segment.target_pace_min_km)}/km
                </Typography>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    gap: 2,
  },
  barSegment: {
    height: '100%',
  },
  barFirst: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  barLast: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  segments: {
    gap: spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  segmentInfo: {
    flex: 1,
  },
  segmentMeta: {
    flexDirection: 'row',
    marginTop: 2,
  },
});
