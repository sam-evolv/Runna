import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, glass, shadows, withOpacity } from '@/constants/theme';

const FEATURES = [
  { icon: '\u{1F3C3}', text: 'Structured running workouts with pace alerts' },
  { icon: '\u{1F4AA}', text: 'Strength programs with progressive overload' },
  { icon: '\u231A', text: 'Syncs to Apple Watch and Garmin' },
  { icon: '\u{1F9E0}', text: 'AI adapts your plan to your progress' },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Animated.View
          entering={FadeIn.duration(1000).delay(200)}
          style={styles.logoContainer}
        >
          <Typography
            variant="largeTitle"
            color={colors.primary}
            align="center"
            style={[styles.logo, shadows.glow(colors.primary)]}
          >
            PULSE
          </Typography>
          <View style={styles.logoAccent} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(600)}>
          <Typography
            variant="title2"
            color={colors.textPrimary}
            align="center"
            style={styles.tagline}
          >
            Your AI-powered{'\n'}fitness coach
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(850)}>
          <Typography
            variant="body"
            color={colors.textSecondary}
            align="center"
            style={styles.subtitle}
          >
            Personalised training plans for running, strength, triathlon, and more.
            Built by AI, guided by sports science.
          </Typography>
        </Animated.View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((feature, index) => (
          <Animated.View
            key={feature.icon}
            entering={FadeInUp.duration(500).delay(1100 + index * 120)}
            style={styles.featureCard}
          >
            <View style={styles.featureIconContainer}>
              <Typography variant="title3">{feature.icon}</Typography>
            </View>
            <Typography
              variant="callout"
              color={colors.textSecondary}
              style={styles.featureText}
            >
              {feature.text}
            </Typography>
          </Animated.View>
        ))}
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(1650)}
        style={styles.buttons}
      >
        <Button
          title="Get Started"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(auth)/register');
          }}
          size="lg"
          fullWidth
          haptic={false}
        />
        <Button
          title="I already have an account"
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          size="lg"
          fullWidth
          style={styles.ghostButton}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.huge,
  },
  logoContainer: {
    marginBottom: spacing.xxxl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: 12,
  },
  logoAccent: {
    marginTop: spacing.md,
    width: 48,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.5),
  },
  tagline: {
    marginBottom: spacing.lg,
    lineHeight: 30,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  features: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...glass.card,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  buttons: {
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  ghostButton: {
    marginTop: spacing.xs,
  },
});
