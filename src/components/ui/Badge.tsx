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
  dot?: boolean;
}

export function Badge({
  label,
  color = colors.textPrimary,
  backgroundColor = 'rgba(255,255,255,0.06)',
  size = 'sm',
  style,
  dot = false,
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
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
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

export function StatusDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs / 2 + 1,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
