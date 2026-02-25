import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing } from '@/constants/theme';

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Typography variant="caption1" color={colors.primary} style={styles.step}>
            EVENT DETAILS (OPTIONAL)
          </Typography>
          <Typography variant="largeTitle">
            Training for an event?
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            We'll taper your plan to peak on race day
          </Typography>
        </View>

        <Input
          label="Event Name"
          placeholder="e.g. Dublin Marathon 2026"
          value={eventName}
          onChangeText={setEventName}
          containerStyle={styles.input}
        />
        <Input
          label="Event Date"
          placeholder="YYYY-MM-DD"
          value={eventDate}
          onChangeText={setEventDate}
          containerStyle={styles.input}
          helper="Format: 2026-10-25"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/schedule',
              params: { ...params, eventName, eventDate },
            });
          }}
          size="lg"
          fullWidth
        />
        <Button
          title="Skip - no specific event"
          onPress={() => {
            router.push({
              pathname: '/(onboarding)/schedule',
              params: { ...params },
            });
          }}
          variant="ghost"
          size="md"
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  step: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  input: {
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
