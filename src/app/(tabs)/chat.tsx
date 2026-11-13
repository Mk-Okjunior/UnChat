// SKRINI 4: Chat
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Chips, Header, Screen, Search } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

export default function Chat() {
  const [tab, setTab] = useState('Zote');
  const [query, setQuery] = useState('');
  const { conversations, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const filtered = conversations.filter((item) => {
    const matchesQuery = `${item.name} ${item.messages.at(-1)?.text ?? ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesTab = tab === 'Zote' || (tab === 'Makundi' ? ['class-cs', 'study-group'].includes(item.id) : !['class-cs', 'study-group'].includes(item.id));
    return matchesQuery && matchesTab;
  });

  return (
    <Screen>
      <Header title="Chat" icon="create-outline" />
      <View style={{ paddingHorizontal: 16 }}>
        <Search ph="Tafuta mawasiliano au group..." value={query} onChangeText={setQuery} />
        <Chips items={['Zote', 'Mtu mmoja', 'Makundi']} active={tab} onPick={setTab} />
      </View>
      <FlatList
        style={styles.list}
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>Hakuna mazungumzo yanayolingana na utafutaji.</Text>}
        renderItem={({ item }) => {
          const latest = item.messages.at(-1);
          return <Pressable onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: item.id } })} style={styles.row}>
            <Avatar name={item.name} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: C.text }}>{item.name}</Text>
              <Text style={{ color: C.mute }} numberOfLines={1}>{latest?.text ?? 'Anza mazungumzo'}</Text>
            </View>
            <View style={styles.messageMeta}>
              <Text style={styles.time}>{latest ? new Date(latest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
            </View>
          </Pressable>;
        }}
      />
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  list: { flex: 1, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  row: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  messageMeta: { alignItems: 'flex-end', gap: 7 },
  time: { color: C.mute, fontSize: 11 },
  empty: { textAlign: 'center', color: C.mute, padding: 28 },
});
