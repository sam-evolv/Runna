import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, animation } from '@/constants/theme';

interface SkeletonLoaderProps {
  /** Width — number or percentage string. Defaults to '100%'. */
  width?: number | string;
  /** Height in px. Defaults to 16. */
  height?: number;
  /** Border radius. Defaults to borderRadius.md. */
  radius?: number;
  /** Extra style. */
  style?: ViewStyle;
}

/**
 * Shimmer skeleton placeholder for loading states.
 */
export function SkeletonLoader({
  width = '100%',
  height = 16,
  radius = borderRadius.md,
  style,
}: SkeletonLoaderProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.6]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: 'rgba(255,255,255,0.06)',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Pre-built skeleton for a card with lines. */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[skeletonStyles.card, style]}>
      <SkeletonLoader width="40%" height={12} />
      <SkeletonLoader width="100%" height={20} style={{ marginTop: spacing.sm }} />
      <SkeletonLoader width="70%" height={14} style={{ marginTop: spacing.sm }} />
      <SkeletonLoader width="100%" height={6} radius={3} style={{ marginTop: spacing.md }} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
});
