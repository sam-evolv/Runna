import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePlan } from '@/hooks/usePlan';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration } from '@/utils/formatters';
import { dayName } from '@/utils/dateUtils';

export default function PlanScreen() {
  const router = useRouter();
  const { plan, workouts, getWorkoutsForWeek, isLoading } = usePlan();
  const [selectedWeek, setSelectedWeek] = useState(plan?.current_week ?? 1);

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <Typography variant="title2" align="center">No Active Plan</Typography>
          <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.md }}>
            Complete the onboarding to generate your personalised training plan.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const weekWorkouts = getWorkoutsForWeek(selectedWeek);
  const completedCount = weekWorkouts.filter((w) => w.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="largeTitle">Your Plan</Typography>
        <Typography variant="callout" color={colors.textSecondary}>
          {plan.name}
        </Typography>
      </View>

      {/* Week selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekSelector}
      >
        {Array.from({ length: plan.total_weeks }, (_, i) => i + 1).map((week) => {
          const wWorkouts = getWorkoutsForWeek(week);
          const wCompleted = wWorkouts.filter((w) => w.status === 'completed').length;
          const isCurrentWeek = week === plan.current_week;
          const isSelected = week === selectedWeek;

          return (
            <TouchableOpacity
              key={week}
              onPress={() => setSelectedWeek(week)}
              style={[
                styles.weekPill,
                isSelected && styles.weekPillSelected,
                isCurrentWeek && !isSelected && styles.weekPillCurrent,
              ]}
            >
              <Typography
                variant="caption2"
                color={isSelected ? colors.textPrimary : colors.textSecondary}
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
                        { backgroundColor: w.status === 'completed' ? colors.success : colors.surfaceElevated },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Week content */}
      <ScrollView contentContainerStyle={styles.weekContent} showsVerticalScrollIndicator={false}>
        <View style={styles.weekHeaderRow}>
          <Typography variant="title3">Week {selectedWeek}</Typography>
          <Typography variant="callout" color={colors.textSecondary}>
            {completedCount}/{weekWorkouts.length} completed
          </Typography>
        </View>

        {plan.plan_data.weeks[selectedWeek - 1]?.theme && (
          <Typography variant="footnote" color={colors.primary} style={styles.weekTheme}>
            {plan.plan_data.weeks[selectedWeek - 1].theme}
          </Typography>
        )}

        {weekWorkouts.length === 0 && (
          <Typography variant="body" color={colors.textSecondary}>
            No workouts scheduled for this week.
          </Typography>
        )}

        {weekWorkouts.map((workout) => (
          <Card
            key={workout.id}
            style={[
              styles.workoutCard,
              workout.status === 'completed' && styles.workoutCompleted,
            ]}
            onPress={() => router.push(`/workout/${workout.id}`)}
          >
            <View style={styles.workoutRow}>
              <View
                style={[
                  styles.dayIndicator,
                  { backgroundColor: workoutTypeColors[workout.workout_type] || colors.primary },
                ]}
              />
              <View style={styles.workoutInfo}>
                <View style={styles.workoutTop}>
                  <Typography variant="caption1" color={colors.textTertiary}>
                    {dayName(workout.day_of_week)}
                  </Typography>
                  {workout.status === 'completed' && (
                    <Badge label="Done" color={colors.success} backgroundColor={`${colors.success}20`} />
                  )}
                  {workout.status === 'skipped' && (
                    <Badge label="Skipped" color={colors.textTertiary} />
                  )}
                </View>
                <Typography variant="headline" style={{ marginTop: 2 }}>
                  {workout.title}
                </Typography>
                <View style={styles.workoutDetails}>
                  <Typography variant="caption1" color={colors.textSecondary}>
                    {formatWorkoutType(workout.workout_type)}
                  </Typography>
                  <Typography variant="caption1" color={colors.textTertiary}> · </Typography>
                  <Typography variant="caption1" color={colors.textSecondary}>
                    {formatWorkoutDuration(workout.estimated_duration_minutes)}
                  </Typography>
                </View>
              </View>
            </View>
          </Card>
        ))}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  weekSelector: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  weekPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minWidth: 44,
  },
  weekPillSelected: {
    backgroundColor: colors.primary,
  },
  weekPillCurrent: {
    borderWidth: 1,
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
    paddingBottom: spacing.huge,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekTheme: {
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  workoutCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  workoutCompleted: {
    opacity: 0.6,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutDetails: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
});
