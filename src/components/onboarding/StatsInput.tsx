import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { colors, spacing } from '@/constants/theme';

interface StatsField {
  key: string;
  label: string;
  placeholder: string;
  suffix?: string;
  keyboardType?: 'numeric' | 'default';
}

interface StatsInputProps {
  title: string;
  fields: StatsField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function StatsInput({ title, fields, values, onChange }: StatsInputProps) {
  return (
    <View style={styles.container}>
      <Typography variant="headline" style={styles.title}>{title}</Typography>
      {fields.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          placeholder={field.placeholder}
          value={values[field.key] || ''}
          onChangeText={(val) => onChange(field.key, val)}
          keyboardType={field.keyboardType || 'default'}
          suffix={field.suffix}
          containerStyle={styles.input}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
});
