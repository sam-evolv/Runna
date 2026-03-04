import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { colors, spacing, borderRadius, shadows, withOpacity } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { plan, goal } = usePlan();

  const [unitsMetric, setUnitsMetric] = useState(user?.unit_preference !== 'imperial');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { signOut(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const planProgress = plan ? (plan.current_week / plan.total_weeks) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Typography variant="largeTitle">Profile</Typography>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar + Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Typography variant="title1" color={colors.textInverse} align="center">{initial}</Typography>
            </View>
            {/* Progress ring simplified as a progress bar arc */}
            <View style={styles.progressRing}>
              <Typography variant="caption2" color={colors.primary} style={{ fontWeight: '700' }}>
                {Math.round(planProgress * 100)}%
              </Typography>
            </View>
          </View>
          <Typography variant="title3" align="center">{user?.full_name || 'Athlete'}</Typography>
          <Typography variant="callout" color={colors.textMuted} align="center">{user?.email}</Typography>

          {goal && (
            <View style={styles.goalBadge}>
              <Typography variant="caption1" color={colors.primary} style={{ fontWeight: '600' }}>
                {goal.goal_subtype?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || goal.goal_type}
              </Typography>
            </View>
          )}

          {plan && (
            <View style={styles.planProgress}>
              <Typography variant="caption2" color={colors.textMuted}>
                Week {plan.current_week} of {plan.total_weeks}
              </Typography>
              <ProgressBar
                progress={planProgress}
                height={4}
                style={{ marginTop: spacing.xs }}
              />
            </View>
          )}
        </Animated.View>

        {/* Connected Services */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.sectionCard}>
            <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
              CONNECTED SERVICES
            </Typography>
            <ServiceRow label="Apple Health" icon={'\u2764\uFE0F'} connected={false} />
            <ServiceRow label="Garmin Connect" icon={'\u231A'} connected={false} />
            <ServiceRow label="Strava" icon={'\u{1F3C3}'} connected={false} />
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.sectionCard}>
            <Typography variant="caption1" color={colors.textMuted} style={styles.sectionLabel}>
              SETTINGS
            </Typography>
            <ToggleRow
              label="Metric Units"
              description="Use km, kg"
              value={unitsMetric}
              onToggle={setUnitsMetric}
            />
            <ToggleRow
              label="Notifications"
              description="Workout reminders & updates"
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
          </View>
        </Animated.View>

        <Button title="Sign Out" onPress={handleSignOut} variant="danger" fullWidth style={styles.signOutButton} />
        <Typography variant="caption2" color={colors.textMuted} align="center" style={styles.version}>Pulse v1.0.0</Typography>
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceRow({ label, icon, connected }: { label: string; icon: string; connected: boolean }) {
  return (
    <View style={styles.serviceRow}>
      <Typography variant="callout" style={{ marginRight: spacing.sm }}>{icon}</Typography>
      <Typography variant="callout" style={{ flex: 1 }}>{label}</Typography>
      <TouchableOpacity style={[styles.connectButton, connected && styles.connectedButton]}>
        <Typography variant="caption1" color={connected ? colors.success : colors.primary} style={{ fontWeight: '600' }}>
          {connected ? 'Connected' : 'Connect'}
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

function ToggleRow({ label, description, value, onToggle }: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Typography variant="callout">{label}</Typography>
        <Typography variant="caption2" color={colors.textMuted}>{description}</Typography>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(255,255,255,0.08)', true: withOpacity(colors.primary, 0.35) }}
        thumbColor={value ? colors.primary : 'rgba(255,255,255,0.3)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  profileCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primaryDark),
  },
  progressRing: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
  },
  planProgress: {
    width: '100%',
    marginTop: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  connectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.sm,
  },
  connectedButton: {
    backgroundColor: withOpacity(colors.success, 0.1),
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  version: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
