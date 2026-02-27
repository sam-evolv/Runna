import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Typography } from './Typography';
import { colors, spacing, borderRadius, glass, animation } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

const AnimatedView = Animated.View;

export function Input({
  label,
  error,
  helper,
  suffix,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const focusAnim = useSharedValue(0);
  const shakeAnim = useSharedValue(0);

  const handleFocus = () => {
    setFocused(true);
    focusAnim.value = withTiming(1, { duration: animation.normal });
  };

  const handleBlur = () => {
    setFocused(false);
    focusAnim.value = withTiming(0, { duration: animation.normal });
  };

  React.useEffect(() => {
    if (error) {
      shakeAnim.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [error]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : focusAnim.value > 0.5
      ? colors.primary
      : 'rgba(255,255,255,0.08)',
    backgroundColor: focusAnim.value > 0.5 ? 'rgba(34,211,238,0.04)' : 'rgba(255,255,255,0.04)',
    transform: [{ translateX: shakeAnim.value }],
  }));

  return (
    <View style={containerStyle}>
      {label && (
        <Typography
          variant="caption1"
          color={error ? colors.error : colors.textSecondary}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
      <AnimatedView style={[styles.inputContainer, animatedContainerStyle]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {suffix && (
          <Typography variant="callout" color={colors.textTertiary} style={styles.suffix}>
            {suffix}
          </Typography>
        )}
      </AnimatedView>
      {error && (
        <Typography variant="caption2" color={colors.error} style={styles.helper}>
          {error}
        </Typography>
      )}
      {!error && helper && (
        <Typography variant="caption2" color={colors.textTertiary} style={styles.helper}>
          {helper}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    minHeight: 48,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  suffix: {
    paddingRight: spacing.lg,
  },
  helper: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
