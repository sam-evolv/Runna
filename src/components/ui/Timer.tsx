import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Mono } from './Typography';
import { Button } from './Button';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface TimerProps {
  /** Total seconds to count down from. If undefined, counts up. */
  duration?: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (secondsElapsed: number) => void;
  showControls?: boolean;
}

export function Timer({ duration, autoStart = false, onComplete, onTick, showControls = true }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onTick?.(next);
          if (duration && next >= duration) {
            clearTimer();
            setRunning(false);
            onComplete?.();
          }
          return next;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, duration, onComplete, onTick, clearTimer]);

  const displaySeconds = duration ? Math.max(duration - seconds, 0) : seconds;
  const hours = Math.floor(displaySeconds / 3600);
  const mins = Math.floor((displaySeconds % 3600) / 60);
  const secs = displaySeconds % 60;

  const formatted = hours > 0
    ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress = duration ? seconds / duration : 0;

  return (
    <View style={styles.container}>
      {duration && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
        </View>
      )}
      <Mono align="center" style={styles.time}>{formatted}</Mono>
      {showControls && (
        <View style={styles.controls}>
          <Button
            title={running ? 'Pause' : seconds > 0 ? 'Resume' : 'Start'}
            onPress={() => setRunning(!running)}
            variant={running ? 'secondary' : 'primary'}
            size="sm"
          />
          {seconds > 0 && (
            <Button
              title="Reset"
              onPress={() => {
                setRunning(false);
                setSeconds(0);
              }}
              variant="ghost"
              size="sm"
              style={{ marginLeft: spacing.sm }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  time: {
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
