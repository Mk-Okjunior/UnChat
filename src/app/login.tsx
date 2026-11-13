import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { CampusBackdrop } from '../components/campus-backdrop';
import { useAppStore } from '../store/app-store';
import { C, GRAD } from '../theme';

const DEMO_EMAIL = 'admin@demo.local';
const DEMO_PASSWORD = 'demo123';

export default function Login() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { login, authError, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);
  const blurTarget = useRef<ComponentRef<typeof View>>(null);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const loginEmail = email.trim() || DEMO_EMAIL;
    const loginPassword = password || DEMO_PASSWORD;
    setError('');
    if (!loginEmail || !loginPassword) return setError('Jaza barua pepe na nenosiri.');
    setBusy(true);
    try {
      const result = await login(loginEmail, loginPassword);
      if (result) setError(result);
      else router.replace('/(tabs)/home');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Imeshindikana kuingia. Jaribu tena.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.backdrop}><CampusBackdrop blurTargetRef={blurTarget} /></View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.layout, desktop && styles.desktopLayout]}>
          <View style={styles.intro}>
            <View style={styles.brandLine}><LinearGradient colors={GRAD} style={styles.logoMark}><Ionicons name="school" size={24} color="#FFFFFF" /></LinearGradient><Text style={styles.mobileTitle}>UniChat</Text></View>
            {desktop && <><Text style={styles.brandTitle}>Jumuiya yako ya chuo.</Text><Text style={styles.brandCopy}>Masomo, marafiki na fursa katika sehemu moja.</Text></>}
          </View>
          <BlurView intensity={72} tint={isDarkMode ? 'dark' : 'light'} blurTarget={blurTarget} blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined} style={styles.glassPanel}>
          <View style={styles.glassTint}>
            <Text style={styles.heading}>Karibu tena</Text>
            <Text style={styles.muted}>Ingia kwenye akaunti yako</Text>
            <View style={styles.fields}>
              <View style={styles.field}><Ionicons name="mail-outline" size={19} color={C.mute} /><TextInput value={email} onChangeText={setEmail} placeholder="Barua pepe" keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={styles.input} /></View>
              <View style={styles.field}><Ionicons name="lock-closed-outline" size={19} color={C.mute} /><TextInput value={password} onChangeText={setPassword} placeholder="Nenosiri" secureTextEntry={!visible} autoComplete="current-password" style={styles.input} /><Pressable onPress={() => setVisible((current) => !current)} accessibilityLabel={visible ? 'Ficha nenosiri' : 'Onyesha nenosiri'}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.mute} /></Pressable></View>
            </View>
            <Text style={styles.demoHint}>Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}</Text>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <Pressable onPress={submit} disabled={busy} style={[styles.submit, busy && styles.disabled]}><LinearGradient colors={GRAD} style={styles.submitGradient}><Text style={styles.submitText}>{busy ? 'Inaingia...' : 'Ingia kama demo'}</Text></LinearGradient></Pressable>
            <Text style={styles.footer}>Huna akaunti? <Link href="/register" style={styles.link}>Jisajili</Link></Text>
            {!!authError && <Text accessibilityRole="alert" style={styles.setupNote}>{authError}</Text>}
          </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0B1C32' },
  backdrop: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 28 },
  layout: { width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 24 },
  desktopLayout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 64 },
  intro: { width: '100%', maxWidth: 390, gap: 18, alignSelf: 'center' },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandPanel: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', padding: 40, borderRadius: 22 },
  brandTitle: { color: '#FFFFFF', fontSize: 38, lineHeight: 46, fontWeight: '800' },
  brandCopy: { color: '#E1ECFA', fontSize: 15, lineHeight: 23 },
  glassPanel: { width: '100%', maxWidth: 500, alignSelf: 'center', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.48)' },
  glassTint: { padding: 24, backgroundColor: isDarkMode ? 'rgba(12,24,39,0.72)' : 'rgba(255,255,255,0.74)' },
  formEyebrow: { color: C.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  mobileBrand: { alignItems: 'center', marginBottom: 28 },
  logoMark: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  mobileTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  heading: { color: isDarkMode ? '#F3F7FC' : '#17233E', fontSize: 23, fontWeight: '800', marginTop: 5 },
  muted: { color: isDarkMode ? '#C1CBD8' : '#64748B', marginTop: 6, fontSize: 12 },
  fields: { gap: 12, marginTop: 24 },
  field: { minHeight: 52, borderWidth: 1, borderColor: isDarkMode ? 'rgba(213,226,242,0.22)' : 'rgba(113,137,166,0.22)', borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.62)' },
  input: { flex: 1, minWidth: 0, color: isDarkMode ? '#F3F7FC' : '#17233E', paddingVertical: 12, outlineStyle: 'none' } as never,
  demoHint: { color: isDarkMode ? '#A7B7CF' : '#4B5E7A', fontSize: 11, marginTop: 10, textAlign: 'center' },
  error: { color: '#B42318', marginTop: 12 },
  submit: { borderRadius: 13, overflow: 'hidden', marginTop: 18, shadowColor: '#1769F5', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 9, elevation: 3 },
  submitGradient: { minHeight: 51, alignItems: 'center', justifyContent: 'center', padding: 14 },
  disabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  footer: { color: isDarkMode ? '#CDD7E4' : '#63748A', textAlign: 'center', marginTop: 22, fontSize: 12 },
  link: { color: C.primary, fontWeight: '800' },
  setupNote: { color: '#B42318', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 12 },
});
