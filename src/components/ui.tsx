import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname, type Href } from 'expo-router';
import { ReactNode, type ComponentProps } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHydrated } from '../hooks/use-hydrated';
import { useAppStore } from '../store/app-store';
import { C, getThemeColors, GRAD } from '../theme';

const navigation: { label: string; href: Href; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: 'Home', href: '/(tabs)/home', icon: 'home-outline' },
  { label: 'Marafiki', href: '/(tabs)/friends', icon: 'people-outline' },
  { label: 'Chat', href: '/(tabs)/chat', icon: 'chatbubble-outline' },
  { label: 'Vikundi', href: '/(tabs)/groups', icon: 'people-circle-outline' },
  { label: 'Academic Corner', href: '/academic', icon: 'school-outline' },
  { label: 'Fursa za Ajira', href: '/jobs', icon: 'briefcase-outline' },
  { label: 'Profile', href: '/(tabs)/profile', icon: 'person-outline' },
];

const mobileNavigation = [navigation[0], navigation[1], navigation[2], navigation[3], navigation[6]];

const selectedIcon: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  Home: 'home',
  Marafiki: 'people',
  Chat: 'chatbubble',
  Vikundi: 'people-circle',
  Profile: 'person',
};

export const Screen = ({ children }: { children: ReactNode }) => {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { user, isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  const desktop = hydrated && width >= 900;
  const items = user?.role === 'admin' ? [...navigation, adminNavigation] : navigation;

  return (
    <SafeAreaView style={[s.screen, desktop && s.desktopScreen]}>
      {desktop && (
        <View style={s.sidebar}>
          <View style={s.brandRow}><LinearGradient colors={GRAD} style={s.brandMark}><Ionicons name="school" size={19} color="#fff" /></LinearGradient><Text style={s.brandName}>UniChat</Text></View>
          <Text style={s.navLabel}>JUMUIYA</Text>
          {items.map((item) => {
            const active = pathname === item.href || pathname.endsWith(item.href.toString().split('/').pop() ?? '');
            return (
              <Pressable key={item.label} onPress={() => router.push(item.href)} style={[s.navItem, active && s.navItemActive]}>
                <Ionicons name={item.icon} size={19} color={active ? C.primary : C.mute} />
                <Text style={[s.navText, active && s.navTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
          <Text style={s.sidebarFooter}>Jumuiya ya wanachuo wa Tanzania</Text>
        </View>
      )}
      <View style={[s.page, desktop && s.desktopPage]}>
        {children}
        {!desktop && (['/academic', '/jobs'].includes(pathname) || pathname === '/admin') && <MobileNavigation />}
      </View>
    </SafeAreaView>
  );
};

export const MobileNavigation = () => {
  const pathname = usePathname();
  const { user, isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  const items = user?.role === 'admin' ? [...mobileNavigation, adminNavigation] : mobileNavigation;

  return (
    <View style={s.mobileNavigation}>
      {items.map((item) => {
        const active = pathname.endsWith(item.href.toString().split('/').pop() ?? '');
        return (
          <Pressable key={item.label} onPress={() => router.push(item.href)} style={s.mobileNavItem} accessibilityRole="button" accessibilityLabel={item.label}>
            <Ionicons name={active ? selectedIcon[item.label] ?? item.icon : item.icon} size={20} color={active ? C.primary : C.mute} />
            <Text style={[s.mobileNavLabel, active && s.mobileNavLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const Header = ({ title, back, icon, onIconPress }: { title: string; back?: boolean; icon?: ComponentProps<typeof Ionicons>['name']; onIconPress?: () => void }) => {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return (
    <View style={s.header}>
      {back && <Pressable onPress={() => router.back()} hitSlop={10} style={s.headerAction}><Ionicons name="arrow-back" size={22} color={C.text} /></Pressable>}
      {title === 'UniChat' && <LinearGradient colors={GRAD} style={s.headerBrand}><Ionicons name="school" size={15} color="#fff" /></LinearGradient>}
      <Text style={s.hTitle}>{title}</Text>
      {icon && <Pressable onPress={onIconPress} disabled={!onIconPress} hitSlop={10} style={s.headerAction} accessibilityLabel={title ? `${title} action` : 'Action'}><Ionicons name={icon} size={21} color={onIconPress ? C.primary : C.text} /></Pressable>}
    </View>
  );
};

export const Avatar = ({ name, size = 46, imageUri }: { name: string; size?: number; imageUri?: string | null }) => {
  const { isDarkMode } = useAppStore();
  const colors = getThemeColors(isDarkMode);
  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.soft }} resizeMode="cover" />;
  }

  return (
    <LinearGradient colors={GRAD} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size / 2.6 }}>{name.slice(0, 2).toUpperCase()}</Text>
    </LinearGradient>
  );
};

export const Banner = ({ title, sub, icon = 'school' }: { title: string; sub: string; icon?: ComponentProps<typeof Ionicons>['name'] }) => (
  <BannerContent title={title} sub={sub} icon={icon} />
);

function BannerContent({ title, sub, icon }: { title: string; sub: string; icon: ComponentProps<typeof Ionicons>['name'] }) {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
    <View style={s.bannerCopy}><Text style={s.bannerTitle}>{title}</Text><Text style={s.bannerSub}>{sub}</Text></View>
    <View style={s.bannerIcon}><Ionicons name={icon} size={26} color="#fff" /></View>
  </LinearGradient>;
}

export const Chips = ({ items, active, onPick }: { items: string[]; active: string; onPick: (v: string) => void }) => {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginVertical: 12 }}>
    {items.map((i) => <Pressable key={i} onPress={() => onPick(i)} style={[s.chip, i === active && s.chipActive]}>
      <Text style={[s.chipText, i === active && s.chipTextActive]}>{i}</Text>
    </Pressable>)}
  </ScrollView>;
};

export const Btn = ({ label, onPress, outline }: { label: string; onPress?: () => void; outline?: boolean }) => {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return <Pressable onPress={onPress} style={[s.btn, outline ? { borderWidth: 1.5, borderColor: C.blue } : { backgroundColor: C.blue }]}>
    <Text style={{ color: outline ? C.blue : '#fff', fontWeight: '700' }}>{label}</Text>
  </Pressable>;
};

export const Search = ({ ph, value, onChangeText }: { ph: string; value?: string; onChangeText?: (value: string) => void }) => {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return <View style={s.search}>
    <Ionicons name="search" size={18} color={C.mute} />
    <TextInput value={value} onChangeText={onChangeText} placeholder={ph} placeholderTextColor={C.mute} style={{ flex: 1 }} />
  </View>;
};

export const Card = ({ children }: { children: ReactNode }) => {
  const { isDarkMode } = useAppStore();
  const s = createStyles(isDarkMode);
  return <View style={s.card}>{children}</View>;
};

const adminNavigation = { label: 'Dashboard', href: '/admin' as Href, icon: 'speedometer-outline' as const };

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: getThemeColors(isDarkMode).bg },
  desktopScreen: { flexDirection: 'row', width: '100%', maxWidth: 1680, alignSelf: 'center' },
  sidebar: { width: 240, paddingHorizontal: 18, paddingTop: 24, paddingBottom: 18, borderRightWidth: 1, borderRightColor: C.line, backgroundColor: C.card },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 32 },
  brandMark: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: C.text, fontSize: 20, fontWeight: '800' },
  navLabel: { color: C.mute, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginHorizontal: 10, marginBottom: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, marginBottom: 4 },
  navItemActive: { backgroundColor: C.soft },
  navText: { color: C.mute, fontSize: 14, fontWeight: '600' },
  navTextActive: { color: C.primary, fontWeight: '800' },
  sidebarFooter: { color: C.mute, fontSize: 11, lineHeight: 16, marginTop: 'auto', padding: 8 },
  page: { flex: 1, minWidth: 0, minHeight: 0, backgroundColor: C.bg },
  desktopPage: { width: '100%', maxWidth: 1180, alignSelf: 'stretch' },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.card },
  headerAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerBrand: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, fontSize: 19, fontWeight: '800', color: C.text },
  banner: { minHeight: 104, borderRadius: 16, padding: 16, marginVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  bannerCopy: { flex: 1, minWidth: 0 },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  bannerSub: { color: '#EAF1FF', marginTop: 5, fontSize: 12, lineHeight: 17 },
  bannerIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 18, backgroundColor: C.soft, marginRight: 8 },
  chipActive: { backgroundColor: C.primary },
  chipText: { color: C.mute, fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.soft, borderRadius: 14, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: C.line },
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mobileNavigation: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 4, paddingVertical: 6 },
  mobileNavItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  mobileNavLabel: { color: C.mute, fontSize: 8, fontWeight: '600' },
  mobileNavLabelActive: { color: C.primary, fontWeight: '800' },
});
