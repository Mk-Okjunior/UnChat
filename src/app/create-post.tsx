import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Avatar, Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

export default function CreatePost() {
  const { width } = useWindowDimensions();
  const { user, addPost, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Ruhusa inahitajika', 'Ruhusa ya picha inahitajika ili kuunganisha picha kwenye post.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const submit = () => {
    if (!text.trim() && !image) return;
    addPost(text, image);
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <Header title="Tengeneza post" back />
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: width >= 900 ? 760 : 640 }]}>
        <View style={styles.author}><Avatar name={user?.fullName ?? 'Mwanafunzi'} imageUri={user?.avatarUrl ?? undefined} /><View><Text style={styles.name}>{user?.fullName}</Text><Text style={styles.muted}>{user?.university}</Text></View></View>
        <TextInput value={text} onChangeText={setText} placeholder="Ungependa kushiriki nini na jumuiya?" placeholderTextColor={C.mute} multiline maxLength={1000} style={styles.input} autoFocus />
        <Text style={styles.counter}>{text.length}/1000</Text>

        <Pressable onPress={pickImage} style={styles.uploadButton}><Text style={styles.uploadText}>+ Ongeza picha</Text></Pressable>

        {image ? (
          <View style={styles.mediaWrap}>
            <Image source={{ uri: image }} style={styles.mediaPreview} resizeMode="cover" />
            <Pressable onPress={() => setImage(null)} style={styles.removeImage}><Text style={styles.removeText}>Ondoa picha</Text></Pressable>
          </View>
        ) : null}

        <Pressable onPress={submit} disabled={!text.trim() && !image} style={[styles.button, (!text.trim() && !image) && styles.disabled]}><Text style={styles.buttonText}>Chapisha</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { width: '100%', alignSelf: 'center', padding: 18, flexGrow: 1, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  name: { color: C.text, fontWeight: '800' },
  muted: { color: C.mute, fontSize: 12, marginTop: 4 },
  input: { minHeight: 180, textAlignVertical: 'top', color: C.text, fontSize: 17, lineHeight: 25, paddingVertical: 18 },
  counter: { alignSelf: 'flex-end', color: C.mute, fontSize: 12 },
  uploadButton: { marginTop: 12, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: C.card },
  uploadText: { color: C.primary, fontWeight: '700' },
  mediaWrap: { marginTop: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: C.bg },
  mediaPreview: { width: '100%', height: 220 },
  removeImage: { alignItems: 'center', paddingVertical: 10 },
  removeText: { color: '#DC2626', fontWeight: '700' },
  button: { backgroundColor: C.primary, padding: 15, alignItems: 'center', borderRadius: 12, marginTop: 18 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '800' },
});