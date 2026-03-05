import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Pressable,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import {
  colors,
  spacing,
  borderRadius,
  withOpacity,
  shadows,
} from '@/constants/theme';

// ─── Connected Services ─────────────────────────────────────────────────────────
interface ConnectedService {
  name: string;
  icon: string;
  description: string;
}

const SERVICES: ConnectedService[] = [
  { name: 'Apple Health', icon: '\u2764\uFE0F', description: 'Sync workouts & health data' },
  { name: 'Garmin Connect', icon: '\u231A', description: 'Import runs & activities' },
  { name: 'Strava', icon: '\u{1F6B4}', description: 'Share activities & compete' },
];

// ─── Component ──────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { plan, goal } = usePlan();

  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>(
    (user as { unit_preference?: string })?.unit_preference === 'imperial'
      ? 'imperial'
      : 'metric',
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Demo fallback
  const displayName =
    (user as { full_name?: string })?.full_name || 'Demo Athlete';
  const displayEmail = user?.email || 'demo@pulse.app';
  const initial = displayName[0]?.toUpperCase() || '?';

  const goalType = goal
    ? (goal.goal_subtype || goal.goal_type || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'General Fitness';

  const currentWeek = plan?.current_week ?? 4;
  const totalWeeks = plan?.total_weeks ?? 12;
  const planName = plan?.name || 'Half Marathon Training';
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      signOut();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/welcome' as never);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ────────────────────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.largeTitle}>Profile</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Avatar Section ─────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <View style={styles.profileCard}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>{goalType}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Plan Progress Card ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Plan Progress</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <Text style={styles.progressPlanName}>{planName}</Text>
            <Text style={styles.progressWeekText}>
              Week {currentWeek} of {totalWeeks}
            </Text>
            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Connected Services ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Text style={styles.sectionLabel}>CONNECTED SERVICES</Text>
          <View style={styles.sectionCard}>
            {SERVICES.map((service, idx) => (
              <View
                key={service.name}
                style={[
                  styles.serviceRow,
                  idx < SERVICES.length - 1 && styles.serviceRowBorder,
                ]}
              >
                <View style={styles.serviceIconWrap}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.connectButton,
                    pressed && styles.connectButtonPressed,
                  ]}
                >
                  <Text style={styles.connectButtonText}>Connect</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── Settings ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.sectionCard}>
            {/* Unit Preference Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Unit Preference</Text>
                <Text style={styles.settingDesc}>
                  {unitPreference === 'metric' ? 'km, kg' : 'mi, lbs'}
                </Text>
              </View>
              <View style={styles.unitToggle}>
                <Pressable
                  onPress={() => setUnitPreference('metric')}
                  style={[
                    styles.unitPill,
                    unitPreference === 'metric' && styles.unitPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitPillText,
                      unitPreference === 'metric' && styles.unitPillTextActive,
                    ]}
                  >
                    Metric
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setUnitPreference('imperial')}
                  style={[
                    styles.unitPill,
                    unitPreference === 'imperial' && styles.unitPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitPillText,
                      unitPreference === 'imperial' &&
                        styles.unitPillTextActive,
                    ]}
                  >
                    Imperial
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.settingDivider} />

            {/* Notifications Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDesc}>
                  Workout reminders & updates
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: 'rgba(255,255,255,0.08)',
                  true: withOpacity(colors.primary, 0.35),
                }}
                thumbColor={
                  notificationsEnabled
                    ? colors.primary
                    : 'rgba(255,255,255,0.3)'
                }
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Sign Out ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        {/* ── Version ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(450).duration(300)}>
          <Text style={styles.version}>Pulse v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
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
  largeTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },

  // Profile card
  profileCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarOuter: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow(colors.primary),
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  goalBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: withOpacity(colors.primary, 0.1),
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.2),
  },
  goalBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Plan Progress
  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  progressPercent: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  progressPlanName: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  progressWeekText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: withOpacity(colors.textMuted, 0.12),
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Section label
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  // Section card
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  // Connected Services
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  serviceRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  serviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: withOpacity(colors.primary, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  serviceDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  connectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: withOpacity(colors.primary, 0.3),
    backgroundColor: 'transparent',
  },
  connectButtonPressed: {
    backgroundColor: withOpacity(colors.primary, 0.1),
  },
  connectButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // Unit toggle pills
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  unitPillActive: {
    backgroundColor: colors.primary,
  },
  unitPillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },

  // Sign Out
  signOutButton: {
    borderWidth: 1,
    borderColor: withOpacity(colors.error, 0.4),
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signOutButtonPressed: {
    backgroundColor: withOpacity(colors.error, 0.08),
  },
  signOutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },

  // Version
  version: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
