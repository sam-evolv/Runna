import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { formatWeight, formatHeight } from '@/utils/formatters';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { plan, goal } = usePlan();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Typography variant="largeTitle">Profile</Typography>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User info */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Typography variant="title1" align="center">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </Typography>
          </View>
          <Typography variant="title3" align="center">
            {user?.full_name || 'Athlete'}
          </Typography>
          <Typography variant="callout" color={colors.textSecondary} align="center">
            {user?.email}
          </Typography>

          {user?.weight_kg && user?.height_cm && (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Typography variant="headline">{formatWeight(user.weight_kg)}</Typography>
                <Typography variant="caption2" color={colors.textTertiary}>Weight</Typography>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Typography variant="headline">{formatHeight(user.height_cm)}</Typography>
                <Typography variant="caption2" color={colors.textTertiary}>Height</Typography>
              </View>
            </View>
          )}
        </Card>

        {/* Current Goal */}
        {goal && (
          <Card style={styles.sectionCard}>
            <Typography variant="headline" style={styles.sectionTitle}>Current Goal</Typography>
            <Typography variant="body">
              {goal.goal_subtype?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || goal.goal_type}
            </Typography>
            {goal.target_value && (
              <Typography variant="callout" color={colors.primary} style={{ marginTop: spacing.xs }}>
                Target: {goal.target_value}
              </Typography>
            )}
          </Card>
        )}

        {/* Connections */}
        <Card style={styles.sectionCard}>
          <Typography variant="headline" style={styles.sectionTitle}>Connections</Typography>
          <SettingRow label="Apple Health" value="Not connected" />
          <SettingRow label="Strava" value="Not connected" />
          <SettingRow label="Garmin Connect" value="Not connected" />
        </Card>

        {/* Settings */}
        <Card style={styles.sectionCard}>
          <Typography variant="headline" style={styles.sectionTitle}>Settings</Typography>
          <SettingRow label="Units" value={user?.unit_preference === 'imperial' ? 'Imperial' : 'Metric'} />
          <SettingRow label="Notifications" value="Enabled" />
        </Card>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          style={styles.signOutButton}
        />

        <Typography variant="caption2" color={colors.textTertiary} align="center" style={styles.version}>
          Pulse v1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Typography variant="callout">{label}</Typography>
      <Typography variant="callout" color={colors.textSecondary}>{value}</Typography>
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
    paddingBottom: spacing.huge,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  signOutButton: {
    marginTop: spacing.lg,
  },
  version: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
});
