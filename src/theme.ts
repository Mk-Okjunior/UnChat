const lightColors = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  soft: '#F1F5F9',
  line: '#E5EAF3',
  text: '#17233E',
  mute: '#77839A',
  primary: '#1769F5',
  blue: '#1769F5',
};

const darkColors = {
  bg: '#101820',
  card: '#19232D',
  soft: '#202D39',
  line: '#2A3947',
  text: '#F2F6FA',
  mute: '#A0AFBC',
  primary: '#78AAFF',
  blue: '#1769F5',
};

export type ThemeColors = typeof lightColors;

export function getThemeColors(darkMode: boolean): ThemeColors {
  return darkMode ? darkColors : lightColors;
}

export const C = { ...lightColors };

export function setThemeMode(darkMode: boolean) {
  Object.assign(C, getThemeColors(darkMode));
}

export const GRAD = ['#087BFF', '#B528F2'] as const;