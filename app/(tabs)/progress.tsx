import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Flame, Trophy, TrendingUp, Activity, Clock, MapPin, Dumbbell, Brain } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  workoutTypeColors,
  withOpacity,
  shadows,
} from '@/constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface WeekDay {
  label: string;
  type: string;
  value: number;
}

interface PersonalRecord {
  exercise: string;
  value: string;
  date: string;
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
  { exercise: '5K Run', value: '23:42', date: 'Mar 1, 2026' },
  { exercise: 'Bench Press', value: '85 kg', date: 'Feb 24, 2026' },
  { exercise: 'Deadlift', value: '140 kg', date: 'Feb 20, 2026' },
  { exercise: '10K Run', value: '51:08', date: 'Feb 15, 2026' },
  { exercise: 'Squat', value: '110 kg', date: 'Feb 10, 2026' },
];

const MOCK_RECENT: RecentActivity[] = [
  { id: '1', name: 'Easy Run', type: 'easy_run', date: 'Today', duration: '38 min', detail: '5.2 km' },
  { id: '2', name: 'Upper Body Strength', type: 'strength', date: 'Yesterday', duration: '52 min', detail: '6 exercises' },
  { id: '3', name: 'Interval Run', type: 'interval_run', date: '2 days ago', duration: '45 min', detail: '6.8 km' },
  { id: '4', name: 'Lower Body Strength', type: 'strength', date: '3 days ago', duration: '48 min', detail: '5 exercises' },
  { id: '5', name: 'Long Run', type: 'long_run', date: '5 days ago', duration: '1h 12m', detail: '14.3 km' },
];

const TRAINING_LOAD = [
  { label: 'Form', value: 0.72, color: colors.success },
  { label: 'Fitness', value: 0.85, color: '#3B82F6' },
  { label: 'Fatigue', value: 0.45, color: '#F97316' },
];

// ─── Weekly Insights ────────────────────────────────────────────────────────────
const WEEKLY_INSIGHTS = [
  {
    title: 'Sleep Impact',
    message: 'On nights you sleep 7+ hours, your RPE scores are 18% lower. Prioritise sleep before hard sessions.',
  },
  {
    title: 'Consistency Streak',
    message: 'You have completed 12 consecutive training days. Your fitness score has improved 8% this month.',
  },
  {
    title: 'Performance Trend',
    message: 'Your 5km pace has improved from 5:30/km to 5:10/km over 6 weeks. On track for sub-25.',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const { user } = useAuth();
  const { workouts } = usePlan();

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
    return { sessions: 5, hours: '4.2', distance: '32.6 km' };
  }, [workouts]);

  const streakDays = 12;
  const insightIndex = Math.floor(Date.now() / 86400000) % WEEKLY_INSIGHTS.length;
  const currentInsight = WEEKLY_INSIGHTS[insightIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.largeTitle}>Progress</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── This Week Stats ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Activity size={18} color={colors.primary} strokeWidth={2} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {weekStats.sessions}
              </Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={18} color={colors.secondary} strokeWidth={2} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {weekStats.hours}h
              </Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statCard}>
              <MapPin size={18} color="#F97316" strokeWidth={2} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: '#F97316' }]}>
                {weekStats.distance}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Weekly Volume Chart ──────────────────────────────── */}
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

        {/* ── AI Insight Card ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(220).duration(400)}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Brain size={22} color={colors.primary} strokeWidth={2} />
              <View style={styles.insightBadge}>
                <Text style={styles.insightBadgeText}>AI INSIGHT</Text>
              </View>
            </View>
            <Text style={styles.insightTitle}>{currentInsight.title}</Text>
            <Text style={styles.insightMessage}>{currentInsight.message}</Text>
          </View>
        </Animated.View>

        {/* ── Streak ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(280).duration(400)}>
          <View style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <View style={styles.streakIconWrap}>
                <Flame size={24} color={colors.warning} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.streakTitle}>{streakDays} Day Streak</Text>
                <Text style={styles.streakSubtitle}>
                  Keep the momentum going!
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Personal Records ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(340).duration(400)}>
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
                  <Trophy size={18} color={colors.primary} strokeWidth={2} />
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

        {/* ── Training Load ───────────────────────────────────── */}
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

        {/* ── Recent Activities ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(460).duration(400)}>
          <Text style={styles.sectionLabel}>RECENT ACTIVITIES</Text>
          {MOCK_RECENT.map((activity, idx) => {
            const dotColor = workoutTypeColors[activity.type] || colors.primary;
            return (
              <Animated.View
                key={activity.id}
                entering={FadeInDown.delay(500 + idx * 60).duration(350)}
              >
                <View style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <View style={[styles.activityDot, { backgroundColor: dotColor }]} />
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
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  // Chart
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: 20,
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
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  // AI Insight
  insightCard: {
    backgroundColor: 'rgba(168,85,247,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.15)',
    borderRadius: borderRadius.lg,
    padding: 20,
    marginTop: spacing.xl,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightBadge: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  insightBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  insightTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  insightMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  // Streak
  streakCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: withOpacity(colors.warning, 0.2),
    borderRadius: borderRadius.lg,
    padding: 20,
    marginTop: spacing.md,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: withOpacity(colors.warning, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  streakSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  // Personal Records
  prsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  prRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
  prInfo: {
    flex: 1,
  },
  prExercise: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  prDate: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  prValue: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Training Load
  loadCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: 20,
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
    fontVariant: ['tabular-nums'],
  },

  // Recent Activities
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: spacing.md,
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
    color: '#6B7280',
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
    fontVariant: ['tabular-nums'],
  },
  activityDetail: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
});
