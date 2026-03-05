import { Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Premium Dark Palette ────────────────────────────────────────────────────
export const colors = {
  // Primary — electric purple
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#A78BFA',
  primaryMuted: 'rgba(124,58,237,0.12)',
  primaryGlow: 'rgba(124,58,237,0.25)',

  // Secondary — teal
  secondary: '#06B6D4',
  secondaryMuted: 'rgba(6,182,212,0.12)',

  // Accent — pink
  accent: '#FD79A8',
  accentMuted: 'rgba(253,121,168,0.12)',

  // Background — premium dark
  background: '#0A0A0F',
  surface: '#12121A',
  card: '#1A1A27',
  surfaceLight: '#1A1A27',
  surfaceElevated: '#22222F',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',
  textInverse: '#0A0A0F',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Workout type accent colours
  running: '#F97316',
  strength: '#EF4444',
  hyrox: '#10B981',
  triathlon: '#3B82F6',
  general: '#8B5CF6',

  // Backward compat aliases
  run: '#F97316',
  recovery: '#10B981',
  easyRun: '#F97316',
  tempoRun: '#F97316',
  intervalRun: '#F97316',
  longRun: '#F97316',
  recoveryRun: '#10B981',
  mobility: '#06B6D4',
  rest: 'rgba(255,255,255,0.15)',
  coral: '#EF4444',

  // Utility
  border: '#2A2A3D',
  borderLight: 'rgba(255,255,255,0.08)',
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

// Sport accent colour helper
export const sportColors: Record<string, string> = {
  running: colors.running,
  strength: colors.strength,
  hyrox: colors.hyrox,
  triathlon: colors.triathlon,
  general_fitness: colors.general,
  endurance: colors.triathlon,
};

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
  hero: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 46,
    letterSpacing: -1.0,
  },
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
} as const;

// ─── Animations ──────────────────────────────────────────────────────────────
export const animation = {
  fast: 150,
  normal: 300,
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
  primary: ['#7C3AED', '#06B6D4'] as const,
  cta: ['#7C3AED', '#06B6D4'] as const,
  success: ['#10B981', '#34D399'] as const,
  warning: ['#F59E0B', '#FBBF24'] as const,
  error: ['#EF4444', '#F87171'] as const,
  purple: ['#7C3AED', '#A78BFA'] as const,
  surface: ['#0A0A0F', '#12121A'] as const,
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
  easy_run: colors.running,
  tempo_run: colors.running,
  interval_run: colors.running,
  long_run: colors.running,
  recovery_run: colors.recovery,
  fartlek: colors.running,
  hill_run: colors.running,
  race_pace: colors.running,
  strength: colors.strength,
  mobility: colors.secondary,
  swim: colors.triathlon,
  bike: colors.triathlon,
  rest: colors.rest,
  hyrox: colors.hyrox,
  run: colors.running,
};
