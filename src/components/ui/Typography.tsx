import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Variant = keyof typeof typography;

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Typography({
  variant = 'body',
  color = colors.textPrimary,
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[typography[variant], { color, textAlign: align }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Convenience components
export function Title({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title1" {...props}>{children}</Typography>;
}

export function Heading({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="title2" {...props}>{children}</Typography>;
}

export function Subheading({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="headline" {...props}>{children}</Typography>;
}

export function Body({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props}>{children}</Typography>;
}

export function Caption({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption1" color={colors.textSecondary} {...props}>{children}</Typography>;
}

export function Mono({ children, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="mono" {...props}>{children}</Typography>;
}
