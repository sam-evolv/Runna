import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { usePlan } from '@/hooks/usePlan';
import {
  getStrategyOptions,
  recommendRealignment,
  type RealignmentStrategy,
} from '@/services/holidayMode';
import {
  calculateBRaceAdjustment,
  getDistanceLabel,
  type RaceDistance,
  type RaceEffort,
} from '@/services/bRaceSupport';
import { colors, spacing, borderRadius, workoutTypeColors } from '@/constants/theme';
import { formatWorkoutType, formatWorkoutDuration } from '@/utils/formatters';
import { dayName } from '@/utils/dateUtils';
import { differenceInDays, parseISO } from 'date-fns';

const RACE_DISTANCES: { id: RaceDistance; label: string }[] = [
  { id: '5k', label: '5K' },
  { id: '10k', label: '10K' },
  { id: 'half_marathon', label: 'Half Marathon' },
  { id: 'marathon', label: 'Marathon' },
  { id: 'other', label: 'Other' },
];

const RACE_EFFORTS: { id: RaceEffort; label: string; desc: string; color: string }[] = [
  { id: 'all_out', label: 'All Out', desc: 'Full taper & recovery', color: colors.error },
  { id: 'hard', label: 'Hard', desc: 'Light taper, moderate recovery', color: colors.warning },
  { id: 'moderate', label: 'Moderate', desc: 'Minimal adjustment', color: colors.primary },
  { id: 'fun_run', label: 'Fun Run', desc: 'No plan changes needed', color: colors.success },
];

export default function PlanScreen() {
  const router = useRouter();
  const { plan, workouts, getWorkoutsForWeek, isLoading } = usePlan();
  const [selectedWeek, setSelectedWeek] = useState(plan?.current_week ?? 1);

  // Holiday mode
  const [showHoliday, setShowHoliday] = useState(false);
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [holidayStrategy, setHolidayStrategy] = useState<RealignmentStrategy | null>(null);
  const [holidayResult, setHolidayResult] = useState<string | null>(null);

  // B-Race
  const [showBRace, setShowBRace] = useState(false);
  const [bRaceStep, setBRaceStep] = useState<'name' | 'distance' | 'effort' | 'result'>('name');
  const [bRaceName, setBRaceName] = useState('');
  const [bRaceDate, setBRaceDate] = useState('');
  const [bRaceDistance, setBRaceDistance] = useState<RaceDistance | null>(null);
  const [bRaceEffort, setBRaceEffort] = useState<RaceEffort | null>(null);
  const [bRaceResult, setBRaceResult] = useState<string | null>(null);

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

  const handleHolidayConfirm = () => {
    if (!holidayStart || !holidayEnd || !holidayStrategy) return;
    const result = recommendRealignment(workouts, holidayStart, holidayEnd, 'holiday', holidayStrategy);
    setHolidayResult(result.explanation);
    setShowHoliday(false);
    setHolidayStart('');
    setHolidayEnd('');
    setHolidayStrategy(null);
  };

  const handleBRaceConfirm = (effort?: RaceEffort) => {
    const eff = effort ?? bRaceEffort;
    if (!bRaceName || !bRaceDate || !bRaceDistance || !eff) return;
    const result = calculateBRaceAdjustment(
      { name: bRaceName, race_date: bRaceDate, distance: bRaceDistance, effort: eff, priority: 'b', notes: null },
      workouts,
    );
    setBRaceEffort(eff);
    setBRaceResult(result.explanation);
    setBRaceStep('result');
  };

  const daysAway = holidayStart && holidayEnd
    ? differenceInDays(parseISO(holidayEnd), parseISO(holidayStart)) + 1
    : 0;
  const strategyOptions = daysAway > 0 ? getStrategyOptions(daysAway) : [];

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

        {/* Holiday / B-Race result feedback */}
        {holidayResult && (
          <Card style={styles.feedbackCard}>
            <Typography variant="footnote" color={colors.primary}>{holidayResult}</Typography>
            <TouchableOpacity onPress={() => setHolidayResult(null)}>
              <Typography variant="caption2" color={colors.textTertiary}>Dismiss</Typography>
            </TouchableOpacity>
          </Card>
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

        {/* Plan Actions */}
        <View style={styles.planActions}>
          <TouchableOpacity
            style={styles.planActionRow}
            onPress={() => setShowHoliday(true)}
            activeOpacity={0.7}
          >
            <Typography variant="body">✈️</Typography>
            <View style={{ flex: 1 }}>
              <Typography variant="callout" style={{ fontWeight: '500' }}>Going on Holiday?</Typography>
              <Typography variant="caption2" color={colors.textTertiary}>
                Pause or adjust your plan while you're away
              </Typography>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.planActionRow}
            onPress={() => setShowBRace(true)}
            activeOpacity={0.7}
          >
            <Typography variant="body">🏁</Typography>
            <View style={{ flex: 1 }}>
              <Typography variant="callout" style={{ fontWeight: '500' }}>Add a B-Race</Typography>
              <Typography variant="caption2" color={colors.textTertiary}>
                Add a secondary race with automatic taper/recovery
              </Typography>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Holiday Modal */}
      <Modal visible={showHoliday} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Typography variant="title3" align="center" style={{ marginBottom: spacing.xs }}>
                Holiday Mode
              </Typography>
              <Typography variant="footnote" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
                Tell us when you'll be away and we'll adjust your plan
              </Typography>

              <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                START DATE (YYYY-MM-DD)
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="2026-03-15"
                placeholderTextColor={colors.textTertiary}
                value={holidayStart}
                onChangeText={setHolidayStart}
              />

              <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm }}>
                END DATE (YYYY-MM-DD)
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="2026-03-22"
                placeholderTextColor={colors.textTertiary}
                value={holidayEnd}
                onChangeText={setHolidayEnd}
              />

              {daysAway > 0 && (
                <>
                  <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.lg }}>
                    STRATEGY
                  </Typography>
                  {strategyOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.strategyCard,
                        holidayStrategy === opt.id && styles.strategyCardSelected,
                      ]}
                      onPress={() => setHolidayStrategy(opt.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.strategyHeader}>
                        <Typography variant="body">{opt.emoji}</Typography>
                        <Typography variant="callout" style={{ fontWeight: '600', flex: 1 }}>
                          {opt.label}
                        </Typography>
                        {opt.recommended && (
                          <Badge label="Recommended" color={colors.success} backgroundColor={`${colors.success}20`} />
                        )}
                      </View>
                      <Typography variant="caption1" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                        {opt.description}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <Button
                title="Apply"
                onPress={handleHolidayConfirm}
                fullWidth
                disabled={!holidayStart || !holidayEnd || !holidayStrategy}
                style={{ marginTop: spacing.lg }}
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowHoliday(false);
                  setHolidayStart('');
                  setHolidayEnd('');
                  setHolidayStrategy(null);
                }}
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* B-Race Modal */}
      <Modal visible={showBRace} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {bRaceStep === 'name' && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                  Add a B-Race
                </Typography>
                <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                  RACE NAME
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Cork City 10K"
                  placeholderTextColor={colors.textTertiary}
                  value={bRaceName}
                  onChangeText={setBRaceName}
                />
                <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm }}>
                  RACE DATE (YYYY-MM-DD)
                </Typography>
                <TextInput
                  style={styles.input}
                  placeholder="2026-04-12"
                  placeholderTextColor={colors.textTertiary}
                  value={bRaceDate}
                  onChangeText={setBRaceDate}
                />
                <Button
                  title="Next"
                  onPress={() => setBRaceStep('distance')}
                  fullWidth
                  disabled={!bRaceName.trim() || !bRaceDate.trim()}
                  style={{ marginTop: spacing.lg }}
                />
              </>
            )}

            {bRaceStep === 'distance' && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                  Race Distance
                </Typography>
                <View style={styles.distanceGrid}>
                  {RACE_DISTANCES.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.distanceCard, bRaceDistance === d.id && styles.distanceCardSelected]}
                      onPress={() => {
                        setBRaceDistance(d.id);
                        setBRaceStep('effort');
                      }}
                      activeOpacity={0.7}
                    >
                      <Typography
                        variant="callout"
                        color={bRaceDistance === d.id ? colors.primary : colors.textPrimary}
                        style={{ fontWeight: '600' }}
                      >
                        {d.label}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button
                  title="Back"
                  variant="ghost"
                  onPress={() => setBRaceStep('name')}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}

            {bRaceStep === 'effort' && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
                  How hard will you race?
                </Typography>
                {RACE_EFFORTS.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    style={styles.effortRow}
                    onPress={() => {
                      handleBRaceConfirm(e.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.effortDot, { backgroundColor: e.color }]} />
                    <View style={{ flex: 1 }}>
                      <Typography variant="callout" style={{ fontWeight: '600' }}>{e.label}</Typography>
                      <Typography variant="caption2" color={colors.textSecondary}>{e.desc}</Typography>
                    </View>
                  </TouchableOpacity>
                ))}
                <Button
                  title="Back"
                  variant="ghost"
                  onPress={() => setBRaceStep('distance')}
                  fullWidth
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}

            {bRaceStep === 'result' && bRaceResult && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.md }}>
                  Plan Adjusted
                </Typography>
                <Card style={{ backgroundColor: `${colors.primary}10`, borderWidth: 1, borderColor: `${colors.primary}20` }}>
                  <Typography variant="footnote" color={colors.primary}>
                    {bRaceResult}
                  </Typography>
                </Card>
                <Button
                  title="Done"
                  onPress={() => {
                    setShowBRace(false);
                    setBRaceStep('name');
                    setBRaceName('');
                    setBRaceDate('');
                    setBRaceDistance(null);
                    setBRaceEffort(null);
                    setBRaceResult(null);
                  }}
                  fullWidth
                  style={{ marginTop: spacing.xl }}
                />
              </>
            )}

            {bRaceStep !== 'result' && (
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowBRace(false);
                  setBRaceStep('name');
                  setBRaceName('');
                  setBRaceDate('');
                  setBRaceDistance(null);
                  setBRaceEffort(null);
                }}
                fullWidth
                style={{ marginTop: spacing.xs }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  feedbackCard: {
    marginBottom: spacing.md,
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Plan actions
  planActions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  planActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Modal
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
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  // Holiday
  strategyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strategyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // B-Race
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  distanceCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  effortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  effortDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
