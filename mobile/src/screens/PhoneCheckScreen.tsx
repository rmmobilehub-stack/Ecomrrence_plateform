import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchDeviceEstimate, fetchRepairCatalog } from '../api';
import { SelectField } from '../components/SelectField';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ensureCustomerLogin, healthCheckReturn, repairReturn } from '../ensureCustomerLogin';
import { formatMoney } from '../money';
import { colors } from '../theme';
import {
  BODY_FLAG_OPTIONS,
  DEFAULT_DEVICE_CONDITION,
  OWNERSHIP_OPTIONS,
  PARTS_CHANGED_OPTIONS,
  SCREEN_CONDITION_OPTIONS,
  type BodyFlag,
  type ChangedPart,
  type DeviceConditionInput,
  type DeviceEstimate,
  type RepairModel,
} from '../types';
import { Card, Chip, ErrorText, Field, LoadingBlock, Muted, PrimaryButton } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

const logoMark = require('../assets/rm-logo.png');
const heroArt = require('../assets/phone-check-hero.png');

const BRANDS = [
  { id: 'apple', name: 'Apple', available: true },
  { id: 'samsung', name: 'Samsung', available: false },
  { id: 'google', name: 'Google', available: false },
  { id: 'xiaomi', name: 'Xiaomi', available: false },
  { id: 'oneplus', name: 'OnePlus', available: false },
  { id: 'oppo', name: 'OPPO', available: false },
  { id: 'infinix', name: 'Infinix', available: false },
  { id: 'vivo', name: 'Vivo', available: false },
];

function toggle<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

export function PhoneCheckScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer } = useAuth();
  const { store, accent } = useStore();
  const [models, setModels] = useState<RepairModel[]>([]);
  const [brandId, setBrandId] = useState('apple');
  const [modelId, setModelId] = useState('');
  const [started, setStarted] = useState(false);
  const [condition, setCondition] = useState<DeviceConditionInput>(DEFAULT_DEVICE_CONDITION);
  const [estimate, setEstimate] = useState<DeviceEstimate | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairCatalog()
      .then(data => setModels(data.models || []))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load catalog'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setEstimate(null);
    setError('');
  }, [brandId, modelId, condition]);

  const selectedModel = useMemo(() => models.find(entry => entry.id === modelId) ?? null, [models, modelId]);
  const appleReady = brandId === 'apple';
  const showCondition = started && appleReady && Boolean(modelId);

  const brandOptions = BRANDS.map(brand => ({
    id: brand.id,
    label: brand.available ? brand.name : `${brand.name} (soon)`,
    disabled: !brand.available,
  }));
  const modelOptions = models.map(model => ({ id: model.id, label: model.name }));

  const startCheck = () => {
    if (!appleReady) {
      setError('Apple is available now. Other brands are coming soon.');
      return;
    }
    if (!modelId) {
      setError('Select your iPhone model first.');
      return;
    }
    setError('');
    setStarted(true);
  };

  const runEstimate = async () => {
    if (!ensureCustomerLogin(customer, navigation, healthCheckReturn())) return;
    if (!appleReady || !modelId) {
      setError('Select Apple and your iPhone model first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await fetchDeviceEstimate({
        modelId,
        colorId: selectedModel?.colors[0]?.id || '',
        condition,
      });
      setEstimate(data.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not estimate');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safe}>
          <LoadingBlock />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image source={logoMark} style={styles.logo} />
          <Text style={styles.brandName}>{store?.name || 'RM Mobile Hub'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          {/* Hero like reference */}
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <View style={styles.phoneCheckKicker}><Icon name="pulse-outline" size={14} color="#9FD7FF" /><Text style={styles.phoneCheckKickerText}>PHONE CHECK</Text></View>
              <Text style={styles.heroTitle}>Health score {'&'} <Text style={styles.heroAccent}>market worth</Text></Text>
              <Text style={styles.heroSub}>Choose your model, share its condition and get an instant health score with Pakistan market range.</Text>
              <View style={styles.checkTrustRow}>
                <View style={styles.checkTrust}><Icon name="checkmark-circle-outline" size={13} color="#9FD7FF" /><Text style={styles.checkTrustText}>Instant assessment</Text></View>
                <View style={styles.checkTrust}><Icon name="trending-up-outline" size={13} color="#9FD7FF" /><Text style={styles.checkTrustText}>Market range</Text></View>
              </View>
              {isValidWhatsAppNumber(store?.whatsappNumber) ? (
                <Pressable style={styles.checkWhatsApp} onPress={() => void openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || 'RM Mobile Hub'}, I need help with a phone check.`)}>
                  <Icon name="logo-whatsapp" size={18} color="#FFFFFF" />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.heroArtWrap}>
              <View style={styles.heroGlow} />
              <Image source={heroArt} style={styles.heroArt} resizeMode="contain" />
              <View style={styles.checkBadge}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter your phone details</Text>
            <SelectField
              label="Brand"
              placeholder="Select brand"
              value={brandId}
              options={brandOptions}
              onChange={value => {
                setBrandId(value);
                setModelId('');
                setStarted(false);
                setEstimate(null);
              }}
            />
            <SelectField
              label="iPhone model"
              placeholder="Select iPhone model"
              value={modelId}
              options={modelOptions}
              onChange={value => {
                setModelId(value);
                setStarted(false);
                setEstimate(null);
              }}
            />
            {!started ? (
              <Pressable style={styles.startBtn} onPress={startCheck}>
                <Text style={styles.startText}>Start phone check</Text>
                <Text style={styles.startArrow}>→</Text>
              </Pressable>
            ) : null}
            <ErrorText>{error && !showCondition ? error : ''}</ErrorText>
          </View>

          <Pressable style={styles.codBar} onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })}>
            <View style={styles.codIcon}>
              <Text style={styles.codIconText}>🚚</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codTitle}>Cash on delivery available</Text>
              <Text style={styles.codSub}>Pay safely when you receive.</Text>
            </View>
            <Text style={styles.codChevron}>›</Text>
          </Pressable>

          {showCondition ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Condition details</Text>
              <ConditionFields condition={condition} setCondition={setCondition} />
              <ErrorText>{error}</ErrorText>
              <PrimaryButton
                label={busy ? 'Checking…' : 'Get score & market worth'}
                onPress={runEstimate}
                disabled={busy}
                color={accent}
              />
            </View>
          ) : null}

          {estimate ? (
            <Card>
              <Text style={styles.score}>
                {estimate.scoreLabel} · {estimate.score}/100
              </Text>
              <Text style={{ color: accent, fontWeight: '800', fontSize: 18 }}>
                {formatMoney(estimate.marketValueMinPkr)} – {formatMoney(estimate.marketValueMaxPkr)}
              </Text>
              <Muted>{estimate.summary}</Muted>
              {(estimate.suggestions || []).map(item => (
                <Text key={item} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
              {(estimate.buySuggestions || []).map(item => (
                <Text key={item} style={styles.bullet}>
                  • {item}
                </Text>
              ))}
              <PrimaryButton
                label="Shop accessories"
                onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })}
                color={accent}
              />
              <PrimaryButton
                label="Book a repair"
                onPress={() => {
                  if (!ensureCustomerLogin(customer, navigation, repairReturn())) return;
                  navigation.navigate('Repair');
                }}
                color={accent}
              />
            </Card>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function ConditionFields({
  condition,
  setCondition,
}: {
  condition: DeviceConditionInput;
  setCondition: (value: DeviceConditionInput) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.fieldLabel}>Screen</Text>
      <View style={styles.row}>
        {SCREEN_CONDITION_OPTIONS.map(option => (
          <Chip
            key={option.id}
            label={option.label}
            selected={condition.screenCondition === option.id}
            onPress={() => setCondition({ ...condition, screenCondition: option.id })}
          />
        ))}
      </View>
      <Text style={styles.fieldLabel}>Body</Text>
      <View style={styles.row}>
        {BODY_FLAG_OPTIONS.map(option => (
          <Chip
            key={option.id}
            label={option.label}
            selected={condition.bodyFlags.includes(option.id)}
            onPress={() => setCondition({ ...condition, bodyFlags: toggle<BodyFlag>(condition.bodyFlags, option.id) })}
          />
        ))}
      </View>
      <Text style={styles.fieldLabel}>Parts changed</Text>
      <View style={styles.row}>
        {PARTS_CHANGED_OPTIONS.map(option => (
          <Chip
            key={option.id}
            label={option.label}
            selected={condition.partsChanged.includes(option.id)}
            onPress={() =>
              setCondition({ ...condition, partsChanged: toggle<ChangedPart>(condition.partsChanged, option.id) })
            }
          />
        ))}
      </View>
      <Text style={styles.fieldLabel}>Ownership</Text>
      <View style={styles.row}>
        {OWNERSHIP_OPTIONS.map(option => (
          <Chip
            key={option.id}
            label={option.label}
            selected={condition.ownership === option.id}
            onPress={() => setCondition({ ...condition, ownership: option.id })}
          />
        ))}
      </View>
      <Field
        label="Overall out of 10"
        keyboardType="numeric"
        value={String(condition.overallOutOf10)}
        onChangeText={value => setCondition({ ...condition, overallOutOf10: Number(value) || 0 })}
      />
      <Field
        label="Battery health %"
        keyboardType="numeric"
        value={String(condition.batteryHealthPercent)}
        onChangeText={value => setCondition({ ...condition, batteryHealthPercent: Number(value) || 0 })}
      />
      <Field
        label="Age in years"
        keyboardType="numeric"
        value={String(condition.ageYears)}
        onChangeText={value => setCondition({ ...condition, ageYears: Number(value) || 0 })}
      />
      <Field
        label="Notes"
        value={condition.additionalNote}
        onChangeText={value => setCondition({ ...condition, additionalNote: value })}
      />
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
    gap: 8,
    minHeight: 210,
    padding: 15,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 28, 56, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  heroCopy: { flex: 1, gap: 8, paddingRight: 4 },
  phoneCheckKicker: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(77, 163, 255, 0.14)' },
  phoneCheckKickerText: { color: '#9FD7FF', fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  heroTitle: { color: '#F7FBFF', fontSize: 25, fontWeight: '800', lineHeight: 29 },
  heroAccent: { color: '#4DA3FF' },
  heroSub: { color: '#C5D5EC', fontSize: 13, lineHeight: 19 },
  checkTrustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  checkTrust: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  checkTrustText: { color: '#B7CDE7', fontSize: 10, fontWeight: '700' },
  checkWhatsApp: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366' },
  heroArtWrap: { width: 112, height: 170, alignItems: 'center', justifyContent: 'center' },
  heroGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(77, 163, 255, 0.25)',
  },
  heroArt: { width: 108, height: 160 },
  checkBadge: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2F7BFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#EAF3FF',
    shadowColor: '#2F7BFF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  checkMark: { color: '#fff', fontSize: 20, fontWeight: '900' },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(10, 28, 56, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  cardTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 16 },
  startBtn: {
    marginTop: 4,
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
  codIconText: { fontSize: 16 },
  codTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 14 },
  codSub: { color: '#A8C0DA', fontSize: 12, marginTop: 2 },
  codChevron: { color: '#8EC8FF', fontSize: 22, fontWeight: '700' },
  fieldLabel: { fontWeight: '700', color: colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  score: { fontWeight: '800', fontSize: 16, color: colors.ink, marginBottom: 6 },
  bullet: { color: colors.ink, marginTop: 4 },
});
