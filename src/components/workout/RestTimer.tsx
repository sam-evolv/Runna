import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Typography, Mono } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  colors,
  spacing,
  borderRadius,
  glass,
  animation,
  shadows,
  withOpacity,
} from '@/constants/theme';

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
  nextSetInfo?: string;
}

export function RestTimer({ duration, onComplete, onSkip, nextSetInfo }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onComplete]);

  const addTime = (seconds: number) => {
    setRemaining((prev) => prev + seconds);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / duration;

  return (
    <Animated.View
      entering={FadeInDown.duration(animation.entrance).springify().damping(18)}
      style={styles.container}
    >
      {/* REST label with glass pill */}
      <Animated.View
        entering={FadeIn.delay(100).duration(animation.slow)}
        style={styles.labelPill}
      >
        <Typography variant="title3" color={colors.textSecondary} align="center">
          REST
        </Typography>
      </Animated.View>

      {/* Large countdown in glass card */}
      <Animated.View
        entering={ZoomIn.delay(150).duration(animation.entrance).springify().damping(16)}
        style={styles.timerCard}
      >
        {/* Top edge glow */}
        <View style={styles.timerCardGlow} />

        <Mono align="center" style={styles.timer}>
          {`${minutes}:${String(seconds).padStart(2, '0')}`}
        </Mono>
      </Animated.View>

      {/* Animated progress bar */}
      <Animated.View
        entering={FadeIn.delay(250).duration(animation.slow)}
        style={styles.progressWrapper}
      >
        <ProgressBar progress={progress} height={6} color={colors.primary} style={styles.progress} />
      </Animated.View>

      {/* Time adjustment buttons */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(animation.entrance).springify().damping(20)}
        style={styles.adjustButtons}
      >
        <Button title="-15s" onPress={() => addTime(-15)} variant="secondary" size="sm" />
        <Button title="+15s" onPress={() => addTime(15)} variant="secondary" size="sm" />
        <Button title="+30s" onPress={() => addTime(30)} variant="secondary" size="sm" />
      </Animated.View>

      {/* Next set info in glass card */}
      {nextSetInfo && (
        <Animated.View
          entering={FadeInDown.delay(400).duration(animation.entrance).springify().damping(20)}
          style={styles.nextInfoCard}
        >
          <Typography variant="caption1" color={colors.textTertiary} style={styles.nextLabel}>
            NEXT UP
          </Typography>
          <Typography variant="callout" color={colors.textSecondary} align="center">
            {nextSetInfo}
          </Typography>
        </Animated.View>
      )}

      {/* Skip button */}
      <Animated.View
        entering={FadeIn.delay(500).duration(animation.slow)}
      >
        <Button
          title="Skip Rest"
          onPress={onSkip}
          variant="ghost"
          size="lg"
          fullWidth
          style={styles.skipButton}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  labelPill: {
    alignSelf: 'center',
    ...glass.card,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  timerCard: {
    ...glass.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadows.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  timerCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  progressWrapper: {
    marginBottom: spacing.xxl,
  },
  progress: {
    marginBottom: 0,
  },
  adjustButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  nextInfoCard: {
    ...glass.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  nextLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  skipButton: {
    marginTop: spacing.md,
  },
});
