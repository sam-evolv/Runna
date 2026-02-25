import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface GoalOption {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

interface GoalSelectorProps {
  options: GoalOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export function GoalSelector({ options, selected, onSelect }: GoalSelectorProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => onSelect(option.id)}
          activeOpacity={0.7}
          style={[
            styles.option,
            selected === option.id && styles.selected,
          ]}
        >
          <Typography variant="title2" style={styles.icon}>{option.icon}</Typography>
          <View style={styles.text}>
            <Typography variant="headline">{option.title}</Typography>
            <Typography variant="footnote" color={colors.textSecondary}>
              {option.subtitle}
            </Typography>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  icon: {
    width: 48,
    textAlign: 'center',
  },
  text: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
