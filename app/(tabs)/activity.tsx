import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/api';
import { colors, spacing, borderRadius, workoutTypeColors, withOpacity } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatRelative } from '@/utils/dateUtils';
import type { Activity } from '@/types/activity';

// Mock PRs for display
const MOCK_PRS = [
  { exercise: 'Bench Press', value: '80kg', date: '2 days ago' },
  { exercise: '5K Run', value: '24:30', date: '1 week ago' },
  { exercise: 'Squat', value: '100kg', date: '1 week ago' },
  { exercise: 'Deadlift', value: '120kg', date: '2 weeks ago' },
  { exercise: '10K Run', value: '52:15', date: '3 weeks ago' },
];

export default function ActivityScreen() {
  const user = useAuthStore((s) => s.user);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

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

    // Calculate streak
    if (data && data.length > 0) {
      let streak = 0;
      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasActivity = data.some((a: Activity) => a.started_at.startsWith(dateStr));
        if (hasActivity || i === 0) {
          if (hasActivity) streak++;
        } else {
          break;
        }
      }
      setCurrentStreak(streak);
    }
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
        {/* This Week Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
            THIS WEEK
          </Typography>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Typography variant="title2" color={colors.primary}>{thisWeekActivities.length}</Typography>
              <Typography variant="caption2" color={colors.textMuted}>Sessions</Typography>
            </View>
            <View style={styles.statCard}>
              <Typography variant="title2" color={colors.secondary}>{formatWorkoutDuration(Math.round(weeklyDurationMin))}</Typography>
              <Typography variant="caption2" color={colors.textMuted}>Time</Typography>
            </View>
            <View style={styles.statCard}>
              <Typography variant="title2" color={colors.accent}>{formatDistance(weeklyDistanceKm)}</Typography>
              <Typography variant="caption2" color={colors.textMuted}>Distance</Typography>
            </View>
          </View>
        </Animated.View>

        {/* Streak */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.streakCard}>
            <Typography variant="title2" style={{ marginRight: spacing.sm }}>
              {'\u{1F525}'}
            </Typography>
            <View style={{ flex: 1 }}>
              <Typography variant="headline">{currentStreak} day streak</Typography>
              <Typography variant="caption2" color={colors.textMuted}>Keep it going!</Typography>
            </View>
          </View>
        </Animated.View>

        {/* Personal Records */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
            PERSONAL RECORDS
          </Typography>
          {MOCK_PRS.map((pr, idx) => (
            <View key={idx} style={styles.prRow}>
              <Typography variant="callout" style={{ marginRight: spacing.sm }}>{'\u{1F3C6}'}</Typography>
              <View style={{ flex: 1 }}>
                <Typography variant="callout" style={{ fontWeight: '500' }}>{pr.exercise}</Typography>
                <Typography variant="caption2" color={colors.textMuted}>{pr.date}</Typography>
              </View>
              <Typography variant="headline" color={colors.primary}>{pr.value}</Typography>
            </View>
          ))}
        </Animated.View>

        {/* Strength Progress Chart (simple SVG) */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
            STRENGTH PROGRESS
          </Typography>
          <View style={styles.chartCard}>
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartBars}>
                {[40, 55, 50, 65, 60, 72, 68, 80].map((height, i) => (
                  <View key={i} style={styles.chartBarCol}>
                    <View style={[styles.chartBar, { height: height, backgroundColor: withOpacity(colors.primary, 0.7 + i * 0.03) }]} />
                    <Typography variant="caption2" color={colors.textMuted} style={{ marginTop: 4, textAlign: 'center' }}>
                      W{i + 1}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activities */}
        <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
          RECENT ACTIVITIES
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
            icon={'\u{1F3C3}'}
            title="No activities yet"
            message="Complete your first workout and it will appear here"
          />
        )}

        {activities.slice(0, 10).map((activity, idx) => (
          <Animated.View key={activity.id} entering={FadeInDown.delay(500 + idx * 60).duration(400)}>
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: withOpacity(workoutTypeColors[activity.activity_type] || colors.primary, 0.15) }]}>
                  <Typography variant="caption1" style={{ textAlign: 'center' }}>
                    {activity.activity_type.includes('run') ? '\u{1F3C3}' : '\u{1F4AA}'}
                  </Typography>
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="callout" style={{ fontWeight: '500' }}>
                    {formatWorkoutType(activity.activity_type)}
                  </Typography>
                  <Typography variant="caption2" color={colors.textMuted}>
                    {formatRelative(activity.started_at)}
                  </Typography>
                </View>
              </View>

              <View style={styles.activityStats}>
                {activity.duration_seconds != null && activity.duration_seconds > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="headline">{formatWorkoutDuration(Math.round(activity.duration_seconds / 60))}</Typography>
                    <Typography variant="caption2" color={colors.textMuted}>Duration</Typography>
                  </View>
                )}
                {activity.distance_km != null && activity.distance_km > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="headline">{formatDistance(activity.distance_km)}</Typography>
                    <Typography variant="caption2" color={colors.textMuted}>Distance</Typography>
                  </View>
                )}
                {activity.avg_pace_min_km != null && activity.avg_pace_min_km > 0 && (
                  <View style={styles.statItem}>
                    <Typography variant="headline">{formatPaceWithUnit(activity.avg_pace_min_km)}</Typography>
                    <Typography variant="caption2" color={colors.textMuted}>Pace</Typography>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 16,
    borderRadius: 4,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    gap: 2,
  },
});
