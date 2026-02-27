import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import {
  colors,
  spacing,
  borderRadius,
  glass,
  animation,
  shadows,
  workoutTypeColors,
  withOpacity,
} from '@/constants/theme';
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
    <Animated.View
      entering={FadeInDown.duration(animation.entrance).springify().damping(18)}
      style={styles.wrapper}
    >
      <Card onPress={onPress} style={styles.container}>
        {/* Accent color bar along the left edge */}
        <View style={[styles.colorBar, { backgroundColor: workoutColor }]}>
          {/* Inner glow within the color bar */}
          <Animated.View
            entering={FadeIn.delay(200).duration(animation.slow)}
            style={[styles.colorBarGlow, { backgroundColor: withOpacity(workoutColor, 0.4) }]}
          />
        </View>

        {/* Subtle top-edge glow matching workout type */}
        <View style={[styles.glowAccent, { backgroundColor: withOpacity(workoutColor, 0.08) }]} />

        {/* Ambient glow behind the card for depth */}
        <View
          style={[
            styles.ambientGlow,
            { backgroundColor: withOpacity(workoutColor, 0.03) },
          ]}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Badge
              label={formatWorkoutType(workout.workout_type)}
              color={workoutColor}
              backgroundColor={withOpacity(workoutColor, 0.12)}
              dot
            />
            {workout.status === 'completed' && (
              <Badge
                label="Done"
                color={colors.success}
                backgroundColor={withOpacity(colors.success, 0.12)}
              />
            )}
          </View>

          <Typography variant="headline" style={styles.title}>
            {workout.title}
          </Typography>

          {!compact && workout.description && (
            <Typography
              variant="footnote"
              color={colors.textSecondary}
              numberOfLines={2}
              style={styles.description}
            >
              {workout.description}
            </Typography>
          )}

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Typography variant="caption2" color={colors.textTertiary} style={styles.metaLabel}>
                DATE
              </Typography>
              <Typography variant="caption1" color={colors.textSecondary}>
                {formatDate(workout.scheduled_date)}
              </Typography>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Typography variant="caption2" color={colors.textTertiary} style={styles.metaLabel}>
                DURATION
              </Typography>
              <Typography variant="caption1" color={colors.textSecondary}>
                {formatWorkoutDuration(workout.estimated_duration_minutes)}
              </Typography>
            </View>

            {isRunningWorkout(workout.workout_data) && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Typography variant="caption2" color={colors.textTertiary} style={styles.metaLabel}>
                    DISTANCE
                  </Typography>
                  <Typography variant="caption1" color={colors.textSecondary}>
                    {formatDistance((workout.workout_data as RunningWorkoutData).total_distance_km)}
                  </Typography>
                </View>
              </>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    ...glass.card,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  colorBar: {
    width: 3,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  colorBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  glowAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 40,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginTop: spacing.sm,
  },
  description: {
    marginTop: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.md,
  },
});
