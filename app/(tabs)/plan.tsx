import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
  isSameMonth,
  subMonths,
  addMonths,
  getDay,
} from 'date-fns';
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
import { ChevronLeft, ChevronRight, Check, Leaf } from 'lucide-react-native';

// ─── Types ──────────────────────────────────────────────────────────────────────
type ViewMode = 'month' | 'week';

interface MockWorkout {
  id: string;
  date: Date;
  title: string;
  type: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'skipped';
  description: string;
}

// ─── Mock Workout Generator ─────────────────────────────────────────────────────
function generateMockWorkouts(refDate: Date): MockWorkout[] {
  const workoutTemplates = [
    { title: 'Easy Run', type: 'easy_run', duration: 35, description: '5K easy pace, focus on form' },
    { title: 'Upper Body Strength', type: 'strength', duration: 50, description: 'Bench, rows, OHP, curls' },
    { title: 'Interval Run', type: 'interval_run', duration: 45, description: '6x800m at threshold pace' },
    { title: 'Lower Body Strength', type: 'strength', duration: 48, description: 'Squat, deadlift, lunges' },
    { title: 'Long Run', type: 'long_run', duration: 75, description: '14K steady state, zone 2' },
    { title: 'Tempo Run', type: 'tempo_run', duration: 40, description: '8K at tempo pace' },
    { title: 'Mobility & Recovery', type: 'mobility', duration: 30, description: 'Foam rolling, yoga flow' },
  ];

  const results: MockWorkout[] = [];
  const monthStart = startOfMonth(refDate);

  // Generate workouts for the entire month
  for (let week = 0; week < 5; week++) {
    // Training days: Mon, Tue, Thu, Fri, Sat (Wed + Sun = rest)
    const trainingDays = [0, 1, 3, 4, 5];
    trainingDays.forEach((dayOffset, idx) => {
      const date = addDays(monthStart, week * 7 + dayOffset);
      if (!isSameMonth(date, refDate)) return;

      const template = workoutTemplates[idx % workoutTemplates.length];
      const isPast = date < new Date();
      const isCurrentDay = isToday(date);

      results.push({
        id: `mock-${week}-${dayOffset}`,
        date,
        title: template.title,
        type: template.type,
        duration: template.duration,
        status: isPast && !isCurrentDay ? 'completed' : 'scheduled',
        description: template.description,
      });
    });
  }

  return results;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function formatDuration(mins: number): string {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins} min`;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function PlanScreen() {
  const { user } = useAuth();
  const { plan, workouts: realWorkouts } = usePlan();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Use real workouts if available, otherwise generate mock
  const mockWorkouts = useMemo(
    () => generateMockWorkouts(currentMonth),
    [currentMonth],
  );

  const workoutsForDisplay = useMemo(() => {
    if (Platform.OS !== 'web' && realWorkouts.length > 0) {
      return realWorkouts.map((w) => ({
        id: w.id,
        date: new Date(w.scheduled_date),
        title: w.title,
        type: w.workout_type,
        duration: w.estimated_duration_minutes,
        status: w.status as 'scheduled' | 'completed' | 'skipped',
        description: w.description || '',
      }));
    }
    return mockWorkouts;
  }, [realWorkouts, mockWorkouts]);

  const getWorkoutsForDate = useCallback(
    (date: Date) =>
      workoutsForDisplay.filter((w) => isSameDay(w.date, date)),
    [workoutsForDisplay],
  );

  // ── Calendar Grid (month view) ────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    // Start from Monday of the week containing the 1st
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = calStart;
    // Fill 6 rows of 7 days
    for (let i = 0; i < 42; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // ── Current Week Days (week view) ─────────────────────────────────────────
  const weekDays = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, []);

  const selectedWorkouts = selectedDate ? getWorkoutsForDate(selectedDate) : [];

  const planName = plan?.name || 'Half Marathon Training';
  const planSubtitle = plan
    ? `Week ${plan.current_week} of ${plan.total_weeks}`
    : '12-Week Progressive Plan';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.largeTitle}>Your Plan</Text>
        <Text style={styles.planSubtitle}>{planName}</Text>
      </Animated.View>

      {/* ── Month / Week Toggle ───────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(80).duration(300)} style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          <Pressable
            onPress={() => setViewMode('month')}
            style={[
              styles.togglePill,
              viewMode === 'month' && styles.togglePillActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'month' && styles.toggleTextActive,
              ]}
            >
              Month
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('week')}
            style={[
              styles.togglePill,
              viewMode === 'week' && styles.togglePillActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'week' && styles.toggleTextActive,
              ]}
            >
              Week
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'month' ? (
          /* ══════════ MONTH VIEW ══════════ */
          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            {/* Month Nav */}
            <View style={styles.monthNav}>
              <Pressable
                onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={styles.navArrow}
              >
                <Text style={styles.navArrowText}>{'\u2039'}</Text>
              </Pressable>
              <Text style={styles.monthTitle}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <Pressable
                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={styles.navArrow}
              >
                <Text style={styles.navArrowText}>{'\u203A'}</Text>
              </Pressable>
            </View>

            {/* Day-of-week headers */}
            <View style={styles.dowRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <View key={`dow-${i}`} style={styles.dowCell}>
                  <Text style={styles.dowText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, idx) => {
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const dayWorkouts = getWorkoutsForDate(day);
                const hasWorkout = dayWorkouts.length > 0;
                const dotColor = hasWorkout
                  ? workoutTypeColors[dayWorkouts[0].type] || colors.primary
                  : 'transparent';

                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.dayCell,
                      today && styles.dayCellToday,
                      selected && styles.dayCellSelected,
                    ]}
                    onPress={() => setSelectedDate(day)}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        !inMonth && styles.dayNumberMuted,
                        today && styles.dayNumberToday,
                        selected && styles.dayNumberSelected,
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                    <View
                      style={[
                        styles.dayDot,
                        { backgroundColor: inMonth ? dotColor : 'transparent' },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Selected Day Details */}
            {selectedDate && (
              <Animated.View entering={FadeInDown.duration(250)}>
                <View style={styles.selectedDayCard}>
                  <Text style={styles.selectedDayTitle}>
                    {format(selectedDate, 'EEEE, MMM d')}
                  </Text>
                  {selectedWorkouts.length === 0 ? (
                    <View style={styles.restDayRow}>
                      <Text style={styles.restEmoji}>{'\u{1F9D8}'}</Text>
                      <View>
                        <Text style={styles.restTitle}>Rest & Recovery</Text>
                        <Text style={styles.restSubtitle}>
                          Light stretching or a walk is perfect today.
                        </Text>
                      </View>
                    </View>
                  ) : (
                    selectedWorkouts.map((w) => {
                      const wColor = workoutTypeColors[w.type] || colors.primary;
                      return (
                        <View key={w.id} style={styles.detailRow}>
                          <View
                            style={[
                              styles.detailDot,
                              { backgroundColor: wColor },
                            ]}
                          />
                          <View style={styles.detailInfo}>
                            <Text style={styles.detailTitle}>{w.title}</Text>
                            <Text style={styles.detailDesc}>
                              {w.description}
                            </Text>
                            <View style={styles.detailMeta}>
                              <Text style={styles.detailMetaText}>
                                {formatDuration(w.duration)}
                              </Text>
                              {w.status === 'completed' && (
                                <View style={styles.completedBadge}>
                                  <Text style={styles.completedBadgeText}>
                                    {'\u2713'} Done
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          /* ══════════ WEEK VIEW ══════════ */
          <Animated.View entering={FadeInDown.delay(120).duration(400)}>
            <Text style={styles.weekViewTitle}>
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
            </Text>

            {weekDays.map((day, idx) => {
              const dayWorkouts = getWorkoutsForDate(day);
              const isRest = dayWorkouts.length === 0;
              const today = isToday(day);

              return (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.delay(140 + idx * 50).duration(300)}
                >
                  <View
                    style={[
                      styles.weekDayCard,
                      today && styles.weekDayCardToday,
                    ]}
                  >
                    {/* Day label row */}
                    <View style={styles.weekDayHeader}>
                      <View style={styles.weekDayLeft}>
                        <Text
                          style={[
                            styles.weekDayName,
                            today && { color: colors.primary },
                          ]}
                        >
                          {format(day, 'EEE')}
                        </Text>
                        <Text
                          style={[
                            styles.weekDayDate,
                            today && { color: colors.primary },
                          ]}
                        >
                          {format(day, 'd')}
                        </Text>
                        {today && (
                          <View style={styles.todayBadge}>
                            <Text style={styles.todayBadgeText}>Today</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Content */}
                    {isRest ? (
                      <View style={styles.weekRestContent}>
                        <Text style={styles.weekRestEmoji}>{'\u{1F343}'}</Text>
                        <Text style={styles.weekRestText}>
                          Rest & Recovery
                        </Text>
                      </View>
                    ) : (
                      dayWorkouts.map((w) => {
                        const wColor =
                          workoutTypeColors[w.type] || colors.primary;
                        return (
                          <View key={w.id} style={styles.weekWorkoutContent}>
                            <View style={styles.weekWorkoutRow}>
                              <View
                                style={[
                                  styles.weekTypeBadge,
                                  {
                                    backgroundColor: withOpacity(wColor, 0.12),
                                    borderColor: withOpacity(wColor, 0.25),
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.weekTypeBadgeText,
                                    { color: wColor },
                                  ]}
                                >
                                  {w.type.replace(/_/g, ' ').toUpperCase()}
                                </Text>
                              </View>
                              <Text style={styles.weekDuration}>
                                {formatDuration(w.duration)}
                              </Text>
                            </View>
                            <Text style={styles.weekWorkoutTitle}>
                              {w.title}
                            </Text>
                            <Text style={styles.weekWorkoutDesc}>
                              {w.description}
                            </Text>
                            {w.status === 'completed' && (
                              <View style={styles.weekCompletedRow}>
                                <Text style={styles.weekCompletedText}>
                                  {'\u2713'} Completed
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}
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
    paddingBottom: spacing.xs,
  },
  largeTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  planSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },

  // Toggle
  toggleRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  togglePillActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },

  // ── Month View ────────────────────────────────────────────────
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
  monthTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // Day-of-week headers
  dowRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dowCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dowText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: 2,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  dayCellSelected: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    borderRadius: borderRadius.sm,
  },
  dayNumber: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumberMuted: {
    color: colors.textMuted,
    opacity: 0.4,
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },

  // Selected day details
  selectedDayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  selectedDayTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  restDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restEmoji: {
    fontSize: 28,
  },
  restTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  restSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  detailDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detailMetaText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: withOpacity(colors.success, 0.12),
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  completedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Week View ─────────────────────────────────────────────────
  weekViewTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  weekDayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  weekDayCardToday: {
    borderColor: withOpacity(colors.primary, 0.5),
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekDayName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  weekDayDate: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  todayBadge: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  todayBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  // Rest in week view
  weekRestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  weekRestEmoji: {
    fontSize: 18,
  },
  weekRestText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },

  // Workout in week view
  weekWorkoutContent: {
    paddingTop: spacing.xs,
  },
  weekWorkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weekTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  weekTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  weekDuration: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  weekWorkoutTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  weekWorkoutDesc: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  weekCompletedRow: {
    marginTop: spacing.sm,
  },
  weekCompletedText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
});
