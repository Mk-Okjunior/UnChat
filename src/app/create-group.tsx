import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Chips, Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Masomo');
  const { addGroup, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);

  const submit = () => {
    if (!name.trim()) return;
    addGroup(name, category);
    router.replace('/(tabs)/groups');
  };

  return (
    <Screen>
      <Header title="Unda kikundi" back />
      <View style={styles.content}>
        <Text style={styles.label}>Jina la kikundi</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Mfano: Study group ya Biology" placeholderTextColor={C.mute} style={styles.input} maxLength={70} />
        <Text style={styles.label}>Aina ya kikundi</Text>
        <Chips items={['Vyuo', 'Madarasa', 'Masomo', 'Mengine']} active={category} onPick={setCategory} />
        <Pressable onPress={submit} disabled={!name.trim()} style={[styles.button, !name.trim() && styles.disabled]}><Text style={styles.buttonText}>Unda kikundi</Text></Pressable>
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  label: { color: C.text, fontWeight: '800', marginTop: 14, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 11, backgroundColor: C.card, paddingHorizontal: 13, paddingVertical: 13, color: C.text },
  button: { backgroundColor: C.primary, borderRadius: 11, alignItems: 'center', padding: 14, marginTop: 22 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '800' },
});