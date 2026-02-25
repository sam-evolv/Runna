import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography, Mono } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, spacing } from '@/constants/theme';

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
    <View style={styles.container}>
      <Typography variant="title3" color={colors.textSecondary} align="center">
        REST
      </Typography>

      <View style={styles.timerContainer}>
        <Mono align="center" style={styles.timer}>
          {`${minutes}:${String(seconds).padStart(2, '0')}`}
        </Mono>
      </View>

      <ProgressBar progress={progress} height={6} color={colors.primary} style={styles.progress} />

      <View style={styles.adjustButtons}>
        <Button title="-15s" onPress={() => addTime(-15)} variant="secondary" size="sm" />
        <Button title="+15s" onPress={() => addTime(15)} variant="secondary" size="sm" />
        <Button title="+30s" onPress={() => addTime(30)} variant="secondary" size="sm" />
      </View>

      {nextSetInfo && (
        <View style={styles.nextInfo}>
          <Typography variant="caption1" color={colors.textTertiary}>NEXT UP</Typography>
          <Typography variant="callout" color={colors.textSecondary} align="center">
            {nextSetInfo}
          </Typography>
        </View>
      )}

      <Button
        title="Skip Rest"
        onPress={onSkip}
        variant="ghost"
        size="lg"
        fullWidth
        style={styles.skipButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  timerContainer: {
    marginVertical: spacing.xxxl,
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  progress: {
    marginBottom: spacing.xxl,
  },
  adjustButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  nextInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  skipButton: {
    marginTop: spacing.md,
  },
});
