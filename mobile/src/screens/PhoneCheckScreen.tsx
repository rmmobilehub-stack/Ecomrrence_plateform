import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchDeviceEstimate, fetchRepairCatalog } from '../api';
import { useStore } from '../context/StoreContext';
import { useAuthGate } from '../navigation/useAuthGate';
import { formatMoney } from '../money';
import { colors, space } from '../theme';
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
import { Card, Chip, ErrorText, Field, LoadingBlock, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const BRANDS = [
  { id: 'apple', name: 'Apple', available: true },
  { id: 'samsung', name: 'Samsung', available: false },
  { id: 'google', name: 'Google', available: false },
  { id: 'xiaomi', name: 'Xiaomi', available: false },
];

function toggle<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

export function PhoneCheckScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ready } = useAuthGate('PhoneCheck');
  const { accent } = useStore();
  const [models, setModels] = useState<RepairModel[]>([]);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
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

  const selectedModel = useMemo(() => models.find(entry => entry.id === modelId) ?? null, [models, modelId]);

  const runEstimate = async () => {
    if (brandId !== 'apple' || !modelId) {
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

  if (!ready || loading) {
    return (
      <ScreenWrap>
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Free phone check</Title>
        <Muted>Apple iPhones only for now. Other brands are listed but not bookable yet.</Muted>
        <Text style={styles.label}>Brand</Text>
        <View style={styles.row}>
          {BRANDS.map(brand => (
            <Chip
              key={brand.id}
              label={brand.available ? brand.name : `${brand.name} (soon)`}
              selected={brandId === brand.id}
              disabled={!brand.available}
              onPress={() => {
                setBrandId(brand.id);
                setModelId('');
                setEstimate(null);
              }}
            />
          ))}
        </View>
        {brandId === 'apple' && (
          <>
            <Text style={styles.label}>Model</Text>
            <View style={styles.row}>
              {models.map(model => (
                <Chip
                  key={model.id}
                  label={model.name}
                  selected={modelId === model.id}
                  onPress={() => {
                    setModelId(model.id);
                    setEstimate(null);
                  }}
                />
              ))}
            </View>
          </>
        )}
        <ConditionFields condition={condition} setCondition={setCondition} />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton label={busy ? 'Checking…' : 'Get estimate'} onPress={runEstimate} disabled={busy} color={accent} />
        {estimate && (
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
            <PrimaryButton label="Book a repair" onPress={() => navigation.navigate('Repair')} color={accent} />
          </Card>
        )}
      </ScrollView>
    </ScreenWrap>
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
      <Text style={styles.label}>Screen</Text>
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
      <Text style={styles.label}>Body</Text>
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
      <Text style={styles.label}>Parts changed</Text>
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
      <Text style={styles.label}>Ownership</Text>
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
  pad: { padding: space, gap: 10, paddingBottom: 48 },
  label: { fontWeight: '700', color: colors.ink, marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  score: { fontWeight: '800', fontSize: 16, color: colors.ink, marginBottom: 6 },
  bullet: { color: colors.ink, marginTop: 4 },
});
