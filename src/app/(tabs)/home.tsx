// SKRINI 3: Home
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Avatar, Banner, Card, Header, Screen } from '../../components/ui';
import { useAppStore } from '../../store/app-store';
import { C } from '../../theme';

const shortcuts = [
  { label: 'Notes', icon: 'document-text', color: '#2563EB', go: '/academic' },
  { label: 'Ajira', icon: 'briefcase', color: '#22C55E', go: '/jobs' },
  { label: 'Vikundi', icon: 'people', color: '#7C3AED', go: '/(tabs)/groups' },
  { label: 'Marafiki', icon: 'person-add', color: '#F59E0B', go: '/(tabs)/friends' },
];

export default function Home() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { user, posts, toggleLike, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const [sharingPostId, setSharingPostId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState('');
  const sharingPost = posts.find((post) => post.id === sharingPostId) ?? null;

  const getShareMessage = () => sharingPost
    ? `${sharingPost.authorName} ameshiriki kwenye UniChat:\n\n${sharingPost.text}`
    : '';

  const shareOnWhatsApp = async () => {
    if (!sharingPost) return;
    try {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(getShareMessage())}`);
      setSharingPostId(null);
      setShareFeedback('');
    } catch {
      setShareFeedback('WhatsApp haikuweza kufunguliwa kwenye kifaa hiki.');
    }
  };

  const shareWithOtherApps = async () => {
    if (!sharingPost) return;
    const message = getShareMessage();
    try {
      if (Platform.OS === 'web' && !navigator.share) {
        await navigator.clipboard.writeText(message);
        setShareFeedback('Ujumbe umenakiliwa.');
        return;
      }
      await Share.share({ message }, { dialogTitle: 'Shiriki post' });
      setSharingPostId(null);
      setShareFeedback('');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (Platform.OS === 'web' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(message);
          setShareFeedback('Ujumbe umenakiliwa.');
          return;
        } catch {
          setShareFeedback('Imeshindikana kushare ujumbe huu.');
          return;
        }
      }
      setShareFeedback('Imeshindikana kushare ujumbe huu.');
    }
  };

  return (
    <Screen>
      <Header title="UniChat" icon="notifications-outline" onIconPress={() => router.push('/notifications')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, desktop && styles.desktopContent]}>
        <View style={styles.feed}>
          <Banner title={`Habari, ${user?.fullName.split(' ')[0] ?? 'mwanafunzi'}`} sub="Karibu kwenye jumuiya ya wanachuo wa Tanzania." icon="school" />
          <Pressable onPress={() => router.push('/create-post')}><Card><Avatar name={user?.fullName ?? 'Mwanafunzi'} size={40} imageUri={user?.avatarUrl ?? undefined} /><Text style={styles.composerHint}>Andika unachofikiria...</Text><Ionicons name="create-outline" size={20} color={C.primary} /></Card></Pressable>
          <View style={styles.shortcuts}>
          {shortcuts.map((x) => (
            <Pressable key={x.label} style={styles.shortcut} onPress={() => router.push(x.go as never)}>
              <View style={[styles.shortcutIcon, { backgroundColor: `${x.color}18` }]}><Ionicons name={x.icon as never} size={22} color={x.color} /></View>
              <Text style={styles.shortcutText}>{x.label}</Text>
            </Pressable>
          ))}
          </View>
          <Text style={styles.sectionTitle}>Kutoka kwenye jumuiya</Text>
          {posts.map((post) => {
            const liked = !!user && post.likes.includes(user.id);
            return (
              <View key={post.id} style={styles.post}>
                <View style={styles.postHeader}><Avatar name={post.authorName} size={42} imageUri={post.authorAvatarUrl ?? undefined} /><View style={styles.author}><Text style={styles.authorName}>{post.authorName}</Text><Text style={styles.meta}>{post.university} · {new Date(post.createdAt).toLocaleDateString()}</Text></View><Pressable accessibilityLabel="Chaguo za chapisho"><Ionicons name="ellipsis-horizontal" size={20} color={C.mute} /></Pressable></View>
                {!!post.text && <Text style={styles.postText}>{post.text}</Text>}
                {post.image ? <View style={styles.imageWrap}><Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" /></View> : null}
                <Text style={styles.meta}>{post.likes.length} likes · {post.comments.length} maoni</Text>
                <View style={styles.postActions}>
                  <Pressable onPress={() => toggleLike(post.id)} style={styles.action}><Ionicons name={liked ? 'heart' : 'heart-outline'} size={19} color={liked ? '#E11D48' : C.mute} /><Text style={[styles.actionText, liked && { color: '#E11D48' }]}>Like</Text></Pressable>
                  <Pressable onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} style={styles.action}><Ionicons name="chatbubble-outline" size={18} color={C.mute} /><Text style={styles.actionText}>Maoni</Text></Pressable>
                  <Pressable onPress={() => { setShareFeedback(''); setSharingPostId(post.id); }} style={styles.action} accessibilityRole="button" accessibilityLabel={`Shiriki post ya ${post.authorName}`}><Ionicons name="share-social-outline" size={18} color={C.mute} /><Text style={styles.actionText}>Shiriki</Text></Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <Modal visible={!!sharingPost} transparent animationType="slide" onRequestClose={() => setSharingPostId(null)}>
        <View style={styles.shareBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSharingPostId(null)} accessibilityLabel="Funga kushiriki" />
          <View style={styles.shareSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.shareHeader}>
              <View style={styles.shareHeaderCopy}>
                <Text style={styles.shareTitle}>Shiriki post</Text>
                <Text style={styles.shareSubtitle} numberOfLines={2}>{sharingPost?.text || 'Shiriki post hii na marafiki.'}</Text>
              </View>
              <Pressable onPress={() => setSharingPostId(null)} accessibilityLabel="Funga" style={styles.closeShare}><Ionicons name="close" size={21} color={C.mute} /></Pressable>
            </View>
            <Pressable onPress={() => void shareOnWhatsApp()} style={styles.shareOption} accessibilityRole="button">
              <View style={[styles.shareIcon, styles.whatsappIcon]}><Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" /></View>
              <View style={styles.shareCopy}><Text style={styles.shareOptionTitle}>WhatsApp</Text><Text style={styles.shareOptionDescription}>Tuma ujumbe kwenye WhatsApp</Text></View>
              <Ionicons name="chevron-forward" size={18} color={C.mute} />
            </Pressable>
            <Pressable onPress={() => void shareWithOtherApps()} style={styles.shareOption} accessibilityRole="button">
              <View style={[styles.shareIcon, styles.otherShareIcon]}><Ionicons name="share-social-outline" size={20} color={C.primary} /></View>
              <View style={styles.shareCopy}><Text style={styles.shareOptionTitle}>Programu nyingine</Text><Text style={styles.shareOptionDescription}>Instagram, Facebook, TikTok na zaidi</Text></View>
              <Ionicons name="chevron-forward" size={18} color={C.mute} />
            </Pressable>
            {!!shareFeedback && <Text accessibilityRole="alert" style={styles.shareFeedback}>{shareFeedback}</Text>}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  scrollView: { flex: 1, minHeight: 0, backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  content: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 32 },
  desktopContent: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  feed: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  composerHint: { flex: 1, color: C.mute },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12, paddingVertical: 8 },
  shortcut: { alignItems: 'center', gap: 7, minWidth: 62 },
  shortcutIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutText: { color: C.mute, fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '800', marginBottom: 12, marginTop: 8 },
  post: { backgroundColor: C.card, borderRadius: 15, borderWidth: 1, borderColor: C.line, padding: 14, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  author: { flex: 1, gap: 3 },
  authorName: { color: C.text, fontWeight: '800' },
  meta: { color: C.mute, fontSize: 12, marginTop: 4 },
  postText: { color: C.text, fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 8 },
  imageWrap: { marginTop: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: C.bg },
  image: { width: '100%', height: 220 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, marginTop: 12, paddingTop: 10, justifyContent: 'space-around' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 },
  actionText: { color: C.mute, fontSize: 13, fontWeight: '600' },
  shareBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,24,40,0.42)' },
  shareSheet: { width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: C.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: C.line, marginBottom: 18 },
  shareHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  shareHeaderCopy: { flex: 1, gap: 5 },
  shareTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  shareSubtitle: { color: C.mute, fontSize: 12, lineHeight: 17 },
  closeShare: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' },
  shareOption: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: C.line },
  shareIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  whatsappIcon: { backgroundColor: '#25A65A' },
  otherShareIcon: { backgroundColor: C.soft },
  shareCopy: { flex: 1, gap: 3 },
  shareOptionTitle: { color: C.text, fontSize: 14, fontWeight: '700' },
  shareOptionDescription: { color: C.mute, fontSize: 11 },
  shareFeedback: { color: C.primary, fontSize: 12, fontWeight: '600', paddingTop: 8 },
});
