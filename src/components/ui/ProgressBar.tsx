import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { colors, animation } from '@/constants/theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
  delay?: number;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  trackColor = 'rgba(255,255,255,0.06)',
  height = 6,
  style,
  animated = true,
  delay = 200,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const widthValue = useSharedValue(animated ? 0 : clampedProgress);

  useEffect(() => {
    if (animated) {
      widthValue.value = withDelay(
        delay,
        withTiming(clampedProgress, {
          duration: 800,
          easing: animation.easing.decelerate,
        }),
      );
    } else {
      widthValue.value = clampedProgress;
    }
  }, [clampedProgress, animated, delay]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${widthValue.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
          animatedFillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
