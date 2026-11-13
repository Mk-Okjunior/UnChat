// SKRINI 8: Profile
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Avatar, Screen } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

const PROFILE_GRAD = ['#1769F5', '#328AF5'] as const;

const MENU: { icon: ComponentProps<typeof Ionicons>['name']; title: string; destination: '/edit-profile' | '/settings' | '/help'; valueKey?: 'university' | 'course' | 'year' }[] = [
  { icon: 'school-outline', title: 'Chuo', destination: '/edit-profile', valueKey: 'university' },
  { icon: 'book-outline', title: 'Kozi', destination: '/edit-profile', valueKey: 'course' },
  { icon: 'calendar-outline', title: 'Mwaka wa masomo', destination: '/edit-profile', valueKey: 'year' },
  { icon: 'settings-outline', title: 'Mipangilio', destination: '/settings' },
  { icon: 'help-circle-outline', title: 'Msaada na usaidizi', destination: '/help' },
];

export default function Profile() {
  const { width } = useWindowDimensions();
  const { user, posts, followedIds, savedJobs, logout, isDarkMode } = useAppStore();
  const styles = createStyles(width >= 720, isDarkMode);
  const name = user?.fullName ?? 'Mwanafunzi';
  const username = user?.email ? `@${user.email.split('@')[0]}` : '@mwanafunzi';
  const studentId = user?.id ? `UC-${user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : 'UC-PENDING';
  const postCount = posts.filter((post) => post.authorId === user?.id).length;
  const followingCount = followedIds.length;

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      Alert.alert('Imeshindikana kutoka', error instanceof Error ? error.message : 'Jaribu tena.');
    }
  };

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <LinearGradient colors={PROFILE_GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.eyebrow}>UNICHAT / PROFILE</Text>
                <Text style={styles.heroTitle}>Wasifu wako</Text>
              </View>
              <Pressable onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Fungua mipangilio" style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={19} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.identity}>
              <View style={styles.avatarFrame}>
                <Avatar name={name} size={84} imageUri={user?.avatarUrl ?? undefined} />
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.name} numberOfLines={2}>{name}</Text>
                <Text style={styles.username} numberOfLines={1}>{username}</Text>
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{user?.role === 'admin' ? 'Active admin' : 'Active student'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.studentIdRow}>
              <Ionicons name="id-card-outline" size={15} color="#DCEBFF" />
              <Text style={styles.studentIdLabel}>Student ID</Text>
              <Text style={styles.studentId}>{studentId}</Text>
            </View>
          </LinearGradient>

          <View style={styles.stats}>
            {[
              { label: 'Posts', value: String(postCount), icon: 'document-text-outline' as const },
              { label: 'Followers', value: '0', icon: 'people-outline' as const },
              { label: 'Following', value: String(followingCount), icon: 'person-add-outline' as const },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <View style={styles.statIcon}><Ionicons name={stat.icon} size={17} color={C.primary} /></View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={() => router.push('/edit-profile')} style={styles.editButton} accessibilityRole="button">
            <Ionicons name="create-outline" size={19} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Hariri profaili</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </Pressable>

          {user?.role === 'admin' && (
            <Pressable onPress={() => router.push('/admin')} style={styles.adminLink} accessibilityRole="button">
              <View style={styles.menuIcon}><Ionicons name="speedometer-outline" size={19} color={C.primary} /></View>
              <View style={styles.menuCopy}><Text style={styles.menuTitle}>Admin dashboard</Text><Text style={styles.menuValue}>Usimamizi wa jumuiya</Text></View>
              <Ionicons name="chevron-forward" size={18} color={C.mute} />
            </Pressable>
          )}

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Taarifa za akaunti</Text>
            <Text style={styles.sectionHint}>Masomo na mipangilio yako</Text>
          </View>
          <View style={styles.menuList}>
            {MENU.map((item, index) => {
              const value = item.valueKey ? user?.[item.valueKey] : undefined;
              return <Pressable key={item.title} onPress={() => router.push(item.destination)} style={[styles.menuItem, index === MENU.length - 1 && styles.lastMenuItem]} accessibilityRole="button">
                <View style={styles.menuIcon}><Ionicons name={item.icon} size={19} color={C.primary} /></View>
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {!!value && <Text style={styles.menuValue} numberOfLines={1}>{value}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.mute} />
              </Pressable>;
            })}
          </View>

          <Pressable onPress={() => router.push('/jobs')} style={styles.savedJobs} accessibilityRole="button">
            <Ionicons name="bookmark-outline" size={17} color={C.mute} />
            <Text style={styles.savedJobsText}>Fursa zilizohifadhiwa</Text>
            <Text style={styles.savedJobsCount}>{savedJobs.length}</Text>
            <Ionicons name="chevron-forward" size={17} color={C.mute} />
          </Pressable>

          <Pressable onPress={handleLogout} style={styles.logout} accessibilityRole="button">
            <Ionicons name="log-out-outline" size={18} color="#C2413A" />
            <Text style={styles.logoutText}>Toka kwenye akaunti</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (wide: boolean, isDarkMode: boolean) => StyleSheet.create({
  scrollContent: { paddingHorizontal: wide ? 24 : 16, paddingTop: 16, paddingBottom: 32, alignItems: 'center', backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  content: { width: '100%', maxWidth: 920, gap: 16 },
  hero: { minHeight: 248, justifyContent: 'space-between', padding: wide ? 28 : 20, borderRadius: 22, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#DCEBFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 5 },
  settingsButton: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 22 },
  avatarFrame: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0, gap: 4 },
  name: { color: '#FFFFFF', fontSize: wide ? 25 : 22, fontWeight: '800' },
  username: { color: '#E1EEFF', fontSize: 13, fontWeight: '600' },
  status: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.17)' },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#B7F7D2' },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  studentIdRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18 },
  studentIdLabel: { color: '#DCEBFF', fontSize: 12 },
  studentId: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, minWidth: 0, minHeight: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 17, paddingHorizontal: 8, paddingVertical: 12, shadowColor: '#0A2845', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.soft, marginBottom: 5 },
  statValue: { color: C.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: C.mute, fontSize: 11, fontWeight: '600', marginTop: 2 },
  editButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.primary, borderRadius: 15, paddingHorizontal: 18, shadowColor: '#1769F5', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 3 },
  editButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', flex: 1 },
  adminLink: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 15, padding: 13 },
  sectionHeading: { marginTop: 4, marginBottom: -5 },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  sectionHint: { color: C.mute, fontSize: 12, marginTop: 3 },
  menuList: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 17, paddingHorizontal: 14 },
  menuItem: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  lastMenuItem: { borderBottomWidth: 0 },
  menuIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.soft },
  menuCopy: { flex: 1, minWidth: 0, gap: 3 },
  menuTitle: { color: C.text, fontSize: 13, fontWeight: '700' },
  menuValue: { color: C.mute, fontSize: 11 },
  savedJobs: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  savedJobsText: { flex: 1, color: C.mute, fontSize: 12, fontWeight: '600' },
  savedJobsCount: { color: C.text, fontSize: 12, fontWeight: '800' },
  logout: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderTopWidth: 1, borderTopColor: C.line },
  logoutText: { color: '#C2413A', fontSize: 13, fontWeight: '700' },
});
