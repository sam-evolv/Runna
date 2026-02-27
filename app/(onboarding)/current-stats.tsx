import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';
import type { GoalType, FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const levels: Array<{ level: FitnessLevel; label: string; description: string }> = [
  { level: 'beginner', label: 'Beginner', description: 'New to this or returning after a long break' },
  { level: 'intermediate', label: 'Intermediate', description: 'Regular training for 6+ months' },
  { level: 'advanced', label: 'Advanced', description: '2+ years consistent training' },
  { level: 'elite', label: 'Elite', description: 'Competitive level athlete' },
];

function LevelCard({
  item,
  isSelected,
  onSelect,
  index,
}: {
  item: (typeof levels)[number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [onSelect]);

  return (
    <Animated.View entering={FadeInUp.delay(300 + index * 80).duration(450).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.levelOption,
          animatedStyle,
          isSelected && styles.levelSelected,
          isSelected && shadows.glow(colors.primaryDark),
        ]}
      >
        <View style={styles.levelContent}>
          <Typography variant="headline" color={isSelected ? colors.textPrimary : colors.textPrimary}>
            {item.label}
          </Typography>
          <Typography
            variant="footnote"
            color={isSelected ? colors.textSecondary : colors.textTertiary}
            style={styles.levelDescription}
          >
            {item.description}
          </Typography>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Typography variant="caption1" color={colors.primary}>
              {'\u2713'}
            </Typography>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CurrentStatsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    goalType: GoalType;
    goalSubtype: string;
    targetValue: string;
  }>();

  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);

  // Running stats
  const [recent5k, setRecent5k] = useState('');
  const [recent10k, setRecent10k] = useState('');
  const [weeklyMileage, setWeeklyMileage] = useState('');

  // Strength stats
  const [benchPress, setBenchPress] = useState('');
  const [squat, setSquat] = useState('');
  const [deadlift, setDeadlift] = useState('');

  const isRunning = params.goalType === 'running' || params.goalType === 'triathlon';
  const isStrength = params.goalType === 'strength';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Typography variant="caption1" color={colors.primary} style={styles.step}>
              STEP 3 OF 5
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="largeTitle" color={colors.textPrimary}>
              Where are you now?
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Help us understand your current fitness level
            </Typography>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
            Experience Level
          </Typography>
        </Animated.View>

        <View style={styles.levels}>
          {levels.map((item, index) => (
            <LevelCard
              key={item.level}
              item={item}
              isSelected={fitnessLevel === item.level}
              onSelect={() => setFitnessLevel(item.level)}
              index={index}
            />
          ))}
        </View>

        {isRunning && (
          <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.statsSection}>
            <View style={styles.statsDivider} />
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Recent Times (optional)
            </Typography>
            <Input
              label="Recent 5k Time"
              placeholder="e.g. 25:30"
              value={recent5k}
              onChangeText={setRecent5k}
              containerStyle={styles.input}
            />
            <Input
              label="Recent 10k Time"
              placeholder="e.g. 55:00"
              value={recent10k}
              onChangeText={setRecent10k}
              containerStyle={styles.input}
            />
            <Input
              label="Weekly Mileage (km)"
              placeholder="e.g. 30"
              value={weeklyMileage}
              onChangeText={setWeeklyMileage}
              keyboardType="numeric"
              suffix="km"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}

        {isStrength && (
          <Animated.View entering={FadeInUp.delay(700).duration(500)} style={styles.statsSection}>
            <View style={styles.statsDivider} />
            <Typography variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
              Current Maxes (optional)
            </Typography>
            <Input
              label="Bench Press 1RM"
              placeholder="e.g. 80"
              value={benchPress}
              onChangeText={setBenchPress}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Squat 1RM"
              placeholder="e.g. 100"
              value={squat}
              onChangeText={setSquat}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
            <Input
              label="Deadlift 1RM"
              placeholder="e.g. 120"
              value={deadlift}
              onChangeText={setDeadlift}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.input}
            />
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/profile-details',
              params: {
                ...params,
                fitnessLevel: fitnessLevel || 'beginner',
                recent5k,
                recent10k,
                weeklyMileage,
                benchPress,
                squat,
                deadlift,
              },
            });
          }}
          disabled={!fitnessLevel}
          size="lg"
          fullWidth
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  step: {
    marginBottom: spacing.sm,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  levels: {
    gap: spacing.sm,
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  levelSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  levelContent: {
    flex: 1,
  },
  levelDescription: {
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  statsSection: {
    marginTop: spacing.lg,
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
