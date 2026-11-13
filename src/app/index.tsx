// SKRINI 1: Splash
import { Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHydrated } from '../hooks/use-hydrated';

export default function Splash() {
  const { width } = useWindowDimensions();
  const hydrated = useHydrated();
  const desktop = hydrated && width >= 820;

  return (
    <LinearGradient colors={['#2563EB', '#7C3AED']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={[styles.scrollContent, desktop && styles.desktopContent]}>
          <View style={[styles.brand, desktop && styles.desktopBrand]}>
            <View style={styles.mark}><Ionicons name="school" size={desktop ? 68 : 82} color="#fff" /></View>
            <Text style={styles.title}>UniChat</Text>
            <Text style={styles.tagline}>Kijamii  ·  Masomo  ·  Fursa</Text>
            <Text style={[styles.description, desktop && styles.desktopDescription]}>Jumuiya ya wanachuo wa Tanzania. Ungana, jifunze na uendelee pamoja.</Text>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => router.push('/register')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Anza sasa</Text></Pressable>
            <Pressable onPress={() => router.push('/login')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Tayari una akaunti? Ingia</Text></Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 48 },
  desktopContent: { width: '100%', maxWidth: 1120, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 64 },
  brand: { width: '100%', maxWidth: 420, alignItems: 'center' },
  desktopBrand: { alignItems: 'flex-start' },
  mark: { width: 132, height: 132, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 44, fontWeight: '800' },
  tagline: { color: '#E0E7FF', fontSize: 16, marginTop: 4 },
  description: { color: '#fff', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 24, maxWidth: 360 },
  desktopDescription: { textAlign: 'left' },
  actions: { width: '100%', maxWidth: 420, gap: 12 },
  primaryButton: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#2563EB', fontWeight: '800', fontSize: 16 },
  secondaryButton: { paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#fff', fontWeight: '700' },
});
