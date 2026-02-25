import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/api';
import { colors, spacing, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatRelative, formatDate } from '@/utils/dateUtils';
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

  // Weekly summary
  const thisWeekActivities = activities.filter((a) => {
    const activityDate = new Date(a.started_at);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    return activityDate >= weekStart;
  });

  const weeklyDistanceKm = thisWeekActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
  const weeklyDurationMin = thisWeekActivities.reduce((sum, a) => sum + ((a.duration_seconds || 0) / 60), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="largeTitle">Activity</Typography>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Summary */}
        <Card style={styles.summaryCard}>
          <Typography variant="headline" style={styles.summaryTitle}>This Week</Typography>
          <View style={styles.statsRow}>
            <StatBox label="Distance" value={formatDistance(weeklyDistanceKm)} />
            <StatBox label="Time" value={formatWorkoutDuration(Math.round(weeklyDurationMin))} />
            <StatBox label="Workouts" value={String(thisWeekActivities.length)} />
          </View>
        </Card>

        {/* Activity List */}
        <Typography variant="headline" style={styles.sectionTitle}>
          Recent Activity
        </Typography>

        {activities.length === 0 && !isLoading && (
          <Card>
            <Typography variant="body" color={colors.textSecondary} align="center">
              No activities yet. Complete your first workout!
            </Typography>
          </Card>
        )}

        {activities.map((activity) => (
          <Card key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Badge
                label={formatWorkoutType(activity.activity_type)}
                color={workoutTypeColors[activity.activity_type] || colors.primary}
                backgroundColor={`${workoutTypeColors[activity.activity_type] || colors.primary}20`}
              />
              <Typography variant="caption1" color={colors.textTertiary}>
                {formatRelative(activity.started_at)}
              </Typography>
            </View>

            <View style={styles.activityStats}>
              {activity.distance_km && (
                <View style={styles.statItem}>
                  <Typography variant="title3">{formatDistance(activity.distance_km)}</Typography>
                  <Typography variant="caption2" color={colors.textTertiary}>Distance</Typography>
                </View>
              )}
              {activity.duration_seconds && (
                <View style={styles.statItem}>
                  <Typography variant="title3">{formatWorkoutDuration(Math.round(activity.duration_seconds / 60))}</Typography>
                  <Typography variant="caption2" color={colors.textTertiary}>Duration</Typography>
                </View>
              )}
              {activity.avg_pace_min_km && (
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
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Typography variant="title3" color={colors.primary}>{value}</Typography>
      <Typography variant="caption2" color={colors.textTertiary}>{label}</Typography>
    </View>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  summaryCard: {
    marginBottom: spacing.xxl,
  },
  summaryTitle: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  activityCard: {
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
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
});
