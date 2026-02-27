import { Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Premium Dark Palette ────────────────────────────────────────────────────
export const colors = {
  // Primary — electric cyan
  primary: '#22D3EE',
  primaryDark: '#0891B2',
  primaryLight: '#67E8F9',
  primaryMuted: 'rgba(34,211,238,0.12)',

  // Background — true dark
  background: '#050505',
  surface: 'rgba(255,255,255,0.03)',
  surfaceLight: 'rgba(255,255,255,0.06)',
  surfaceElevated: 'rgba(255,255,255,0.09)',

  // Text
  textPrimary: '#F0F0F0',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.3)',
  textInverse: '#050505',

  // Accents
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  coral: '#FB7185',

  // Workout types
  easyRun: '#34D399',
  tempoRun: '#FBBF24',
  intervalRun: '#F87171',
  longRun: '#22D3EE',
  recoveryRun: '#A78BFA',
  strength: '#FB7185',
  mobility: '#67E8F9',
  rest: 'rgba(255,255,255,0.2)',

  // Utility
  border: 'rgba(255,255,255,0.06)',
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
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
    backgroundColor: 'rgba(255,255,255,0.03)' as string,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)' as string,
  },
  cardElevated: {
    backgroundColor: 'rgba(255,255,255,0.06)' as string,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)' as string,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)' as string,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)' as string,
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
  primary: ['#22D3EE', '#06B6D4'] as const,
  success: ['#34D399', '#10B981'] as const,
  warning: ['#FBBF24', '#F59E0B'] as const,
  error: ['#F87171', '#EF4444'] as const,
  purple: ['#A78BFA', '#8B5CF6'] as const,
  surface: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'] as const,
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: spacing.xl,
  maxContentWidth: 428,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  minTouchTarget: 44,
} as const;

// ─── Workout Type → Color ────────────────────────────────────────────────────
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
  swim: '#67E8F9',
  bike: '#FDE68A',
  rest: colors.rest,
};
