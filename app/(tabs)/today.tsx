import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePlan } from '@/hooks/usePlan';
import { useAuthStore } from '@/stores/authStore';
import { useWorkout } from '@/hooks/useWorkout';
import {
  FEELING_OPTIONS,
  SPECIFIC_ISSUES,
  adjustWorkout,
  type FeelingLevel,
  type SpecificIssue,
} from '@/services/feelingAdjustment';
import { colors, spacing, borderRadius, workoutTypeColors, glass, withOpacity } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { isRunningWorkout, type RunningWorkoutData } from '@/types/workout';

const FEELING_EMOJIS = [
  { id: 'tired' as const, emoji: '\u{1F634}', label: 'Tired' },
  { id: 'okay' as const, emoji: '\u{1F610}', label: 'Average' },
  { id: 'good' as const, emoji: '\u{1F4AA}', label: 'Good' },
  { id: 'great' as const, emoji: '\u{1F525}', label: 'Amazing' },
];

const AI_COACH_MESSAGES = [
  "Focus on consistency this week. Every session counts toward your goal.",
  "Recovery is when you get stronger. Rest days are as important as training days.",
  "You're building a solid foundation. Trust the process.",
  "Great work staying consistent. Your body is adapting well.",
  "Remember: quality over quantity. Execute each rep with intention.",
];

export default function TodayScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { plan, todayWorkout, workouts, isLoading } = usePlan();
  const { startWorkout } = useWorkout();

  const [showFeelingCheck, setShowFeelingCheck] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingLevel | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<SpecificIssue[]>([]);
  const [adjustmentResult, setAdjustmentResult] = useState<string | null>(null);
  const [feelingSelected, setFeelingSelected] = useState(false);

  const completedThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1) && w.status === 'completed',
  ).length;
  const totalThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1),
  ).length;

  const greeting = getGreeting();
  const coachMessage = AI_COACH_MESSAGES[Math.floor(Date.now() / 86400000) % AI_COACH_MESSAGES.length];

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    startWorkout(todayWorkout);
    if (isRunningWorkout(todayWorkout.workout_data)) {
      router.push('/workout/run-active');
    } else {
      router.push('/workout/active');
    }
  };

  const handleFeelingTap = (feeling: typeof FEELING_EMOJIS[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeelingSelected(true);

    if (feeling.id === 'tired' && todayWorkout) {
      const result = adjustWorkout(todayWorkout, 'tired', ['previous_hard_session']);
      if (result.wasAdjusted) {
        setAdjustmentResult('Got it! Your workout has been adjusted.');
      }
    }
  };

  const workoutColor = todayWorkout
    ? workoutTypeColors[todayWorkout.workout_type] || colors.primary
    : colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <Typography variant="callout" color={colors.textMuted}>
            {greeting}
          </Typography>
          <Typography variant="largeTitle">
            {user?.full_name?.split(' ')[0] || 'Athlete'}
          </Typography>
          {plan && (
            <Typography variant="caption1" color={colors.primary} style={{ marginTop: spacing.xs, fontWeight: '600' }}>
              Week {plan.current_week} of {plan.total_weeks}
            </Typography>
          )}
        </Animated.View>

        {/* Adjustment feedback */}
        {adjustmentResult && (
          <Pressable onPress={() => setAdjustmentResult(null)} style={styles.adjustmentCard}>
            <Typography variant="footnote" color={colors.success} style={{ flex: 1 }}>
              {adjustmentResult}
            </Typography>
            <Typography variant="caption2" color={colors.textMuted}>Dismiss</Typography>
          </Pressable>
        )}

        {/* Today's Workout Card */}
        {todayWorkout ? (
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.id}`)}
              style={[styles.workoutCard, { borderLeftColor: workoutColor }]}
            >
              <Badge
                label={formatWorkoutType(todayWorkout.workout_type)}
                color={workoutColor}
                backgroundColor={withOpacity(workoutColor, 0.12)}
              />
              <Typography variant="title1" style={{ marginTop: spacing.sm }}>
                {todayWorkout.title}
              </Typography>
              {todayWorkout.description && (
                <Typography variant="callout" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: spacing.xs }}>
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
                onPress={handleStartWorkout}
                size="lg"
                fullWidth
                style={{ marginTop: spacing.lg }}
              />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <View style={styles.restCard}>
              <Typography variant="title1" align="center" style={{ marginBottom: spacing.sm }}>
                {'\u{1F34C}'}
              </Typography>
              <Typography variant="title3" align="center">
                Rest Day
              </Typography>
              <Typography variant="callout" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
                Recovery is part of the plan.{'\n'}Your body builds strength while you rest.
              </Typography>
              {workouts.filter((w) => w.status === 'scheduled').length > 0 && (
                <View style={styles.nextWorkoutPreview}>
                  <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                    NEXT UP
                  </Typography>
                  <Typography variant="callout" color={colors.textSecondary}>
                    {workouts.filter((w) => w.status === 'scheduled')[0]?.title || 'Upcoming session'}
                  </Typography>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Weekly Progress */}
        {plan && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <View style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '700', letterSpacing: 1.5 }}>
                  WEEKLY PROGRESS
                </Typography>
                <Typography variant="headline" color={colors.primary}>
                  {completedThisWeek}/{totalThisWeek}
                </Typography>
              </View>
              <ProgressBar
                progress={totalThisWeek > 0 ? completedThisWeek / totalThisWeek : 0}
                height={6}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </Animated.View>
        )}

        {/* AI Coach Message */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <View style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={styles.coachAvatar}>
                <Typography variant="caption1" style={{ textAlign: 'center' }}>{'\u{1F9E0}'}</Typography>
              </View>
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '700' }}>AI COACH</Typography>
            </View>
            <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
              {coachMessage}
            </Typography>
            <TouchableOpacity
              style={styles.coachButton}
              onPress={() => router.push('/coach/chat' as any)}
              activeOpacity={0.7}
            >
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600' }}>
                Chat with Coach
              </Typography>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* How are you feeling? */}
        {!feelingSelected && (
          <Animated.View entering={FadeInDown.delay(450).duration(400)}>
            <View style={styles.feelingCard}>
              <Typography variant="caption1" color={colors.textMuted} style={{ fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm }}>
                HOW ARE YOU FEELING?
              </Typography>
              <View style={styles.feelingRow}>
                {FEELING_EMOJIS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.feelingOption}
                    onPress={() => handleFeelingTap(f)}
                    activeOpacity={0.7}
                  >
                    <Typography variant="title2" align="center">{f.emoji}</Typography>
                    <Typography variant="caption2" color={colors.textMuted} style={{ marginTop: 2, textAlign: 'center' }}>
                      {f.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Coming Up */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.section}>
          <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
            COMING UP
          </Typography>
          {workouts
            .filter((w) => w.status === 'scheduled' && w.id !== todayWorkout?.id)
            .slice(0, 3)
            .map((workout) => (
              <Pressable
                key={workout.id}
                style={styles.upcomingCard}
                onPress={() => router.push(`/workout/${workout.id}`)}
              >
                <View style={[styles.upcomingDot, { backgroundColor: workoutTypeColors[workout.workout_type] || colors.primary }]} />
                <View style={styles.upcomingText}>
                  <Typography variant="callout" style={{ fontWeight: '500' }}>{workout.title}</Typography>
                  <Typography variant="caption1" color={colors.textMuted}>
                    {formatDate(workout.scheduled_date)} · {formatWorkoutDuration(workout.estimated_duration_minutes)}
                  </Typography>
                </View>
              </Pressable>
            ))}
          {workouts.filter((w) => w.status === 'scheduled' && w.id !== todayWorkout?.id).length === 0 && (
            <Typography variant="callout" color={colors.textMuted} style={{ paddingVertical: spacing.md }}>
              No upcoming workouts
            </Typography>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Typography variant="caption1" color={colors.textMuted} style={{ letterSpacing: 0.5 }}>{label}</Typography>
      <Typography variant="headline" style={{ marginTop: 2 }}>{value}</Typography>
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
    paddingBottom: spacing.massive,
  },
  header: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  adjustmentCard: {
    marginBottom: spacing.md,
    backgroundColor: withOpacity(colors.success, 0.08),
    borderWidth: 1,
    borderColor: withOpacity(colors.success, 0.15),
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  workoutCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  metaItem: {
    gap: 2,
  },
  restCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  nextWorkoutPreview: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coachCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  feelingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  feelingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  feelingOption: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  upcomingText: {
    flex: 1,
  },
});
