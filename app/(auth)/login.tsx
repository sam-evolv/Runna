import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, borderRadius, glass, shadows, withOpacity } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error);
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Animated.View entering={FadeIn.duration(800).delay(200)}>
              <Typography
                variant="caption1"
                color={colors.primary}
                style={styles.brandLabel}
              >
                PULSE
              </Typography>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(350)}>
              <Typography
                variant="largeTitle"
                color={colors.textPrimary}
                style={styles.title}
              >
                Welcome Back
              </Typography>
            </Animated.View>

            <Animated.View entering={FadeInUp.duration(600).delay(500)}>
              <Typography
                variant="body"
                color={colors.textSecondary}
                style={styles.subtitle}
              >
                Sign in to continue your training
              </Typography>
            </Animated.View>
          </View>

          {/* Form */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(650)}
            style={styles.formCard}
          >
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              containerStyle={styles.input}
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              containerStyle={styles.inputLast}
            />
          </Animated.View>

          {/* Error */}
          {error ? (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.errorCard}
            >
              <View style={styles.errorIconRow}>
                <Typography variant="footnote" color={colors.error}>
                  {error}
                </Typography>
              </View>
            </Animated.View>
          ) : null}

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(850)}
            style={styles.actions}
          >
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              fullWidth
            />
            <Button
              title="Don't have an account? Sign up"
              onPress={() => router.push('/(auth)/register')}
              variant="ghost"
              size="md"
              fullWidth
              style={styles.ghostButton}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xxxl,
  },
  brandLabel: {
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  formCard: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    ...glass.card,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.xl,
  },
  inputLast: {
    marginBottom: spacing.xs,
  },
  errorCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: withOpacity('#F87171', 0.06),
    borderWidth: 1,
    borderColor: withOpacity('#F87171', 0.12),
  },
  errorIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    marginTop: spacing.sm,
  },
  ghostButton: {
    marginTop: spacing.md,
  },
});
