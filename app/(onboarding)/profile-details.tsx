import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { Gender } from '@/types/user';

const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 4 OF 5
          </Typography>
          <Typography variant="largeTitle">
            About you
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            This helps us personalise your plan safely
          </Typography>
        </View>

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

        <Input
          label="Height"
          placeholder="175"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          suffix="cm"
          containerStyle={styles.input}
        />

        <Typography variant="subheadline" color={colors.textSecondary} style={styles.genderLabel}>
          Gender
        </Typography>
        <View style={styles.genderRow}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setGender(option.value)}
              style={[
                styles.genderOption,
                gender === option.value && styles.genderSelected,
              ]}
            >
              <Typography
                variant="footnote"
                color={gender === option.value ? colors.primary : colors.textSecondary}
                style={{ fontWeight: '600' }}
              >
                {option.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

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
      </ScrollView>

      <View style={styles.footer}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontWeight: '600',
    letterSpacing: 1,
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
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  genderSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
