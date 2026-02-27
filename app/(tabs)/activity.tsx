import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/api';
import { colors, spacing, borderRadius, workoutTypeColors, glass } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatRelative } from '@/utils/dateUtils';
import type { Activity } from '@/types/activity';

export default function ActivityScreen() {
  const user = useAuthStore((s) => s.user);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadActivities();
  }, [user?.id]);

  const loadActivities = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user!.id)
      .order('started_at', { ascending: false })
      .limit(50);
    setActivities(data || []);
    setIsLoading(false);
  };

  const thisWeekActivities = activities.filter((a) => {
    const activityDate = new Date(a.started_at);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    return activityDate >= weekStart;
  });

  const weeklyDistanceKm = thisWeekActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
  const weeklyDurationMin = thisWeekActivities.reduce((sum, a) => sum + ((a.duration_seconds || 0) / 60), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Typography variant="largeTitle">Activity</Typography>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Summary */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.summaryCard}>
            <Typography variant="caption1" color={colors.textTertiary} style={styles.summaryLabel}>
              THIS WEEK
            </Typography>
            <View style={styles.statsRow}>
              <StatBox label="Distance" value={formatDistance(weeklyDistanceKm)} />
              <View style={styles.statDivider} />
              <StatBox label="Time" value={formatWorkoutDuration(Math.round(weeklyDurationMin))} />
              <View style={styles.statDivider} />
              <StatBox label="Sessions" value={String(thisWeekActivities.length)} />
            </View>
          </View>
        </Animated.View>

        {/* Activity List */}
        <Typography variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
          RECENT
        </Typography>

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {activities.length === 0 && !isLoading && (
          <EmptyState
            icon={'\uD83C\uDFC3'}
            title="No activities yet"
            message="Complete your first workout and it will appear here"
          />
        )}

        {activities.map((activity, idx) => (
          <Animated.View key={activity.id} entering={FadeInDown.delay(200 + idx * 60).duration(400)}>
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Badge
                  label={formatWorkoutType(activity.activity_type)}
                  color={workoutTypeColors[activity.activity_type] || colors.primary}
                  backgroundColor={`${workoutTypeColors[activity.activity_type] || colors.primary}15`}
                />
                <Typography variant="caption1" color={colors.textTertiary}>
                  {formatRelative(activity.started_at)}
                </Typography>
              </View>

              <View style={styles.activityStats}>
                {activity.distance_km != null && activity.distance_km > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="title3">{formatDistance(activity.distance_km)}</Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>Distance</Typography>
                  </View>
                )}
                {activity.duration_seconds != null && activity.duration_seconds > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="title3">{formatWorkoutDuration(Math.round(activity.duration_seconds / 60))}</Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>Duration</Typography>
                  </View>
                )}
                {activity.avg_pace_min_km != null && activity.avg_pace_min_km > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="title3">{formatPaceWithUnit(activity.avg_pace_min_km)}</Typography>
                    <Typography variant="caption2" color={colors.textTertiary}>Avg Pace</Typography>
                  </View>
                )}
              </View>

              {activity.source !== 'app' && (
                <Typography variant="caption2" color={colors.textTertiary} style={styles.sourceLabel}>
                  via {activity.source.replace('_', ' ')}
                </Typography>
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Typography variant="title2" color={colors.primary}>{value}</Typography>
      <Typography variant="caption2" color={colors.textTertiary} style={{ marginTop: 2 }}>{label}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
  },
  summaryCard: {
    ...glass.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  summaryLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  activityCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activityStats: {
    flexDirection: 'row',
    gap: spacing.xxl,
  },
  statItem: {
    gap: 2,
  },
  sourceLabel: {
    marginTop: spacing.md,
    textTransform: 'capitalize',
  },
});
