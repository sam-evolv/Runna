import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format, addDays } from 'date-fns';
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
import type { Workout, WorkoutType } from '@/types/workout';
import { DEMO_WORKOUTS, DEMO_COMPLETED_COUNT, DEMO_TOTAL_WEEK } from '@/constants/demoData';

// ─── Legacy Demo Data (kept for reference, using shared module above) ──────
// @ts-ignore - unused, demo data is now in @/constants/demoData
const _LEGACY_DEMO: Workout[] = [
  {
    id: 'demo-1',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: new Date().getDay() || 7,
    scheduled_date: makeDemoDate(0),
    workout_type: 'tempo_run' as WorkoutType,
    title: 'Tempo Run',
    description:
      'Build lactate threshold with sustained effort. Warm up 10 min, then 20 min at tempo pace, cool down 10 min.',
    workout_data: {
      type: 'tempo_run' as const,
      total_distance_km: 8.5,
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Easy warm-up jog' },
        { type: 'tempo' as const, distance_km: 4.5, target_pace_min_km: 4.45, description: 'Tempo effort' },
        { type: 'cooldown' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Cool down' },
      ],
      notes: 'Keep tempo effort controlled — you should be able to say short sentences.',
    },
    estimated_duration_minutes: 45,
    status: 'scheduled',
    completed_at: null,
    sort_order: 1,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-2',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) % 7) + 1,
    scheduled_date: makeDemoDate(1),
    workout_type: 'strength' as WorkoutType,
    title: 'Upper Body Strength',
    description: 'Compound pushing and pulling with core work. Focus on controlled tempo.',
    workout_data: {
      type: 'strength' as const,
      focus: 'Upper Body',
      exercises: [
        {
          name: 'Bench Press',
          sets: [
            { set_number: 1, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
            { set_number: 2, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
            { set_number: 3, reps: 8, weight_kg: 60, type: 'working' as const, rest_seconds: 90 },
          ],
        },
      ],
      estimated_duration_minutes: 50,
      notes: 'Superset accessories to save time.',
    },
    estimated_duration_minutes: 50,
    status: 'scheduled',
    completed_at: null,
    sort_order: 2,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-3',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 1) % 7 + 1,
    scheduled_date: makeDemoDate(2),
    workout_type: 'easy_run' as WorkoutType,
    title: 'Easy Recovery Run',
    description: 'Keep it conversational. This run builds aerobic base without fatigue.',
    workout_data: {
      type: 'easy_run' as const,
      total_distance_km: 6,
      segments: [
        { type: 'easy' as const, distance_km: 6, target_pace_min_km: 5.8, description: 'Easy pace' },
      ],
      notes: 'Heart rate zone 2. Enjoy the run.',
    },
    estimated_duration_minutes: 35,
    status: 'scheduled',
    completed_at: null,
    sort_order: 3,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-4',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 2) % 7 + 1,
    scheduled_date: makeDemoDate(3),
    workout_type: 'interval_run' as WorkoutType,
    title: 'Speed Intervals',
    description: '6x800m at 5K pace with 400m recovery jogs between.',
    workout_data: {
      type: 'interval_run' as const,
      total_distance_km: 10,
      segments: [
        { type: 'warmup' as const, distance_km: 2, target_pace_min_km: 5.5, description: 'Warm up' },
        { type: 'interval' as const, distance_km: 0.8, target_pace_min_km: 4.0, description: '800m hard' },
        { type: 'recovery' as const, distance_km: 0.4, target_pace_min_km: 6.5, description: 'Recovery jog' },
        { type: 'interval' as const, distance_km: 0.8, target_pace_min_km: 4.0, description: '800m hard' },
        { type: 'recovery' as const, distance_km: 0.4, target_pace_min_km: 6.5, description: 'Recovery jog' },
        { type: 'cooldown' as const, distance_km: 2, target_pace_min_km: 6.0, description: 'Cool down' },
      ],
      notes: 'Focus on even splits across all intervals.',
    },
    estimated_duration_minutes: 55,
    status: 'scheduled',
    completed_at: null,
    sort_order: 4,
    created_at: makeDemoDate(-7),
  },
  {
    id: 'demo-5',
    plan_id: 'demo-plan',
    user_id: 'web-demo',
    week_number: 1,
    day_of_week: ((new Date().getDay() || 7) + 3) % 7 + 1,
    scheduled_date: makeDemoDate(4),
    workout_type: 'long_run' as WorkoutType,
    title: 'Long Run',
    description: 'Weekly long run to build endurance. Negative split the second half.',
    workout_data: {
      type: 'long_run' as const,
      total_distance_km: 16,
      segments: [
        { type: 'easy' as const, distance_km: 8, target_pace_min_km: 5.5, description: 'Easy first half' },
        { type: 'steady' as const, distance_km: 8, target_pace_min_km: 5.0, description: 'Faster second half' },
      ],
      notes: 'Take a gel at km 10. Stay hydrated.',
    },
    estimated_duration_minutes: 85,
    status: 'scheduled',
    completed_at: null,
    sort_order: 5,
    created_at: makeDemoDate(-7),
  },
];

// DEMO_COMPLETED_COUNT and DEMO_TOTAL_WEEK imported from @/constants/demoData

// ─── Motivational Messages ──────────────────────────────────────────────────

const MOTIVATIONAL_MESSAGES = [
  'Every rep builds the athlete you want to be.',
  'Consistency beats intensity. Show up today.',
  'Your future self will thank you for this session.',
  'Progress is built one workout at a time.',
  'The only bad workout is the one you skipped.',
  'Train hard, recover harder.',
  'Discipline is choosing between what you want now and what you want most.',
];

const AI_COACH_MESSAGES = [
  'Your training load is well balanced this week. Keep the easy days easy to maximize your hard sessions.',
  'I noticed your tempo runs are improving. Consider adding 30 seconds to your next threshold block.',
  'Recovery is where adaptation happens. Make sure you are getting 7-8 hours of sleep tonight.',
  'Your consistency has been excellent. You are on track for a strong performance on race day.',
  'Focus on cadence during your easy runs — 170-180 steps per minute builds efficiency over time.',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMotivationalMessage(): string {
  const dayIndex = Math.floor(Date.now() / 86400000) % MOTIVATIONAL_MESSAGES.length;
  return MOTIVATIONAL_MESSAGES[dayIndex];
}

function getCoachMessage(): string {
  const dayIndex = Math.floor(Date.now() / 86400000) % AI_COACH_MESSAGES.length;
  return AI_COACH_MESSAGES[dayIndex];
}

function formatWorkoutType(type: string): string {
  const labels: Record<string, string> = {
    easy_run: 'Easy Run',
    tempo_run: 'Tempo Run',
    interval_run: 'Intervals',
    long_run: 'Long Run',
    recovery_run: 'Recovery',
    fartlek: 'Fartlek',
    hill_run: 'Hill Session',
    race_pace: 'Race Pace',
    strength: 'Strength',
    hyrox: 'HYROX',
    mobility: 'Mobility',
    swim: 'Swim',
    bike: 'Bike',
    rest: 'Rest Day',
  };
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatScheduledDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff <= 6) return format(date, 'EEEE');
  return format(date, 'EEE, d MMM');
}

function getDistanceFromWorkout(workout: Workout): string | null {
  const data = workout.workout_data as any;
  if (data?.total_distance_km) {
    const km = data.total_distance_km;
    return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(1)} km`;
  }
  return null;
}

// ─── Day Dot Status ─────────────────────────────────────────────────────────

type DayStatus = 'completed' | 'today' | 'scheduled' | 'rest';

function getWeekDayStatuses(
  workouts: Workout[],
  currentWeek: number,
): DayStatus[] {
  const statuses: DayStatus[] = [];
  const todayDow = new Date().getDay() || 7; // 1=Mon..7=Sun

  for (let day = 1; day <= 7; day++) {
    const dayWorkouts = workouts.filter(
      (w) => w.week_number === currentWeek && w.day_of_week === day,
    );
    if (dayWorkouts.length === 0) {
      statuses.push(day === todayDow ? 'today' : 'rest');
    } else if (dayWorkouts.some((w) => w.status === 'completed')) {
      statuses.push('completed');
    } else if (day === todayDow) {
      statuses.push('today');
    } else {
      statuses.push('scheduled');
    }
  }
  return statuses;
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function TodayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    plan: realPlan,
    todayWorkout: realTodayWorkout,
    workouts: realWorkouts,
  } = usePlan();

  // Use demo data when on web or when real data is empty
  const isDemo = !realTodayWorkout && realWorkouts.length === 0;

  const todayWorkout = isDemo ? DEMO_WORKOUTS[0] : realTodayWorkout;
  const workouts = isDemo ? DEMO_WORKOUTS : realWorkouts;
  const currentWeek = isDemo ? 1 : (realPlan?.current_week ?? 1);
  const totalWeeks = isDemo ? 12 : (realPlan?.total_weeks ?? 12);

  const completedThisWeek = useMemo(() => {
    if (isDemo) return DEMO_COMPLETED_COUNT;
    return workouts.filter(
      (w) => w.week_number === currentWeek && w.status === 'completed',
    ).length;
  }, [workouts, currentWeek, isDemo]);

  const totalThisWeek = useMemo(() => {
    if (isDemo) return DEMO_TOTAL_WEEK;
    return workouts.filter((w) => w.week_number === currentWeek).length;
  }, [workouts, currentWeek, isDemo]);

  const upcomingWorkouts = useMemo(() => {
    return workouts
      .filter(
        (w) =>
          w.status === 'scheduled' &&
          w.id !== todayWorkout?.id &&
          w.workout_type !== 'rest',
      )
      .slice(0, 3);
  }, [workouts, todayWorkout]);

  const weekStatuses = useMemo(
    () => getWeekDayStatuses(workouts, currentWeek),
    [workouts, currentWeek],
  );

  const greeting = getGreeting();
  const firstName =
    (user as any)?.full_name?.split(' ')[0] || 'there';
  const motivationalMsg = getMotivationalMessage();
  const coachMessage = getCoachMessage();

  const workoutColor = todayWorkout
    ? workoutTypeColors[todayWorkout.workout_type] || colors.primary
    : colors.primary;

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    router.push(`/workout/${todayWorkout.id}` as any);
  };

  const handleCheckin = () => {
    if (!todayWorkout) return;
    router.push({
      pathname: '/workout/checkin',
      params: { type: 'pre_workout', workoutId: todayWorkout.id },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting Section ─────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(300)}
          style={styles.greetingSection}
        >
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.nameText}>{firstName}</Text>
          <Text style={styles.motivationalText}>{motivationalMsg}</Text>
          {(realPlan || isDemo) && (
            <Text style={styles.weekIndicator}>
              Week {currentWeek} of {totalWeeks}
            </Text>
          )}
        </Animated.View>

        {/* ── How Are You Feeling? ──────────────────────────── */}
        {todayWorkout && todayWorkout.workout_type !== 'rest' && (
          <Animated.View entering={FadeInDown.delay(80).duration(300)}>
            <Pressable
              onPress={handleCheckin}
              style={({ pressed }) => [
                styles.checkinPrompt,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.checkinLeft}>
                <Text style={styles.checkinEmoji}>{'\u{1F4AC}'}</Text>
                <View>
                  <Text style={styles.checkinTitle}>How are you feeling?</Text>
                  <Text style={styles.checkinSubtitle}>Quick check-in before your workout</Text>
                </View>
              </View>
              <Text style={styles.checkinChevron}>{'\u203A'}</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── Today's Workout Card ────────────────────────── */}
        {todayWorkout && todayWorkout.workout_type !== 'rest' ? (
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <Pressable
              onPress={handleStartWorkout}
              style={({ pressed }) => [
                styles.todayCard,
                pressed && styles.cardPressed,
              ]}
            >
              {/* Accent bar */}
              <View
                style={[
                  styles.accentBar,
                  { backgroundColor: workoutColor },
                ]}
              />

              <View style={styles.todayCardContent}>
                {/* Workout type badge */}
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: withOpacity(workoutColor, 0.12) },
                  ]}
                >
                  <Text
                    style={[styles.typeBadgeText, { color: workoutColor }]}
                  >
                    {formatWorkoutType(todayWorkout.workout_type)}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.workoutTitle}>
                  {todayWorkout.title}
                </Text>

                {/* Description */}
                {todayWorkout.description && (
                  <Text style={styles.workoutDescription} numberOfLines={2}>
                    {todayWorkout.description}
                  </Text>
                )}

                {/* Meta row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>
                      {formatDuration(todayWorkout.estimated_duration_minutes)}
                    </Text>
                  </View>
                  {getDistanceFromWorkout(todayWorkout) && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Distance</Text>
                      <Text style={styles.metaValue}>
                        {getDistanceFromWorkout(todayWorkout)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Start Workout Button */}
                <Pressable
                  onPress={handleStartWorkout}
                  style={({ pressed }) => [
                    styles.startButton,
                    pressed && styles.startButtonPressed,
                  ]}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <View style={styles.restCard}>
              <Text style={styles.restIcon}>{'\uD83C\uDF3F'}</Text>
              <Text style={styles.restTitle}>Rest Day</Text>
              <Text style={styles.restMessage}>
                Your body is rebuilding. Recovery is when the magic happens
                — muscles repair, energy restores, and you come back
                stronger.
              </Text>
              {upcomingWorkouts.length > 0 && (
                <View style={styles.nextWorkoutPreview}>
                  <Text style={styles.nextLabel}>NEXT UP</Text>
                  <View style={styles.nextWorkoutRow}>
                    <View
                      style={[
                        styles.nextDot,
                        {
                          backgroundColor:
                            workoutTypeColors[
                              upcomingWorkouts[0].workout_type
                            ] || colors.primary,
                        },
                      ]}
                    />
                    <Text style={styles.nextTitle}>
                      {upcomingWorkouts[0].title}
                    </Text>
                    <Text style={styles.nextDate}>
                      {formatScheduledDate(
                        upcomingWorkouts[0].scheduled_date,
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* ── Weekly Progress ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <View style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <Text style={styles.sectionTitle}>This Week</Text>
              <Text style={styles.weekCount}>
                {completedThisWeek} of {totalThisWeek} completed
              </Text>
            </View>
            <View style={styles.dotsRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const status = weekStatuses[i];
                return (
                  <View key={i} style={styles.dotColumn}>
                    <View
                      style={[
                        styles.dayDot,
                        status === 'completed' && styles.dayDotCompleted,
                        status === 'today' && styles.dayDotToday,
                        status === 'scheduled' && styles.dayDotScheduled,
                        status === 'rest' && styles.dayDotRest,
                      ]}
                    >
                      {status === 'completed' && (
                        <Text style={styles.checkText}>{'\u2713'}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayLabel,
                        status === 'today' && {
                          color: colors.primary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── AI Coach Card ───────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <View style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={styles.coachAvatar}>
                <Text style={styles.coachAvatarText}>P</Text>
              </View>
              <View style={styles.coachNameBlock}>
                <Text style={styles.coachName}>Pulse</Text>
                <Text style={styles.coachSubtitle}>AI Coach</Text>
              </View>
            </View>
            <Text style={styles.coachMessage}>{coachMessage}</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/coach' as any)}
              style={({ pressed }) => [
                styles.coachButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.coachButtonText}>Chat with Coach</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Coming Up ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
          <View style={styles.upcomingSection}>
            <Text style={styles.sectionTitle}>Coming Up</Text>
            {upcomingWorkouts.length > 0 ? (
              upcomingWorkouts.map((workout) => {
                const wColor =
                  workoutTypeColors[workout.workout_type] || colors.primary;
                return (
                  <Pressable
                    key={workout.id}
                    onPress={() =>
                      router.push(`/workout/${workout.id}` as any)
                    }
                    style={({ pressed }) => [
                      styles.upcomingCard,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View
                      style={[
                        styles.upcomingDot,
                        { backgroundColor: wColor },
                      ]}
                    />
                    <View style={styles.upcomingInfo}>
                      <Text style={styles.upcomingTitle}>
                        {workout.title}
                      </Text>
                      <Text style={styles.upcomingMeta}>
                        {formatScheduledDate(workout.scheduled_date)}
                        {'  \u00B7  '}
                        {formatDuration(workout.estimated_duration_minutes)}
                      </Text>
                    </View>
                    <Text style={styles.upcomingChevron}>{'\u203A'}</Text>
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No upcoming workouts</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },

  // Greeting
  greetingSection: {
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  greetingText: {
    ...typography.callout,
    color: colors.textTertiary,
  },
  nameText: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  motivationalText: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  weekIndicator: {
    ...typography.caption1,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  // Check-in Prompt
  checkinPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: withOpacity(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  checkinEmoji: {
    fontSize: 24,
  },
  checkinTitle: {
    ...typography.headline,
    color: colors.primary,
  },
  checkinSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkinChevron: {
    fontSize: 22,
    color: colors.primary,
  },

  // Today's Workout Card
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  accentBar: {
    width: 4,
  },
  todayCardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    ...typography.caption2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutTitle: {
    ...typography.title1,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  workoutDescription: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    ...typography.caption1,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaValue: {
    ...typography.headline,
    color: colors.textPrimary,
    marginTop: 2,
  },
  startButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.primary),
  },
  startButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  startButtonText: {
    ...typography.headline,
    color: '#050505',
    fontWeight: '700',
  },

  // Rest Day Card
  restCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  restIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  restTitle: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  restMessage: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  nextWorkoutPreview: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
  },
  nextLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  nextWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  nextTitle: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  nextDate: {
    ...typography.caption1,
    color: colors.textTertiary,
  },

  // Weekly Progress
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  weekCount: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  dotColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotCompleted: {
    backgroundColor: colors.success,
  },
  dayDotToday: {
    backgroundColor: withOpacity(colors.primary, 0.2),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayDotScheduled: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayDotRest: {
    backgroundColor: withOpacity(colors.textMuted, 0.1),
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dayLabel: {
    ...typography.caption2,
    color: colors.textTertiary,
    fontWeight: '500',
  },

  // AI Coach Card
  coachCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withOpacity(colors.primary, 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  coachNameBlock: {
    flex: 1,
  },
  coachName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  coachSubtitle: {
    ...typography.caption2,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coachMessage: {
    ...typography.callout,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  coachButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  coachButtonText: {
    ...typography.footnote,
    color: colors.primary,
    fontWeight: '600',
  },

  // Coming Up
  upcomingSection: {
    marginBottom: spacing.lg,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  upcomingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  upcomingMeta: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginTop: 2,
  },
  upcomingChevron: {
    fontSize: 22,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  emptyText: {
    ...typography.callout,
    color: colors.textTertiary,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
