import React from 'react';
import { Platform, View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, glass, animation } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'elevated' | 'outlined';
  animate?: boolean;
  animationDelay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({ children, onPress, style, variant = 'default', animate = false, animationDelay = 0 }: CardProps) {
  const scale = useSharedValue(1);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, animation.spring.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animation.spring.snappy);
    }
  };

  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const cardStyle: ViewStyle[] = [
    styles.base,
    variant === 'default' && styles.glassDefault,
    variant === 'elevated' && styles.glassElevated,
    variant === 'outlined' && styles.outlined,
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    const entering = animate
      ? FadeInDown.delay(animationDelay).duration(animation.entrance).springify().damping(18)
      : undefined;

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        entering={entering}
        style={[...cardStyle, animatedScaleStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  if (animate) {
    return (
      <Animated.View
        entering={FadeInDown.delay(animationDelay).duration(animation.entrance).springify().damping(18)}
        style={cardStyle}
      >
        {children}
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  glassDefault: {
    ...glass.card,
  },
  glassElevated: {
    ...glass.cardElevated,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
