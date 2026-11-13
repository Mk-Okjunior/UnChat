import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Banner, Card, Chips, Header, Screen } from '../components/ui';
import { createAcademicResource, getAdminDashboardData, updateAcademicResourceFile } from '../services/academic';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

const categories = ['Notes', 'Maswali', 'Study Groups', 'Kozi'];

export default function AdminDashboard() {
  const { user, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof getAdminDashboardData>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileLinks, setFileLinks] = useState<Record<string, string>>({});
  const [category, setCategory] = useState(categories[0]);

  const fetchDashboard = useCallback(() => getAdminDashboardData(), []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDashboard(await fetchDashboard());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kupakia taarifa za dashboard.');
    } finally {
      setLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let active = true;
    fetchDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Imeshindikana kupakia taarifa za dashboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchDashboard, user?.role]);

  const addResource = async () => {
    if (!title.trim()) {
      setError('Weka jina la nyenzo kabla ya kuhifadhi.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await createAcademicResource({ title, description, university, course, category, fileUrl, fileName });
      setTitle('');
      setDescription('');
      setUniversity('');
      setCourse('');
      setFileUrl('');
      setFileName('');
      setMessage('Nyenzo imeongezwa. Unaweza kuweka link ya faili sasa au baadaye.');
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kuhifadhi nyenzo.');
    } finally {
      setSaving(false);
    }
  };

  const saveFileLink = async (id: string) => {
    try {
      await updateAcademicResourceFile(id, fileLinks[id] ?? '');
      setMessage('Linki ya faili imehifadhiwa.');
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kuhifadhi linki ya faili.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Screen>
        <Header title="Admin dashboard" back />
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={40} color={C.mute} />
          <Text style={styles.sectionTitle}>Huruhusiwi kufungua ukurasa huu.</Text>
          <Text style={styles.muted}>Demo mode: admin ya ndani inahitajika kwenye app hii.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Admin dashboard" back icon="refresh-outline" onIconPress={() => void loadDashboard()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Banner title="Usimamizi wa UniChat" sub={`Karibu, ${user.fullName}`} />

        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!!message && <Text accessibilityRole="alert" style={styles.success}>{message}</Text>}

        <View style={styles.stats}>
          <StatCard label="Wanachama" value={dashboard?.profileCount ?? '—'} icon="people-outline" />
          <StatCard label="Nyenzo za masomo" value={dashboard?.noteCount ?? '—'} icon="document-text-outline" />
        </View>

        <Text style={styles.sectionTitle}>Ongeza nyenzo za masomo</Text>
        <Card>
          <View style={styles.form}>
            <Field label="Jina la nyenzo *" value={title} onChangeText={setTitle} />
            <Field label="Maelezo" value={description} onChangeText={setDescription} multiline />
            <Field label="Chuo" value={university} onChangeText={setUniversity} />
            <Field label="Kozi" value={course} onChangeText={setCourse} />
            <Chips items={categories} active={category} onPick={setCategory} />
            <Field label="Link ya faili (hiari, https://...)" value={fileUrl} onChangeText={setFileUrl} autoCapitalize="none" keyboardType="url" />
            <Field label="Jina la faili (mf. calculus.pdf)" value={fileName} onChangeText={setFileName} />
            <Pressable onPress={() => void addResource()} disabled={saving} style={[styles.button, saving && styles.disabled]}>
              <Text style={styles.buttonText}>{saving ? 'Inahifadhi...' : 'Ongeza nyenzo'}</Text>
            </Pressable>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Wanachama wa hivi karibuni</Text>
        {loading && !dashboard && <Text style={styles.muted}>Inapakia taarifa...</Text>}
        {dashboard?.profiles.map((profile) => (
          <Card key={profile.id}>
            <Ionicons name={profile.role === 'admin' ? 'shield-checkmark-outline' : 'person-circle-outline'} size={24} color={C.primary} />
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>{profile.fullName || profile.email}</Text>
              <Text style={styles.muted}>{profile.university || profile.email}</Text>
            </View>
            <Text style={profile.role === 'admin' ? styles.adminRole : styles.studentRole}>{profile.role}</Text>
          </Card>
        ))}
        {dashboard && dashboard.profiles.length === 0 && <Text style={styles.muted}>Hakuna wanachama bado.</Text>}

        <Text style={styles.sectionTitle}>Nyenzo za hivi karibuni</Text>
        {dashboard?.notes.map((note) => (
          <Card key={note.id}>
            <Ionicons name="document-text-outline" size={23} color={C.primary} />
            <View style={styles.listItem}>
              <Text style={styles.itemTitle}>{note.title}</Text>
              <Text style={styles.muted}>{[note.university, note.course].filter(Boolean).join(' · ') || note.category}</Text>
              <TextInput
                value={fileLinks[note.id] ?? note.fileUrl ?? ''}
                onChangeText={(value) => setFileLinks((current) => ({ ...current, [note.id]: value }))}
                placeholder="Linki ya faili (https://...)"
                placeholderTextColor={C.mute}
                autoCapitalize="none"
                keyboardType="url"
                style={styles.linkInput}
              />
              <Pressable onPress={() => void saveFileLink(note.id)} style={styles.linkButton}>
                <Text style={styles.linkButtonText}>{note.fileUrl ? 'Sasisha linki ya faili' : 'Ongeza linki ya faili'}</Text>
              </Pressable>
            </View>
            <Ionicons name={note.fileUrl ? 'checkmark-circle' : 'time-outline'} size={19} color={note.fileUrl ? '#16A34A' : C.mute} />
          </Card>
        ))}
        {dashboard && dashboard.notes.length === 0 && <Text style={styles.muted}>Hakuna nyenzo zilizoongezwa bado.</Text>}
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: 'people-outline' | 'document-text-outline' }) {
  const { isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  return (
    <Card>
      <Ionicons name={icon} size={22} color={C.primary} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.muted}>{label}</Text>
      </View>
    </Card>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'url';
}) {
  const { isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        placeholder={label}
        placeholderTextColor={C.mute}
        style={[styles.input, props.multiline && styles.multiline]}
        textAlignVertical={props.multiline ? 'top' : 'center'}
      />
    </View>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 36, width: '100%', maxWidth: 900, alignSelf: 'center', backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  accessDenied: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  form: { flex: 1, gap: 12 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: C.text, fontWeight: '700', fontSize: 13 },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 11, color: C.text },
  multiline: { minHeight: 76 },
  button: { backgroundColor: C.primary, padding: 14, alignItems: 'center', borderRadius: 10 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800' },
  error: { color: '#B42318', lineHeight: 18, marginVertical: 8 },
  success: { color: '#15803D', lineHeight: 18, marginVertical: 8 },
  statValue: { color: C.text, fontSize: 19, fontWeight: '800' },
  muted: { color: C.mute, fontSize: 12, marginTop: 3 },
  listItem: { flex: 1 },
  linkInput: { borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8, marginTop: 8, color: C.text, fontSize: 12 },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 8 },
  linkButtonText: { color: C.primary, fontWeight: '700', fontSize: 12 },
  itemTitle: { color: C.text, fontWeight: '700' },
  adminRole: { color: C.primary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  studentRole: { color: C.mute, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});
