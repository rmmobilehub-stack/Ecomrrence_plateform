import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchDeviceEstimate, fetchRepairCatalog } from '../api';
import { HeaderActions } from '../components/HeaderActions';
import { SelectField } from '../components/SelectField';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useAppTheme } from '../context/ThemeContext';
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
const logoMark = require('../assets/rm-logo.png');

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
  const { colors: theme, isDark } = useAppTheme();
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
      <View style={[styles.page, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.statusBar} />
        <SafeAreaView style={styles.safe}>
          <LoadingBlock />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={[styles.brandName, { color: theme.ink }]}>{store?.name || 'RM Mobile Hub'}</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          {/* Hero like reference */}
          <View
            style={[
              styles.hero,
              {
                backgroundColor: isDark ? 'rgba(10, 28, 56, 0.9)' : theme.card,
                borderColor: theme.cardBorder,
              },
            ]}>
            <View style={styles.heroCopy}>
              <View style={styles.phoneCheckKicker}><Icon name="pulse-outline" size={14} color={theme.accentSoft} /><Text style={[styles.phoneCheckKickerText, { color: theme.accentSoft }]}>PHONE CHECK</Text></View>
              <Text style={[styles.heroTitle, { color: theme.ink }]}>Health score {'&'} <Text style={[styles.heroAccent, { color: theme.accentSoft }]}>market worth</Text></Text>
              <Text style={[styles.heroSub, { color: theme.muted }]}>Choose your model, share its condition and get an instant health score with Pakistan market range.</Text>
              <View style={styles.heroTiles}>
                <View style={[styles.heroTile, { backgroundColor: isDark ? 'rgba(47, 123, 255, 0.14)' : '#E6F6FF', borderColor: theme.cardBorder }]}>
                  <Icon name="pulse-outline" size={13} color={theme.accentSoft} />
                  <Text style={[styles.heroTileLabel, { color: theme.ink }]}>Mobile health</Text>
                </View>
                <View style={[styles.heroTile, { backgroundColor: isDark ? 'rgba(47, 123, 255, 0.14)' : '#E6F6FF', borderColor: theme.cardBorder }]}>
                  <Icon name="trending-up-outline" size={13} color={theme.accentSoft} />
                  <Text style={[styles.heroTileLabel, { color: theme.ink }]}>Market worth</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroArtWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={styles.heroOrbit} />
              <View style={styles.heroDevice}>
                <View style={styles.heroIsland} />
                <Text style={styles.heroHeart}>92</Text>
                <Text style={styles.heroHealth}>HEALTH</Text>
                <View style={[styles.heroBar, { width: 32 }]} />
                <View style={[styles.heroBar, { width: 24 }]} />
                <View style={[styles.heroBar, { width: 18 }]} />
              </View>
              <View style={styles.heroScoreCard}>
                <Text style={styles.heroScoreLabel}>Estimated score</Text>
                <Text style={styles.heroScoreValue}>
                  9.2<Text style={styles.heroScoreUnit}>/10</Text>
                </Text>
                <Text style={styles.heroScoreStatus}>Excellent condition</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: theme.ink }]}>Enter your phone details</Text>
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
              <Pressable style={[styles.startBtn, { backgroundColor: theme.accent }]} onPress={startCheck}>
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
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.cardTitle, { color: theme.ink }]}>Condition details</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 14,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 28, 56, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  heroCopy: { flex: 1, gap: 7, paddingRight: 2, minWidth: 0 },
  phoneCheckKicker: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(77, 163, 255, 0.14)' },
  phoneCheckKickerText: { color: '#9FD7FF', fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  heroTitle: { color: '#F7FBFF', fontSize: 22, fontWeight: '800', lineHeight: 26 },
  heroAccent: { color: '#4DA3FF' },
  heroSub: { color: '#C5D5EC', fontSize: 12, lineHeight: 17 },
  heroTiles: { flexDirection: 'row', flexWrap: 'nowrap', gap: 6, marginTop: 2 },
  heroTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(47, 123, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  heroTileLabel: { color: '#D7E7FF', fontSize: 10, fontWeight: '700' },
  heroArtWrap: {
    width: 96,
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroOrbit: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(123, 222, 251, 0.35)',
    backgroundColor: 'rgba(123, 222, 251, 0.08)',
  },
  heroDevice: {
    width: 54,
    height: 98,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#173F5C',
    backgroundColor: '#7FDAEF',
    alignItems: 'center',
    paddingTop: 18,
    transform: [{ rotate: '8deg' }],
    shadowColor: '#1B7197',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  heroIsland: {
    position: 'absolute',
    top: 5,
    width: 22,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#123249',
  },
  heroHeart: {
    color: '#08364F',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 20,
  },
  heroHealth: {
    color: '#17628A',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  heroBar: {
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(10, 80, 110, 0.24)',
    marginTop: 5,
  },
  heroScoreCard: {
    position: 'absolute',
    right: -4,
    bottom: 4,
    minWidth: 78,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    gap: 1,
    shadowColor: '#125E82',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heroScoreLabel: { color: '#618296', fontSize: 7, fontWeight: '700' },
  heroScoreValue: { color: '#087FBB', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  heroScoreUnit: { fontSize: 8, fontWeight: '700' },
  heroScoreStatus: { color: '#178158', fontSize: 7, fontWeight: '700' },
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
