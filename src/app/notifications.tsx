import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

export default function Notifications() {
  const { user, posts, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const items = posts.flatMap((post) => post.authorId === user?.id
    ? post.comments.map((comment) => ({ id: comment.id, title: comment.authorName, body: `Amejibu post yako: ${comment.text}` }))
    : []);

  return (
    <Screen>
      <Header title="Arifa" back />
      <View style={styles.content}>
        {items.length ? items.map((item) => <View key={item.id} style={styles.row}><Ionicons name="chatbubble-ellipses-outline" size={21} color={C.primary} /><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.body}</Text></View></View>) : <View style={styles.empty}><Ionicons name="notifications-off-outline" size={32} color={C.mute} /><Text style={styles.emptyTitle}>Huna arifa mpya</Text><Text style={styles.body}>Arifa za maoni kwenye posts zako zitaonekana hapa.</Text></View>}
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, width: '100%', maxWidth: 700, alignSelf: 'center', backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  copy: { flex: 1 },
  title: { color: C.text, fontWeight: '800' },
  body: { color: C.mute, lineHeight: 20, marginTop: 4 },
  empty: { alignItems: 'center', padding: 28, gap: 8 },
  emptyTitle: { color: C.text, fontWeight: '800', marginTop: 6 },
});