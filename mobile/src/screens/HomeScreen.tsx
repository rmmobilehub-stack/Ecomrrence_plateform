import { Image, ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BellGlyph, HeartGlyph, UserGlyph } from '../navigation/icons';
import type { RootStackParamList, TabParamList } from '../navigation/types';

const heroArt = require('../assets/home-hero.jpg');
const logoMark = require('../assets/rm-logo.png');

export function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>
  >();

  return (
    <ImageBackground source={heroArt} style={styles.bg} imageStyle={styles.bgImage}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={styles.brandName}>RM Mobile Hub</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => navigation.navigate('Account')}
              style={styles.iconBtn}>
              <BellGlyph color="#D7E7FF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Account"
              onPress={() => navigation.navigate('Account')}
              style={styles.iconBtn}>
              <UserGlyph color="#D7E7FF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.headline}>
            Protection and{'\n'}power for{'\n'}every <Text style={styles.headlineAccent}>iPhone.</Text>
          </Text>
          <Text style={styles.sub}>
            Protective cases, fast chargers{'\n'}and dependable cables.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Shop')}
            style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Shop mobile accessories</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('HealthCheck')}
            style={styles.secondaryBtn}>
            <HeartGlyph color="#7EC8FF" />
            <Text style={styles.secondaryText}>Free phone check</Text>
            <Text style={styles.arrowMuted}>→</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#050E24' },
  bgImage: { resizeMode: 'cover', alignSelf: 'flex-end' },
  safe: { flex: 1, paddingHorizontal: 20, paddingBottom: 92 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 12 },
  brandName: { color: '#F4F8FF', fontSize: 16, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150, 190, 255, 0.35)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, justifyContent: 'center', maxWidth: 280, paddingBottom: 24 },
  headline: { color: '#F7FBFF', fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.6 },
  headlineAccent: { color: '#4DA3FF' },
  sub: { color: '#C5D5EC', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 22 },
  primaryBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2F7BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginBottom: 12,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  arrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  secondaryText: { color: '#EAF3FF', fontWeight: '700', fontSize: 14 },
  arrowMuted: { color: '#9CC7FF', fontSize: 16, fontWeight: '700' },
});
