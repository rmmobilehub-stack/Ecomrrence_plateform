import { Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HeaderActions } from '../components/HeaderActions';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useAppTheme } from '../context/ThemeContext';
import { ensureCustomerLogin, repairReturn } from '../ensureCustomerLogin';
import type { RootStackParamList, TabParamList } from '../navigation/types';

const logoMark = require('../assets/rm-logo.png');
const repairHeroArt = require('../assets/rm-iphone-repair-hero.png');

export function RepairsTabScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Repairs'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { customer } = useAuth();
  const { store } = useStore();
  const { colors, isDark } = useAppTheme();

  const startBooking = () => {
    if (!ensureCustomerLogin(customer, navigation, repairReturn())) return;
    navigation.navigate('Repair');
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={[styles.brandName, { color: colors.ink }]}>{store?.name || 'RM Mobile Hub'}</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <ImageBackground source={repairHeroArt} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <View style={styles.kicker}>
                <Icon name="construct-outline" size={14} color="#7DD3FC" />
                <Text style={styles.kickerText}>IPHONE DOORSTEP REPAIR</Text>
              </View>
              <Text style={styles.heroTitle}>
                Doorstep <Text style={styles.heroAccent}>iPhone</Text> repair
              </Text>
              <Text style={styles.heroSub}>
                Pick your model and colour. We come to your address, repair it on the spot, and leave once it works again.
              </Text>
              <View style={styles.points}>
                <View style={styles.point}>
                  <Icon name="shield-checkmark-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Exact model match</Text>
                </View>
                <View style={styles.point}>
                  <Icon name="phone-portrait-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Official colours</Text>
                </View>
                <View style={styles.point}>
                  <Icon name="home-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>At your door</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>How booking works</Text>
            {[
              'Choose Apple model & colour',
              'Pick SIM setup and issue',
              'Get health score & market worth',
              'Share visit address and confirm',
            ].map((label, index) => (
              <View key={label} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepNumWrap,
                    { backgroundColor: isDark ? 'rgba(47, 123, 255, 0.16)' : '#E6F6FF' },
                  ]}>
                  <Text style={[styles.stepNum, { color: colors.accentSoft }]}>0{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.ink }]}>{label}</Text>
              </View>
            ))}

            <Pressable style={[styles.startBtn, { backgroundColor: colors.accent }]} onPress={startBooking}>
              <Text style={styles.startText}>Start repair booking</Text>
              <Text style={styles.startArrow}>→</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.codBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('HealthCheck')}>
            <View style={[styles.codIcon, { backgroundColor: isDark ? 'rgba(47, 123, 255, 0.2)' : '#E6F6FF' }]}>
              <Text style={[styles.codIconText, { color: colors.accentSoft }]}>✓</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.codTitle, { color: colors.ink }]}>Not sure about condition?</Text>
              <Text style={[styles.codSub, { color: colors.muted }]}>Run a free phone check first.</Text>
            </View>
            <Text style={[styles.codChevron, { color: colors.accentSoft }]}>›</Text>
          </Pressable>

          <Text style={[styles.trust, { color: colors.muted }]}>Clear pricing after inspection · Direct support</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050E24' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  logo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { fontSize: 16, fontWeight: '800' },
  pad: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  hero: {
    minHeight: 220,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { resizeMode: 'cover' },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 28, 42, 0.72)',
  },
  heroCopy: { position: 'relative', zIndex: 1, padding: 18, gap: 8 },
  kicker: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.35)',
  },
  kickerText: { color: '#7DD3FC', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', lineHeight: 30 },
  heroAccent: { color: '#7DD3FC' },
  heroSub: { color: 'rgba(236, 248, 255, 0.9)', fontSize: 13, lineHeight: 19, maxWidth: 320 },
  points: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 165, 233, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.28)',
  },
  pointText: { color: '#E8F7FF', fontSize: 11, fontWeight: '700' },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(10, 28, 56, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  cardTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 16, marginBottom: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  stepNumWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(47, 123, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: '#4DA3FF', fontWeight: '800', fontSize: 12 },
  stepText: { color: '#EAF3FF', fontWeight: '600', flex: 1, fontSize: 14 },
  startBtn: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#2F7BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  startArrow: { color: '#fff', fontWeight: '800', fontSize: 18 },
  codBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(10, 28, 56, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
  },
  codIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 123, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codIconText: { color: '#8EC8FF', fontWeight: '900', fontSize: 16 },
  codTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 14 },
  codSub: { color: '#A8C0DA', fontSize: 12, marginTop: 2 },
  codChevron: { color: '#8EC8FF', fontSize: 22, fontWeight: '700' },
  trust: { color: '#A8C0DA', fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
