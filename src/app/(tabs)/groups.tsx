// SKRINI 5: Vikundi
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Chips, Header, Screen, Search } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

export default function Groups() {
  const [tab, setTab] = useState('Vyuo');
  const [query, setQuery] = useState('');
  const { user, groups, joinGroup, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const filtered = groups.filter((group) => {
    const categoryMatch = tab === 'Mengine' ? !['Vyuo', 'Madarasa', 'Masomo'].includes(group.category) : group.category === tab;
    return categoryMatch && group.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Screen>
      <Header title="Vikundi" icon="add" onIconPress={() => router.push('/create-group')} />
      <View style={styles.container}>
        <Search ph="Tafuta vikundi" value={query} onChangeText={setQuery} />
        <Chips items={['Vyuo', 'Madarasa', 'Masomo', 'Mengine']} active={tab} onPick={setTab} />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Hakuna kikundi katika kundi hili.</Text>}
          renderItem={({ item }) => (
            <Card>
              <Avatar name={item.name} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{item.name}</Text>
                <Text style={{ color: C.mute, fontSize: 12 }}>{item.members.toLocaleString()} wanachama · {item.category}</Text>
              </View>
              <Pressable onPress={() => joinGroup(item.id)} style={[styles.join, user && item.memberIds.includes(user.id) && styles.joined]}>
                <Text style={[styles.joinText, user && item.memberIds.includes(user.id) && styles.joinedText]}>{user && item.memberIds.includes(user.id) ? 'Umejiunga' : 'Jiunge'}</Text>
              </Pressable>
            </Card>
          )}
        />
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { paddingHorizontal: 16, flex: 1, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  list: { paddingBottom: 20 },
  join: { backgroundColor: C.primary, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18 },
  joined: { backgroundColor: C.soft },
  joinText: { color: '#fff', fontWeight: '700' },
  joinedText: { color: C.primary },
  empty: { color: C.mute, textAlign: 'center', padding: 28 },
});
