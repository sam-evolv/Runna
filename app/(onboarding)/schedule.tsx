import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/constants/theme';

const days = [
  { num: 1, short: 'Mon', full: 'Monday' },
  { num: 2, short: 'Tue', full: 'Tuesday' },
  { num: 3, short: 'Wed', full: 'Wednesday' },
  { num: 4, short: 'Thu', full: 'Thursday' },
  { num: 5, short: 'Fri', full: 'Friday' },
  { num: 6, short: 'Sat', full: 'Saturday' },
  { num: 7, short: 'Sun', full: 'Sunday' },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [longSessionDay, setLongSessionDay] = useState<number | null>(null);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
    if (longSessionDay === day) setLongSessionDay(null);
  };

  const isRunningOrTri = params.goalType === 'running' || params.goalType === 'triathlon';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            STEP 5 OF 5
          </Typography>
          <Typography variant="largeTitle">
            Your schedule
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Which days can you train?
          </Typography>
        </View>

        <View style={styles.daysGrid}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.num}
              onPress={() => toggleDay(day.num)}
              style={[
                styles.dayButton,
                selectedDays.includes(day.num) && styles.daySelected,
              ]}
            >
              <Typography
                variant="headline"
                color={selectedDays.includes(day.num) ? colors.primary : colors.textSecondary}
              >
                {day.short}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        <Typography variant="footnote" color={colors.textSecondary} align="center" style={styles.hint}>
          {selectedDays.length === 0
            ? 'Select at least 3 days for best results'
            : `${selectedDays.length} days selected`}
        </Typography>

        {isRunningOrTri && selectedDays.length >= 3 && (
          <View style={styles.longRunSection}>
            <Typography variant="headline" style={styles.sectionTitle}>
              Long run day
            </Typography>
            <Typography variant="footnote" color={colors.textSecondary} style={styles.longRunHint}>
              Which day works best for your longest session?
            </Typography>
            <View style={styles.longRunOptions}>
              {selectedDays.sort().map((dayNum) => {
                const day = days.find((d) => d.num === dayNum)!;
                return (
                  <TouchableOpacity
                    key={dayNum}
                    onPress={() => setLongSessionDay(dayNum)}
                    style={[
                      styles.longRunOption,
                      longSessionDay === dayNum && styles.longRunSelected,
                    ]}
                  >
                    <Typography
                      variant="callout"
                      color={longSessionDay === dayNum ? colors.primary : colors.textSecondary}
                    >
                      {day.full}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Generate My Plan"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/generating',
              params: {
                ...params,
                availableDays: JSON.stringify(selectedDays),
                longSessionDay: String(longSessionDay || ''),
              },
            });
          }}
          disabled={selectedDays.length < 2}
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
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxxl,
  },
  step: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  daySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  hint: {
    marginTop: spacing.lg,
  },
  longRunSection: {
    marginTop: spacing.xxxl,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  longRunHint: {
    marginBottom: spacing.md,
  },
  longRunOptions: {
    gap: spacing.sm,
  },
  longRunOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  longRunSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
