import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
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
import * as Haptics from '@/utils/haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius, glass, animation, shadows, withOpacity } from '@/constants/theme';
import type { GoalType, GoalSubtype } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const subtypesByGoalType: Record<GoalType, Array<{ subtype: GoalSubtype; label: string; description: string }>> = {
  running: [
    { subtype: 'couch_to_5k', label: 'Couch to 5k', description: 'Start from scratch' },
    { subtype: '5k', label: '5k', description: 'Speed up your 5k time' },
    { subtype: '10k', label: '10k', description: 'Train for a 10k race' },
    { subtype: 'half_marathon', label: 'Half Marathon', description: '21.1km / 13.1 miles' },
    { subtype: 'marathon', label: 'Marathon', description: '42.2km / 26.2 miles' },
    { subtype: 'ultra', label: 'Ultra Marathon', description: '50k, 100k, or beyond' },
  ],
  strength: [
    { subtype: 'general_hypertrophy', label: 'Build Muscle', description: 'General hypertrophy program' },
    { subtype: 'powerlifting', label: 'Powerlifting', description: 'Squat, bench, deadlift focus' },
    { subtype: 'bench_press', label: 'Bench Press Goal', description: 'Hit a bench press target' },
    { subtype: 'squat', label: 'Squat Goal', description: 'Hit a squat target' },
    { subtype: 'deadlift', label: 'Deadlift Goal', description: 'Hit a deadlift target' },
  ],
  triathlon: [
    { subtype: 'sprint_tri', label: 'Sprint Triathlon', description: '750m/20km/5km' },
    { subtype: 'olympic_tri', label: 'Olympic Triathlon', description: '1.5km/40km/10km' },
    { subtype: 'half_ironman', label: 'Half Ironman (70.3)', description: '1.9km/90km/21.1km' },
    { subtype: 'ironman', label: 'Ironman', description: '3.8km/180km/42.2km' },
  ],
  general_fitness: [
    { subtype: 'couch_to_5k', label: 'Couch to 5k', description: 'Get running from zero' },
    { subtype: 'weight_loss', label: 'Weight Loss', description: 'Burn fat with cardio & strength' },
    { subtype: 'flexibility', label: 'Flexibility & Mobility', description: 'Improve range of motion' },
    { subtype: 'general_fitness', label: 'General Fitness', description: 'All-round fitness improvement' },
  ],
};

function SubtypeCard({
  item,
  isSelected,
  onSelect,
  index,
}: {
  item: { subtype: GoalSubtype; label: string; description: string };
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
    <Animated.View entering={FadeInUp.delay(200 + index * 80).duration(450).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.option,
          animatedStyle,
          isSelected && styles.optionSelected,
          isSelected && shadows.glow(colors.primaryDark),
        ]}
      >
        <View style={styles.optionContent}>
          <Typography variant="headline" color={colors.textPrimary}>
            {item.label}
          </Typography>
          <Typography
            variant="footnote"
            color={isSelected ? colors.textSecondary : colors.textTertiary}
            style={styles.optionDescription}
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

export default function GoalDetailsScreen() {
  const router = useRouter();
  const { goalType } = useLocalSearchParams<{ goalType: GoalType }>();
  const [selected, setSelected] = useState<GoalSubtype | null>(null);
  const [targetValue, setTargetValue] = useState('');

  const subtypes = subtypesByGoalType[goalType as GoalType] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Typography variant="caption1" color={colors.primary} style={styles.step}>
              STEP 2 OF 5
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="largeTitle" color={colors.textPrimary}>
              What specifically?
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Choose your specific goal
            </Typography>
          </Animated.View>
        </Animated.View>

        <View style={styles.options}>
          {subtypes.map((item, index) => (
            <SubtypeCard
              key={item.subtype}
              item={item}
              isSelected={selected === item.subtype}
              onSelect={() => setSelected(item.subtype)}
              index={index}
            />
          ))}
        </View>

        {selected && (
          <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.targetSection}>
            <View style={styles.targetDivider} />
            <Input
              label="Target (optional)"
              placeholder="e.g. Sub 3:30 marathon, 100kg bench press"
              value={targetValue}
              onChangeText={setTargetValue}
              containerStyle={styles.targetInput}
            />
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            if (selected) {
              router.push({
                pathname: '/(onboarding)/current-stats',
                params: { goalType, goalSubtype: selected, targetValue },
              });
            }
          }}
          disabled={!selected}
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
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  optionContent: {
    flex: 1,
  },
  optionDescription: {
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
  targetSection: {
    marginTop: spacing.xxl,
  },
  targetDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.xxl,
  },
  targetInput: {
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
