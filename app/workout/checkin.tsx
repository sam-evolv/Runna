import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  colors,
  spacing,
  borderRadius,
  withOpacity,
  shadows,
  typography,
} from '@/constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────────
type CheckinType = 'pre_workout' | 'post_workout';
type MoodLevel = 1 | 2 | 3 | 4 | 5;
type Step = 'mood' | 'sleep' | 'soreness' | 'ai_response' | 'rpe' | 'reflection' | 'feedback';

interface MoodOption {
  value: MoodLevel;
  label: string;
  emoji: string;
  color: string;
}

interface SorenessArea {
  id: string;
  label: string;
  emoji: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 5, label: 'Great', emoji: '\u{1F525}', color: colors.success },
  { value: 4, label: 'Good', emoji: '\u{1F4AA}', color: '#3B82F6' },
  { value: 3, label: 'Okay', emoji: '\u{1F610}', color: '#FBBF24' },
  { value: 2, label: 'Tired', emoji: '\u{1F634}', color: '#F97316' },
  { value: 1, label: 'Rough', emoji: '\u{1F62B}', color: colors.error },
];

const SLEEP_OPTIONS: MoodOption[] = [
  { value: 5, label: '8+ hours', emoji: '\u{1F31F}', color: colors.success },
  { value: 4, label: '7 hours', emoji: '\u{1F4A4}', color: '#3B82F6' },
  { value: 3, label: '6 hours', emoji: '\u{1F634}', color: '#FBBF24' },
  { value: 2, label: '5 hours', emoji: '\u{1F611}', color: '#F97316' },
  { value: 1, label: '< 5 hours', emoji: '\u{1F62B}', color: colors.error },
];

const SORENESS_AREAS: SorenessArea[] = [
  { id: 'legs', label: 'Legs', emoji: '\u{1F9B5}' },
  { id: 'back', label: 'Back', emoji: '\u{1F4AA}' },
  { id: 'shoulders', label: 'Shoulders', emoji: '\u{1F937}' },
  { id: 'chest', label: 'Chest', emoji: '\u{1F4AA}' },
  { id: 'core', label: 'Core', emoji: '\u{1F525}' },
  { id: 'arms', label: 'Arms', emoji: '\u{1F4AA}' },
  { id: 'knees', label: 'Knees', emoji: '\u26A0\uFE0F' },
  { id: 'none', label: 'No soreness', emoji: '\u2705' },
];

const RPE_SCALE = [
  { value: 1, label: 'Very light' },
  { value: 2, label: 'Light' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Somewhat hard' },
  { value: 5, label: 'Hard' },
  { value: 6, label: 'Harder' },
  { value: 7, label: 'Very hard' },
  { value: 8, label: 'Very hard+' },
  { value: 9, label: 'Extremely hard' },
  { value: 10, label: 'Maximum effort' },
];

// ─── AI Response Generator ──────────────────────────────────────────────────────
function getAIResponse(mood: MoodLevel, sleep: MoodLevel, soreness: string[]): {
  action: string;
  explanation: string;
  emoji: string;
} {
  if (mood >= 4 && sleep >= 4) {
    return {
      action: 'proceed',
      explanation: "Looking strong! Your energy and sleep are solid. Let's push today — your body is ready for it. Stick with the planned session.",
      emoji: '\u{1F525}',
    };
  }
  if (mood === 3 || sleep === 3) {
    const hasSoreness = soreness.length > 0 && !soreness.includes('none');
    return {
      action: 'adjust',
      explanation: hasSoreness
        ? `Not your best day, and I see soreness in your ${soreness.join(' and ')}. I've dialed back intensity by 15% and adjusted exercises to avoid those areas. We'll make up the volume later this week.`
        : "Not your best day — I've reduced the intensity by 10-15% but kept the structure. Smart training means listening to your body. You'll still get quality work done.",
      emoji: '\u{1F4AA}',
    };
  }
  if (mood === 2) {
    return {
      action: 'swap',
      explanation: "Recovery is part of the process. I've swapped today for a lighter session — some mobility work and easy movement. We'll redistribute the hard work across the rest of your week. Trust the process.",
      emoji: '\u{1F9D8}',
    };
  }
  return {
    action: 'rest',
    explanation: "Rest day. Your body is telling you something important — listen to it. Take today completely off. A 15-minute walk and some light stretching is all I'd suggest. We'll pick back up when you're ready.",
    emoji: '\u{1F33F}',
  };
}

function getPostWorkoutFeedback(rpe: number, couldPushHarder: boolean | null): string {
  if (rpe >= 8) {
    return "That was a solid effort! RPE 8+ means you pushed your limits today. Make sure to prioritise recovery — good nutrition and sleep will help you adapt from this session. Your next workout will be slightly lighter to allow recovery.";
  }
  if (rpe >= 6 && rpe <= 7) {
    return "Perfect intensity zone! RPE 6-7 is the sweet spot for building fitness without overtraining. You're making progress exactly where you should be. Consistency at this level compounds fast.";
  }
  if (couldPushHarder) {
    return "Good session, but sounds like you had more in the tank. I'll bump up the intensity slightly for next time — adding either more weight, more reps, or faster paces. Let's see what you're capable of!";
  }
  return "Nice work getting the session done! Every completed workout builds your fitness base. Focus on recovery and we'll push a bit more next time.";
}

// ─── Component ──────────────────────────────────────────────────────────────────
export default function CheckinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; workoutId?: string }>();
  const checkinType: CheckinType = (params.type as CheckinType) || 'pre_workout';
  const isPreWorkout = checkinType === 'pre_workout';

  const [step, setStep] = useState<Step>(isPreWorkout ? 'mood' : 'rpe');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [sleep, setSleep] = useState<MoodLevel | null>(null);
  const [soreness, setSoreness] = useState<string[]>([]);
  const [rpe, setRpe] = useState<number | null>(null);
  const [couldPushHarder, setCouldPushHarder] = useState<boolean | null>(null);
  const [feelingStronger, setFeelingStronger] = useState<string | null>(null);
  const [postNotes, setPostNotes] = useState('');

  const aiResponse = mood && sleep ? getAIResponse(mood, sleep, soreness) : null;

  const handleMoodSelect = (value: MoodLevel) => {
    setMood(value);
    setStep('sleep');
  };

  const handleSleepSelect = (value: MoodLevel) => {
    setSleep(value);
    setStep('soreness');
  };

  const handleSorenessConfirm = () => {
    setStep('ai_response');
  };

  const toggleSoreness = (id: string) => {
    if (id === 'none') {
      setSoreness(['none']);
      return;
    }
    setSoreness((prev) => {
      const filtered = prev.filter((s) => s !== 'none');
      return filtered.includes(id) ? filtered.filter((s) => s !== id) : [...filtered, id];
    });
  };

  const handleStartWorkout = () => {
    router.back();
  };

  const handleRpeSelect = (value: number) => {
    setRpe(value);
    setStep('reflection');
  };

  const handleReflectionDone = () => {
    setStep('feedback');
  };

  const handleDone = () => {
    router.back();
  };

  // ── Progress indicator ────────────────────────────────────
  const preSteps: Step[] = ['mood', 'sleep', 'soreness', 'ai_response'];
  const postSteps: Step[] = ['rpe', 'reflection', 'feedback'];
  const steps = isPreWorkout ? preSteps : postSteps;
  const currentStepIndex = steps.indexOf(step);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isPreWorkout ? 'Pre-Workout Check-In' : 'Post-Workout Reflection'}
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── PRE-WORKOUT: Mood ───────────────────────────────── */}
        {step === 'mood' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.questionText}>How are you feeling?</Text>
            <Text style={styles.questionSubtext}>
              This helps me adjust today's workout to match your energy.
            </Text>
            <View style={styles.optionsGrid}>
              {MOOD_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleMoodSelect(option.value)}
                  style={({ pressed }) => [
                    styles.moodCard,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: option.color }]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── PRE-WORKOUT: Sleep ──────────────────────────────── */}
        {step === 'sleep' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.questionText}>How did you sleep?</Text>
            <Text style={styles.questionSubtext}>
              Sleep quality directly impacts your training capacity and recovery.
            </Text>
            <View style={styles.optionsGrid}>
              {SLEEP_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSleepSelect(option.value)}
                  style={({ pressed }) => [
                    styles.moodCard,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: option.color }]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── PRE-WORKOUT: Soreness ───────────────────────────── */}
        {step === 'soreness' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.questionText}>Any soreness?</Text>
            <Text style={styles.questionSubtext}>
              Tap all areas that feel sore or tight. This helps me adjust exercise selection.
            </Text>
            <View style={styles.sorenessGrid}>
              {SORENESS_AREAS.map((area) => {
                const isSelected = soreness.includes(area.id);
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => toggleSoreness(area.id)}
                    style={[
                      styles.sorenessChip,
                      isSelected && styles.sorenessChipSelected,
                    ]}
                  >
                    <Text style={styles.sorenessEmoji}>{area.emoji}</Text>
                    <Text
                      style={[
                        styles.sorenessLabel,
                        isSelected && styles.sorenessLabelSelected,
                      ]}
                    >
                      {area.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={handleSorenessConfirm}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── PRE-WORKOUT: AI Response ────────────────────────── */}
        {step === 'ai_response' && aiResponse && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.aiResponseCard}>
              <Text style={styles.aiResponseEmoji}>{aiResponse.emoji}</Text>
              <View style={styles.aiResponseBadge}>
                <Text style={styles.aiResponseBadgeText}>AI COACH</Text>
              </View>
              <Text style={styles.aiResponseText}>{aiResponse.explanation}</Text>
            </View>
            <Pressable
              onPress={handleStartWorkout}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.continueButtonText}>
                {aiResponse.action === 'rest' ? 'Got It' : 'Start Workout'}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── POST-WORKOUT: RPE ───────────────────────────────── */}
        {step === 'rpe' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.questionText}>How did that feel?</Text>
            <Text style={styles.questionSubtext}>
              Rate your perceived exertion from 1 (very light) to 10 (maximum).
            </Text>
            <View style={styles.rpeGrid}>
              {RPE_SCALE.map((item) => {
                const rpeColor =
                  item.value <= 3 ? colors.success :
                  item.value <= 6 ? '#FBBF24' :
                  item.value <= 8 ? '#F97316' : colors.error;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleRpeSelect(item.value)}
                    style={({ pressed }) => [
                      styles.rpeItem,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <View style={[styles.rpeCircle, { borderColor: rpeColor }]}>
                      <Text style={[styles.rpeNumber, { color: rpeColor }]}>
                        {item.value}
                      </Text>
                    </View>
                    <Text style={styles.rpeLabel}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── POST-WORKOUT: Reflection ────────────────────────── */}
        {step === 'reflection' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.questionText}>Quick reflection</Text>

            <Text style={styles.reflectionQuestion}>Could you have pushed harder?</Text>
            <View style={styles.yesNoRow}>
              {[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map((opt) => (
                <Pressable
                  key={opt.label}
                  onPress={() => setCouldPushHarder(opt.value)}
                  style={[
                    styles.yesNoButton,
                    couldPushHarder === opt.value && styles.yesNoButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.yesNoText,
                      couldPushHarder === opt.value && styles.yesNoTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.reflectionQuestion}>
              Do you feel like you're getting stronger/faster?
            </Text>
            <View style={styles.yesNoRow}>
              {['Yes', 'Plateau', 'Declining'].map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setFeelingStronger(opt)}
                  style={[
                    styles.yesNoButton,
                    feelingStronger === opt && styles.yesNoButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.yesNoText,
                      feelingStronger === opt && styles.yesNoTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.reflectionQuestion}>Any additional notes?</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Optional — any pain, discomfort, or thoughts..."
              placeholderTextColor={colors.textMuted}
              value={postNotes}
              onChangeText={setPostNotes}
              multiline
              numberOfLines={3}
            />

            <Pressable
              onPress={handleReflectionDone}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.continueButtonText}>See Feedback</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── POST-WORKOUT: AI Feedback ───────────────────────── */}
        {step === 'feedback' && rpe !== null && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={styles.aiResponseCard}>
              <Text style={styles.aiResponseEmoji}>
                {rpe >= 7 ? '\u{1F525}' : '\u{1F4AA}'}
              </Text>
              <View style={styles.aiResponseBadge}>
                <Text style={styles.aiResponseBadgeText}>AI COACH</Text>
              </View>
              <Text style={styles.aiResponseText}>
                {getPostWorkoutFeedback(rpe, couldPushHarder)}
              </Text>
              {feelingStronger === 'Plateau' && (
                <Text style={[styles.aiResponseText, { marginTop: spacing.md }]}>
                  You mentioned feeling like you've plateaued. This is normal — adaptation
                  isn't always linear. I'll introduce some variation in your next cycle to
                  break through. Trust the process.
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.continueButtonText}>Done</Text>
            </Pressable>
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
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
    paddingTop: spacing.xl,
  },

  // Questions
  questionText: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  questionSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },

  // Mood cards
  optionsGrid: {
    gap: spacing.sm,
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Soreness
  sorenessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sorenessChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sorenessChipSelected: {
    backgroundColor: withOpacity(colors.primary, 0.12),
    borderColor: withOpacity(colors.primary, 0.3),
  },
  sorenessEmoji: {
    fontSize: 16,
  },
  sorenessLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sorenessLabelSelected: {
    color: colors.primary,
  },

  // Continue button
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadows.glow(colors.primary),
  },
  continueButtonText: {
    color: '#050505',
    fontSize: 17,
    fontWeight: '700',
  },

  // AI Response
  aiResponseCard: {
    backgroundColor: withOpacity(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.15),
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  aiResponseEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  aiResponseBadge: {
    backgroundColor: withOpacity(colors.primary, 0.15),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  aiResponseBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  aiResponseText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  // RPE
  rpeGrid: {
    gap: spacing.sm,
  },
  rpeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  rpeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  rpeLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },

  // Reflection
  reflectionQuestion: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  yesNoButtonSelected: {
    backgroundColor: withOpacity(colors.primary, 0.12),
    borderColor: withOpacity(colors.primary, 0.3),
  },
  yesNoText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  yesNoTextSelected: {
    color: colors.primary,
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: spacing.sm,
  },
});
