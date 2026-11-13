import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Header, Screen } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

export default function Conversation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, conversations, sendMessage, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const conversation = conversations.find((item) => item.id === id);
  const name = conversation?.name ?? id;

  const send = () => {
    if (!text.trim() || !id) return;
    sendMessage(id, text);
    setText('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <Screen>
      <Header title={name} back />
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList ref={listRef} data={conversation?.messages ?? []} keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })} ListEmptyComponent={<Text style={styles.empty}>Anza mazungumzo na {name}.</Text>} renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return <View style={[styles.messageRow, mine && styles.messageRowMine]}><View style={[styles.bubble, mine ? styles.mine : styles.theirs]}><Text style={[styles.messageText, mine && styles.mineText]}>{item.text}</Text><Text style={[styles.time, mine && styles.mineText]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View></View>;
        }} />
        <View style={styles.composer}><TextInput value={text} onChangeText={setText} placeholder="Andika ujumbe..." placeholderTextColor={C.mute} style={styles.input} multiline maxLength={1000} /><Pressable onPress={send} disabled={!text.trim()} style={styles.sendButton} accessibilityLabel="Tuma ujumbe"><Ionicons name="send" size={19} color={text.trim() ? '#fff' : '#94A3B8'} /></Pressable></View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  body: { flex: 1, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  messages: { flexGrow: 1, paddingHorizontal: 16, paddingVertical: 20, gap: 10 },
  empty: { color: C.mute, textAlign: 'center', marginTop: 28 },
  messageRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  messageRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 10 },
  theirs: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderBottomLeftRadius: 4 },
  mine: { backgroundColor: C.primary, borderBottomRightRadius: 4 },
  messageText: { color: C.text, lineHeight: 20 },
  mineText: { color: '#fff' },
  time: { color: C.mute, fontSize: 10, alignSelf: 'flex-end', marginTop: 5 },
  composer: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card },
  input: { flex: 1, maxHeight: 110, minHeight: 42, borderRadius: 18, backgroundColor: C.soft, paddingHorizontal: 14, paddingVertical: 10, color: C.text },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary },
});