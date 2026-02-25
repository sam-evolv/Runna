import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration } from '@/utils/formatters';
import { dayName } from '@/utils/dateUtils';
import type { Workout } from '@/types/workout';

interface WeekViewProps {
  workouts: Workout[];
  onWorkoutPress: (workout: Workout) => void;
}

export function WeekView({ workouts, onWorkoutPress }: WeekViewProps) {
  // Create a map of day -> workouts
  const dayWorkouts = new Map<number, Workout[]>();
  for (let d = 1; d <= 7; d++) {
    dayWorkouts.set(d, workouts.filter((w) => w.day_of_week === d));
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
        const dayW = dayWorkouts.get(day) || [];

        return (
          <View key={day} style={styles.dayRow}>
            <View style={styles.dayLabel}>
              <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600' }}>
                {dayName(day)}
              </Typography>
            </View>
            <View style={styles.dayContent}>
              {dayW.length === 0 ? (
                <View style={styles.restDay}>
                  <Typography variant="caption1" color={colors.textTertiary}>Rest</Typography>
                </View>
              ) : (
                dayW.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => onWorkoutPress(w)}
                    activeOpacity={0.7}
                    style={[
                      styles.workoutPill,
                      { borderLeftColor: workoutTypeColors[w.workout_type] || colors.primary },
                      w.status === 'completed' && styles.completed,
                    ]}
                  >
                    <Typography variant="footnote" numberOfLines={1}>
                      {w.title}
                    </Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>
                      {formatWorkoutDuration(w.estimated_duration_minutes)}
                    </Typography>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  dayRow: {
    flexDirection: 'row',
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dayLabel: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContent: {
    flex: 1,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  restDay: {
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  workoutPill: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  completed: {
    opacity: 0.5,
  },
});
