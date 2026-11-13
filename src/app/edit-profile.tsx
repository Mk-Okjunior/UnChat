import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar, Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

export default function EditProfile() {
  const { user, updateProfile, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [university, setUniversity] = useState(user?.university ?? '');
  const [course, setCourse] = useState(user?.course ?? '');
  const [year, setYear] = useState(user?.year ?? 'Mwaka 1');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [busy, setBusy] = useState(false);

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Ruhusa ya picha', 'Ruhusa ya picha inahitajika ili kubadilisha picha ya profaili.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!fullName.trim() || !university.trim() || !course.trim()) return;
    setBusy(true);
    try {
      const error = await updateProfile({ fullName: fullName.trim(), university: university.trim(), course: course.trim(), year, avatarUrl });
      if (error) {
        Alert.alert('Imeshindikana kuhifadhi', error);
        return;
      }
      router.back();
    } catch (error) {
      Alert.alert('Imeshindikana kuhifadhi', error instanceof Error ? error.message : 'Jaribu tena.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Hariri profaili" back />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar name={fullName || 'U'} size={90} imageUri={avatarUrl ?? undefined} />
          <Pressable onPress={chooseAvatar} style={styles.avatarButton}><Text style={styles.avatarButtonText}>Badilisha picha</Text></Pressable>
          {avatarUrl && <Pressable onPress={() => setAvatarUrl(null)}><Text style={styles.removeText}>Ondoa picha</Text></Pressable>}
        </View>
        <Field label="Jina kamili" value={fullName} onChangeText={setFullName} />
        <Field label="Chuo" value={university} onChangeText={setUniversity} />
        <Field label="Kozi" value={course} onChangeText={setCourse} />
        <Field label="Mwaka wa masomo" value={year} onChangeText={setYear} />
        <Pressable onPress={save} disabled={busy} style={[styles.button, busy && { opacity: 0.6 }]}><Text style={styles.buttonText}>{busy ? 'Inahifadhi...' : 'Hifadhi mabadiliko'}</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, ...props }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const { isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  return <View style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><TextInput {...props} style={styles.input} placeholder={label} placeholderTextColor={C.mute} /></View>;
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  avatarSection: { alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarButton: { backgroundColor: C.soft, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  avatarButtonText: { color: C.primary, fontWeight: '700' },
  removeText: { color: '#DC2626', fontWeight: '700' },
  fieldGroup: { gap: 7 },
  label: { color: C.text, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 11, backgroundColor: C.card, paddingHorizontal: 13, paddingVertical: 13, color: C.text },
  button: { backgroundColor: C.primary, padding: 15, alignItems: 'center', borderRadius: 11, marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '800' },
});