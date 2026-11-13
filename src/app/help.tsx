import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '../components/ui';
import { useAppStore } from '../store/app-store';
import { C } from '../theme';

const faq = [
  { question: 'Akaunti yangu inahifadhiwa wapi?', answer: 'Akaunti na data ya demo huhifadhiwa kwenye kifaa hiki pekee.' },
  { question: 'Je, ujumbe unaonekana kwa watumiaji wengine?', answer: 'Bado hapana. Chat ya sasa ni demo ya ndani; chat ya pamoja inahitaji backend.' },
  { question: 'Ninawezaje kubadilisha taarifa za chuo?', answer: 'Fungua Profile, chagua Hariri Profaili, kisha hifadhi mabadiliko.' },
];

export default function Help() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode);

  return (
    <Screen>
      <Header title="Msaada" back />
      <View style={styles.content}>
        {faq.map((item) => {
          const open = expanded === item.question;
          return <Pressable key={item.question} onPress={() => setExpanded(open ? null : item.question)} style={styles.item}><View style={styles.questionRow}><Text style={styles.question}>{item.question}</Text><Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.mute} /></View>{open && <Text style={styles.answer}>{item.answer}</Text>}</Pressable>;
        })}
      </View>
    </Screen>
  );
}

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
  content: { padding: 18, width: '100%', maxWidth: 700, alignSelf: 'center', backgroundColor: isDarkMode ? '#101820' : '#F4F7FC' },
  item: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  question: { flex: 1, color: C.text, fontWeight: '700' },
  answer: { color: C.mute, lineHeight: 21, marginTop: 10 },
});