import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { CampusBackdrop } from '../components/campus-backdrop';
import { useAppStore } from '../store/app-store';
import { C, GRAD } from '../theme';

const years = ['Mwaka 1', 'Mwaka 2', 'Mwaka 3', 'Mwaka 4', 'Mwaka 5', 'Uzamili'];
const pendingEmailKey = 'unchat-pending-registration-email-v1';
type RegistrationStep = 'details' | 'verify-email' | 'student-card';

export default function Register() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { user, register, verifySignupOtp, completeStudentRegistration, resendSignupOtp, authError, isDarkMode } = useAppStore();
  const styles = createStyles(isDarkMode, desktop);
  const blurTarget = useRef<ComponentRef<typeof View>>(null);
  const [step, setStep] = useState<RegistrationStep>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState(years[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [studentIdCard, setStudentIdCard] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const activeStep: RegistrationStep = user?.role === 'student' && !user.studentIdCardPath ? 'student-card' : step;

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(pendingEmailKey)
      .then((pendingEmail) => {
        if (active && pendingEmail && !user) {
          setEmail(pendingEmail);
          setStep('verify-email');
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  const pickStudentIdCard = async () => {
    setError('');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) setStudentIdCard(result.assets[0]);
  };

  const submitDetails = async () => {
    setError('');
    setMessage('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || !university.trim() || !course.trim() || !studentIdCard) {
      return setError('Jaza taarifa zote na ongeza picha ya kitambulisho.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Weka barua pepe iliyo sahihi.');
    if (!/^\+?[0-9\s()-]{8,20}$/.test(phone.trim())) return setError('Weka namba ya simu iliyo sahihi.');
    if (password.length < 8) return setError('Nenosiri liwe na angalau herufi 8.');
    if (password !== confirmPassword) return setError('Nenosiri halifanani.');
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await register({ fullName, email: normalizedEmail, phone, university, course, year, password });
      if (result.error) setError(result.error);
      else if (result.confirmationRequired) {
        await AsyncStorage.setItem(pendingEmailKey, normalizedEmail);
        setEmail(normalizedEmail);
        setStep('verify-email');
        setMessage('Nimetuma msimbo wa uthibitisho kwenye barua pepe yako.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Imeshindikana kuhifadhi akaunti. Jaribu tena.');
    } finally {
      setBusy(false);
    }
  };

  const verifyEmail = async () => {
    if (!/^\d{6}$/.test(otp.trim())) return setError('Weka msimbo wa tarakimu 6 uliotumwa kwenye barua pepe.');
    if (!studentIdCard) return setError('Chagua picha ya kitambulisho kabla ya kuthibitisha.');
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const result = await verifySignupOtp(email, otp, studentIdCard);
      if (result) {
        setError(result);
        return;
      }
      await AsyncStorage.removeItem(pendingEmailKey);
      setMessage('Akaunti imethibitishwa. Karibu UniChat!');
      router.replace('/(tabs)/home');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kuthibitisha akaunti.');
    } finally {
      setBusy(false);
    }
  };

  const completeStudentCard = async () => {
    if (!studentIdCard) return setError('Chagua picha ya kitambulisho kwanza.');
    setError('');
    setBusy(true);
    try {
      const result = await completeStudentRegistration(studentIdCard);
      if (result) {
        setError(result);
        return;
      }
      setMessage('Taarifa zako zimekamilika. Karibu UniChat!');
      router.replace('/(tabs)/home');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kuhifadhi picha ya kitambulisho.');
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await resendSignupOtp(email);
      if (result) setError(result);
      else setMessage('Msimbo mpya umetumwa kwenye barua pepe yako.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Imeshindikana kutuma msimbo tena.');
    } finally {
      setBusy(false);
    }
  };

  const field = (
    label: string,
    value: string,
    setValue: (text: string) => void,
    icon: ComponentProps<typeof Ionicons>['name'],
    options: ComponentProps<typeof TextInput> = {},
  ) => (
    <View style={styles.field}>
      <Ionicons name={icon} size={19} color={C.mute} />
      <TextInput value={value} onChangeText={setValue} placeholder={label} placeholderTextColor={C.mute} style={styles.input} {...options} />
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.backdrop}>
        <CampusBackdrop blurTargetRef={blurTarget} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.layout, desktop && styles.desktopLayout]}>
          <View style={styles.intro}>
            <View style={styles.brandLine}>
              <LinearGradient colors={GRAD} style={styles.logoMark}><Ionicons name="school" size={25} color="#FFFFFF" /></LinearGradient>
              <Text style={styles.brandName}>UniChat</Text>
            </View>
            <Text style={styles.introTitle}>Jumuiya yako ya chuo inaanzia hapa.</Text>
            <Text style={styles.introCopy}>Unda akaunti yako ya mwanafunzi ili uungane na wanachuo.</Text>
          </View>

          <BlurView
            intensity={72}
            tint={isDarkMode ? 'dark' : 'light'}
            blurTarget={blurTarget}
            blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
            style={styles.glassPanel}
          >
            <View style={styles.glassTint}>
              <View style={styles.formHeader}>
                <View>
                  <Text style={styles.formEyebrow}>{activeStep === 'details' ? 'ANZA SAFARI YAKO' : activeStep === 'verify-email' ? 'UTHIBITISHO WA BARUA PEPE' : 'HATUA YA MWISHO'}</Text>
                  <Text style={styles.heading}>{activeStep === 'details' ? 'Tengeneza akaunti' : activeStep === 'verify-email' ? 'Thibitisha akaunti' : 'Kamilisha usajili'}</Text>
                </View>
                <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{activeStep === 'details' ? '01' : activeStep === 'verify-email' ? '02' : '03'}</Text><Text style={styles.stepCount}>/ 03</Text></View>
              </View>

              {activeStep === 'details' && <>
                <Text style={styles.muted}>Taarifa zako za mwanafunzi na kitambulisho cha chuo.</Text>
                <View style={styles.fields}>
                  {field('Jina kamili', fullName, setFullName, 'person-outline', { autoComplete: 'name' })}
                  {field('Barua pepe', email, setEmail, 'mail-outline', { keyboardType: 'email-address', autoCapitalize: 'none', autoComplete: 'email' })}
                  {field('Namba ya simu', phone, setPhone, 'call-outline', { keyboardType: 'phone-pad', autoComplete: 'tel' })}
                  <View style={styles.fieldRow}>
                    {field('Chuo kikuu', university, setUniversity, 'school-outline')}
                    {field('Kozi', course, setCourse, 'book-outline')}
                  </View>
                  <View style={styles.yearSection}>
                    <Text style={styles.fieldLabel}>Mwaka wa masomo</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearRow}>
                      {years.map((item) => <Pressable key={item} onPress={() => setYear(item)} style={[styles.yearChip, year === item && styles.yearActive]} accessibilityRole="button" accessibilityState={{ selected: year === item }}><Text style={[styles.yearText, year === item && styles.yearTextActive]}>{item}</Text></Pressable>)}
                    </ScrollView>
                  </View>
                  <View style={styles.field}>
                    <Ionicons name="lock-closed-outline" size={19} color={C.mute} />
                    <TextInput value={password} onChangeText={setPassword} placeholder="Nenosiri (angalau herufi 8)" placeholderTextColor={C.mute} style={styles.input} secureTextEntry={!passwordVisible} autoComplete="new-password" />
                    <Pressable onPress={() => setPasswordVisible((visible) => !visible)} accessibilityLabel={passwordVisible ? 'Ficha nenosiri' : 'Onyesha nenosiri'}><Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={19} color={C.mute} /></Pressable>
                  </View>
                  {field('Rudia nenosiri', confirmPassword, setConfirmPassword, 'lock-closed-outline', { secureTextEntry: !passwordVisible, autoComplete: 'new-password' })}
                </View>
                <Text style={styles.fieldLabel}>Picha ya kitambulisho cha mwanafunzi</Text>
                <Pressable onPress={() => void pickStudentIdCard()} style={[styles.uploadCard, studentIdCard && styles.uploadCardSelected]} accessibilityRole="button">
                  {studentIdCard ? <>
                    <Image source={{ uri: studentIdCard.uri }} style={styles.idPreview} resizeMode="cover" />
                    <View style={styles.idFileInfo}><Ionicons name="checkmark-circle" size={19} color="#16A36A" /><Text style={styles.uploadText} numberOfLines={1}>{studentIdCard.fileName ?? 'Kitambulisho kimechaguliwa'}</Text></View>
                    <Ionicons name="create-outline" size={18} color={C.primary} />
                  </> : <>
                    <View style={styles.uploadIcon}><Ionicons name="cloud-upload-outline" size={21} color={C.primary} /></View>
                    <View style={styles.uploadCopy}><Text style={styles.uploadTitle}>Pakia picha ya kitambulisho</Text><Text style={styles.uploadText}>JPG, PNG au WebP · hadi MB 5</Text></View>
                    <Ionicons name="add-circle-outline" size={22} color={C.primary} />
                  </>}
                </Pressable>
              </>}

              {activeStep === 'verify-email' && <>
                <Text style={styles.muted}>Msimbo wa tarakimu 6 umetumwa kwa</Text>
                <Text style={styles.emailTarget}>{email}</Text>
                {studentIdCard && <View style={styles.cardReady}><Ionicons name="checkmark-circle" size={17} color="#16A36A" /><Text style={styles.cardReadyText}>Picha ya kitambulisho iko tayari</Text><Image source={{ uri: studentIdCard.uri }} style={styles.cardReadyImage} /></View>}
                <View style={styles.otpField}>
                  <TextInput value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" placeholderTextColor={C.mute} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} style={styles.otpInput} />
                </View>
                <Pressable onPress={() => void resendOtp()} disabled={busy} style={styles.resendButton}><Text style={styles.resendText}>Tuma tena msimbo</Text></Pressable>
              </>}

              {activeStep === 'student-card' && <>
                <Text style={styles.muted}>Barua pepe imethibitishwa. Pakia picha ya kitambulisho ili ukamilishe usajili.</Text>
                <Pressable onPress={() => void pickStudentIdCard()} style={[styles.uploadCard, studentIdCard && styles.uploadCardSelected]} accessibilityRole="button">
                  {studentIdCard ? <><Image source={{ uri: studentIdCard.uri }} style={styles.idPreview} resizeMode="cover" /><View style={styles.idFileInfo}><Ionicons name="checkmark-circle" size={19} color="#16A36A" /><Text style={styles.uploadText} numberOfLines={1}>{studentIdCard.fileName ?? 'Kitambulisho kimechaguliwa'}</Text></View></> : <><View style={styles.uploadIcon}><Ionicons name="cloud-upload-outline" size={21} color={C.primary} /></View><View style={styles.uploadCopy}><Text style={styles.uploadTitle}>Chagua picha ya kitambulisho</Text><Text style={styles.uploadText}>JPG, PNG au WebP · hadi MB 5</Text></View><Ionicons name="add-circle-outline" size={22} color={C.primary} /></>}
                </Pressable>
              </>}

              {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              {!!message && <Text accessibilityRole="alert" style={styles.success}>{message}</Text>}
              {!!authError && <Text accessibilityRole="alert" style={styles.setupNote}>{authError}</Text>}

              <Pressable
                onPress={() => void (activeStep === 'details' ? submitDetails() : activeStep === 'verify-email' ? verifyEmail() : completeStudentCard())}
                disabled={busy}
                style={[styles.submit, busy && styles.disabled]}
                accessibilityRole="button"
              >
                <LinearGradient colors={['#1A73E8', '#3B8DF4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                  <Text style={styles.submitText}>{busy ? 'Inachakata...' : activeStep === 'details' ? 'Tengeneza akaunti' : activeStep === 'verify-email' ? 'Thibitisha na pakia' : 'Kamilisha usajili'}</Text>
                  {!busy && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                </LinearGradient>
              </Pressable>
              {activeStep === 'verify-email' && <Pressable onPress={() => { setError(''); setMessage(''); setStep('details'); }} style={styles.backButton}><Text style={styles.resendText}>Rudi kwenye taarifa</Text></Pressable>}
              {activeStep === 'details' && <Text style={styles.footer}>Una akaunti? <Link href="/login" style={styles.link}>Ingia</Link></Text>}
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (isDarkMode: boolean, desktop: boolean) => StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0B1C32' },
  backdrop: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: desktop ? 40 : 16, paddingVertical: 28 },
  layout: { width: '100%', maxWidth: 1120, alignSelf: 'center', gap: 24 },
  desktopLayout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 64 },
  intro: { width: desktop ? 390 : '100%', gap: 18, paddingHorizontal: desktop ? 0 : 4 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoMark: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' },
  brandName: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  introTitle: { maxWidth: 420, color: '#FFFFFF', fontSize: desktop ? 38 : 28, lineHeight: desktop ? 46 : 35, fontWeight: '800' },
  introCopy: { maxWidth: 360, color: '#E1ECFA', fontSize: 15, lineHeight: 23 },
  glassPanel: { width: '100%', maxWidth: 540, alignSelf: 'center', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.48)' },
  glassTint: { padding: desktop ? 28 : 20, backgroundColor: isDarkMode ? 'rgba(12,24,39,0.72)' : 'rgba(255,255,255,0.74)' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  formEyebrow: { color: C.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heading: { color: isDarkMode ? '#F3F7FC' : '#17233E', fontSize: 23, fontWeight: '800', marginTop: 5 },
  stepBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 3, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: isDarkMode ? 'rgba(120,170,255,0.14)' : 'rgba(23,105,245,0.08)' },
  stepBadgeText: { color: C.primary, fontSize: 13, fontWeight: '800' },
  stepCount: { color: C.mute, fontSize: 10, fontWeight: '600' },
  muted: { color: isDarkMode ? '#C1CBD8' : '#64748B', lineHeight: 20, marginTop: 5, fontSize: 12 },
  fields: { gap: 9, marginTop: 18 },
  fieldRow: { flexDirection: desktop ? 'row' : 'column', gap: 9 },
  field: { minHeight: 48, flex: 1, minWidth: 0, borderWidth: 1, borderColor: isDarkMode ? 'rgba(213,226,242,0.22)' : 'rgba(113,137,166,0.22)', borderRadius: 13, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.62)' },
  input: { flex: 1, minWidth: 0, color: isDarkMode ? '#F3F7FC' : '#17233E', paddingVertical: 11, fontSize: 13, outlineStyle: 'none' } as never,
  yearSection: { gap: 7 },
  fieldLabel: { color: isDarkMode ? '#D8E2EF' : '#42536B', fontSize: 11, fontWeight: '700' },
  yearRow: { flexDirection: 'row', gap: 7, paddingRight: 4 },
  yearChip: { minHeight: 34, justifyContent: 'center', borderRadius: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(90,115,145,0.12)', paddingHorizontal: 10 },
  yearActive: { backgroundColor: C.primary, borderColor: C.primary },
  yearText: { color: isDarkMode ? '#D8E2EF' : '#596B82', fontWeight: '700', fontSize: 10 },
  yearTextActive: { color: '#FFFFFF' },
  uploadCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 8, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: isDarkMode ? 'rgba(213,226,242,0.28)' : 'rgba(83,116,157,0.35)', padding: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.42)' },
  uploadCardSelected: { borderStyle: 'solid', borderColor: 'rgba(22,163,106,0.5)' },
  uploadIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: isDarkMode ? 'rgba(120,170,255,0.16)' : 'rgba(23,105,245,0.09)' },
  uploadCopy: { flex: 1, minWidth: 0, gap: 3 },
  uploadTitle: { color: isDarkMode ? '#F3F7FC' : '#253650', fontSize: 12, fontWeight: '700' },
  uploadText: { flex: 1, minWidth: 0, color: isDarkMode ? '#B7C4D3' : '#708198', fontSize: 10 },
  idPreview: { width: 56, height: 42, borderRadius: 7, backgroundColor: isDarkMode ? '#243446' : '#E5EDF6' },
  idFileInfo: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardReady: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 9, borderRadius: 13, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.55)' },
  cardReadyText: { flex: 1, color: isDarkMode ? '#D8E2EF' : '#53647A', fontSize: 11, fontWeight: '600' },
  cardReadyImage: { width: 44, height: 36, borderRadius: 7 },
  emailTarget: { color: isDarkMode ? '#F3F7FC' : '#17233E', fontSize: 14, fontWeight: '800', marginTop: 3 },
  otpField: { marginTop: 20, borderWidth: 1, borderColor: isDarkMode ? 'rgba(213,226,242,0.24)' : 'rgba(113,137,166,0.25)', borderRadius: 14, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)' },
  otpInput: { minHeight: 62, color: isDarkMode ? '#FFFFFF' : '#17233E', textAlign: 'center', fontSize: 27, fontWeight: '800', letterSpacing: 6, outlineStyle: 'none' } as never,
  resendButton: { alignSelf: 'center', paddingVertical: 13, paddingHorizontal: 12 },
  resendText: { color: C.primary, fontSize: 12, fontWeight: '700' },
  error: { color: '#B42318', marginTop: 12, lineHeight: 18, fontSize: 12 },
  success: { color: '#15803D', marginTop: 12, lineHeight: 18, fontSize: 12 },
  setupNote: { color: '#B42318', marginTop: 12, lineHeight: 18, fontSize: 12 },
  submit: { borderRadius: 13, overflow: 'hidden', marginTop: 18, shadowColor: '#1769F5', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 9, elevation: 3 },
  submitGradient: { minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 14 },
  disabled: { opacity: 0.65 },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  backButton: { alignSelf: 'center', padding: 12 },
  footer: { color: isDarkMode ? '#CDD7E4' : '#63748A', textAlign: 'center', marginTop: 17, fontSize: 12 },
  link: { color: C.primary, fontWeight: '800' },
});