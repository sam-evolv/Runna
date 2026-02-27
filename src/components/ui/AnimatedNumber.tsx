import React, { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { TextInput } from 'react-native';
import { colors, typography, animation } from '@/constants/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  formatFn?: (val: number) => string;
  style?: TextStyle;
  color?: string;
  duration?: number;
}

/**
 * Animates smoothly between numeric values.
 * Useful for pace, distance, time displays.
 */
export function AnimatedNumber({
  value,
  formatFn = (v) => String(Math.round(v)),
  style,
  color = colors.textPrimary,
  duration = animation.normal,
}: AnimatedNumberProps) {
  const animValue = useSharedValue(value);

  useEffect(() => {
    animValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const text = useDerivedValue(() => formatFn(animValue.value));

  const animatedProps = useAnimatedProps(() => ({
    text: text.value,
    defaultValue: text.value,
  }));

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      style={[
        {
          color,
          fontVariant: ['tabular-nums'],
          padding: 0,
          ...typography.monoSmall,
        },
        style,
      ]}
      animatedProps={animatedProps}
    />
  );
}
