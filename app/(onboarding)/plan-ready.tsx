import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity, sportColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { usePlanStore } from '@/stores/planStore';
import type { GoalType, GoalSubtype, FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getWorkoutColor(type) {
  const map = {
    easy_run: colors.running,
    tempo_run: colors.running,
    recovery_run: colors.hyrox,
    long_run: colors.running,
    strength: colors.strength,
    hyrox: colors.hyrox,
    swim: colors.triathlon,
    bike: colors.triathlon,
    run: colors.running,
    mobility: colors.secondary,
    rest: colors.border,
  };
  return map[type] || colors.general;
}

export default function PlanReadyScreen() {
  const router = useRouter();
  const { goalType, targetData, fitnessData, availabilityData, profileData, equipmentData } = useLocalSearchParams();

  const { user, setOnboarded, updateProfile } = useAuthStore();
  const { createGoalAndGeneratePlan, currentPlan, workouts, isGenerating, generationProgress } = usePlanStore();

  const [error, setError] = useState(null);
  const [planGenerated, setPlanGenerated] = useState(false);

  const accentColor = sportColors[goalType] || sportColors.general_fitness || colors.general;

  const buttonScale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    generatePlan();
  }, []);

  useEffect(() => {
    if (planGenerated) {
      checkOpacity.value = withTiming(1, { duration: 500 });
      checkScale.value = withSpring(1, { damping: 8, stiffness: 200, mass: 0.8 });
      pulseScale.value = withDelay(800, withRepeat(withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ), -1, false));
    }
  }, [planGenerated]);

  const generatePlan = async () => {
    if (!user) return;
    try {
      let td = {}, fd = {}, ad = {}, pd = {}, ed = {};
      try { td = JSON.parse(targetData || "{}"); } catch {}
      try { fd = JSON.parse(fitnessData || "{}"); } catch {}
      try { ad = JSON.parse(availabilityData || "{}"); } catch {}
      try { pd = JSON.parse(profileData || "{}"); } catch {}
      try { ed = JSON.parse(equipmentData || "{}"); } catch {}

      let height_cm = null;
      let weight_kg = null;

      if (pd.height) {
        if (pd.useMetric !== false) {
          height_cm = parseFloat(pd.height) || null;
        } else {
          const parts = String(pd.height).replace('"', "").split("'");
          if (parts.length === 2) height_cm = Math.round((parseInt(parts[0]) * 12 + parseInt(parts[1])) * 2.54);
        }
      }
      if (pd.weight) {
        weight_kg = pd.useMetric !== false ? parseFloat(pd.weight) || null : Math.round((parseFloat(pd.weight) || 0) * 0.453592);
      }

      await updateProfile({ height_cm, weight_kg, unit_preference: pd.useMetric !== false ? "metric" : "imperial" });

      const availableDays = Array.isArray(ad.selectedDays) ? ad.selectedDays : [1, 3, 5];

      const raceMap = { "Marathon": "marathon", "Half Marathon": "half_marathon", "10K": "10k", "5K": "5k", "Couch to 5K": "couch_to_5k", "Ultra": "ultra" };
      const focusMap = { "Muscle & Physique": "general_hypertrophy", "Powerlifting": "powerlifting", "Beginner Strength": "beginner_strength", "Athletic Performance": "athletic_performance" };

      const goalSubtype = (td.targetRace && raceMap[td.targetRace]) || (td.focus && focusMap[td.focus]) || (td.physique ? "general_hypertrophy" : null);

      let targetDate = null;
      if (td.targetMonth && td.targetYear) {
        const monthNum = new Date(Date.parse(td.targetMonth + " 1, 2000")).getMonth() + 1;
        targetDate = td.targetYear + "-" + String(monthNum).padStart(2, "0") + "-01";
      }

      const injuryLabels = { knee: "Knee", back: "Back", shoulder: "Shoulder", hip: "Hip", ankle: "Ankle" };
      const injuries = Array.isArray(pd.injuries) ? pd.injuries.filter(i => i !== "none").map(i => injuryLabels[i] || i).join(", ") : "";

      const goal = {
        goal_type: goalType || "general_fitness",
        goal_subtype: goalSubtype,
        target_value: td.targetTime || td.targetWeight || null,
        target_event: td.targetRace || td.focus || td.physique || null,
        target_date: targetDate,
        current_level: pd.experienceLevel || "beginner",
        available_days: availableDays,
        preferred_long_session_day: ad.preferredLongDay || null,
      };

      const stats = {
        recent_5k_time: fd.recent5k || null,
        recent_10k_time: fd.recent10k || null,
        recent_half_time: fd.recentHalf || null,
        recent_marathon_time: fd.recentMarathon || null,
        weekly_mileage_km: fd.weeklyMileage ? parseFloat(fd.weeklyMileage) : null,
        max_heart_rate: fd.maxHR ? parseInt(fd.maxHR) : null,
        resting_heart_rate: fd.restingHR ? parseInt(fd.restingHR) : null,
        bench_press_1rm: fd.bench ? parseFloat(fd.bench) : null,
        squat_1rm: fd.squat ? parseFloat(fd.squat) : null,
        deadlift_1rm: fd.deadlift ? parseFloat(fd.deadlift) : null,
        overhead_press_1rm: fd.ohp ? parseFloat(fd.ohp) : null,
        injury_history: injuries || null,
        equipment_available: Array.isArray(ed.equipment) ? ed.equipment : [],
        gym_access: ed.gymAccess !== false,
        gym_limitations: ed.limitations || null,
        physique_goal: td.physique || td.focus || null,
        body_fat_estimate: null,
        notes: [td.physique ? "Physique goal: " + td.physique : "", td.additionalNotes || ""].filter(Boolean).join(". ") || null,
      };

      const result = await createGoalAndGeneratePlan(user, goal, stats);
      if (result.error) { setError(result.error); } else { setPlanGenerated(true); }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartTraining = () => {
    setOnboarded(true);
    router.replace("/(tabs)/today");
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));
  const checkAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }], opacity: checkOpacity.value }));
  const pulseAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  const week1Workouts = workouts.filter(w => w.week_number === 1).slice(0, 4);

  if (isGenerating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
            <View style={[styles.loadingOrb, { backgroundColor: withOpacity(accentColor, 0.15) }]}>
              <ActivityIndicator size="large" color={accentColor} />
            </View>
            <Text style={[styles.loadingTitle, { color: accentColor }]}>Building Your Plan</Text>
            <Text style={styles.loadingSubtitle}>{generationProgress || "Analysing your profile..."}</Text>
            <Text style={styles.loadingHint}>This takes about 30 seconds</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>{"⚠️"}</Text>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Pressable onPress={generatePlan} style={[styles.retryButton, { backgroundColor: accentColor }]}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.celebrationSection}>
          <Animated.View style={[styles.celebrationGlow, pulseAnimatedStyle, { backgroundColor: withOpacity(accentColor, 0.15) }]} />
          <Animated.View style={[styles.checkCircle, checkAnimatedStyle, { backgroundColor: accentColor, ...shadows.glow(accentColor) }]}>
            <Text style={styles.checkEmoji}>{"✓"}</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.progressSection}>
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 8 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: "100%", backgroundColor: accentColor }]} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.title}>Your Plan is Ready</Text>
          <Text style={styles.subtitle}>{"We've crafted a personalised program just for you"}</Text>
        </Animated.View>

        {currentPlan && (
          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <View style={[styles.planCard, { borderColor: withOpacity(accentColor, 0.3) }]}>
              <View style={[styles.planCardAccent, { backgroundColor: accentColor }]} />
              <View style={styles.planCardContent}>
                <Text style={styles.planName}>{currentPlan.name}</Text>
                <Text style={styles.planDescription}>{currentPlan.description}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {currentPlan && (
          <Animated.View entering={FadeInDown.delay(1000).duration(500)}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: accentColor }]}>{week1Workouts.length || 4}</Text>
                <Text style={styles.statLabel}>Sessions/wk</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: accentColor }]}>{(week1Workouts[0] && week1Workouts[0].estimated_duration_minutes) || 45}</Text>
                <Text style={styles.statLabel}>Min/session</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: accentColor }]}>{currentPlan.total_weeks}</Text>
                <Text style={styles.statLabel}>Weeks</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {week1Workouts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1200).duration(500)}>
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Week 1 Preview</Text>
              <Text style={styles.previewSubtitle}>Your AI-generated first week</Text>
              {week1Workouts.map((workout, index) => {
                const workoutColor = getWorkoutColor(workout.workout_type);
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return (
                  <Animated.View key={workout.id} entering={FadeInDown.delay(1400 + index * 100).duration(300)}>
                    <View style={styles.workoutCard}>
                      <View style={[styles.workoutAccent, { backgroundColor: workoutColor }]} />
                      <View style={styles.workoutContent}>
                        <View style={styles.workoutHeader}>
                          <Text style={styles.workoutDay}>{days[(workout.day_of_week - 1) % 7]}</Text>
                          <Text style={[styles.workoutDuration, { color: workoutColor }]}>{workout.estimated_duration_minutes} min</Text>
                        </View>
                        <Text style={styles.workoutTitle}>{workout.title}</Text>
                        <Text style={styles.workoutSubtitle}>{workout.description || ""}</Text>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        <View style={{ height: spacing.massive }} />
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(planGenerated ? 1600 : 400).duration(600)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleStartTraining}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          style={[styles.ctaButton, buttonAnimatedStyle, { backgroundColor: accentColor, ...shadows.glow(accentColor) }]}
        >
          <Text style={styles.ctaText}>Start Training</Text>
        </AnimatedPressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  loadingOrb: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: spacing.xl },
  loadingTitle: { ...typography.title2, fontWeight: "700", textAlign: "center", marginBottom: spacing.sm },
  loadingSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.sm },
  loadingHint: { ...typography.footnote, color: colors.textMuted, textAlign: "center" },
  errorTitle: { ...typography.title2, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
  errorMessage: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xl },
  retryButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  retryText: { ...typography.headline, color: colors.textPrimary, fontWeight: "700" },
  celebrationSection: { alignItems: "center", justifyContent: "center", paddingTop: spacing.xxl, paddingBottom: spacing.lg, position: "relative" },
  celebrationGlow: { position: "absolute", width: 140, height: 140, borderRadius: 70 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  checkEmoji: { fontSize: 36, color: colors.textPrimary, fontWeight: "700" },
  progressSection: { marginBottom: spacing.md },
  stepLabel: { ...typography.caption1, fontWeight: "700", letterSpacing: 2, marginBottom: spacing.sm },
  progressBarContainer: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginBottom: spacing.lg, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 2 },
  title: { ...typography.largeTitle, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
  planCard: { flexDirection: "row", backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, overflow: "hidden", marginBottom: spacing.lg },
  planCardAccent: { width: 5 },
  planCardContent: { flex: 1, padding: spacing.lg },
  planName: { ...typography.title2, color: colors.textPrimary, marginBottom: spacing.xs },
  planDescription: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  statsRow: { flexDirection: "row", backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.lg, marginBottom: spacing.xl },
  statCard: { flex: 1, alignItems: "center" },
  statValue: { ...typography.title1, fontWeight: "700", marginBottom: 4 },
  statLabel: { ...typography.caption1, color: colors.textMuted },
  statDivider: { width: 1, backgroundColor: colors.border },
  previewSection: { marginBottom: spacing.lg },
  previewTitle: { ...typography.title3, color: colors.textPrimary, marginBottom: spacing.xs },
  previewSubtitle: { ...typography.footnote, color: colors.textSecondary, marginBottom: spacing.md },
  workoutCard: { flexDirection: "row", backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: spacing.sm },
  workoutAccent: { width: 4 },
  workoutContent: { flex: 1, padding: spacing.md },
  workoutHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  workoutDay: { ...typography.caption1, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  workoutDuration: { ...typography.caption1, fontWeight: "700" },
  workoutTitle: { ...typography.headline, color: colors.textPrimary, marginBottom: 2 },
  workoutSubtitle: { ...typography.footnote, color: colors.textSecondary },
  footer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  ctaButton: { width: "100%", height: 60, borderRadius: borderRadius.full, alignItems: "center", justifyContent: "center" },
  ctaText: { ...typography.headline, color: colors.textPrimary, fontWeight: "700", fontSize: 18, letterSpacing: 0.5 },
});
