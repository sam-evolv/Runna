import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import {
  colors,
  spacing,
  borderRadius,
  workoutTypeColors,
  withOpacity,
  shadows,
} from '@/constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface WeekDay {
  label: string;
  type: string;
  value: number; // 0..1 normalised bar height
}

interface PersonalRecord {
  exercise: string;
  value: string;
  date: string;
  icon: string;
}

interface RecentActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: string;
  detail: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_WEEK_DAYS: WeekDay[] = [
  { label: 'Mon', type: 'easy_run', value: 0.55 },
  { label: 'Tue', type: 'strength', value: 0.7 },
  { label: 'Wed', type: 'rest', value: 0.0 },
  { label: 'Thu', type: 'interval_run', value: 0.85 },
  { label: 'Fri', type: 'strength', value: 0.65 },
  { label: 'Sat', type: 'long_run', value: 1.0 },
  { label: 'Sun', type: 'rest', value: 0.0 },
];

const MOCK_PRS: PersonalRecord[] = [
  { exercise: '5K Run', value: '23:42', date: 'Mar 1, 2026', icon: '\u{1F3C3}' },
  { exercise: 'Bench Press', value: '85 kg', date: 'Feb 24, 2026', icon: '\u{1F4AA}' },
  { exercise: 'Deadlift', value: '140 kg', date: 'Feb 20, 2026', icon: '\u{1F525}' },
  { exercise: '10K Run', value: '51:08', date: 'Feb 15, 2026', icon: '\u{1F3C5}' },
  { exercise: 'Squat', value: '110 kg', date: 'Feb 10, 2026', icon: '\u26A1' },
];

const MOCK_RECENT: RecentActivity[] = [
  { id: '1', name: 'Easy Run', type: 'easy_run', date: 'Today', duration: '38 min', detail: '5.2 km' },
  { id: '2', name: 'Upper Body Strength', type: 'strength', date: 'Yesterday', duration: '52 min', detail: '6 exercises' },
  { id: '3', name: 'Interval Run', type: 'interval_run', date: '2 days ago', duration: '45 min', detail: '6.8 km' },
  { id: '4', name: 'Lower Body Strength', type: 'strength', date: '3 days ago', duration: '48 min', detail: '5 exercises' },
  { id: '5', name: 'Long Run', type: 'long_run', date: '5 days ago', duration: '1h 12m', detail: '14.3 km' },
  { id: '6', name: 'Recovery Run', type: 'recovery_run', date: '6 days ago', duration: '25 min', detail: '3.5 km' },
];

// ─── Training Load Data ─────────────────────────────────────────────────────────
const TRAINING_LOAD = [
  { label: 'Form', value: 0.72, color: colors.success },
  { label: 'Fitness', value: 0.85, color: '#3B82F6' },
  { label: 'Fatigue', value: 0.45, color: colors.running },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function ActivityScreen() {
  const { user } = useAuth();
  const { workouts } = usePlan();

  // Derive weekly stats from real workouts, fall back to mock for web
  const weekStats = useMemo(() => {
    if (Platform.OS !== 'web' && workouts.length > 0) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);

      const thisWeek = workouts.filter((w) => {
        if (!w.completed_at) return false;
        return new Date(w.completed_at) >= weekStart;
      });

      const sessions = thisWeek.length;
      const totalMinutes = thisWeek.reduce((s, w) => s + (w.estimated_duration_minutes || 0), 0);
      const hours = (totalMinutes / 60).toFixed(1);
      return { sessions, hours, distance: '--' };
    }
    // Web demo mock
    return { sessions: 5, hours: '4.2', distance: '32.6 km' };
  }, [workouts]);

  const streakDays = 12; // Mock streak

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.largeTitle}>Activity</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── This Week Stats ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {weekStats.sessions}
              </Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {weekStats.hours}h
              </Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F97316' }]}>
                {weekStats.distance}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Weekly Volume Chart ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Text style={styles.sectionLabel}>WEEKLY VOLUME</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBarsContainer}>
              {MOCK_WEEK_DAYS.map((day) => {
                const barColor =
                  day.value === 0
                    ? withOpacity(colors.textMuted, 0.15)
                    : workoutTypeColors[day.type] || colors.primary;
                const barHeight = Math.max(day.value * 120, day.value > 0 ? 12 : 6);

                return (
                  <View key={day.label} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: barHeight,
                            backgroundColor: barColor,
                            borderRadius: 6,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── Streak ────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakEmoji}>{'\u{1F525}'}</Text>
              <View>
                <Text style={styles.streakTitle}>{streakDays} Day Streak</Text>
                <Text style={styles.streakSubtitle}>
                  You're on fire! Keep the momentum going.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Personal Records ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Text style={styles.sectionLabel}>PERSONAL RECORDS</Text>
          <View style={styles.prsCard}>
            {MOCK_PRS.map((pr, idx) => (
              <View
                key={pr.exercise}
                style={[
                  styles.prRow,
                  idx < MOCK_PRS.length - 1 && styles.prRowBorder,
                ]}
              >
                <View style={styles.prIconWrap}>
                  <Text style={styles.prIcon}>{pr.icon}</Text>
                </View>
                <View style={styles.prInfo}>
                  <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prDate}>{pr.date}</Text>
                </View>
                <Text style={styles.prValue}>{pr.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Training Load ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionLabel}>TRAINING LOAD</Text>
          <View style={styles.loadCard}>
            {TRAINING_LOAD.map((item) => (
              <View key={item.label} style={styles.loadRow}>
                <Text style={styles.loadLabel}>{item.label}</Text>
                <View style={styles.loadBarTrack}>
                  <View
                    style={[
                      styles.loadBarFill,
                      {
                        width: `${item.value * 100}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.loadPercent, { color: item.color }]}>
                  {Math.round(item.value * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Recent Activities ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(480).duration(400)}>
          <Text style={styles.sectionLabel}>RECENT ACTIVITIES</Text>
          {MOCK_RECENT.map((activity, idx) => {
            const dotColor =
              workoutTypeColors[activity.type] || colors.primary;
            return (
              <Animated.View
                key={activity.id}
                entering={FadeInDown.delay(520 + idx * 60).duration(350)}
              >
                <View style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <View
                      style={[styles.activityDot, { backgroundColor: dotColor }]}
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName}>{activity.name}</Text>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityDuration}>{activity.duration}</Text>
                    <Text style={styles.activityDetail}>{activity.detail}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
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
  largeTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 22,
    minHeight: 6,
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  // Streak
  streakCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: withOpacity('#F97316', 0.2),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  streakSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  // Personal Records
  prsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  prRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  prIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  prIcon: {
    fontSize: 18,
  },
  prInfo: {
    flex: 1,
  },
  prExercise: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  prDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  prValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },

  // Training Load
  loadCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    width: 56,
  },
  loadBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: withOpacity(colors.textMuted, 0.12),
    borderRadius: 4,
    overflow: 'hidden',
  },
  loadBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadPercent: {
    fontSize: 13,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },

  // Recent Activities
  activityCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  activityDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityDuration: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  activityDetail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
