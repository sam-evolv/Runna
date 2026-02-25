export interface ExerciseInfo {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  isCompound: boolean;
}

export type ExerciseCategory = 'barbell' | 'dumbbell' | 'bodyweight' | 'machine' | 'cable' | 'kettlebell' | 'band';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'forearms' | 'full_body';
export type Equipment = 'barbell' | 'dumbbells' | 'pull_up_bar' | 'bench' | 'squat_rack' | 'cable_machine' | 'kettlebell' | 'resistance_bands' | 'none' | 'machine';

export const exercises: ExerciseInfo[] = [
  // Compound barbell
  { id: 'bench_press', name: 'Bench Press', category: 'barbell', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['barbell', 'bench'], isCompound: true },
  { id: 'squat', name: 'Squat', category: 'barbell', muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'], equipment: ['barbell', 'squat_rack'], isCompound: true },
  { id: 'deadlift', name: 'Deadlift', category: 'barbell', muscleGroups: ['hamstrings', 'glutes', 'back', 'core'], equipment: ['barbell'], isCompound: true },
  { id: 'overhead_press', name: 'Overhead Press', category: 'barbell', muscleGroups: ['shoulders', 'triceps', 'core'], equipment: ['barbell'], isCompound: true },
  { id: 'barbell_row', name: 'Barbell Row', category: 'barbell', muscleGroups: ['back', 'biceps'], equipment: ['barbell'], isCompound: true },
  { id: 'front_squat', name: 'Front Squat', category: 'barbell', muscleGroups: ['quads', 'core', 'glutes'], equipment: ['barbell', 'squat_rack'], isCompound: true },
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', category: 'barbell', muscleGroups: ['hamstrings', 'glutes', 'back'], equipment: ['barbell'], isCompound: true },
  { id: 'incline_bench_press', name: 'Incline Bench Press', category: 'barbell', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: ['barbell', 'bench'], isCompound: true },

  // Dumbbell
  { id: 'dumbbell_press', name: 'Dumbbell Press', category: 'dumbbell', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['dumbbells', 'bench'], isCompound: true },
  { id: 'dumbbell_row', name: 'Dumbbell Row', category: 'dumbbell', muscleGroups: ['back', 'biceps'], equipment: ['dumbbells'], isCompound: true },
  { id: 'lateral_raise', name: 'Lateral Raise', category: 'dumbbell', muscleGroups: ['shoulders'], equipment: ['dumbbells'], isCompound: false },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', category: 'dumbbell', muscleGroups: ['biceps'], equipment: ['dumbbells'], isCompound: false },
  { id: 'tricep_extension', name: 'Tricep Extension', category: 'dumbbell', muscleGroups: ['triceps'], equipment: ['dumbbells'], isCompound: false },
  { id: 'goblet_squat', name: 'Goblet Squat', category: 'dumbbell', muscleGroups: ['quads', 'glutes'], equipment: ['dumbbells'], isCompound: true },
  { id: 'dumbbell_lunge', name: 'Dumbbell Lunge', category: 'dumbbell', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: ['dumbbells'], isCompound: true },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell Shoulder Press', category: 'dumbbell', muscleGroups: ['shoulders', 'triceps'], equipment: ['dumbbells'], isCompound: true },

  // Bodyweight
  { id: 'push_up', name: 'Push Up', category: 'bodyweight', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['none'], isCompound: true },
  { id: 'pull_up', name: 'Pull Up', category: 'bodyweight', muscleGroups: ['back', 'biceps'], equipment: ['pull_up_bar'], isCompound: true },
  { id: 'chin_up', name: 'Chin Up', category: 'bodyweight', muscleGroups: ['back', 'biceps'], equipment: ['pull_up_bar'], isCompound: true },
  { id: 'dip', name: 'Dip', category: 'bodyweight', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['none'], isCompound: true },
  { id: 'plank', name: 'Plank', category: 'bodyweight', muscleGroups: ['core'], equipment: ['none'], isCompound: false },
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', category: 'bodyweight', muscleGroups: ['quads', 'glutes'], equipment: ['none'], isCompound: true },
  { id: 'burpee', name: 'Burpee', category: 'bodyweight', muscleGroups: ['full_body'], equipment: ['none'], isCompound: true },
  { id: 'mountain_climber', name: 'Mountain Climber', category: 'bodyweight', muscleGroups: ['core', 'full_body'], equipment: ['none'], isCompound: true },

  // Cable
  { id: 'cable_fly', name: 'Cable Fly', category: 'cable', muscleGroups: ['chest'], equipment: ['cable_machine'], isCompound: false },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'cable', muscleGroups: ['back', 'biceps'], equipment: ['cable_machine'], isCompound: true },
  { id: 'cable_row', name: 'Cable Row', category: 'cable', muscleGroups: ['back', 'biceps'], equipment: ['cable_machine'], isCompound: true },
  { id: 'face_pull', name: 'Face Pull', category: 'cable', muscleGroups: ['shoulders', 'back'], equipment: ['cable_machine'], isCompound: false },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', category: 'cable', muscleGroups: ['triceps'], equipment: ['cable_machine'], isCompound: false },
];

export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseInfo[] {
  return exercises.filter((e) => e.muscleGroups.includes(muscle));
}

export function getExercisesByEquipment(available: Equipment[]): ExerciseInfo[] {
  return exercises.filter((e) => e.equipment.every((eq) => available.includes(eq)));
}

export function getExerciseByName(name: string): ExerciseInfo | undefined {
  return exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
}
