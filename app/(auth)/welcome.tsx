import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
import { colors, spacing, borderRadius, shadows, withOpacity, typography } from '@/constants/theme';

const FEATURES = [
  { icon: '\u{1F3C3}', text: 'Run training: C25K to marathon', color: colors.running },
  { icon: '\u{1F4AA}', text: 'Strength & powerlifting programs', color: colors.strength },
  { icon: '\u{1F525}', text: 'HYROX & triathlon race prep', color: colors.hyrox },
  { icon: '\u{1F9E0}', text: 'AI coach that adapts to you', color: colors.primary },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

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
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
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
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      <View style={styles.hero}>
        <Animated.View
          entering={FadeIn.duration(1000).delay(200)}
          style={styles.logoContainer}
        >
          <Animated.View style={logoAnimStyle}>
            <Text style={[styles.logo, shadows.glow(colors.primary)]}>
              PULSE
            </Text>
          </Animated.View>
          <View style={styles.logoAccent} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(600)}>
          <Text style={styles.tagline}>
            Train smarter.{'\n'}Go further.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(700).delay(850)}>
          <Text style={styles.subtitle}>
            AI-powered coaching for runners, lifters,{'\n'}and athletes of every level.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.features}>
        {FEATURES.map((feature, index) => (
          <Animated.View
            key={feature.text}
            entering={FadeInUp.duration(500).delay(1100 + index * 120)}
            style={styles.featureCard}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: withOpacity(feature.color, 0.12) }]}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
            </View>
            <Text style={styles.featureText}>{feature.text}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(1650)}
        style={styles.buttons}
      >
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.ctaButtonText}>Get Started</Text>
        </Pressable>
        <Pressable
          style={styles.ghostButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.ghostButtonText}>I already have an account</Text>
        </Pressable>
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
    color: colors.primary,
  },
  logoAccent: {
    marginTop: spacing.md,
    width: 48,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: withOpacity(colors.primary, 0.5),
  },
  tagline: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    ...typography.callout,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.md,
  },
  buttons: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  ctaButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.primary),
  },
  ctaButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  ghostButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    ...typography.callout,
    color: colors.primary,
  },
});
