import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList, TabParamList } from '../navigation/types';

const logoMark = require('../assets/rm-logo.png');
const phoneArt = require('../assets/repair-iphone.jpg');

const SERVICES = [
  { id: 'screen', label: 'Screen repair' },
  { id: 'battery', label: 'Battery replacement' },
  { id: 'charging', label: 'Charging issue' },
] as const;

const IPHONE_MODELS = [
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16 Plus',
  'iPhone 16',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 15',
  'iPhone 14 Pro Max',
  'iPhone 14 Pro',
  'iPhone 14',
  'iPhone 13 Pro Max',
  'iPhone 13 Pro',
  'iPhone 13',
];

export function RepairsTabScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Repairs'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const [serviceId, setServiceId] = useState<(typeof SERVICES)[number]['id']>('screen');
  const [model, setModel] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedService = SERVICES.find(item => item.id === serviceId) || SERVICES[0];

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image source={logoMark} style={styles.logo} />
          <Text style={styles.brandName}>RM Mobile Hub</Text>
        </View>

        <ScrollView contentContainerStyle={styles.pad}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>
                Book an{'\n'}
                <Text style={styles.titleAccent}>iPhone</Text> repair
              </Text>
              <Text style={styles.sub}>Fast. Reliable. Trusted by thousands.</Text>
            </View>
            <View style={styles.heroArt}>
              <View style={styles.glow} />
              <Image source={phoneArt} style={styles.phone} resizeMode="contain" />
            </View>
          </View>

          <Text style={styles.section}>Choose a service</Text>
          <View style={styles.services}>
            {SERVICES.map(service => (
              <Pressable
                key={service.id}
                onPress={() => setServiceId(service.id)}
                style={[styles.serviceCard, serviceId === service.id && styles.serviceCardOn]}>
                <ServiceIcon id={service.id} active={serviceId === service.id} />
                <Text style={[styles.serviceLabel, serviceId === service.id && styles.serviceLabelOn]}>
                  {service.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>Choose your iPhone model</Text>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.modelBtn}>
            <View style={styles.modelLeft}>
              <View style={styles.miniPhone} />
              <Text style={[styles.modelText, !model && styles.modelPlaceholder]}>
                {model || 'Select model'}
              </Text>
            </View>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>

          <Pressable
            style={styles.cta}
            onPress={() =>
              navigation.navigate('RepairCheck', {
                serviceId: selectedService.id,
                serviceLabel: selectedService.label,
                model: model || 'iPhone 16 Pro',
              })
            }>
            <Text style={styles.ctaText}>Check availability</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </Pressable>

          <View style={styles.trust}>
            <Text style={styles.trustItem}>🛡️  Clear pricing</Text>
            <Text style={styles.trustDot}>•</Text>
            <Text style={styles.trustItem}>Direct support</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={pickerOpen} animationType="fade" transparent onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setPickerOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select model</Text>
            <ScrollView style={styles.sheetList}>
              {IPHONE_MODELS.map(entry => (
                <Pressable
                  key={entry}
                  style={[styles.sheetRow, model === entry && styles.sheetRowOn]}
                  onPress={() => {
                    setModel(entry);
                    setPickerOpen(false);
                  }}>
                  <Text style={[styles.sheetRowText, model === entry && styles.sheetRowTextOn]}>{entry}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ServiceIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? '#7ED0FF' : '#4DA3FF';
  if (id === 'battery') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.battery, { borderColor: color }]}>
          <Text style={{ color, fontSize: 12, fontWeight: '800' }}>⚡</Text>
        </View>
        <View style={[styles.batteryNub, { backgroundColor: color }]} />
      </View>
    );
  }
  if (id === 'charging') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.cableHead, { borderColor: color }]} />
        <View style={[styles.cableLine, { backgroundColor: color }]} />
      </View>
    );
  }
  return (
    <View style={styles.iconBox}>
      <View style={[styles.phoneOutline, { borderColor: color }]}>
        <View style={[styles.phoneNotch, { backgroundColor: color }]} />
      </View>
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
  },
  logo: { width: 38, height: 38, borderRadius: 12 },
  brandName: { color: '#F4F8FF', fontSize: 16, fontWeight: '700' },
  pad: { paddingHorizontal: 18, paddingBottom: 110, paddingTop: 8 },
  hero: { flexDirection: 'row', alignItems: 'center', minHeight: 168 },
  heroCopy: { flex: 1, paddingRight: 8 },
  title: { color: '#F7FBFF', fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.6 },
  titleAccent: { color: '#4DA3FF' },
  sub: { color: '#C5D5EC', marginTop: 10, fontSize: 14 },
  heroArt: { width: 132, height: 168, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: 'rgba(80, 190, 255, 0.55)',
    shadowColor: '#4DA3FF',
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },
  phone: { width: 86, height: 148 },
  section: { color: '#EAF3FF', fontWeight: '700', fontSize: 15, marginTop: 18, marginBottom: 10 },
  services: { flexDirection: 'row', gap: 8 },
  serviceCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(90, 150, 220, 0.28)',
    backgroundColor: 'rgba(8, 24, 52, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 12,
    gap: 8,
  },
  serviceCardOn: {
    borderColor: '#4DA3FF',
    backgroundColor: 'rgba(47, 123, 255, 0.16)',
  },
  serviceLabel: { color: '#C5D5EC', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  serviceLabelOn: { color: '#F4F8FF' },
  iconBox: { height: 36, alignItems: 'center', justifyContent: 'center' },
  phoneOutline: { width: 22, height: 34, borderRadius: 5, borderWidth: 1.8, alignItems: 'center', paddingTop: 4 },
  phoneNotch: { width: 8, height: 2, borderRadius: 1 },
  battery: {
    width: 26,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryNub: { position: 'absolute', right: -3, width: 3, height: 8, borderRadius: 1 },
  cableHead: { width: 16, height: 10, borderWidth: 1.8, borderBottomWidth: 0, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  cableLine: { width: 2, height: 16, marginTop: -1, transform: [{ rotate: '18deg' }] },
  modelBtn: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(90, 150, 220, 0.35)',
    backgroundColor: 'rgba(8, 24, 52, 0.85)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniPhone: {
    width: 16,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.6,
    borderColor: '#4DA3FF',
  },
  modelText: { color: '#F4F8FF', fontSize: 15, fontWeight: '600' },
  modelPlaceholder: { color: '#7A93B0' },
  chevron: { color: '#8EC8FF', fontSize: 18, fontWeight: '700' },
  cta: {
    marginTop: 16,
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: '#3B8CFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  ctaArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },
  trust: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14 },
  trustItem: { color: '#9BB4CC', fontSize: 12, fontWeight: '600' },
  trustDot: { color: '#4DA3FF' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(2, 8, 20, 0.72)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '70%',
    backgroundColor: '#0B1F3F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(90, 150, 220, 0.28)',
  },
  sheetTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 18, marginBottom: 10 },
  sheetList: { marginBottom: 12 },
  sheetRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(90, 150, 220, 0.16)' },
  sheetRowOn: { backgroundColor: 'rgba(47, 123, 255, 0.12)', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 10 },
  sheetRowText: { color: '#C5D5EC', fontSize: 16, fontWeight: '600' },
  sheetRowTextOn: { color: '#8EC8FF' },
});
