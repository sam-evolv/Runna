import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Typography } from './Typography';
import { Button } from './Button';
import { colors, spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Beautiful empty state component with subtle entrance animation.
 * Use when a screen/section has no data to display.
 */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          <Typography variant="largeTitle" align="center" style={styles.icon}>
            {icon}
          </Typography>
        </View>
      )}
      <Typography variant="title3" align="center" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" color={colors.textSecondary} align="center" style={styles.message}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.action}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.huge,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.xl,
  },
});
