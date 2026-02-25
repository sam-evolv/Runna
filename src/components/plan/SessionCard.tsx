import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration } from '@/utils/formatters';

interface SessionCardProps {
  title: string;
  workoutType: string;
  duration: number;
  status: string;
  onPress: () => void;
}

export function SessionCard({ title, workoutType, duration, status, onPress }: SessionCardProps) {
  const workoutColor = workoutTypeColors[workoutType] || colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: workoutColor }]} />
      <View style={styles.content}>
        <Typography variant="callout" numberOfLines={1}>{title}</Typography>
        <View style={styles.meta}>
          <Typography variant="caption1" color={colors.textSecondary}>
            {formatWorkoutType(workoutType)}
          </Typography>
          <Typography variant="caption1" color={colors.textTertiary}>
            {formatWorkoutDuration(duration)}
          </Typography>
        </View>
      </View>
      {status === 'completed' && (
        <Typography variant="callout" color={colors.success}>✓</Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
});
