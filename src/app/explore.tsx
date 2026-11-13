import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Banner, Card, Header, Screen, Search } from '@/components/ui';
import { useAppStore } from '@/store/app-store';
import { C } from '@/theme';

export default function ExploreScreen() {
  const { isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  return (
    <Screen>
      <Header title="Gundua" />
      <ScrollView contentContainerStyle={styles.content}>
        <Search ph="Tafuta kozi, vikundi au fursa" />
        <Banner title="Gundua jumuiya yako" sub="Ungana na wanafunzi wenye malengo yanayofanana." />
        <Text style={styles.sectionTitle}>Vinavyokuvutia</Text>
        {[
          { title: 'Masomo', detail: 'Nyenzo na vikundi vya masomo', icon: 'school-outline' as const },
          { title: 'Fursa za kazi', detail: 'Ajira na mafunzo kwa vitendo', icon: 'briefcase-outline' as const },
          { title: 'Jumuiya', detail: 'Kutana na wanafunzi wapya', icon: 'people-outline' as const },
        ].map((item) => (
          <Card key={item.title}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={22} color={C.primary} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.mute} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginTop: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, gap: 4 },
  itemTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  itemDetail: { color: C.mute, fontSize: 13 },
});
