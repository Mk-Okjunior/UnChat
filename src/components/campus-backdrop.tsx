import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ComponentRef, type RefObject } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const buildSvgDataUri = (title: string, bg: string, accent: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <circle cx="930" cy="190" r="210" fill="rgba(255,255,255,0.12)"/>
    <circle cx="180" cy="720" r="260" fill="rgba(255,255,255,0.14)"/>
    <path d="M0,650 L260,520 L470,620 L740,420 L1000,590 L1200,470 L1200,900 L0,900 Z" fill="rgba(255,255,255,0.18)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="78" font-weight="700" fill="white">${title}</text>
  </svg>
`)}`;

const campusImages = [
  buildSvgDataUri('UDSM', '#0f172a', '#2563eb'),
  buildSvgDataUri('ARU', '#1d4ed8', '#0ea5e9'),
  buildSvgDataUri('MUHAS', '#0f766e', '#14b8a6'),
];

export function CampusBackdrop({ blurTargetRef }: { blurTargetRef: RefObject<ComponentRef<typeof View> | null> }) {
  const [campusIndex, setCampusIndex] = useState(0);
  const [slideOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(slideOpacity, { toValue: 0, duration: 450, useNativeDriver: true }).start(({ finished }) => {
        if (!finished) return;
        setCampusIndex((current) => (current + 1) % campusImages.length);
        Animated.timing(slideOpacity, { toValue: 1, duration: 900, useNativeDriver: true }).start();
      });
    }, 6500);
    return () => clearInterval(timer);
  }, [slideOpacity]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
        <Animated.Image source={{ uri: campusImages[campusIndex] }} style={[StyleSheet.absoluteFill, styles.image, { opacity: slideOpacity }]} resizeMode="cover" />
      </BlurTargetView>
      <LinearGradient colors={['rgba(8, 24, 48, 0.22)', 'rgba(7, 26, 51, 0.68)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.indicators} pointerEvents="none">
        {campusImages.map((image, index) => <View key={image} style={[styles.dot, index === campusIndex && styles.dotActive]} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  indicators: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 20, backgroundColor: '#FFFFFF' },
});