import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, animation } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 88,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\u26A1'} label="Today" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\u{1F4C5}'} label="Plan" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\u{1F4CA}'} label="Activity" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\u{1F464}'} label="Profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, label, color, focused }: { icon: string; label: string; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, animation.spring.snappy);
    dotOpacity.value = withSpring(focused ? 1 : 0, animation.spring.snappy);
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotOpacity.value }],
  }));

  return (
    <View style={styles.tabContainer}>
      <Animated.View style={iconStyle}>
        <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.45 }]}>{icon}</Text>
      </Animated.View>
      <Text style={[styles.tabLabel, { color, fontWeight: focused ? '600' : '400' }]}>{label}</Text>
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 56,
  },
  tabEmoji: {
    fontSize: 22,
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
});
