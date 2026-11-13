import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Banner, Card, Chips, Header, Screen } from '../components/ui';
import { type AcademicResource, listAcademicResources } from '../services/academic';
import { downloadNote } from '../services/notes-download';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

const categories = ['Notes', 'Maswali', 'Study Groups', 'Kozi'];

export default function Academic() {
  const [tab, setTab] = useState('Notes');
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { savedResources, toggleSavedResource, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);

  useEffect(() => {
    let active = true;
    listAcademicResources()
      .then((items) => {
        if (active) setResources(items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Imeshindikana kupakia nyenzo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => resources.filter((item) => item.category === tab), [resources, tab]);

  const handleDownload = async (item: AcademicResource) => {
    if (!item.fileUrl) return;
    setDownloading(item.id);
    try {
      await downloadNote(item.fileUrl, item.fileName || `${item.title}.pdf`);
    } catch (cause) {
      Alert.alert('Imeshindikana kupakua', cause instanceof Error ? cause.message : 'Jaribu tena.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Screen>
      <Header title="Academic Corner" back icon="search" />
      <View style={styles.container}>
        <Banner title="Pata Notes, Maswali na Vikundi vya Masomo" sub="Soma • Shiriki • Jifunze" />
        <Chips items={categories} active={tab} onPick={setTab} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {loading ? 'Inapakia nyenzo...' : error ? 'Nyenzo hazikupatikana.' : 'Hakuna nyenzo katika kundi hili bado.'}
            </Text>
          }
          renderItem={({ item }) => {
            const icon = item.category === 'Study Groups' ? 'people' : item.category === 'Kozi' ? 'school' : 'document-text';
            const saved = savedResources.includes(item.id);
            return (
              <Card>
                <Ionicons name={icon} size={25} color={C.primary} />
                <View style={styles.resource}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>{[item.university, item.course].filter(Boolean).join(' · ') || item.category}</Text>
                  {!!item.description && <Text style={styles.description}>{item.description}</Text>}
                  <Pressable
                    disabled={!item.fileUrl || downloading === item.id}
                    onPress={() => void handleDownload(item)}
                    accessibilityLabel={item.fileUrl ? `Pakua ${item.title}` : 'Faili bado halijaongezwa'}
                    style={styles.download}
                  >
                    <Ionicons
                      name={item.fileUrl ? 'download-outline' : 'time-outline'}
                      size={16}
                      color={item.fileUrl ? C.primary : C.mute}
                    />
                    <Text style={[styles.downloadText, !item.fileUrl && styles.disabledText]}>
                      {downloading === item.id ? 'Inapakua...' : item.fileUrl ? 'Pakua faili' : 'Faili litaongezwa'}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => toggleSavedResource(item.id)}
                  accessibilityLabel={saved ? 'Ondoa kwenye vilivyohifadhiwa' : 'Hifadhi nyenzo'}
                >
                  <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={C.primary} />
                </Pressable>
              </Card>
            );
          }}
        />
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: { paddingHorizontal: 16, flex: 1, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  list: { paddingBottom: 20 },
  empty: { color: C.mute, textAlign: 'center', padding: 28 },
  error: { color: '#B42318', marginVertical: 8, lineHeight: 18 },
  resource: { flex: 1 },
  title: { color: C.text, fontWeight: '700' },
  meta: { color: C.mute, fontSize: 12, marginTop: 3 },
  description: { color: C.mute, fontSize: 12, marginTop: 5, lineHeight: 17 },
  download: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 8, alignSelf: 'flex-start' },
  downloadText: { color: C.primary, fontWeight: '700', fontSize: 12 },
  disabledText: { color: C.mute, fontWeight: '500' },
});
