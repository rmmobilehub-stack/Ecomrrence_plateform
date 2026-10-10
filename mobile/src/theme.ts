/** App palettes — dark navy (default) + sky-blue light (website classic-blue). */

export type ThemeMode = 'dark' | 'light';

export type ThemeColors = {
  bg: string;
  card: string;
  cardBorder: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  whatsapp: string;
  tabBar: string;
  tabInactive: string;
  tabActive: string;
  fab: string;
  fabActive: string;
  headerIcon: string;
  headerBtnBg: string;
  headerBtnBorder: string;
  sheetBg: string;
  statusBar: 'light-content' | 'dark-content';
};

export const darkColors: ThemeColors = {
  bg: '#050E24',
  card: '#0B1F3F',
  cardBorder: 'rgba(126, 200, 255, 0.28)',
  ink: '#F7FBFF',
  muted: '#A8C0DA',
  line: 'rgba(126, 200, 255, 0.28)',
  accent: '#2F7BFF',
  accentSoft: '#4DA3FF',
  success: '#3DCF8E',
  danger: '#FF6B6B',
  whatsapp: '#128C7E',
  tabBar: '#0A2140',
  tabInactive: '#8FB0D4',
  tabActive: '#FFFFFF',
  fab: '#2F7BFF',
  fabActive: '#4DA3FF',
  headerIcon: '#D7E7FF',
  headerBtnBg: 'rgba(8, 28, 58, 0.55)',
  headerBtnBorder: 'rgba(150, 190, 255, 0.35)',
  sheetBg: '#0A1C38',
  statusBar: 'light-content',
};

/** Sky / cyan light — matches website classic-blue storefront. */
export const lightColors: ThemeColors = {
  bg: '#EDF8FD',
  card: '#FFFFFF',
  cardBorder: '#D9EAF5',
  ink: '#12384E',
  muted: '#587185',
  line: '#D9EAF5',
  accent: '#0284C7',
  accentSoft: '#0EA5E9',
  success: '#178158',
  danger: '#DC2626',
  whatsapp: '#128C7E',
  tabBar: '#FFFFFF',
  tabInactive: '#88A0B3',
  tabActive: '#0369A1',
  fab: '#0284C7',
  fabActive: '#0EA5E9',
  headerIcon: '#0369A1',
  headerBtnBg: 'rgba(255, 255, 255, 0.92)',
  headerBtnBorder: '#B9DCEC',
  sheetBg: '#FFFFFF',
  statusBar: 'dark-content',
};

export const palettes = { dark: darkColors, light: lightColors } as const;

/** Default export kept for legacy imports — prefer useAppTheme().colors */
export const colors = darkColors;

export const radius = 16;
export const space = 16;
