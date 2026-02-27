import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { formatPace } from '@/utils/paceCalculator';

interface PaceZoneIndicatorProps {
  currentPace: number;  // min/km
  targetPace: number;   // min/km
  style?: ViewStyle;
}

export function PaceZoneIndicator({ currentPace, targetPace, style }: PaceZoneIndicatorProps) {
  // Calculate how far off target we are
  // Positive = too slow, Negative = too fast
  const paceDeviation = currentPace - targetPace;
  const tolerance = 0.25; // 15 seconds per km tolerance

  let status: 'on_pace' | 'too_slow' | 'too_fast';
  let statusColor: string;
  let statusText: string;

  if (currentPace <= 0) {
    status = 'on_pace';
    statusColor = colors.textTertiary;
    statusText = 'Waiting for GPS...';
  } else if (Math.abs(paceDeviation) <= tolerance) {
    status = 'on_pace';
    statusColor = colors.success;
    statusText = 'On pace';
  } else if (paceDeviation > 0) {
    status = 'too_slow';
    statusColor = colors.warning;
    statusText = `Slow down - ${formatPace(paceDeviation)} behind`;
  } else {
    status = 'too_fast';
    statusColor = colors.error;
    statusText = `Speed up! ${formatPace(Math.abs(paceDeviation))} ahead`;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.indicator, { backgroundColor: `${statusColor}10`, borderColor: `${statusColor}30` }]}>
        <Typography variant="callout" color={statusColor} align="center" style={{ fontWeight: '600' }}>
          {statusText}
        </Typography>
        <View style={styles.paceRow}>
          <View style={styles.paceItem}>
            <Typography variant="caption2" color={colors.textTertiary}>TARGET</Typography>
            <Typography variant="headline" color={colors.textSecondary}>
              {formatPace(targetPace)}/km
            </Typography>
          </View>
          <View style={styles.paceItem}>
            <Typography variant="caption2" color={colors.textTertiary}>CURRENT</Typography>
            <Typography variant="headline" color={statusColor}>
              {currentPace > 0 ? `${formatPace(currentPace)}/km` : '--:--/km'}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  indicator: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  paceItem: {
    alignItems: 'center',
    gap: 2,
  },
});
