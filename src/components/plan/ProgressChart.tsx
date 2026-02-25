import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface ProgressChartProps {
  data: Array<{ label: string; value: number; maxValue: number }>;
  title: string;
  unit: string;
}

export function ProgressChart({ data, title, unit }: ProgressChartProps) {
  const maxVal = Math.max(...data.map((d) => d.maxValue), 1);

  return (
    <View style={styles.container}>
      <Typography variant="headline" style={styles.title}>{title}</Typography>
      <View style={styles.chart}>
        {data.map((item, idx) => {
          const height = (item.value / maxVal) * 120;
          return (
            <View key={idx} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 4),
                      backgroundColor: item.value >= item.maxValue * 0.8
                        ? colors.success
                        : colors.primary,
                    },
                  ]}
                />
              </View>
              <Typography variant="caption2" color={colors.textTertiary} align="center">
                {item.label}
              </Typography>
            </View>
          );
        })}
      </View>
      <Typography variant="caption1" color={colors.textTertiary} align="center" style={styles.unit}>
        {unit}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  unit: {
    marginTop: spacing.md,
  },
});
