import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
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
import {
  WORKOUT_TYPE_OPTIONS,
  TIME_OPTIONS,
  generateInstantWorkout,
  type InstantWorkoutCategory,
  type IntensityLevel,
} from '@/services/instantWorkout';
import { getShoesWithWarnings, type Equipment } from '@/services/equipmentTracker';
import { colors, spacing, borderRadius, workoutTypeColors, glass, withOpacity } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { isRunningWorkout, type RunningWorkoutData } from '@/types/workout';

export default function TodayScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { plan, todayWorkout, workouts, isLoading } = usePlan();
  const { startWorkout } = useWorkout();

  const [showFeelingCheck, setShowFeelingCheck] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingLevel | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<SpecificIssue[]>([]);
  const [adjustmentResult, setAdjustmentResult] = useState<string | null>(null);

  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantStep, setInstantStep] = useState<'type' | 'time' | 'intensity'>('type');
  const [instantType, setInstantType] = useState<string | null>(null);
  const [instantTime, setInstantTime] = useState<number | null>(null);

  const [shoeWarnings] = useState<Equipment[]>([]);

  const completedThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1) && w.status === 'completed',
  ).length;
  const totalThisWeek = workouts.filter(
    (w) => w.week_number === (plan?.current_week ?? 1),
  ).length;

  const greeting = getGreeting();

  const handleStartWithFeelingCheck = () => {
    if (!todayWorkout) return;
    setShowFeelingCheck(true);
  };

  const handleFeelingSelected = (feeling: FeelingLevel) => {
    setSelectedFeeling(feeling);
    if (feeling === 'great' || feeling === 'good') {
      if (todayWorkout) {
        startWorkout(todayWorkout);
        setShowFeelingCheck(false);
        if (isRunningWorkout(todayWorkout.workout_data)) {
          router.push('/workout/run-active');
        } else {
          router.push('/workout/active');
        }
      }
    }
  };

  const handleIssuesConfirmed = () => {
    if (!todayWorkout || !selectedFeeling) return;
    const result = adjustWorkout(todayWorkout, selectedFeeling, selectedIssues);
    if (result.wasAdjusted) {
      setAdjustmentResult(result.explanation);
      startWorkout(result.adjustedWorkout);
    } else {
      startWorkout(todayWorkout);
    }
    setShowFeelingCheck(false);
    setSelectedFeeling(null);
    setSelectedIssues([]);
    if (isRunningWorkout(todayWorkout.workout_data)) {
      router.push('/workout/run-active');
    } else {
      router.push('/workout/active');
    }
  };

  const handleInstantWorkout = (intensity: IntensityLevel) => {
    if (!instantType || !instantTime) return;
    const workout = generateInstantWorkout({
      workoutTypeId: instantType,
      durationMinutes: instantTime,
      intensity,
    });
    startWorkout(workout);
    setShowInstantModal(false);
    setInstantStep('type');
    setInstantType(null);
    setInstantTime(null);
    if (isRunningWorkout(workout.workout_data)) {
      router.push('/workout/run-active');
    } else {
      router.push('/workout/active');
    }
  };

  const toggleIssue = (issue: SpecificIssue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue],
    );
  };

  const warnShoes = getShoesWithWarnings(shoeWarnings);
  const workoutColor = todayWorkout
    ? workoutTypeColors[todayWorkout.workout_type] || colors.primary
    : colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <Typography variant="callout" color={colors.textTertiary}>
            {greeting}
          </Typography>
          <Typography variant="largeTitle">
            {user?.full_name?.split(' ')[0] || 'Athlete'}
          </Typography>
        </Animated.View>

        {/* Shoe warning */}
        {warnShoes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.warningCard}>
            <Typography variant="footnote" color={colors.warning}>
              {'\uD83D\uDC5F'} {warnShoes[0].name} needs replacing — {Math.round(warnShoes[0].total_distance_km)}km logged
            </Typography>
          </Animated.View>
        )}

        {/* Adjustment feedback */}
        {adjustmentResult && (
          <Pressable onPress={() => setAdjustmentResult(null)} style={styles.adjustmentCard}>
            <Typography variant="footnote" color={colors.primary} style={{ flex: 1 }}>
              {adjustmentResult}
            </Typography>
            <Typography variant="caption2" color={colors.textTertiary}>Dismiss</Typography>
          </Pressable>
        )}

        {/* Week Progress */}
        {plan && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Card style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <View>
                  <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
                    WEEK {plan.current_week}
                  </Typography>
                  <Typography variant="title3" style={{ marginTop: 2 }}>
                    {completedThisWeek} of {totalThisWeek} sessions
                  </Typography>
                </View>
                <View style={styles.weekBadge}>
                  <Typography variant="headline" color={colors.primary}>
                    {totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0}%
                  </Typography>
                </View>
              </View>
              <ProgressBar
                progress={totalThisWeek > 0 ? completedThisWeek / totalThisWeek : 0}
                height={4}
                style={{ marginTop: spacing.lg }}
              />
            </Card>
          </Animated.View>
        )}

        {/* Today's Workout */}
        {todayWorkout ? (
          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.section}>
            <Typography variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
              TODAY'S SESSION
            </Typography>
            <Pressable
              onPress={() => router.push(`/workout/${todayWorkout.id}`)}
              style={[styles.workoutCard, { borderLeftColor: workoutColor }]}
            >
              <Badge
                label={formatWorkoutType(todayWorkout.workout_type)}
                color={workoutColor}
                backgroundColor={withOpacity(workoutColor, 0.12)}
              />
              <Typography variant="title2" style={{ marginTop: spacing.md }}>
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
                onPress={handleStartWithFeelingCheck}
                size="lg"
                fullWidth
                style={{ marginTop: spacing.xl }}
              />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={styles.restCard}>
              <Typography variant="title1" align="center" style={{ marginBottom: spacing.sm }}>
                {'\uD83D\uDE34'}
              </Typography>
              <Typography variant="title3" align="center">
                Rest Day
              </Typography>
              <Typography variant="callout" color={colors.textSecondary} align="center" style={{ marginTop: spacing.sm }}>
                Recovery is part of the plan.{'\n'}Your body builds strength while you rest.
              </Typography>
            </View>
          </Animated.View>
        )}

        {/* Instant Workout */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <TouchableOpacity
            style={styles.instantButton}
            onPress={() => setShowInstantModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.instantIcon}>
              <Typography variant="title3" color={colors.primary}>+</Typography>
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="callout" style={{ fontWeight: '600' }}>
                Instant Workout
              </Typography>
              <Typography variant="caption1" color={colors.textSecondary}>
                Quick session outside your plan
              </Typography>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Coming Up */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.section}>
          <Typography variant="caption1" color={colors.textTertiary} style={styles.sectionLabel}>
            COMING UP
          </Typography>
          {workouts
            .filter((w) => w.status === 'scheduled' && w.id !== todayWorkout?.id)
            .slice(0, 3)
            .map((workout, idx) => (
              <Pressable
                key={workout.id}
                style={styles.upcomingCard}
                onPress={() => router.push(`/workout/${workout.id}`)}
              >
                <View style={[styles.upcomingDot, { backgroundColor: workoutTypeColors[workout.workout_type] || colors.primary }]} />
                <View style={styles.upcomingText}>
                  <Typography variant="callout" style={{ fontWeight: '500' }}>{workout.title}</Typography>
                  <Typography variant="caption1" color={colors.textTertiary}>
                    {formatDate(workout.scheduled_date)} · {formatWorkoutDuration(workout.estimated_duration_minutes)}
                  </Typography>
                </View>
              </Pressable>
            ))}
          {workouts.filter((w) => w.status === 'scheduled' && w.id !== todayWorkout?.id).length === 0 && (
            <Typography variant="callout" color={colors.textTertiary} style={{ paddingVertical: spacing.lg }}>
              No upcoming workouts
            </Typography>
          )}
        </Animated.View>
      </ScrollView>

      {/* Feeling Check Modal */}
      <Modal visible={showFeelingCheck} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {!selectedFeeling || selectedFeeling === 'great' || selectedFeeling === 'good' ? (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xs }}>
                  How are you feeling?
                </Typography>
                <Typography variant="footnote" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
                  We'll adjust your workout if needed
                </Typography>
                <View style={styles.feelingGrid}>
                  {FEELING_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={styles.feelingCard}
                      onPress={() => handleFeelingSelected(opt.id)}
                      activeOpacity={0.7}
                    >
                      <Typography variant="title2" align="center">{opt.emoji}</Typography>
                      <Typography variant="callout" align="center" style={{ fontWeight: '600', marginTop: spacing.xs }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption2" color={colors.textSecondary} align="center" style={{ marginTop: 2 }}>
                        {opt.description}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button
                  title="Skip"
                  variant="ghost"
                  onPress={() => {
                    setShowFeelingCheck(false);
                    if (todayWorkout) {
                      startWorkout(todayWorkout);
                      if (isRunningWorkout(todayWorkout.workout_data)) {
                        router.push('/workout/run-active');
                      } else {
                        router.push('/workout/active');
                      }
                    }
                  }}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </>
            ) : (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xs }}>
                  What's going on?
                </Typography>
                <Typography variant="footnote" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
                  Select any that apply
                </Typography>
                <View style={styles.issueGrid}>
                  {SPECIFIC_ISSUES.map((issue) => {
                    const isSelected = selectedIssues.includes(issue.id);
                    return (
                      <TouchableOpacity
                        key={issue.id}
                        style={[styles.issueChip, isSelected && styles.issueChipSelected]}
                        onPress={() => toggleIssue(issue.id)}
                        activeOpacity={0.7}
                      >
                        <Typography variant="footnote">{issue.emoji}</Typography>
                        <Typography
                          variant="caption1"
                          color={isSelected ? colors.primary : colors.textSecondary}
                          style={{ fontWeight: isSelected ? '600' : '400' }}
                        >
                          {issue.label}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Button
                  title="Continue with Adjustment"
                  onPress={handleIssuesConfirmed}
                  fullWidth
                  style={{ marginTop: spacing.xl }}
                />
                <Button
                  title="Back"
                  variant="ghost"
                  onPress={() => setSelectedFeeling(null)}
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Instant Workout Modal */}
      <Modal visible={showInstantModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={{ maxHeight: '85%' }}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              {instantStep === 'type' && (
                <>
                  <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                    What do you want to do?
                  </Typography>
                  {(['run', 'strength', 'recovery'] as InstantWorkoutCategory[]).map((cat) => {
                    const items = WORKOUT_TYPE_OPTIONS.filter((o) => o.category === cat);
                    return (
                      <View key={cat} style={{ marginBottom: spacing.lg }}>
                        <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm }}>
                          {cat}
                        </Typography>
                        {items.map((opt) => (
                          <TouchableOpacity
                            key={opt.id}
                            style={styles.instantTypeRow}
                            onPress={() => { setInstantType(opt.id); setInstantStep('time'); }}
                            activeOpacity={0.7}
                          >
                            <Typography variant="body">{opt.emoji}</Typography>
                            <View style={{ flex: 1 }}>
                              <Typography variant="callout" style={{ fontWeight: '500' }}>{opt.label}</Typography>
                              <Typography variant="caption2" color={colors.textSecondary}>{opt.description}</Typography>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
                </>
              )}

              {instantStep === 'time' && (
                <>
                  <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                    How long?
                  </Typography>
                  <View style={styles.timeGrid}>
                    {TIME_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.minutes}
                        style={[styles.timeCard, instantTime === opt.minutes && styles.timeCardSelected]}
                        onPress={() => { setInstantTime(opt.minutes); setInstantStep('intensity'); }}
                        activeOpacity={0.7}
                      >
                        <Typography variant="title2" color={instantTime === opt.minutes ? colors.primary : colors.textPrimary} align="center">
                          {opt.minutes}
                        </Typography>
                        <Typography variant="caption2" color={colors.textSecondary} align="center">min</Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Button title="Back" variant="ghost" onPress={() => setInstantStep('type')} fullWidth style={{ marginTop: spacing.md }} />
                </>
              )}

              {instantStep === 'intensity' && (
                <>
                  <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                    How hard?
                  </Typography>
                  {([
                    { id: 'easy' as IntensityLevel, label: 'Easy', desc: 'Relaxed effort', color: colors.success },
                    { id: 'moderate' as IntensityLevel, label: 'Moderate', desc: 'Steady, purposeful', color: colors.warning },
                    { id: 'hard' as IntensityLevel, label: 'Hard', desc: 'Push yourself', color: colors.error },
                  ]).map((opt) => (
                    <TouchableOpacity key={opt.id} style={styles.intensityRow} onPress={() => handleInstantWorkout(opt.id)} activeOpacity={0.7}>
                      <View style={[styles.intensityDot, { backgroundColor: opt.color }]} />
                      <View style={{ flex: 1 }}>
                        <Typography variant="callout" style={{ fontWeight: '600' }}>{opt.label}</Typography>
                        <Typography variant="caption2" color={colors.textSecondary}>{opt.desc}</Typography>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Button title="Back" variant="ghost" onPress={() => setInstantStep('time')} fullWidth style={{ marginTop: spacing.md }} />
                </>
              )}

              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => { setShowInstantModal(false); setInstantStep('type'); setInstantType(null); setInstantTime(null); }}
                fullWidth
                style={{ marginTop: spacing.xs }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Typography variant="caption1" color={colors.textTertiary} style={{ letterSpacing: 0.5 }}>{label}</Typography>
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
  },
  header: {
    paddingTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  warningCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(251,191,36,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  adjustmentCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  weekCard: {
    marginBottom: spacing.xxl,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(34,211,238,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  workoutCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderLeftWidth: 3,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.xxxl,
  },
  metaItem: {
    gap: 2,
  },
  restCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  instantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
    borderStyle: 'dashed',
  },
  instantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,211,238,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    paddingTop: spacing.md,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  feelingCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    flexGrow: 1,
    flexBasis: '45%',
  },
  issueGrid: {
    gap: spacing.sm,
  },
  issueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...glass.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  issueChipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  instantTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  timeCard: {
    width: 80,
    paddingVertical: spacing.xl,
    ...glass.card,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  timeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
