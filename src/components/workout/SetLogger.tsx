import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  colors,
  spacing,
  borderRadius,
  glass,
  animation,
  shadows,
  withOpacity,
} from '@/constants/theme';
import type { ExerciseSet } from '@/types/workout';
import type { CompletedSet } from '@/types/activity';

interface SetLoggerProps {
  sets: ExerciseSet[];
  completedSets: CompletedSet[];
  onLogSet: (reps: number, weight: number | null, rpe?: number) => void;
}

export function SetLogger({ sets, completedSets, onLogSet }: SetLoggerProps) {
  const currentSetIndex = completedSets.length;
  const currentTargetSet = sets[currentSetIndex];
  const isComplete = currentSetIndex >= sets.length;

  const [reps, setReps] = useState(String(currentTargetSet?.reps ?? ''));
  const [weight, setWeight] = useState(String(currentTargetSet?.weight_kg ?? ''));

  // Update inputs when moving to next set
  React.useEffect(() => {
    if (currentTargetSet) {
      setReps(String(currentTargetSet.reps));
      setWeight(String(currentTargetSet.weight_kg ?? ''));
    }
  }, [currentSetIndex]);

  const handleLog = () => {
    const parsedReps = parseInt(reps, 10);
    const parsedWeight = weight ? parseFloat(weight) : null;
    if (isNaN(parsedReps) || parsedReps <= 0) return;
    onLogSet(parsedReps, parsedWeight);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(animation.entrance).springify().damping(18)}
      style={styles.container}
    >
      {/* Set rows */}
      {sets.map((set, idx) => {
        const completed = completedSets[idx];
        const isCurrent = idx === currentSetIndex;

        return (
          <Animated.View
            key={idx}
            entering={FadeInDown.delay(idx * 40).duration(animation.entrance).springify().damping(20)}
            style={[
              styles.setRow,
              completed && styles.setCompleted,
              isCurrent && styles.setCurrent,
            ]}
          >
            {/* Current set left accent */}
            {isCurrent && (
              <View style={styles.currentAccent} />
            )}

            <View style={styles.setNumber}>
              {completed ? (
                <Animated.View entering={ZoomIn.duration(animation.normal)}>
                  <Typography
                    variant="callout"
                    color={colors.success}
                    style={{ fontWeight: '700' }}
                  >
                    {'✓'}
                  </Typography>
                </Animated.View>
              ) : (
                <Typography
                  variant="callout"
                  color={isCurrent ? colors.primary : colors.textTertiary}
                  style={{ fontWeight: '700' }}
                >
                  {idx + 1}
                </Typography>
              )}
            </View>

            <View style={styles.setDetail}>
              <Typography variant="callout" color={completed ? colors.textSecondary : colors.textPrimary}>
                {completed ? `${completed.reps} reps` : `${set.reps} reps`}
              </Typography>
            </View>

            <View style={styles.setDetail}>
              <Typography variant="callout" color={completed ? colors.textSecondary : colors.textPrimary}>
                {completed
                  ? completed.weight_kg ? `${completed.weight_kg} kg` : 'BW'
                  : set.weight_kg ? `${set.weight_kg} kg` : 'BW'}
              </Typography>
            </View>

            <View style={styles.setType}>
              <Typography variant="caption2" color={colors.textTertiary}>
                {set.type}
              </Typography>
            </View>
          </Animated.View>
        );
      })}

      {/* Log current set */}
      {!isComplete && currentTargetSet && (
        <Animated.View
          entering={FadeInDown.delay(sets.length * 40 + 100).duration(animation.entrance).springify().damping(18)}
          style={styles.logSection}
        >
          {/* Top edge glow */}
          <View style={styles.logSectionGlow} />

          <Typography variant="headline" style={styles.logTitle}>
            Set {currentSetIndex + 1}
          </Typography>
          <View style={styles.logInputs}>
            <Input
              label="Reps"
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              containerStyle={styles.logInput}
            />
            <Input
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              containerStyle={styles.logInput}
            />
          </View>
          <Button
            title="Log Set"
            onPress={handleLog}
            size="lg"
            fullWidth
          />
        </Animated.View>
      )}

      {isComplete && (
        <Animated.View
          entering={ZoomIn.duration(animation.entrance).springify().damping(14)}
          style={styles.allDone}
        >
          <View style={styles.allDoneGlow} />
          <Typography variant="headline" color={colors.success} align="center">
            All sets completed!
          </Typography>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 2,
    ...glass.card,
    overflow: 'hidden',
  },
  setCompleted: {
    opacity: 0.5,
  },
  setCurrent: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  currentAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: withOpacity(colors.primary, 0.6),
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  setDetail: {
    flex: 1,
  },
  setType: {
    width: 60,
    alignItems: 'flex-end',
  },
  logSection: {
    marginTop: spacing.lg,
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    overflow: 'hidden',
  },
  logSectionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logTitle: {
    marginBottom: spacing.md,
  },
  logInputs: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logInput: {
    flex: 1,
  },
  allDone: {
    ...glass.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    marginTop: spacing.lg,
    overflow: 'hidden',
    alignItems: 'center',
  },
  allDoneGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: withOpacity(colors.success, 0.2),
  },
});
