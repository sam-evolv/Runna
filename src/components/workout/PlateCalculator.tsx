import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { calculatePlates, formatPlates } from '@/utils/plateCalculator';

interface PlateCalculatorProps {
  targetWeight: number;
  unit?: 'kg' | 'lb';
}

const plateColors: Record<number, string> = {
  25: '#FF453A',
  20: '#0A84FF',
  15: '#FFD60A',
  10: '#30D158',
  5: '#FFFFFF',
  2.5: '#8E8E93',
  1.25: '#636366',
  // lb plates
  45: '#0A84FF',
  35: '#FFD60A',
  // 25 already defined
  // 10 already defined
  // 5 already defined
  // 2.5 already defined
};

export function PlateCalculator({ targetWeight, unit = 'kg' }: PlateCalculatorProps) {
  const result = calculatePlates(targetWeight, unit);

  if (result.plates.length === 0) return null;

  return (
    <View style={styles.container}>
      <Typography variant="caption1" color={colors.textTertiary} style={styles.label}>
        PLATE SETUP
      </Typography>
      <View style={styles.visual}>
        {/* Bar end */}
        <View style={styles.barEnd} />
        {/* Plates (shown in reverse so largest is closest to center) */}
        {[...result.plates].reverse().map((plate, idx) => (
          <View
            key={idx}
            style={[
              styles.plate,
              {
                backgroundColor: plateColors[plate] || 'rgba(255,255,255,0.15)',
                height: 20 + plate * 1.2,
              },
            ]}
          >
            <Typography variant="caption2" color={colors.textInverse} style={{ fontWeight: '700' }}>
              {plate}
            </Typography>
          </View>
        ))}
        {/* Collar */}
        <View style={styles.collar} />
      </View>
      <Typography variant="caption2" color={colors.textSecondary} align="center">
        {formatPlates(result, unit)}
      </Typography>
      {!result.isExact && (
        <Typography variant="caption2" color={colors.warning} align="center">
          Nearest: {result.totalWeight}{unit}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
  },
  label: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  visual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  barEnd: {
    width: 40,
    height: 6,
    backgroundColor: colors.textTertiary,
    borderRadius: 3,
  },
  plate: {
    width: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    marginLeft: 2,
  },
  collar: {
    width: 8,
    height: 16,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    marginLeft: 2,
  },
});
