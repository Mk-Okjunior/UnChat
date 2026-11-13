import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Header, Screen, Search } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

const PEOPLE = [
  { id: 'sample-amina', name: 'Amina Hassan', course: 'Computer Science · UDSM' },
  { id: 'daniel', name: 'Daniel Mwakalonge', course: 'Information Technology · UDSM' },
  { id: 'neema', name: 'Neema John', course: 'Architecture · ARU' },
  { id: 'sample-joseph', name: 'Joseph Msuya', course: 'Medicine · MUHAS' },
];

export default function Friends() {
  const [query, setQuery] = useState('');
  const { followedIds, toggleFollow, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const people = PEOPLE.filter((person) => `${person.name} ${person.course}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Screen>
      <Header title="Marafiki" />
      <View style={styles.content}>
        <Search ph="Tafuta wanafunzi" value={query} onChangeText={setQuery} />
        <FlatList data={people} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Hakuna wanafunzi waliopatikana.</Text>} renderItem={({ item }) => {
          const following = followedIds.includes(item.id);
          return <Card><Avatar name={item.name} /><View style={styles.person}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.course}</Text></View><Pressable onPress={() => toggleFollow(item.id)} style={[styles.follow, following && styles.following]}><Text style={[styles.followText, following && styles.followingText]}>{following ? 'Inafuatwa' : 'Fuata'}</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.id } })} accessibilityLabel={`Tuma ujumbe kwa ${item.name}`} style={styles.chat}><Text style={styles.chatText}>Chat</Text></Pressable></Card>;
        }} />
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 16, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  list: { paddingTop: 12, paddingBottom: 24 },
  person: { flex: 1, gap: 4 },
  name: { color: C.text, fontWeight: '800' },
  meta: { color: C.mute, fontSize: 12 },
  follow: { backgroundColor: C.primary, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 8 },
  following: { backgroundColor: C.soft },
  followText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  followingText: { color: C.primary },
  chat: { borderWidth: 1, borderColor: C.line, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7 },
  chatText: { color: C.text, fontSize: 12, fontWeight: '700' },
  empty: { color: C.mute, textAlign: 'center', padding: 28 },
});
