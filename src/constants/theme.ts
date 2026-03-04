import { Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Premium Dark Palette ────────────────────────────────────────────────────
export const colors = {
  // Primary — purple
  primary: '#6C5CE7',
  primaryDark: '#5A4BD6',
  primaryLight: '#A29BFE',
  primaryMuted: 'rgba(108,92,231,0.12)',

  // Secondary — teal
  secondary: '#00CEC9',
  secondaryMuted: 'rgba(0,206,201,0.12)',

  // Accent — pink
  accent: '#FD79A8',
  accentMuted: 'rgba(253,121,168,0.12)',

  // Background — premium dark
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceLight: '#1C1C26',
  surfaceElevated: '#1C1C26',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textTertiary: '#5A5A72',
  textMuted: '#5A5A72',
  textInverse: '#0A0A0F',

  // Status
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',

  // Workout type colours
  run: '#0984E3',
  strength: '#E17055',
  hyrox: '#6C5CE7',
  triathlon: '#00CEC9',
  recovery: '#00B894',

  // Workout sub-types (backward compat)
  easyRun: '#0984E3',
  tempoRun: '#FDCB6E',
  intervalRun: '#E17055',
  longRun: '#0984E3',
  recoveryRun: '#00B894',
  mobility: '#00CEC9',
  rest: 'rgba(255,255,255,0.2)',
  coral: '#E17055',

  // Utility
  border: '#2A2A38',
  borderLight: 'rgba(255,255,255,0.1)',
  overlay: 'rgba(0,0,0,0.75)',
  transparent: 'transparent',
  white: '#FFFFFF',
} as const;

/**
 * Returns a hex color with alpha applied.
 */
export function withOpacity(hex: string, opacity: number): string {
  if (hex.startsWith('rgba(')) return hex;
  if (hex.startsWith('rgb(')) {
    const inner = hex.slice(4, -1);
    return `rgba(${inner},${opacity})`;
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

// ─── Typography Scale ────────────────────────────────────────────────────────
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: -0.2,
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
    lineHeight: 24,
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
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  mono: {
    fontSize: 48,
    fontWeight: '200' as const,
    lineHeight: 56,
    fontFamily: undefined,
  },
  monoSmall: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 34,
    fontFamily: undefined,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  }),
} as const;

// ─── Glass Card Styles ───────────────────────────────────────────────────────
export const glass = {
  card: {
    backgroundColor: '#13131A' as string,
    borderWidth: 1,
    borderColor: '#2A2A38' as string,
  },
  cardElevated: {
    backgroundColor: '#1C1C26' as string,
    borderWidth: 1,
    borderColor: '#2A2A38' as string,
  },
  input: {
    backgroundColor: '#13131A' as string,
    borderWidth: 1,
    borderColor: '#2A2A38' as string,
  },
} as const;

// ─── Animations ──────────────────────────────────────────────────────────────
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  entrance: 500,

  spring: {
    gentle: { damping: 20, stiffness: 180, mass: 1 },
    snappy: { damping: 15, stiffness: 300, mass: 0.8 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.6 },
  },

  easing: {
    smooth: Easing.bezier(0.4, 0.0, 0.2, 1.0),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1.0),
    accelerate: Easing.bezier(0.4, 0.0, 1.0, 1.0),
    overshoot: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  },
} as const;

// ─── Gradients ───────────────────────────────────────────────────────────────
export const gradients = {
  primary: ['#6C5CE7', '#A29BFE'] as const,
  success: ['#00B894', '#55EFC4'] as const,
  warning: ['#FDCB6E', '#F9CA24'] as const,
  error: ['#E17055', '#D63031'] as const,
  purple: ['#6C5CE7', '#A29BFE'] as const,
  surface: ['#0A0A0F', '#13131A'] as const,
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: spacing.lg,
  maxContentWidth: 428,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  minTouchTarget: 48,
} as const;

// ─── Workout Type → Color ────────────────────────────────────────────────────
export const workoutTypeColors: Record<string, string> = {
  easy_run: colors.run,
  tempo_run: colors.tempoRun,
  interval_run: colors.intervalRun,
  long_run: colors.run,
  recovery_run: colors.recovery,
  fartlek: colors.warning,
  hill_run: colors.coral,
  race_pace: colors.error,
  strength: colors.strength,
  mobility: colors.triathlon,
  swim: colors.triathlon,
  bike: '#FDCB6E',
  rest: colors.rest,
  hyrox: colors.hyrox,
  run: colors.run,
};
