// MENU YA CHINI (Home, Marafiki, Chat, Vikundi, Profile)
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useHydrated } from '../../hooks/use-hydrated';
import { useAppStore } from '../../store/app-store';
import { C, getThemeColors } from '../../theme';

const tab = (name: string, title: string, icon: any) => (
  <Tabs.Screen key={name} name={name} options={{ title, tabBarIcon: ({ color, size }) => <Ionicons name={icon} size={size} color={typeof color === 'number' ? C.mute : color ?? C.mute} /> }} />
);

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useAppStore();
  const hydrated = useHydrated();
  const desktop = hydrated && width >= 900;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.mute,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
      tabBarIconStyle: { marginTop: 2 },
      tabBarStyle: desktop ? { display: 'none' } : {
        height: 66,
        paddingTop: 6,
        paddingBottom: 5,
        borderTopColor: C.line,
        backgroundColor: getThemeColors(isDarkMode).card,
        elevation: 12,
      },
    }}>
      {tab('home', 'Home', 'home')}
      {tab('friends', 'Marafiki', 'people-outline')}
      {tab('chat', 'Chat', 'chatbubble-outline')}
      {tab('groups', 'Vikundi', 'people-circle-outline')}
      {tab('profile', 'Profile', 'person-outline')}
    </Tabs>
  );
}
