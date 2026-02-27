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
import type { Gender } from '@/types/user';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

function GenderPill({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: (typeof genderOptions)[number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, animation.spring.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.spring.snappy);
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  }, [onSelect]);

  return (
    <Animated.View entering={FadeInUp.delay(500 + index * 60).duration(400).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.genderOption,
          animatedStyle,
          isSelected && styles.genderSelected,
        ]}
      >
        <Typography
          variant="footnote"
          color={isSelected ? colors.primary : colors.textSecondary}
          style={{ fontWeight: '600' }}
        >
          {option.label}
        </Typography>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [injuries, setInjuries] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Typography variant="caption1" color={colors.primary} style={styles.step}>
              STEP 4 OF 5
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Typography variant="largeTitle" color={colors.textPrimary}>
              About you
            </Typography>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
              This helps us personalise your plan safely
            </Typography>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(450)}>
          <View style={styles.row}>
            <Input
              label="Age"
              placeholder="30"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            <Input
              label="Weight"
              placeholder="75"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              suffix="kg"
              containerStyle={styles.halfInput}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(420).duration(450)}>
          <Input
            label="Height"
            placeholder="175"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            suffix="cm"
            containerStyle={styles.input}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(480).duration(450)}>
          <Typography variant="subheadline" color={colors.textSecondary} style={styles.genderLabel}>
            Gender
          </Typography>
        </Animated.View>

        <View style={styles.genderRow}>
          {genderOptions.map((option, index) => (
            <GenderPill
              key={option.value}
              option={option}
              isSelected={gender === option.value}
              onSelect={() => setGender(option.value)}
              index={index}
            />
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(700).duration(450)}>
          <Input
            label="Injury History (optional)"
            placeholder="e.g. Runner's knee 6 months ago, currently fine"
            value={injuries}
            onChangeText={setInjuries}
            multiline
            numberOfLines={3}
            containerStyle={styles.input}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/schedule',
              params: {
                ...params,
                age,
                gender: gender || 'prefer_not_to_say',
                weight,
                height,
                injuries,
              },
            });
          }}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.lg,
  },
  genderLabel: {
    marginBottom: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  genderOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  genderSelected: {
    borderColor: colors.primary,
    backgroundColor: withOpacity(colors.primary, 0.06),
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
