import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  color = colors.textPrimary,
  backgroundColor = colors.surfaceLight,
  size = 'sm',
  style,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor },
        size === 'md' && styles.md,
        style,
      ]}
    >
      <Typography
        variant={size === 'sm' ? 'caption2' : 'caption1'}
        color={color}
        style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
