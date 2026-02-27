import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePlan } from '@/hooks/usePlan';
import {
  getStrategyOptions,
  recommendRealignment,
  type RealignmentStrategy,
} from '@/services/holidayMode';
import {
  calculateBRaceAdjustment,
  type RaceDistance,
  type RaceEffort,
} from '@/services/bRaceSupport';
import { colors, spacing, borderRadius, workoutTypeColors, glass } from '@/constants/theme';
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

  const [showHoliday, setShowHoliday] = useState(false);
  const [holidayStart, setHolidayStart] = useState('');
  const [holidayEnd, setHolidayEnd] = useState('');
  const [holidayStrategy, setHolidayStrategy] = useState<RealignmentStrategy | null>(null);
  const [holidayResult, setHolidayResult] = useState<string | null>(null);

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
        <EmptyState
          icon={'\uD83D\uDCC5'}
          title="No Active Plan"
          message="Complete the onboarding to generate your personalised training plan."
          style={{ flex: 1, justifyContent: 'center' }}
        />
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
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Typography variant="largeTitle">Your Plan</Typography>
        <Typography variant="callout" color={colors.textSecondary} style={{ marginTop: 2 }}>
          {plan.name}
        </Typography>
      </Animated.View>

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
            <Pressable
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
                color={isSelected ? colors.textInverse : isCurrentWeek ? colors.primary : colors.textSecondary}
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
                        { backgroundColor: w.status === 'completed' ? colors.success : 'rgba(255,255,255,0.15)' },
                      ]}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Week content */}
      <ScrollView contentContainerStyle={styles.weekContent} showsVerticalScrollIndicator={false}>
        <View style={styles.weekHeaderRow}>
          <View>
            <Typography variant="title3">Week {selectedWeek}</Typography>
            {plan.plan_data.weeks[selectedWeek - 1]?.theme && (
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600', marginTop: 2 }}>
                {plan.plan_data.weeks[selectedWeek - 1].theme}
              </Typography>
            )}
          </View>
          <View style={styles.completionBadge}>
            <Typography variant="caption1" color={colors.textSecondary}>
              {completedCount}/{weekWorkouts.length}
            </Typography>
          </View>
        </View>

        {/* Feedback */}
        {holidayResult && (
          <Pressable onPress={() => setHolidayResult(null)} style={styles.feedbackCard}>
            <Typography variant="footnote" color={colors.primary} style={{ flex: 1 }}>{holidayResult}</Typography>
            <Typography variant="caption2" color={colors.textTertiary}>Dismiss</Typography>
          </Pressable>
        )}

        {weekWorkouts.length === 0 && (
          <Typography variant="body" color={colors.textSecondary} style={{ paddingVertical: spacing.xl }}>
            No workouts scheduled for this week.
          </Typography>
        )}

        {weekWorkouts.map((workout, idx) => (
          <Animated.View key={workout.id} entering={FadeInDown.delay(idx * 50).duration(350)}>
            <Pressable
              style={[styles.workoutCard, workout.status === 'completed' && styles.workoutCompleted]}
              onPress={() => router.push(`/workout/${workout.id}`)}
            >
              <View style={styles.workoutRow}>
                <View style={[styles.dayIndicator, { backgroundColor: workoutTypeColors[workout.workout_type] || colors.primary }]} />
                <View style={styles.workoutInfo}>
                  <View style={styles.workoutTop}>
                    <Typography variant="caption1" color={colors.textTertiary}>{dayName(workout.day_of_week)}</Typography>
                    {workout.status === 'completed' && (
                      <Badge label="Done" color={colors.success} backgroundColor="rgba(52,211,153,0.12)" />
                    )}
                    {workout.status === 'skipped' && (
                      <Badge label="Skipped" color={colors.textTertiary} />
                    )}
                  </View>
                  <Typography variant="headline" style={{ marginTop: 2 }}>{workout.title}</Typography>
                  <View style={styles.workoutDetails}>
                    <Typography variant="caption1" color={colors.textSecondary}>{formatWorkoutType(workout.workout_type)}</Typography>
                    <Typography variant="caption1" color={colors.textTertiary}> · </Typography>
                    <Typography variant="caption1" color={colors.textSecondary}>{formatWorkoutDuration(workout.estimated_duration_minutes)}</Typography>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {/* Plan Actions */}
        <View style={styles.planActions}>
          <TouchableOpacity style={styles.planActionRow} onPress={() => setShowHoliday(true)} activeOpacity={0.7}>
            <Typography variant="body">{'\u2708\uFE0F'}</Typography>
            <View style={{ flex: 1 }}>
              <Typography variant="callout" style={{ fontWeight: '500' }}>Going on Holiday?</Typography>
              <Typography variant="caption2" color={colors.textTertiary}>Pause or adjust your plan</Typography>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.planActionRow} onPress={() => setShowBRace(true)} activeOpacity={0.7}>
            <Typography variant="body">{'\uD83C\uDFC1'}</Typography>
            <View style={{ flex: 1 }}>
              <Typography variant="callout" style={{ fontWeight: '500' }}>Add a B-Race</Typography>
              <Typography variant="caption2" color={colors.textTertiary}>Secondary race with auto taper</Typography>
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
              <Typography variant="title3" align="center" style={{ marginBottom: spacing.xs }}>Holiday Mode</Typography>
              <Typography variant="footnote" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
                Tell us when you'll be away
              </Typography>

              <Typography variant="caption1" color={colors.textTertiary} style={styles.inputLabel}>START DATE (YYYY-MM-DD)</Typography>
              <TextInput style={styles.input} placeholder="2026-03-15" placeholderTextColor={colors.textTertiary} value={holidayStart} onChangeText={setHolidayStart} />

              <Typography variant="caption1" color={colors.textTertiary} style={[styles.inputLabel, { marginTop: spacing.sm }]}>END DATE (YYYY-MM-DD)</Typography>
              <TextInput style={styles.input} placeholder="2026-03-22" placeholderTextColor={colors.textTertiary} value={holidayEnd} onChangeText={setHolidayEnd} />

              {daysAway > 0 && (
                <>
                  <Typography variant="caption1" color={colors.textTertiary} style={[styles.inputLabel, { marginTop: spacing.lg }]}>STRATEGY</Typography>
                  {strategyOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.strategyCard, holidayStrategy === opt.id && styles.strategyCardSelected]}
                      onPress={() => setHolidayStrategy(opt.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.strategyHeader}>
                        <Typography variant="body">{opt.emoji}</Typography>
                        <Typography variant="callout" style={{ fontWeight: '600', flex: 1 }}>{opt.label}</Typography>
                        {opt.recommended && <Badge label="Best" color={colors.success} backgroundColor="rgba(52,211,153,0.12)" />}
                      </View>
                      <Typography variant="caption1" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>{opt.description}</Typography>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <Button title="Apply" onPress={handleHolidayConfirm} fullWidth disabled={!holidayStart || !holidayEnd || !holidayStrategy} style={{ marginTop: spacing.lg }} />
              <Button title="Cancel" variant="ghost" onPress={() => { setShowHoliday(false); setHolidayStart(''); setHolidayEnd(''); setHolidayStrategy(null); }} fullWidth style={{ marginTop: spacing.sm }} />
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
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>Add a B-Race</Typography>
                <Typography variant="caption1" color={colors.textTertiary} style={styles.inputLabel}>RACE NAME</Typography>
                <TextInput style={styles.input} placeholder="e.g. Cork City 10K" placeholderTextColor={colors.textTertiary} value={bRaceName} onChangeText={setBRaceName} />
                <Typography variant="caption1" color={colors.textTertiary} style={[styles.inputLabel, { marginTop: spacing.sm }]}>RACE DATE (YYYY-MM-DD)</Typography>
                <TextInput style={styles.input} placeholder="2026-04-12" placeholderTextColor={colors.textTertiary} value={bRaceDate} onChangeText={setBRaceDate} />
                <Button title="Next" onPress={() => setBRaceStep('distance')} fullWidth disabled={!bRaceName.trim() || !bRaceDate.trim()} style={{ marginTop: spacing.lg }} />
              </>
            )}

            {bRaceStep === 'distance' && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>Race Distance</Typography>
                <View style={styles.distanceGrid}>
                  {RACE_DISTANCES.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.distanceCard, bRaceDistance === d.id && styles.distanceCardSelected]}
                      onPress={() => { setBRaceDistance(d.id); setBRaceStep('effort'); }}
                      activeOpacity={0.7}
                    >
                      <Typography variant="callout" color={bRaceDistance === d.id ? colors.primary : colors.textPrimary} style={{ fontWeight: '600' }}>{d.label}</Typography>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button title="Back" variant="ghost" onPress={() => setBRaceStep('name')} fullWidth style={{ marginTop: spacing.md }} />
              </>
            )}

            {bRaceStep === 'effort' && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>How hard?</Typography>
                {RACE_EFFORTS.map((e) => (
                  <TouchableOpacity key={e.id} style={styles.effortRow} onPress={() => handleBRaceConfirm(e.id)} activeOpacity={0.7}>
                    <View style={[styles.effortDot, { backgroundColor: e.color }]} />
                    <View style={{ flex: 1 }}>
                      <Typography variant="callout" style={{ fontWeight: '600' }}>{e.label}</Typography>
                      <Typography variant="caption2" color={colors.textSecondary}>{e.desc}</Typography>
                    </View>
                  </TouchableOpacity>
                ))}
                <Button title="Back" variant="ghost" onPress={() => setBRaceStep('distance')} fullWidth style={{ marginTop: spacing.md }} />
              </>
            )}

            {bRaceStep === 'result' && bRaceResult && (
              <>
                <Typography variant="title3" align="center" style={{ marginBottom: spacing.md }}>Plan Adjusted</Typography>
                <View style={styles.resultCard}>
                  <Typography variant="footnote" color={colors.primary}>{bRaceResult}</Typography>
                </View>
                <Button title="Done" onPress={() => { setShowBRace(false); setBRaceStep('name'); setBRaceName(''); setBRaceDate(''); setBRaceDistance(null); setBRaceEffort(null); setBRaceResult(null); }} fullWidth style={{ marginTop: spacing.xl }} />
              </>
            )}

            {bRaceStep !== 'result' && (
              <Button title="Cancel" variant="ghost" onPress={() => { setShowBRace(false); setBRaceStep('name'); setBRaceName(''); setBRaceDate(''); setBRaceDistance(null); setBRaceEffort(null); }} fullWidth style={{ marginTop: spacing.xs }} />
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  weekSelector: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  weekPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    minWidth: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  weekPillSelected: {
    backgroundColor: colors.primary,
  },
  weekPillCurrent: {
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.massive,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  completionBadge: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  feedbackCard: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.12)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  workoutCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  workoutCompleted: {
    opacity: 0.5,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dayIndicator: {
    width: 3,
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
  planActions: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  planActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  // Modal styles
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
    maxHeight: '85%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  input: {
    ...glass.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  strategyCard: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  strategyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  distanceCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...glass.card,
    borderRadius: borderRadius.lg,
  },
  distanceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
  effortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  effortDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  resultCard: {
    backgroundColor: 'rgba(34,211,238,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.12)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
});
