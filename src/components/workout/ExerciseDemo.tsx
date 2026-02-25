import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/constants/theme';
import { getExerciseByName, type ExerciseInfo } from '@/constants/exercises';

interface ExerciseDemoProps {
  exerciseName: string;
}

export function ExerciseDemo({ exerciseName }: ExerciseDemoProps) {
  const exercise = getExerciseByName(exerciseName);
  if (!exercise) return null;

  return (
    <Card style={styles.container}>
      <Typography variant="headline">{exercise.name}</Typography>
      <View style={styles.tags}>
        <Tag label={exercise.category} />
        {exercise.isCompound && <Tag label="Compound" />}
        {exercise.muscleGroups.map((mg) => (
          <Tag key={mg} label={mg.replace(/_/g, ' ')} />
        ))}
      </View>
      <Typography variant="caption1" color={colors.textTertiary} style={styles.equipment}>
        Equipment: {exercise.equipment.map((e) => e.replace(/_/g, ' ')).join(', ')}
      </Typography>
    </Card>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Typography variant="caption2" color={colors.textSecondary} style={{ textTransform: 'capitalize' }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equipment: {
    marginTop: spacing.sm,
  },
});
