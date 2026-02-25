import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Typography variant="largeTitle" color={colors.primary} align="center">
            PULSE
          </Typography>
        </View>
        <Typography variant="title2" align="center" style={styles.tagline}>
          Your AI-powered{'\n'}fitness coach
        </Typography>
        <Typography variant="body" color={colors.textSecondary} align="center" style={styles.subtitle}>
          Personalised training plans for running, strength, triathlon, and more.
          Built by AI, guided by sports science.
        </Typography>
      </View>

      <View style={styles.features}>
        <FeatureRow icon="🏃" text="Structured running workouts with pace alerts" />
        <FeatureRow icon="💪" text="Strength programs with progressive overload" />
        <FeatureRow icon="⌚" text="Syncs to Apple Watch and Garmin" />
        <FeatureRow icon="🧠" text="AI adapts your plan to your progress" />
      </View>

      <View style={styles.buttons}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(auth)/register')}
          size="lg"
          fullWidth
        />
        <Button
          title="I already have an account"
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          size="lg"
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Typography variant="title3" style={styles.featureIcon}>{icon}</Typography>
      <Typography variant="callout" color={colors.textSecondary} style={styles.featureText}>
        {text}
      </Typography>
    </View>
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
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  tagline: {
    marginBottom: spacing.md,
  },
  subtitle: {
    paddingHorizontal: spacing.xl,
  },
  features: {
    paddingVertical: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    width: 36,
  },
  featureText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  buttons: {
    paddingBottom: spacing.xxl,
  },
});
