import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { getWeekDates, isSameDay, isToday } from '@/utils/dateUtils';
import { format } from 'date-fns';
import type { Workout } from '@/types/workout';

interface CalendarViewProps {
  weekStartDate: string;
  workouts: Workout[];
  onDayPress: (date: Date) => void;
}

const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView({ weekStartDate, workouts, onDayPress }: CalendarViewProps) {
  const dates = getWeekDates(weekStartDate);

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {dayHeaders.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Typography variant="caption2" color={colors.textTertiary} align="center">
              {day}
            </Typography>
          </View>
        ))}
      </View>

      {/* Day cells */}
      <View style={styles.daysRow}>
        {dates.map((date, idx) => {
          const dayWorkouts = workouts.filter((w) => {
            const scheduled = new Date(w.scheduled_date);
            return isSameDay(scheduled, date);
          });
          const today = isToday(date);

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onDayPress(date)}
              style={[styles.dayCell, today && styles.todayCell]}
            >
              <Typography
                variant="callout"
                color={today ? colors.primary : colors.textPrimary}
                align="center"
                style={{ fontWeight: today ? '700' : '400' }}
              >
                {format(date, 'd')}
              </Typography>

              {/* Workout dots */}
              <View style={styles.dots}>
                {dayWorkouts.map((w) => (
                  <View
                    key={w.id}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          w.status === 'completed'
                            ? colors.success
                            : workoutTypeColors[w.workout_type] || colors.primary,
                      },
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  headerCell: {
    flex: 1,
  },
  daysRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  todayCell: {
    backgroundColor: `${colors.primary}15`,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
    height: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
