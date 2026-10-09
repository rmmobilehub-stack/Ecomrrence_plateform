import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ensureCustomerLogin, repairReturn } from '../ensureCustomerLogin';
import type { RootStackParamList, TabParamList } from '../navigation/types';

const logoMark = require('../assets/rm-logo.png');

export function RepairsTabScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Repairs'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { customer } = useAuth();
  const { store } = useStore();

  const startBooking = () => {
    if (!ensureCustomerLogin(customer, navigation, repairReturn())) return;
    navigation.navigate('Repair');
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image source={logoMark} style={styles.logo} />
          <Text style={styles.brandName}>{store?.name || 'RM Mobile Hub'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                Book an <Text style={styles.heroAccent}>iPhone</Text>
                {'\n'}repair
              </Text>
              <Text style={styles.heroSub}>Doorstep service — pick model, issue and visit details in a few steps.</Text>
            </View>
            <View style={styles.wrenchBadge}>
              <Text style={styles.wrenchMark}>🔧</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How booking works</Text>
            {[
              'Choose Apple model & colour',
              'Pick SIM setup and issue',
              'Get health score & market worth',
              'Share visit address and confirm',
            ].map((label, index) => (
              <View key={label} style={styles.stepRow}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>0{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{label}</Text>
              </View>
            ))}

            <Pressable style={styles.startBtn} onPress={startBooking}>
              <Text style={styles.startText}>Start repair booking</Text>
              <Text style={styles.startArrow}>→</Text>
            </Pressable>
          </View>

          <Pressable style={styles.codBar} onPress={() => navigation.navigate('HealthCheck')}>
            <View style={styles.codIcon}>
              <Text style={styles.codIconText}>✓</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codTitle}>Not sure about condition?</Text>
              <Text style={styles.codSub}>Run a free phone check first.</Text>
            </View>
            <Text style={styles.codChevron}>›</Text>
          </Pressable>

          <Text style={styles.trust}>Clear pricing after inspection · Direct support</Text>
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
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 6,
  },
  logo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { color: '#F4F8FF', fontSize: 16, fontWeight: '800' },
  pad: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 130,
  },
  heroCopy: { flex: 1, gap: 8 },
  heroTitle: { color: '#F7FBFF', fontSize: 30, fontWeight: '800', lineHeight: 34 },
  heroAccent: { color: '#4DA3FF' },
  heroSub: { color: '#C5D5EC', fontSize: 13, lineHeight: 19 },
  wrenchBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(47, 123, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrenchMark: { fontSize: 26 },
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
