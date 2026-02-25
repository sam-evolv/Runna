import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { isRunningWorkout, type Workout, type RunningWorkoutData } from '@/types/workout';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  compact?: boolean;
}

export function WorkoutCard({ workout, onPress, compact = false }: WorkoutCardProps) {
  const workoutColor = workoutTypeColors[workout.workout_type] || colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={[styles.colorBar, { backgroundColor: workoutColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Badge
            label={formatWorkoutType(workout.workout_type)}
            color={workoutColor}
            backgroundColor={`${workoutColor}20`}
          />
          {workout.status === 'completed' && (
            <Badge label="Done" color={colors.success} backgroundColor={`${colors.success}20`} />
          )}
        </View>

        <Typography variant="headline" style={styles.title}>
          {workout.title}
        </Typography>

        {!compact && workout.description && (
          <Typography variant="footnote" color={colors.textSecondary} numberOfLines={2}>
            {workout.description}
          </Typography>
        )}

        <View style={styles.meta}>
          <Typography variant="caption1" color={colors.textTertiary}>
            {formatDate(workout.scheduled_date)}
          </Typography>
          <Typography variant="caption1" color={colors.textTertiary}>
            {formatWorkoutDuration(workout.estimated_duration_minutes)}
          </Typography>
          {isRunningWorkout(workout.workout_data) && (
            <Typography variant="caption1" color={colors.textTertiary}>
              {formatDistance((workout.workout_data as RunningWorkoutData).total_distance_km)}
            </Typography>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
});
