import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C, getThemeColors } from '../theme';

const APPEARANCE_MODES = [
  { value: 'system', label: 'Kifaa', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Mwanga', icon: 'sunny-outline' },
  { value: 'dark', label: 'Giza', icon: 'moon-outline' },
] as const;

export default function Settings() {
  const { notificationsEnabled, setNotificationsEnabled, themeMode, setThemeMode, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);

  return (
    <Screen>
      <Header title="Mipangilio" back />
      <View style={styles.content}>
        <Text style={styles.section}>Muonekano</Text>
        <View style={styles.appearanceControl} accessibilityRole="radiogroup">
          {APPEARANCE_MODES.map((mode) => {
            const selected = themeMode === mode.value;
            return <Pressable key={mode.value} onPress={() => setThemeMode(mode.value)} style={[styles.appearanceOption, selected && styles.appearanceOptionSelected]} accessibilityRole="radio" accessibilityState={{ selected }}>
              <Ionicons name={mode.icon} size={16} color={selected ? C.primary : C.mute} />
              <Text style={[styles.appearanceLabel, selected && styles.appearanceLabelSelected]}>{mode.label}</Text>
            </Pressable>;
          })}
        </View>
        <Text style={styles.detail}>Kifaa hufuata mwonekano wa simu au kompyuta yako.</Text>
        <Text style={styles.section}>Arifa</Text>
        <View style={styles.row}><View style={styles.copy}><Text style={styles.title}>Arifa ndani ya app</Text><Text style={styles.detail}>Hifadhi upendeleo wako kwenye kifaa hiki.</Text></View><Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: C.primary }} /></View>
        <Text style={styles.note}>Arifa za push hazijaunganishwa kwenye demo hii.</Text>
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, width: '100%', maxWidth: 700, alignSelf: 'center', backgroundColor: getThemeColors(isDarkMode).bg },
  section: { color: C.mute, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', marginBottom: 10 },
  appearanceControl: { flexDirection: 'row', gap: 5, padding: 5, backgroundColor: C.soft, borderRadius: 13, borderWidth: 1, borderColor: C.line },
  appearanceOption: { flex: 1, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9, paddingHorizontal: 5 },
  appearanceOptionSelected: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  appearanceLabel: { color: C.mute, fontSize: 12, fontWeight: '600' },
  appearanceLabelSelected: { color: C.primary, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  copy: { flex: 1 },
  title: { color: C.text, fontWeight: '700' },
  detail: { color: C.mute, fontSize: 12, marginTop: 5 },
  note: { color: C.mute, fontSize: 12, marginTop: 16 },
});