import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/constants/theme';
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
    <View style={styles.container}>
      {/* Completed sets */}
      {sets.map((set, idx) => {
        const completed = completedSets[idx];
        const isCurrent = idx === currentSetIndex;

        return (
          <View
            key={idx}
            style={[
              styles.setRow,
              completed && styles.setCompleted,
              isCurrent && styles.setCurrent,
            ]}
          >
            <View style={styles.setNumber}>
              <Typography
                variant="callout"
                color={completed ? colors.success : isCurrent ? colors.primary : colors.textTertiary}
                style={{ fontWeight: '700' }}
              >
                {completed ? '✓' : idx + 1}
              </Typography>
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
          </View>
        );
      })}

      {/* Log current set */}
      {!isComplete && currentTargetSet && (
        <View style={styles.logSection}>
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
        </View>
      )}

      {isComplete && (
        <View style={styles.allDone}>
          <Typography variant="headline" color={colors.success} align="center">
            All sets completed!
          </Typography>
        </View>
      )}
    </View>
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
  },
  setCompleted: {
    opacity: 0.5,
  },
  setCurrent: {
    backgroundColor: colors.surfaceLight,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    padding: spacing.xxl,
  },
});
