import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createRepairBooking, fetchDeviceEstimate, fetchRepairCatalog } from '../api';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { colors, space } from '../theme';
import {
  DEFAULT_DEVICE_CONDITION,
  type DeviceConditionInput,
  type DeviceEstimate,
  type RepairCatalog,
} from '../types';
import { Chip, ErrorText, Field, LoadingBlock, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { ConditionFields } from './PhoneCheckScreen';

export function RepairScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer } = useAuth();
  const { accent } = useStore();
  const [catalog, setCatalog] = useState<RepairCatalog | null>(null);
  const [modelId, setModelId] = useState('');
  const [colorId, setColorId] = useState('');
  const [simTypeId, setSimTypeId] = useState('');
  const [issueId, setIssueId] = useState('');
  const [issueDetail, setIssueDetail] = useState('');
  const [condition, setCondition] = useState<DeviceConditionInput>(DEFAULT_DEVICE_CONDITION);
  const [estimate, setEstimate] = useState<DeviceEstimate | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
    preferredDate: '',
    preferredTime: '',
  });

  useEffect(() => {
    if (!customer) return;
    setForm(prev => ({
      ...prev,
      name: prev.name || customer.name || '',
      email: prev.email || customer.email || '',
      phone: prev.phone || customer.phone || '',
    }));
  }, [customer]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairCatalog()
      .then(data => {
        setCatalog(data);
        if (data.simOptions?.[0]) setSimTypeId(data.simOptions[0].id);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load repair catalog'))
      .finally(() => setLoading(false));
  }, []);

  const model = useMemo(() => catalog?.models.find(entry => entry.id === modelId), [catalog, modelId]);

  const runEstimate = async () => {
    if (!modelId) {
      setError('Select a model first');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await fetchDeviceEstimate({
        modelId,
        colorId,
        issueId,
        issueDetail,
        condition,
      });
      setEstimate(data.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not estimate');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await createRepairBooking({
        ...form,
        modelId,
        colorId,
        simTypeId,
        issueId,
        issueDetail,
        deviceCondition: condition,
        deviceEstimate: estimate,
      });
      navigation.replace('RepairDone', { bookingNumber: data.booking.bookingNumber });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save booking');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrap>
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <Title>Doorstep repair</Title>
        <Muted>Apple iPhone only. Map pin drop from the website is not included; add the visit address below.</Muted>
        <Text style={styles.label}>Model</Text>
        <View style={styles.row}>
          {(catalog?.models || []).map(entry => (
            <Chip
              key={entry.id}
              label={entry.name}
              selected={modelId === entry.id}
              onPress={() => {
                setModelId(entry.id);
                setColorId(entry.colors[0]?.id || '');
                setEstimate(null);
              }}
            />
          ))}
        </View>
        {!!model && (
          <>
            <Text style={styles.label}>Colour</Text>
            <View style={styles.row}>
              {model.colors.map(color => (
                <Chip key={color.id} label={color.name} selected={colorId === color.id} onPress={() => setColorId(color.id)} />
              ))}
            </View>
          </>
        )}
        <Text style={styles.label}>SIM</Text>
        <View style={styles.row}>
          {(catalog?.simOptions || []).map(option => (
            <Chip
              key={option.id}
              label={option.name}
              selected={simTypeId === option.id}
              onPress={() => setSimTypeId(option.id)}
            />
          ))}
        </View>
        <Text style={styles.label}>Issue</Text>
        <View style={styles.row}>
          {(catalog?.issues || []).map(issue => (
            <Chip key={issue.id} label={issue.name} selected={issueId === issue.id} onPress={() => setIssueId(issue.id)} />
          ))}
        </View>
        <Field label="Issue detail" value={issueDetail} onChangeText={setIssueDetail} />
        <ConditionFields condition={condition} setCondition={setCondition} />
        <PrimaryButton label={busy ? 'Working…' : 'Preview estimate'} onPress={runEstimate} disabled={busy} color={accent} />
        {estimate ? (
          <Muted>
            {estimate.scoreLabel}: {estimate.summary}
          </Muted>
        ) : null}
        <Field label="Name *" value={form.name} onChangeText={value => setForm({ ...form, name: value })} />
        <Field label="Phone *" value={form.phone} onChangeText={value => setForm({ ...form, phone: value })} keyboardType="phone-pad" />
        <Field
          label="Email *"
          value={form.email}
          onChangeText={value => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field label="Address *" value={form.address} onChangeText={value => setForm({ ...form, address: value })} />
        <Field label="City *" value={form.city} onChangeText={value => setForm({ ...form, city: value })} />
        <Field label="Preferred date" value={form.preferredDate} onChangeText={value => setForm({ ...form, preferredDate: value })} />
        <Field label="Preferred time" value={form.preferredTime} onChangeText={value => setForm({ ...form, preferredTime: value })} />
        <Field label="Notes" value={form.notes} onChangeText={value => setForm({ ...form, notes: value })} />
        <ErrorText>{error}</ErrorText>
        <PrimaryButton label={busy ? 'Booking…' : 'Confirm booking'} onPress={submit} disabled={busy} color={accent} />
      </ScrollView>
    </ScreenWrap>
  );
}

export function RepairDoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RepairDone'>>();
  const { accent } = useStore();
  return (
    <ScreenWrap style={styles.pad}>
      <Title>Booking received</Title>
      <Muted>We saved {route.params.bookingNumber}. The store will contact you to confirm the visit.</Muted>
      <PrimaryButton label="Back home" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} color={accent} />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, gap: 10, paddingBottom: 48 },
  label: { fontWeight: '700', color: colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
