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
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#4B5563',
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
            <TabIcon icon={'\uD83D\uDCC5'} label="Plan" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\uD83D\uDCCA'} label="Progress" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\uD83E\uDDE0'} label="Coach" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={'\uD83D\uDC64'} label="Profile" color={color} focused={focused} />
          ),
        }}
      />
      {/* Hide old activity tab */}
      <Tabs.Screen
        name="activity"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  icon,
  label,
  color,
  focused,
}: {
  icon: string;
  label: string;
  color: string;
  focused: boolean;
}) {
  const scale = useSharedValue(1);
  const dotScale = useSharedValue(focused ? 1 : 0);
  const dotOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, animation.spring.snappy);
    dotScale.value = withSpring(focused ? 1 : 0, animation.spring.snappy);
    dotOpacity.value = withSpring(focused ? 1 : 0, animation.spring.snappy);
  }, [focused]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotAnimStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={styles.tabContainer}>
      <Animated.View style={iconAnimStyle}>
        <Text
          style={[
            styles.tabEmoji,
            { opacity: focused ? 1 : 0.4 },
          ]}
        >
          {icon}
        </Text>
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          {
            color,
            fontWeight: focused ? '600' : '400',
            opacity: focused ? 1 : 0.6,
          },
        ]}
      >
        {label}
      </Text>
      <Animated.View style={[styles.activeDot, dotAnimStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#050505',
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    height: 88,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    elevation: 0,
  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 52,
    paddingTop: 2,
  },
  tabEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
});
