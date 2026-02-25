import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';
import {
  getEquipmentStatus,
  createNewShoe,
  type Equipment,
  type EquipmentStatus,
} from '@/services/equipmentTracker';
import {
  estimateMaxHR,
  calculateZonesFromMaxHR,
  calculateZonesFromHRR,
  type ZoneConfig,
} from '@/services/heartRateZones';
import { audioCoaching } from '@/services/audioCoaching';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { formatWeight, formatHeight } from '@/utils/formatters';

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  good: colors.success,
  warning: colors.warning,
  replace: colors.error,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { plan, goal } = usePlan();

  // Equipment state (would come from store/API in production)
  const [shoes, setShoes] = useState<Equipment[]>([]);
  const [showAddShoe, setShowAddShoe] = useState(false);
  const [newShoeName, setNewShoeName] = useState('');
  const [newShoeBrand, setNewShoeBrand] = useState('');
  const [newShoeModel, setNewShoeModel] = useState('');

  // HR zone state
  const [showHRSetup, setShowHRSetup] = useState(false);
  const [maxHR, setMaxHR] = useState('');
  const [restingHR, setRestingHR] = useState('');
  const [hrZones, setHRZones] = useState<ZoneConfig | null>(null);

  // Audio coaching settings
  const [audioCuesEnabled, setAudioCuesEnabled] = useState(true);
  const [paceAlerts, setPaceAlerts] = useState(true);
  const [distanceAlerts, setDistanceAlerts] = useState(true);

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

  const handleAddShoe = () => {
    if (!newShoeName.trim()) return;
    const shoe: Equipment = {
      id: `shoe_${Date.now()}`,
      user_id: user?.id ?? '',
      name: newShoeName.trim(),
      brand: newShoeBrand.trim(),
      model: newShoeModel.trim(),
      purchase_date: new Date().toISOString().split('T')[0],
      total_distance_km: 0,
      total_runs: 0,
      max_distance_km: 800,
      is_default: shoes.length === 0,
      is_retired: false,
      notes: null,
      created_at: new Date().toISOString(),
    };
    setShoes((prev) => [...prev, shoe]);
    setShowAddShoe(false);
    setNewShoeName('');
    setNewShoeBrand('');
    setNewShoeModel('');
  };

  const handleRetireShoe = (shoeId: string) => {
    Alert.alert('Retire Shoe', 'This shoe will be moved to retired. You can\'t undo this.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Retire',
        style: 'destructive',
        onPress: () => {
          setShoes((prev) => prev.map((s) => s.id === shoeId ? { ...s, is_retired: true } : s));
        },
      },
    ]);
  };

  const handleCalculateZones = () => {
    const max = parseInt(maxHR, 10);
    if (!max || max < 100 || max > 230) {
      Alert.alert('Invalid', 'Max HR should be between 100 and 230.');
      return;
    }
    const resting = parseInt(restingHR, 10);
    const config = resting && resting > 30 && resting < 120
      ? calculateZonesFromHRR(max, resting)
      : calculateZonesFromMaxHR(max);
    setHRZones(config);
    setShowHRSetup(false);
  };

  const handleEstimateMaxHR = () => {
    if (!user?.date_of_birth) {
      Alert.alert('Age needed', 'Set your date of birth in your profile to estimate max HR.');
      return;
    }
    const age = Math.floor(
      (Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    const estimated = estimateMaxHR(age);
    setMaxHR(String(estimated));
  };

  const activeShoes = shoes.filter((s) => !s.is_retired);

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

        {/* My Shoes */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="headline">My Shoes</Typography>
            <TouchableOpacity onPress={() => setShowAddShoe(true)}>
              <Typography variant="callout" color={colors.primary} style={{ fontWeight: '600' }}>
                + Add
              </Typography>
            </TouchableOpacity>
          </View>

          {activeShoes.length === 0 ? (
            <Typography variant="footnote" color={colors.textTertiary} style={{ marginTop: spacing.sm }}>
              Track your running shoes to know when they need replacing.
            </Typography>
          ) : (
            activeShoes.map((shoe) => {
              const status = getEquipmentStatus(shoe);
              return (
                <TouchableOpacity
                  key={shoe.id}
                  style={styles.shoeRow}
                  onLongPress={() => handleRetireShoe(shoe.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.shoeNameRow}>
                      <Typography variant="callout" style={{ fontWeight: '500' }}>
                        {shoe.name}
                      </Typography>
                      {shoe.is_default && (
                        <Badge label="Default" color={colors.primary} backgroundColor={`${colors.primary}20`} />
                      )}
                    </View>
                    {shoe.brand && (
                      <Typography variant="caption2" color={colors.textTertiary}>
                        {shoe.brand} {shoe.model}
                      </Typography>
                    )}
                    <View style={styles.shoeProgress}>
                      <ProgressBar
                        progress={status.percentUsed}
                        color={STATUS_COLORS[status.status]}
                        height={4}
                        style={{ flex: 1, marginRight: spacing.sm }}
                      />
                      <Typography variant="caption2" color={STATUS_COLORS[status.status]} style={{ fontWeight: '600' }}>
                        {Math.round(shoe.total_distance_km)}km
                      </Typography>
                    </View>
                  </View>
                  <Badge
                    label={status.status}
                    color={STATUS_COLORS[status.status]}
                    backgroundColor={`${STATUS_COLORS[status.status]}15`}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </Card>

        {/* Heart Rate Zones */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="headline">Heart Rate Zones</Typography>
            <TouchableOpacity onPress={() => setShowHRSetup(true)}>
              <Typography variant="callout" color={colors.primary} style={{ fontWeight: '600' }}>
                {hrZones ? 'Edit' : 'Set Up'}
              </Typography>
            </TouchableOpacity>
          </View>

          {hrZones ? (
            <View style={{ marginTop: spacing.sm }}>
              {hrZones.zones.map((zone) => (
                <View key={zone.zone} style={styles.zoneRow}>
                  <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
                  <Typography variant="caption1" style={{ width: 20, fontWeight: '600' }}>
                    Z{zone.zone}
                  </Typography>
                  <Typography variant="caption1" color={colors.textSecondary} style={{ flex: 1 }}>
                    {zone.name}
                  </Typography>
                  <Typography variant="caption1" style={{ fontWeight: '600' }}>
                    {zone.minBpm}–{zone.maxBpm}
                  </Typography>
                  <Typography variant="caption2" color={colors.textTertiary} style={{ marginLeft: spacing.xs }}>
                    bpm
                  </Typography>
                </View>
              ))}
            </View>
          ) : (
            <Typography variant="footnote" color={colors.textTertiary} style={{ marginTop: spacing.sm }}>
              Set up HR zones for real-time zone feedback during runs.
            </Typography>
          )}
        </Card>

        {/* Audio Coaching */}
        <Card style={styles.sectionCard}>
          <Typography variant="headline" style={styles.sectionTitle}>Audio Coaching</Typography>
          <ToggleRow
            label="Audio Cues"
            description="Voice announcements during runs"
            value={audioCuesEnabled}
            onToggle={(v) => {
              setAudioCuesEnabled(v);
              audioCoaching.updateConfig({ enabled: v });
            }}
          />
          <ToggleRow
            label="Pace Alerts"
            description="Tell me when I'm off target"
            value={paceAlerts}
            onToggle={(v) => {
              setPaceAlerts(v);
              audioCoaching.updateConfig({ paceAlerts: v });
            }}
          />
          <ToggleRow
            label="Distance Alerts"
            description="Announce each kilometre"
            value={distanceAlerts}
            onToggle={(v) => {
              setDistanceAlerts(v);
              audioCoaching.updateConfig({ distanceAlerts: v });
            }}
          />
        </Card>

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

      {/* Add Shoe Modal */}
      <Modal visible={showAddShoe} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Typography variant="title3" align="center" style={{ marginBottom: spacing.xl }}>
              Add Running Shoe
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="Shoe name (e.g. Daily Trainers)"
              placeholderTextColor={colors.textTertiary}
              value={newShoeName}
              onChangeText={setNewShoeName}
            />
            <TextInput
              style={styles.input}
              placeholder="Brand (e.g. Nike)"
              placeholderTextColor={colors.textTertiary}
              value={newShoeBrand}
              onChangeText={setNewShoeBrand}
            />
            <TextInput
              style={styles.input}
              placeholder="Model (e.g. Pegasus 41)"
              placeholderTextColor={colors.textTertiary}
              value={newShoeModel}
              onChangeText={setNewShoeModel}
            />
            <Button
              title="Add Shoe"
              onPress={handleAddShoe}
              fullWidth
              disabled={!newShoeName.trim()}
              style={{ marginTop: spacing.md }}
            />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => {
                setShowAddShoe(false);
                setNewShoeName('');
                setNewShoeBrand('');
                setNewShoeModel('');
              }}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* HR Zone Setup Modal */}
      <Modal visible={showHRSetup} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Typography variant="title3" align="center" style={{ marginBottom: spacing.xs }}>
              Heart Rate Zones
            </Typography>
            <Typography variant="footnote" color={colors.textSecondary} align="center" style={{ marginBottom: spacing.xl }}>
              Enter your max HR, or estimate it from your age
            </Typography>

            <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs }}>
              MAX HEART RATE
            </Typography>
            <View style={styles.hrInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="e.g. 190"
                placeholderTextColor={colors.textTertiary}
                value={maxHR}
                onChangeText={setMaxHR}
                keyboardType="number-pad"
              />
              <Button
                title="Estimate"
                variant="secondary"
                size="sm"
                onPress={handleEstimateMaxHR}
                style={{ marginLeft: spacing.sm }}
              />
            </View>

            <Typography variant="caption1" color={colors.textTertiary} style={{ fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md }}>
              RESTING HEART RATE (optional)
            </Typography>
            <TextInput
              style={styles.input}
              placeholder="e.g. 55"
              placeholderTextColor={colors.textTertiary}
              value={restingHR}
              onChangeText={setRestingHR}
              keyboardType="number-pad"
            />
            <Typography variant="caption2" color={colors.textTertiary} style={{ marginTop: spacing.xs }}>
              Adding resting HR uses the Karvonen method for more accurate zones
            </Typography>

            <Button
              title="Calculate Zones"
              onPress={handleCalculateZones}
              fullWidth
              disabled={!maxHR}
              style={{ marginTop: spacing.xl }}
            />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowHRSetup(false)}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>
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
        <Typography variant="caption2" color={colors.textTertiary}>{description}</Typography>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceLight, true: `${colors.primary}60` }}
        thumbColor={value ? colors.primary : colors.surfaceElevated}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  // Shoes
  shoeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  shoeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shoeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  // HR Zones
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hrInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
    paddingTop: spacing.md,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  signOutButton: {
    marginTop: spacing.lg,
  },
  version: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
});
