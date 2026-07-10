import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * SkinShelf design system.
 * Editorial "quiet luxury" direction: warm ivory surfaces, deep forest ink,
 * sage primary, muted gold accents. Serif display + humanist sans body.
 */

export const colors = {
  // Surfaces
  background: '#FBFAF6',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F3EC',
  surfaceSage: '#EDF2EC',
  surfaceBlush: '#F8EFEC',

  // Brand
  forest: '#173A26',
  forestDeep: '#0F2919',
  sage: '#42654A',
  sageSoft: '#5F7D64',
  gold: '#B99356',
  goldSoft: '#D8C39A',
  blush: '#C99287',

  // Text
  ink: '#1A211C',
  inkSoft: '#4A564E',
  inkMuted: '#7C877E',
  onDark: '#FFFFFF',
  onDarkSoft: 'rgba(255,255,255,0.72)',

  // Lines
  line: '#E8E7DE',
  lineSage: '#DCE5DC',
  lineGold: '#EADFC8',
  lineBlush: '#EEDCD6',

  // Status
  danger: '#B3261E',
  dangerSurface: '#FBEDEB',
  warning: '#8A6100',
  warningSurface: '#FBF3DE',
  success: '#1F6E43',
  successSurface: '#E7F2E9',
} as const;

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displayMedium: 'PlayfairDisplay_500Medium',
  displayItalic: 'PlayfairDisplay_500Medium_Italic',
  sans: 'Manrope_500Medium',
  sansSemiBold: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  sansExtraBold: 'Manrope_800ExtraBold',
} as const;

export const type = {
  hero: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 52,
    color: colors.ink,
  } as TextStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 36,
    color: colors.ink,
  } as TextStyle,
  heading: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
  } as TextStyle,
  subheading: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  } as TextStyle,
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  } as TextStyle,
  bodySemi: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  } as TextStyle,
  caption: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
  } as TextStyle,
  overline: {
    fontFamily: fonts.sansExtraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.sage,
  } as TextStyle,
  button: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    letterSpacing: 0.3,
    color: colors.onDark,
  } as TextStyle,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

const webShadow = (value: string): ViewStyle =>
  Platform.OS === 'web' ? ({ boxShadow: value } as unknown as ViewStyle) : {};

export const shadows = {
  soft: {
    shadowColor: colors.forestDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    ...webShadow('0px 6px 16px rgba(15,41,25,0.06)'),
  } as ViewStyle,
  card: {
    shadowColor: colors.forestDeep,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 5,
    ...webShadow('0px 10px 24px rgba(15,41,25,0.09)'),
  } as ViewStyle,
  floating: {
    shadowColor: colors.forestDeep,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 9,
    ...webShadow('0px 16px 32px rgba(15,41,25,0.16)'),
  } as ViewStyle,
} as const;

export const gradients = {
  forest: ['#1C4630', '#0F2919'] as const,
  sage: ['#4F7357', '#32543C'] as const,
  gold: ['#CBA96C', '#A88243'] as const,
  ivoryVeil: ['rgba(251,250,246,0.2)', 'rgba(251,250,246,0.9)', '#FBFAF6'] as const,
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

/** Shared bottom tab bar style (RoutineScreen temporarily hides/restores it). */
export const tabBarStyle = {
  position: 'absolute' as const,
  backgroundColor: 'rgba(255,255,255,0.97)',
  borderTopWidth: 0,
  elevation: 18,
  shadowColor: colors.forestDeep,
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.08,
  shadowRadius: 22,
  height: 76,
  paddingBottom: 14,
  paddingTop: 12,
  ...(Platform.OS === 'web' ? ({ boxShadow: '0px -6px 22px rgba(15,41,25,0.08)' } as object) : null),
};
