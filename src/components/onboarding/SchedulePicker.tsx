import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';

const days = [
  { num: 1, label: 'M' },
  { num: 2, label: 'T' },
  { num: 3, label: 'W' },
  { num: 4, label: 'T' },
  { num: 5, label: 'F' },
  { num: 6, label: 'S' },
  { num: 7, label: 'S' },
];

interface SchedulePickerProps {
  selectedDays: number[];
  onToggle: (day: number) => void;
}

export function SchedulePicker({ selectedDays, onToggle }: SchedulePickerProps) {
  return (
    <View style={styles.container}>
      {days.map((day) => {
        const isSelected = selectedDays.includes(day.num);
        return (
          <TouchableOpacity
            key={day.num}
            onPress={() => onToggle(day.num)}
            style={[styles.day, isSelected && styles.daySelected]}
          >
            <Typography
              variant="headline"
              color={isSelected ? colors.primary : colors.textTertiary}
            >
              {day.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  daySelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34,211,238,0.06)',
  },
});
