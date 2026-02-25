import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePlan } from '@/hooks/usePlan';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { isRunningWorkout, type RunningWorkoutData, type StrengthWorkoutData } from '@/types/workout';

export default function TodayScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { plan, todayWorkout, workouts, isLoading } = usePlan();

  const completedThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1) && w.status === 'completed',
  ).length;
  const totalThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1),
  ).length;

  const greeting = getGreeting();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="title3" color={colors.textSecondary}>
            {greeting}
          </Typography>
          <Typography variant="largeTitle">
            {user?.full_name?.split(' ')[0] || 'Athlete'}
          </Typography>
        </View>

        {/* Week Progress */}
        {plan && (
          <Card style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <Typography variant="headline">
                Week {plan.current_week} of {plan.total_weeks}
              </Typography>
              <Typography variant="callout" color={colors.textSecondary}>
                {completedThisWeek}/{totalThisWeek} done
              </Typography>
            </View>
            <ProgressBar
              progress={totalThisWeek > 0 ? completedThisWeek / totalThisWeek : 0}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Today's Workout */}
        {todayWorkout ? (
          <View style={styles.section}>
            <Typography variant="headline" style={styles.sectionTitle}>
              Today's Workout
            </Typography>
            <Card
              style={[
                styles.workoutCard,
                { borderLeftColor: workoutTypeColors[todayWorkout.workout_type] || colors.primary, borderLeftWidth: 4 },
              ]}
              onPress={() => router.push(`/workout/${todayWorkout.id}`)}
            >
              <Badge
                label={formatWorkoutType(todayWorkout.workout_type)}
                color={workoutTypeColors[todayWorkout.workout_type] || colors.primary}
                backgroundColor={`${workoutTypeColors[todayWorkout.workout_type] || colors.primary}20`}
              />
              <Typography variant="title2" style={{ marginTop: spacing.sm }}>
                {todayWorkout.title}
              </Typography>
              {todayWorkout.description && (
                <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                  {todayWorkout.description}
                </Typography>
              )}

              <View style={styles.workoutMeta}>
                <MetaItem label="Duration" value={formatWorkoutDuration(todayWorkout.estimated_duration_minutes)} />
                {isRunningWorkout(todayWorkout.workout_data) && (
                  <MetaItem
                    label="Distance"
                    value={formatDistance((todayWorkout.workout_data as RunningWorkoutData).total_distance_km)}
                  />
                )}
              </View>

              <Button
                title="Start Workout"
                onPress={() => router.push(`/workout/${todayWorkout.id}`)}
                size="lg"
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </Card>
          </View>
        ) : (
          <Card style={styles.restCard}>
            <Typography variant="title2" align="center">
              Rest Day
            </Typography>
            <Typography variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
              Recovery is part of the plan. Your body builds strength while you rest.
            </Typography>
          </Card>
        )}

        {/* Upcoming */}
        <View style={styles.section}>
          <Typography variant="headline" style={styles.sectionTitle}>
            Coming Up
          </Typography>
          {workouts
            .filter((w) => w.status === 'scheduled' && w.id !== todayWorkout?.id)
            .slice(0, 3)
            .map((workout) => (
              <Card
                key={workout.id}
                style={styles.upcomingCard}
                onPress={() => router.push(`/workout/${workout.id}`)}
              >
                <View style={styles.upcomingRow}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: workoutTypeColors[workout.workout_type] || colors.primary },
                    ]}
                  />
                  <View style={styles.upcomingText}>
                    <Typography variant="callout">{workout.title}</Typography>
                    <Typography variant="caption1" color={colors.textSecondary}>
                      {formatDate(workout.scheduled_date)} · {formatWorkoutDuration(workout.estimated_duration_minutes)}
                    </Typography>
                  </View>
                </View>
              </Card>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Typography variant="caption1" color={colors.textTertiary}>{label}</Typography>
      <Typography variant="headline">{value}</Typography>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  weekCard: {
    marginBottom: spacing.xxl,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  workoutCard: {
    borderRadius: borderRadius.lg,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xxl,
  },
  metaItem: {
    gap: spacing.xs,
  },
  restCard: {
    marginBottom: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  upcomingCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  upcomingText: {
    flex: 1,
  },
});
