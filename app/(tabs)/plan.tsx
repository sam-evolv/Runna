import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePlan } from '@/hooks/usePlan';
import { useWorkout } from '@/hooks/useWorkout';
import { isRunningWorkout, type RunningWorkoutData, type StrengthWorkoutData } from '@/types/workout';
import { colors, spacing, borderRadius, workoutTypeColors, withOpacity } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration } from '@/utils/formatters';
import { dayName } from '@/utils/dateUtils';

export default function PlanScreen() {
  const router = useRouter();
  const { plan, workouts, getWorkoutsForWeek, isLoading } = usePlan();
  const { startWorkout } = useWorkout();
  const [selectedWeek, setSelectedWeek] = useState(plan?.current_week ?? 1);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          icon={'\u{1F4C5}'}
          title="No Active Plan"
          message="Complete the onboarding to generate your personalised training plan."
          style={{ flex: 1, justifyContent: 'center' }}
        />
      </SafeAreaView>
    );
  }

  const weekWorkouts = getWorkoutsForWeek(selectedWeek);
  const completedCount = weekWorkouts.filter((w) => w.status === 'completed').length;

  const handleStartWorkout = (workout: any) => {
    startWorkout(workout);
    if (isRunningWorkout(workout.workout_data)) {
      router.push('/workout/run-active');
    } else {
      router.push('/workout/active');
    }
  };

  // Build 7 day view
  const daySlots = Array.from({ length: 7 }, (_, i) => {
    const dayWorkout = weekWorkouts.find((w) => w.day_of_week === i);
    return { dayIndex: i, workout: dayWorkout };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Typography variant="largeTitle">Your Plan</Typography>
        <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: 2 }}>
          {plan.name}
        </Typography>
      </Animated.View>

      {/* Week selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekSelector}
      >
        {Array.from({ length: plan.total_weeks }, (_, i) => i + 1).map((week) => {
          const wWorkouts = getWorkoutsForWeek(week);
          const isCurrentWeek = week === plan.current_week;
          const isSelected = week === selectedWeek;

          return (
            <Pressable
              key={week}
              onPress={() => { setSelectedWeek(week); setExpandedDay(null); }}
              style={[
                styles.weekPill,
                isSelected && styles.weekPillSelected,
                isCurrentWeek && !isSelected && styles.weekPillCurrent,
              ]}
            >
              <Typography
                variant="caption2"
                color={isSelected ? colors.textInverse : isCurrentWeek ? colors.primary : colors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                W{week}
              </Typography>
              {wWorkouts.length > 0 && (
                <View style={styles.weekDots}>
                  {wWorkouts.map((w) => (
                    <View
                      key={w.id}
                      style={[
                        styles.miniDot,
                        { backgroundColor: w.status === 'completed' ? colors.success : 'rgba(255,255,255,0.15)' },
                      ]}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Week content */}
      <ScrollView contentContainerStyle={styles.weekContent} showsVerticalScrollIndicator={false}>
        <View style={styles.weekHeaderRow}>
          <View>
            <Typography variant="title3">Week {selectedWeek}</Typography>
            {plan.plan_data.weeks[selectedWeek - 1]?.theme && (
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600', marginTop: 2 }}>
                {plan.plan_data.weeks[selectedWeek - 1].theme}
              </Typography>
            )}
          </View>
          <View style={styles.completionBadge}>
            <Typography variant="caption1" color={colors.textSecondary}>
              {completedCount}/{weekWorkouts.length}
            </Typography>
          </View>
        </View>

        {/* 7-day calendar */}
        <View style={styles.dayCalendar}>
          {daySlots.map(({ dayIndex, workout }) => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const wColor = workout ? (workoutTypeColors[workout.workout_type] || colors.primary) : colors.recovery;
            const isExpanded = expandedDay === (workout?.id || `rest-${dayIndex}`);
            const isRest = !workout;

            return (
              <View key={dayIndex}>
                <Pressable
                  style={styles.dayRow}
                  onPress={() => setExpandedDay(isExpanded ? null : (workout?.id || `rest-${dayIndex}`))}
                >
                  <View style={styles.dayLabel}>
                    <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '600', width: 32 }}>
                      {dayNames[dayIndex]}
                    </Typography>
                  </View>
                  <View style={[styles.dayDot, { backgroundColor: wColor }]} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="callout" style={{ fontWeight: '500' }}>
                      {workout ? workout.title : 'Rest & Recovery'}
                    </Typography>
                    <Typography variant="caption2" color={colors.textMuted}>
                      {workout ? `${formatWorkoutDuration(workout.estimated_duration_minutes)}` : 'Recovery day'}
                    </Typography>
                  </View>
                  {workout?.status === 'completed' && (
                    <Badge label="Done" color={colors.success} backgroundColor={withOpacity(colors.success, 0.12)} />
                  )}
                </Pressable>

                {/* Expanded detail */}
                {isExpanded && workout && (
                  <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedCard}>
                    {isRunningWorkout(workout.workout_data) && (
                      <View>
                        {(workout.workout_data as RunningWorkoutData).segments?.map((seg, i) => (
                          <View key={i} style={styles.segmentRow}>
                            <Typography variant="caption1" color={colors.textMuted} style={{ width: 80 }}>
                              {seg.type}
                            </Typography>
                            <Typography variant="caption1" color={colors.textSecondary}>
                              {seg.distance_km}km @ {seg.target_pace_min_km}min/km
                            </Typography>
                          </View>
                        ))}
                      </View>
                    )}
                    {!isRunningWorkout(workout.workout_data) && (workout.workout_data as StrengthWorkoutData)?.exercises && (
                      <View>
                        {(workout.workout_data as StrengthWorkoutData).exercises.map((ex, i) => (
                          <View key={i} style={styles.segmentRow}>
                            <Typography variant="caption1" color={colors.textSecondary} style={{ flex: 1 }}>
                              {ex.name}
                            </Typography>
                            <Typography variant="caption1" color={colors.textMuted}>
                              {ex.sets.length} sets
                            </Typography>
                          </View>
                        ))}
                      </View>
                    )}
                    {workout.status !== 'completed' && (
                      <Button
                        title="Start"
                        onPress={() => handleStartWorkout(workout)}
                        size="sm"
                        fullWidth
                        style={{ marginTop: spacing.sm }}
                      />
                    )}
                  </Animated.View>
                )}

                {isExpanded && isRest && (
                  <Animated.View entering={FadeInDown.duration(200)} style={styles.expandedCard}>
                    <Typography variant="footnote" color={colors.textSecondary}>
                      Take it easy today. Light walking, stretching, or foam rolling is great for recovery.
                    </Typography>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>

        {/* Upcoming weeks */}
        <Typography variant="caption1" color={colors.textMuted} style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
          UPCOMING WEEKS
        </Typography>
        {Array.from({ length: Math.min(4, plan.total_weeks - selectedWeek) }, (_, i) => selectedWeek + 1 + i).map((week) => {
          const wWorkouts = getWorkoutsForWeek(week);
          return (
            <Pressable
              key={week}
              style={styles.upcomingWeek}
              onPress={() => { setSelectedWeek(week); setExpandedDay(null); }}
            >
              <Typography variant="callout" style={{ fontWeight: '500' }}>Week {week}</Typography>
              <Typography variant="caption1" color={colors.textMuted}>
                {plan.plan_data.weeks[week - 1]?.theme || `${wWorkouts.length} sessions`}
              </Typography>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  weekSelector: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  weekPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minWidth: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weekPillSelected: {
    backgroundColor: colors.primary,
  },
  weekPillCurrent: {
    borderColor: colors.primary,
  },
  weekDots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 4,
  },
  miniDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  weekContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  completionBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  dayCalendar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  dayLabel: {},
  dayDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  expandedCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  upcomingWeek: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
