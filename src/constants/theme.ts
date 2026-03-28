import { Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Pulse Design System v1.0 ───────────────────────────────────────────────
// Primary: Electric Purple #A855F7
// Background: True Dark #050505
// Glass-morphism cards, premium typography, zero-friction UX

export const colors = {
  // Primary — electric purple (brand-500)
  primary: '#A855F7',
  primaryDark: '#9333EA',
  primaryLight: '#C084FC',
  primaryMuted: 'rgba(168,85,247,0.12)',
  primaryGlow: 'rgba(168,85,247,0.25)',

  // Secondary — purple-700
  secondary: '#7E22CE',
  secondaryMuted: 'rgba(126,34,206,0.12)',

  // Accent — purple-600
  accent: '#9333EA',
  accentMuted: 'rgba(147,51,234,0.12)',

  // Background — true dark
  background: '#050505',
  surface: '#0A0A0F',
  card: '#0A0A0F',
  surfaceLight: '#111118',
  surfaceElevated: '#1A1A24',

  // Text — design system text scale
  textPrimary: '#F1F1F6',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textMuted: '#4B5563',
  textInverse: '#050505',

  // Status — semantic colours
  success: '#34D399',
  successDim: '#065F46',
  warning: '#FBBF24',
  warningDim: '#78350F',
  error: '#F87171',
  errorDim: '#7F1D1D',
  info: '#60A5FA',
  infoDim: '#1E3A5F',

  // Workout type colours
  running: '#F97316',
  strength: '#EF4444',
  hyrox: '#10B981',
  triathlon: '#3B82F6',
  general: '#8B5CF6',

  // Workout effort colours
  typeEasy: '#34D399',
  typeModerate: '#60A5FA',
  typeHard: '#F97316',
  typeRest: '#6B7280',
  typeRace: '#EF4444',

  // Backward compat aliases
  run: '#F97316',
  recovery: '#10B981',
  easyRun: '#34D399',
  tempoRun: '#F97316',
  intervalRun: '#F97316',
  longRun: '#F97316',
  recoveryRun: '#10B981',
  mobility: '#60A5FA',
  rest: 'rgba(255,255,255,0.15)',
  coral: '#EF4444',

  // Utility
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  borderLight: 'rgba(255,255,255,0.04)',
  overlay: 'rgba(0,0,0,0.75)',
  transparent: 'transparent',
  white: '#FFFFFF',

  // Glass
  glassBg: 'rgba(255,255,255,0.03)',
  glassBorder: 'rgba(255,255,255,0.06)',
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

// ─── Spacing (Design System v1.0) ───────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 40,
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

// ─── Typography Scale (Design System v1.0) ──────────────────────────────────
export const typography = {
  // Workout-specific: large glanceable numbers
  statHero: {
    fontSize: 64,
    fontWeight: '700' as const,
    lineHeight: 72,
    letterSpacing: -2,
  },
  statLarge: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -1.5,
  },
  statMedium: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
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
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
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
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: 0,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.3,
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

// ─── Shadows (Dark Mode) ────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  }),
  purpleGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  purpleGlowStrong: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;

// ─── Glass Card Styles ───────────────────────────────────────────────────────
export const glass = {
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  cardElevated: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.xl,
    padding: 24,
  },
  cardActive: {
    backgroundColor: 'rgba(168,85,247,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  input: {
    backgroundColor: '#111118',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
  },
} as const;

// ─── Animations (Design System v1.0) ────────────────────────────────────────
export const animation = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 350,
  gentle: 500,
  entrance: 500,

  spring: {
    gentle: { damping: 20, stiffness: 180, mass: 1 },
    snappy: { damping: 15, stiffness: 300, mass: 0.8 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.6 },
  },

  easing: {
    premium: Easing.bezier(0.16, 1, 0.3, 1),
    smooth: Easing.bezier(0.4, 0.0, 0.2, 1.0),
    spring: Easing.bezier(0.2, 0.8, 0.2, 1),
    snap: Easing.bezier(0.4, 0, 0, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1.0),
    accelerate: Easing.bezier(0.4, 0.0, 1.0, 1.0),
    overshoot: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  },
} as const;

// ─── Gradients ───────────────────────────────────────────────────────────────
export const gradients = {
  primary: ['#A855F7', '#7E22CE'] as const,
  cta: ['#A855F7', '#9333EA'] as const,
  success: ['#34D399', '#10B981'] as const,
  warning: ['#FBBF24', '#F59E0B'] as const,
  error: ['#F87171', '#EF4444'] as const,
  surface: ['#050505', '#0A0A0F'] as const,
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: spacing.lg,
  maxContentWidth: 428,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
  minTouchTarget: 44,
  workoutTouchTarget: 52,
  cardPadding: 20,
  cardGap: 16,
  sectionGap: 32,
} as const;

// ─── Workout Type → Color ────────────────────────────────────────────────────
export const workoutTypeColors: Record<string, string> = {
  easy_run: colors.typeEasy,
  tempo_run: colors.typeHard,
  interval_run: colors.typeHard,
  long_run: colors.typeModerate,
  recovery_run: colors.typeEasy,
  fartlek: colors.typeHard,
  hill_run: colors.typeHard,
  race_pace: colors.typeRace,
  strength: colors.strength,
  mobility: colors.typeModerate,
  swim: colors.triathlon,
  bike: colors.triathlon,
  rest: colors.typeRest,
  hyrox: colors.hyrox,
  run: colors.running,
};
