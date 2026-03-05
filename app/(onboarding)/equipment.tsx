import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows, animation, withOpacity, sportColors } from '@/constants/theme';
import type { GoalType } from '@/types/plan';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface EquipmentItem {
  id: string;
  emoji: string;
  name: string;
  category?: string;
}

const STRENGTH_EQUIPMENT: EquipmentItem[] = [
  { id: 'barbell', emoji: '\u{1F3CB}\uFE0F', name: 'Barbell' },
  { id: 'dumbbells', emoji: '\u{1F4AA}', name: 'Dumbbells' },
  { id: 'kettlebells', emoji: '\u{1F514}', name: 'Kettlebells' },
  { id: 'cables', emoji: '\u{1F3AF}', name: 'Cable Machine' },
  { id: 'sled', emoji: '\u{1F6F7}', name: 'Sled' },
  { id: 'ski_erg', emoji: '\u26F7\uFE0F', name: 'Ski Erg' },
  { id: 'rower', emoji: '\u{1F6A3}', name: 'Rower' },
  { id: 'assault_bike', emoji: '\u{1F6B2}', name: 'Assault Bike' },
];

const RUNNING_EQUIPMENT: EquipmentItem[] = [
  { id: 'garmin', emoji: '\u231A', name: 'Garmin Watch', category: 'GPS Watch' },
  { id: 'apple_watch', emoji: '\u231A', name: 'Apple Watch', category: 'GPS Watch' },
  { id: 'no_watch', emoji: '\u274C', name: 'No GPS Watch', category: 'GPS Watch' },
  { id: 'treadmill', emoji: '\u{1F3C3}', name: 'Treadmill Access' },
  { id: 'heart_rate_monitor', emoji: '\u2764\uFE0F', name: 'Heart Rate Monitor' },
  { id: 'foam_roller', emoji: '\u{1F9F4}', name: 'Foam Roller' },
];

const TRIATHLON_EQUIPMENT: EquipmentItem[] = [
  { id: 'pool_access', emoji: '\u{1F3CA}', name: 'Pool Access' },
  { id: 'road_bike', emoji: '\u{1F6B4}', name: 'Road Bike', category: 'Bike' },
  { id: 'tri_bike', emoji: '\u{1F6B4}', name: 'Tri Bike', category: 'Bike' },
  { id: 'turbo_trainer', emoji: '\u{1F4A8}', name: 'Turbo Trainer', category: 'Bike' },
  { id: 'treadmill', emoji: '\u{1F3C3}', name: 'Treadmill' },
  { id: 'wetsuit', emoji: '\u{1F3CA}', name: 'Wetsuit' },
  { id: 'gps_watch', emoji: '\u231A', name: 'GPS Watch' },
];

const GENERAL_EQUIPMENT: EquipmentItem[] = [
  { id: 'gym_access', emoji: '\u{1F3E2}', name: 'Gym Access' },
  { id: 'barbell', emoji: '\u{1F3CB}\uFE0F', name: 'Barbell' },
  { id: 'dumbbells', emoji: '\u{1F4AA}', name: 'Dumbbells' },
  { id: 'kettlebells', emoji: '\u{1F514}', name: 'Kettlebells' },
  { id: 'pull_up_bar', emoji: '\u{1F4AA}', name: 'Pull-up Bar' },
  { id: 'resistance_bands', emoji: '\u{1F9F6}', name: 'Resistance Bands' },
  { id: 'treadmill', emoji: '\u{1F3C3}', name: 'Treadmill' },
  { id: 'rower', emoji: '\u{1F6A3}', name: 'Rower' },
];

function getEquipmentForGoal(goalType: string): EquipmentItem[] {
  switch (goalType as GoalType) {
    case 'strength':
    case 'hyrox':
      return STRENGTH_EQUIPMENT;
    case 'running':
      return RUNNING_EQUIPMENT;
    case 'triathlon':
      return TRIATHLON_EQUIPMENT;
    case 'general_fitness':
    default:
      return GENERAL_EQUIPMENT;
  }
}

function EquipmentCard({
  item,
  isEnabled,
  onToggle,
  accentColor,
  index,
}: {
  item: EquipmentItem;
  isEnabled: boolean;
  onToggle: () => void;
  accentColor: string;
  index: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 60).duration(300)}>
      <Pressable
        onPress={onToggle}
        style={[
          styles.equipmentCard,
          isEnabled && {
            borderColor: withOpacity(accentColor, 0.4),
            backgroundColor: withOpacity(accentColor, 0.05),
          },
        ]}
      >
        <View style={[styles.equipmentEmoji, { backgroundColor: withOpacity(accentColor, 0.1) }]}>
          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
        </View>
        <View style={styles.equipmentContent}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          {item.category && (
            <Text style={styles.equipmentCategory}>{item.category}</Text>
          )}
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: withOpacity(accentColor, 0.4) }}
          thumbColor={isEnabled ? accentColor : colors.textMuted}
          ios_backgroundColor={colors.border}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function EquipmentScreen() {
  const router = useRouter();
  const { goalType, fitnessData, targetData, availabilityData, profileData } =
    useLocalSearchParams<{
      goalType: string;
      fitnessData: string;
      targetData: string;
      availabilityData: string;
      profileData: string;
    }>();

  const equipment = getEquipmentForGoal(goalType || 'general_fitness');
  const [enabledItems, setEnabledItems] = useState<Set<string>>(new Set());
  const buttonScale = useSharedValue(1);

  const accentColor = sportColors[goalType || 'general_fitness'] || colors.general;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const toggleItem = (itemId: string) => {
    setEnabledItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/plan-ready',
      params: {
        goalType: goalType || 'general_fitness',
        fitnessData: fitnessData || '{}',
        targetData: targetData || '{}',
        availabilityData: availabilityData || '{}',
        profileData: profileData || '{}',
        equipmentData: JSON.stringify(Array.from(enabledItems)),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  // Group by category if applicable
  const categories = equipment.reduce<Record<string, EquipmentItem[]>>((acc, item) => {
    const cat = item.category || 'Equipment';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const hasCategories = Object.keys(categories).length > 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.backRow}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'\u2190'}</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.stepLabel, { color: accentColor }]}>STEP 7 OF 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: '87.5%', backgroundColor: accentColor }]} />
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Equipment access</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.headerSubtitle}>
            What do you have available for training?
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {hasCategories ? (
          Object.entries(categories).map(([categoryName, items]) => (
            <View key={categoryName}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryLabel, { color: accentColor }]}>
                  {categoryName.toUpperCase()}
                </Text>
              </View>
              {items.map((item, index) => (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  isEnabled={enabledItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                  accentColor={accentColor}
                  index={index}
                />
              ))}
            </View>
          ))
        ) : (
          equipment.map((item, index) => (
            <EquipmentCard
              key={item.id}
              item={item}
              isEnabled={enabledItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
              accentColor={accentColor}
              index={index}
            />
          ))
        )}

        {/* Quick select row */}
        <Animated.View entering={FadeInDown.delay(800).duration(300)}>
          <View style={styles.quickSelectRow}>
            <Pressable
              onPress={() => setEnabledItems(new Set(equipment.map((e) => e.id)))}
              style={styles.quickSelectButton}
            >
              <Text style={[styles.quickSelectText, { color: accentColor }]}>Select All</Text>
            </Pressable>
            <Pressable
              onPress={() => setEnabledItems(new Set())}
              style={styles.quickSelectButton}
            >
              <Text style={styles.quickSelectText}>Clear All</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(600).duration(400)} style={styles.footer}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={() => { buttonScale.value = withSpring(0.96, animation.spring.snappy); }}
          onPressOut={() => { buttonScale.value = withSpring(1, animation.spring.snappy); }}
          style={[styles.continueButton, buttonAnimatedStyle, { backgroundColor: accentColor, ...shadows.glow(accentColor) }]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </AnimatedPressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  backArrow: {
    ...typography.title3,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  stepLabel: {
    ...typography.caption1,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoryHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    ...typography.footnote,
    fontWeight: '700',
    letterSpacing: 1,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  equipmentEmoji: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  equipmentContent: {
    flex: 1,
  },
  equipmentName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  equipmentCategory: {
    ...typography.caption1,
    color: colors.textMuted,
    marginTop: 1,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  quickSelectButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quickSelectText: {
    ...typography.footnote,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
