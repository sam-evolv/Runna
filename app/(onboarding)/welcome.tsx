import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();
  const glowOpacity = useSharedValue(0.3);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePress = () => {
    router.push('/(onboarding)/goal-selection');
  };

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Spacer */}
        <View style={styles.topSpacer} />

        {/* Logo Section */}
        <Animated.View entering={FadeIn.duration(1000)} style={styles.logoSection}>
          {/* Pulsing glow behind logo */}
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Animated.View entering={FadeInDown.delay(200).duration(800)}>
            <Text style={styles.logoText}>PULSE</Text>
          </Animated.View>
        </Animated.View>

        {/* Tagline */}
        <Animated.View entering={FadeInDown.delay(600).duration(800)} style={styles.taglineSection}>
          <Text style={styles.tagline}>Train smarter. Go further.</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View entering={FadeInDown.delay(900).duration(800)} style={styles.subtitleSection}>
          <Text style={styles.subtitle}>
            AI-powered coaching for runners, lifters, and athletes
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.bottomSpacer} />

        {/* CTA Button */}
        <Animated.View entering={FadeInUp.delay(1200).duration(800)} style={styles.ctaSection}>
          <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.ctaButton, buttonAnimatedStyle]}
          >
            <Text style={styles.ctaText}>Begin Your Journey</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  topSpacer: {
    flex: 2,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.3,
    ...shadows.glow(colors.primary),
    shadowRadius: 60,
    shadowOpacity: 0.6,
  },
  logoText: {
    ...typography.hero,
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 12,
    textAlign: 'center',
  },
  taglineSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  tagline: {
    ...typography.title1,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleSection: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSpacer: {
    flex: 3,
  },
  ctaSection: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  ctaButton: {
    width: '100%',
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow(colors.secondary),
    shadowRadius: 20,
    shadowOpacity: 0.35,
  },
  ctaText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
