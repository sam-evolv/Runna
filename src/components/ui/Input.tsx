import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  suffix?: string;
}

export function Input({
  label,
  error,
  helper,
  containerStyle,
  suffix,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Typography variant="subheadline" color={colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
      )}
      <View style={[styles.inputContainer, focused && styles.focused, error ? styles.error : undefined]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {suffix && (
          <Typography variant="callout" color={colors.textSecondary} style={styles.suffix}>
            {suffix}
          </Typography>
        )}
      </View>
      {error && (
        <Typography variant="caption1" color={colors.error} style={styles.helper}>
          {error}
        </Typography>
      )}
      {helper && !error && (
        <Typography variant="caption1" color={colors.textTertiary} style={styles.helper}>
          {helper}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.primary,
  },
  error: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    ...typography.body,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  suffix: {
    paddingRight: spacing.lg,
  },
  helper: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
  },
});
