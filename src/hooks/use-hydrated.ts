import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => typeof window !== 'undefined';
const getServerSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}