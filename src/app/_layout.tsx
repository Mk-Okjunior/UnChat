import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppStoreProvider, useAppStore } from '../store/app-store';

function AuthGate() {
  const { ready, user, authError } = useAppStore();
  const router = useRouter();
  const segments = useSegments();
  const route = segments[0];

  useEffect(() => {
    if (!ready) return;
    const publicRoute = !route || route === 'login' || route === 'register';
    const needsStudentCard = user?.role === 'student' && !user.studentIdCardPath;
    if (!user && !publicRoute) router.replace(authError ? '/login' : '/');
    if (user && needsStudentCard && route !== 'register') router.replace('/register');
    else if (user && !needsStudentCard && publicRoute) router.replace('/(tabs)/home');
  }, [authError, ready, route, router, user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Root() {
  return <AppStoreProvider><AuthGate /></AppStoreProvider>;
}
