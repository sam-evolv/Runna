import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius, glass, shadows, withOpacity } from '@/constants/theme';

const FEATURES = [
  { icon: '\u{1F3C3}', text: 'Run training: C25K to marathon' },
  { icon: '\u{1F4AA}', text: 'Strength: beginner to powerlifting' },
  { icon: '\u{1F525}', text: 'HYROX & triathlon race prep' },
  { icon: '\u{1F9E0}', text: 'AI coach that adapts to you' },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated background glow */}
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      {/* Hero Section */}
      <View style={styles.hero}>
        <Animated.View
          entering={FadeIn.duration(1000).delay(200)}
          style={styles.logoContainer}
        >
          <Animated.View style={logoAnimStyle}>
            <Typography
              variant="largeTitle"
              color={colors.primary}
              align="center"
              style={[styles.logo, shadows.glow(colors.primary)]}
            >
              PULSE
            </Typography>
          </Animated.View>
          <View style={styles.logoAccent} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(600)}>
          <Typography
            variant="title2"
            color={colors.textPrimary}
            align="center"
            style={styles.tagline}
          >
            Your AI coach for{'\n'}every fitness goal
          </Typography>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(850)}>
          <Typography
            variant="body"
            color={colors.textSecondary}
            align="center"
            style={styles.subtitle}
          >
            One app. Every goal. Running, strength,{'\n'}HYROX, triathlon — all with AI coaching.
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
    paddingHorizontal: spacing.lg,
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
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
    marginBottom: spacing.md,
    lineHeight: 30,
  },
  subtitle: {
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  features: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
    marginLeft: spacing.md,
  },
  buttons: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  ghostButton: {
    marginTop: spacing.xs,
  },
});
