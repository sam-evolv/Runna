import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity, sportColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { usePlanStore } from '@/stores/planStore';
import type { GoalType, GoalSubtype, FitnessLevel } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getWorkoutColor(type: string): string {
  const map: Record<string, string> = {
    easy_run: colors.running,
    tempo_run: colors.running,
    recovery_run: colors.hyrox,
    long_run: colors.running,
    strength: colors.strength,
    hyrox: colors.hyrox,
    swim: colors.triathlon,
    bike: colors.triathlon,
    run: colors.running,
    mobility: colors.secondary,
    rest: colors.border,
  };
  return map[type] || colors.general;
}

export default function PlanReadyScreen() {
  const router = useRouter();
  const {
    goalType,
    targetData,
    fitnessData,
    availabilityData,
    profileData,
    equipmentData,
  } = useLocalSearchParams<{
    goalType: string;
    targetData: string;
    fitnessData: string;
    availabilityData: string;
    profileData: string;
    equipmentData: string;
  }>();

  const { user, setOnboarded, updateProfile } = useAuthStore();
  const { createGoalAndGeneratePlan, currentPlan, workouts, isGenerating, generationProgress } = usePlanStore();

  const [error, setError] = useState<string | null>(null);
  const [planGenerated, setPlanGenerated] = useState(false);

  const accentColor = sportColors[goalType || 'general_fitness']