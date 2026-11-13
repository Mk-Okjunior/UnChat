import { useSyncExternalStore } from 'react';

const getPreference = () => typeof window === 'undefined'
  ? null
  : window.matchMedia('(prefers-color-scheme: dark)');

const subscribe = (onChange: () => void) => {
  const preference = getPreference();
  if (!preference) return () => {};
  preference.addEventListener('change', onChange);
  return () => preference.removeEventListener('change', onChange);
};

const getSnapshot = () => getPreference()?.matches ? 'dark' : 'light';
const getServerSnapshot = () => 'light';

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
