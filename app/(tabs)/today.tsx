import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration, formatDistance, formatPaceWithUnit } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { isRunningWorkout, type RunningWorkoutData, type StrengthWorkoutData } from '@/types/workout';

export default function TodayScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { plan, todayWorkout, workouts, isLoading } = usePlan();
  const { startWorkout } = useWorkout();

  // Feeling check state
  const [showFeelingCheck, setShowFeelingCheck] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingLevel | null>(null);
  const [selectedIssues, setSelectedIssues] = useState<SpecificIssue[]>([]);
  const [adjustmentResult, setAdjustmentResult] = useState<string | null>(null);

  // Instant workout state
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [instantStep, setInstantStep] = useState<'type' | 'time' | 'intensity'>('type');
  const [instantType, setInstantType] = useState<string | null>(null);
  const [instantTime, setInstantTime] = useState<number | null>(null);

  // Equipment warnings (would come from store/API in production)
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
      // No issues needed, start directly
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
      // Use adjusted workout
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

        {/* Shoe replacement warning */}
        {warnShoes.length > 0 && (
          <Card style={styles.warningCard}>
            <View style={styles.warningRow}>
              <Typography variant="footnote" color={colors.warning}>
                👟 {warnShoes[0].name} needs replacing — {Math.round(warnShoes[0].total_distance_km)}km logged
              </Typography>
            </View>
          </Card>
        )}

        {/* Adjustment result feedback */}
        {adjustmentResult && (
          <Card style={styles.adjustmentCard}>
            <Typography variant="footnote" color={colors.primary}>
              {adjustmentResult}
            </Typography>
            <TouchableOpacity onPress={() => setAdjustmentResult(null)}>
              <Typography variant="caption2" color={colors.textTertiary}>Dismiss</Typography>
            </TouchableOpacity>
          </Card>
        )}

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
                onPress={handleStartWithFeelingCheck}
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

        {/* Instant Workout Button */}
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
                      <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.sm }}>
                        {cat}
                      </Typography>
                      {items.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          style={styles.instantTypeRow}
                          onPress={() => {
                            setInstantType(opt.id);
                            setInstantStep('time');
                          }}
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
                      onPress={() => {
                        setInstantTime(opt.minutes);
                        setInstantStep('intensity');
                      }}
                      activeOpacity={0.7}
                    >
                      <Typography
                        variant="title2"
                        color={instantTime === opt.minutes ? colors.primary : colors.textPrimary}
                        align="center"
                      >
                        {opt.minutes}
                      </Typography>
                      <Typography variant="caption2" color={colors.textSecondary} align="center">min</Typography>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button
                  title="Back"
                  variant="ghost"
                  onPress={() => setInstantStep('type')}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
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
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.intensityRow}
                    onPress={() => handleInstantWorkout(opt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.intensityDot, { backgroundColor: opt.color }]} />
                    <View style={{ flex: 1 }}>
                      <Typography variant="callout" style={{ fontWeight: '600' }}>{opt.label}</Typography>
                      <Typography variant="caption2" color={colors.textSecondary}>{opt.desc}</Typography>
                    </View>
                  </TouchableOpacity>
                ))}
                <Button
                  title="Back"
                  variant="ghost"
                  onPress={() => setInstantStep('time')}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}

            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => {
                setShowInstantModal(false);
                setInstantStep('type');
                setInstantType(null);
                setInstantTime(null);
              }}
              fullWidth
              style={{ marginTop: spacing.xs }}
            />
          </View>
        </View>
      </Modal>
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
  warningCard: {
    marginBottom: spacing.md,
    backgroundColor: `${colors.warning}10`,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustmentCard: {
    marginBottom: spacing.md,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Instant Workout Button
  instantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  instantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Upcoming
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    paddingTop: spacing.md,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  // Feeling
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  feelingCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  issueChipSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  // Instant Workout
  instantTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  intensityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
