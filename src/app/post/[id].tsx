import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar, Header, Screen } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

export default function PostDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, posts, addComment, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [comment, setComment] = useState('');
  const post = posts.find((item) => item.id === id);

  const submit = () => {
    if (!post || !comment.trim()) return;
    addComment(post.id, comment);
    setComment('');
  };

  return (
    <Screen>
      <Header title="Maoni" back />
      {post ? <>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.author}><Avatar name={post.authorName} imageUri={post.authorAvatarUrl ?? undefined} /><View><Text style={styles.name}>{post.authorName}</Text><Text style={styles.muted}>{post.university}</Text></View></View>
          {!!post.text && <Text style={styles.postText}>{post.text}</Text>}
          {post.image ? <View style={styles.mediaWrap}><Image source={{ uri: post.image }} style={styles.mediaPreview} resizeMode="cover" /></View> : null}
          <Text style={styles.muted}>{post.likes.length} likes · {post.comments.length} maoni</Text>
          <Text style={styles.heading}>Maoni</Text>
          {post.comments.map((item) => <View key={item.id} style={styles.comment}><Avatar name={item.authorName} size={34} /><View style={styles.commentBody}><Text style={styles.name}>{item.authorName}</Text><Text style={styles.postText}>{item.text}</Text></View></View>)}
          {post.comments.length === 0 && <Text style={styles.muted}>Bado hakuna maoni.</Text>}
        </ScrollView>
        <View style={styles.composer}><TextInput value={comment} onChangeText={setComment} placeholder="Andika maoni..." placeholderTextColor={C.mute} style={styles.input} returnKeyType="send" onSubmitEditing={submit} /><Pressable onPress={submit} disabled={!comment.trim()} accessibilityLabel="Tuma maoni"><Ionicons name="send" size={21} color={comment.trim() ? C.primary : C.mute} /></Pressable></View>
      </> : <Text style={styles.muted}>Post hii haipatikani.</Text>}
      {!user && <Text style={styles.muted}>Ingia ili kushiriki maoni.</Text>}
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, paddingBottom: 30, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: C.text, fontWeight: '800' },
  muted: { color: C.mute, fontSize: 13, marginTop: 8 },
  postText: { color: C.text, lineHeight: 22, marginTop: 12 },
  mediaWrap: { marginTop: 14, borderRadius: 14, overflow: 'hidden', backgroundColor: C.bg },
  mediaPreview: { width: '100%', height: 240 },
  heading: { color: C.text, fontWeight: '800', fontSize: 17, marginTop: 26, marginBottom: 12 },
  comment: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  commentBody: { flex: 1, backgroundColor: C.soft, borderRadius: 12, padding: 12 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card },
  input: { flex: 1, minHeight: 42, borderRadius: 20, backgroundColor: C.soft, paddingHorizontal: 14, color: C.text },
});