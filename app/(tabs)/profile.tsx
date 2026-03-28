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
import {
  User,
  Settings,
  Link2,
  Bell,
  Scale,
  LogOut,
  ChevronRight,
  Heart,
  Watch,
  Activity,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';

// ─── Connected Services ─────────────────────────────────────────────────────────
interface ConnectedService {
  name: string;
  icon: 'heart' | 'watch' | 'activity';
  description: string;
}

const SERVICES: ConnectedService[] = [
  { name: 'Apple Health', icon: 'heart', description: 'Sync workouts & health data' },
  { name: 'Garmin Connect', icon: 'watch', description: 'Import runs & activities' },
  { name: 'Strava', icon: 'activity', description: 'Share activities & compete' },
];

function ServiceIcon({ type, size, color }: { type: ConnectedService['icon']; size: number; color: string }) {
  switch (type) {
    case 'heart':
      return <Heart size={size} color={color} />;
    case 'watch':
      return <Watch size={size} color={color} />;
    case 'activity':
      return <Activity size={size} color={color} />;
  }
}

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
                <User size={36} color="#FFFFFF" />
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
                  <ServiceIcon type={service.icon} size={20} color="#A855F7" />
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
                  true: 'rgba(168,85,247,0.35)',
                }}
                thumbColor={
                  notificationsEnabled
                    ? '#A855F7'
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
            <LogOut size={18} color="#F87171" style={{ marginRight: 8 }} />
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
    backgroundColor: '#050505',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  largeTitle: {
    color: '#F1F1F6',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // Profile card
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarOuter: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  userName: {
    color: '#F1F1F6',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  goalBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(168,85,247,0.06)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  goalBadgeText: {
    color: '#A855F7',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Plan Progress
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    color: '#F1F1F6',
    fontSize: 16,
    fontWeight: '700',
  },
  progressPercent: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '700',
  },
  progressPlanName: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  progressWeekText: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },

  // Section label
  sectionLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Section card
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },

  // Connected Services
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  serviceRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  serviceIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(168,85,247,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: '#F1F1F6',
    fontSize: 15,
    fontWeight: '600',
  },
  serviceDesc: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    backgroundColor: 'transparent',
  },
  connectButtonPressed: {
    backgroundColor: 'rgba(168,85,247,0.1)',
  },
  connectButtonText: {
    color: '#A855F7',
    fontSize: 13,
    fontWeight: '600',
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: '#F1F1F6',
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },

  // Unit toggle pills
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0F',
    borderRadius: 999,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  unitPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
  },
  unitPillActive: {
    backgroundColor: '#A855F7',
  },
  unitPillText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signOutButtonPressed: {
    backgroundColor: 'rgba(248,113,113,0.08)',
  },
  signOutText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '600',
  },

  // Version
  version: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
});
