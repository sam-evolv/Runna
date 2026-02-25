import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const colors = {
  // Primary
  primary: '#0A84FF',
  primaryDark: '#0066CC',
  primaryLight: '#3DA0FF',

  // Background
  background: '#0A0A0A',
  surface: '#1C1C1E',
  surfaceLight: '#2C2C2E',
  surfaceElevated: '#3A3A3C',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  textInverse: '#000000',

  // Accents
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  coral: '#FF6B6B',

  // Workout types
  easyRun: '#30D158',
  tempoRun: '#FF9F0A',
  intervalRun: '#FF453A',
  longRun: '#0A84FF',
  recoveryRun: '#BF5AF2',
  strength: '#FF6B6B',
  mobility: '#64D2FF',
  rest: '#8E8E93',

  // Misc
  border: '#38383A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  // Monospace for pace / time display
  mono: {
    fontSize: 48,
    fontWeight: '300' as const,
    lineHeight: 56,
    fontFamily: undefined, // Will use system monospace
  },
  monoSmall: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    fontFamily: undefined,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: spacing.lg,
  maxContentWidth: 428,
} as const;

export const workoutTypeColors: Record<string, string> = {
  easy_run: colors.easyRun,
  tempo_run: colors.tempoRun,
  interval_run: colors.intervalRun,
  long_run: colors.longRun,
  recovery_run: colors.recoveryRun,
  fartlek: colors.warning,
  hill_run: colors.coral,
  race_pace: colors.error,
  strength: colors.strength,
  mobility: colors.mobility,
  swim: '#64D2FF',
  bike: '#FFD60A',
  rest: colors.rest,
};
