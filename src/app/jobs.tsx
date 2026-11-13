// SKRINI 7: Fursa za Ajira
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chips, Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

const DATA = [
  { id: 'tigo-internship', t: 'Internship - Tigo Tanzania', s: 'Masoko · Dar es Salaam', d: 'Mwisho: 30 Nov 2026', tag: 'Internship', color: '#22C55E' },
  { id: 'crdb-trainee', t: 'Graduate Trainee - CRDB Bank', s: 'Benki · Dar es Salaam', d: 'Mwisho: 15 Nov 2026', tag: 'Ajira', color: '#EF4444' },
  { id: 'nm-scholarship', t: 'Scholarship - Nelson Mandela', s: 'Masomo · Tanzania', d: 'Mwisho: 20 Dec 2026', tag: 'Scholarships', color: '#9333EA' },
  { id: 'youth-volunteer', t: 'Volunteer - Youth Empowerment', s: 'Jitolea · Dodoma', d: 'Mwisho: 10 Nov 2026', tag: 'Matukio', color: '#F59E0B' },
];

export default function Jobs() {
  const [tab, setTab] = useState('Internship');
  const { savedJobs, toggleSavedJob, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const filtered = DATA.filter((item) => item.tag === tab);
  return (
    <Screen>
      <Header title="Fursa za Ajira" back icon="search" />
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <Chips items={['Internship', 'Ajira', 'Scholarships', 'Matukio']} active={tab} onPick={setTab} />
        <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Hakuna fursa za aina hii kwa sasa.</Text>} renderItem={({ item }) => (
          <Card>
            <View style={[styles.companyMark, { backgroundColor: `${item.color}16` }]}><Ionicons name={item.tag === 'Internship' ? 'briefcase' : item.tag === 'Ajira' ? 'business' : item.tag === 'Scholarships' ? 'school' : 'heart'} size={22} color={item.color} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.t}</Text>
              <Text style={{ color: C.mute, fontSize: 12 }}>{item.s}</Text>
              <Text style={styles.date}>{item.d}</Text>
              <Text style={[styles.tag, { color: item.color, backgroundColor: `${item.color}16` }]}>{item.tag}</Text>
            </View>
            <Pressable onPress={() => toggleSavedJob(item.id)} accessibilityLabel={savedJobs.includes(item.id) ? 'Ondoa fursa iliyohifadhiwa' : 'Hifadhi fursa'}><Ionicons name={savedJobs.includes(item.id) ? 'bookmark' : 'bookmark-outline'} size={21} color={C.primary} /></Pressable>
          </Card>
        )} />
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  list: { paddingBottom: 20, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  empty: { color: C.mute, textAlign: 'center', padding: 28 },
  companyMark: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { color: C.text, fontWeight: '800', marginBottom: 3 },
  date: { color: C.mute, fontSize: 11, marginTop: 2 },
  tag: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: '800', marginTop: 6, overflow: 'hidden' },
});
