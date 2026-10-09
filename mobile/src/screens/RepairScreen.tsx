import { useEffect, useMemo, useState } from 'react';
import { ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createRepairBooking, fetchDeviceEstimate, fetchRepairCatalog } from '../api';
import { SelectField } from '../components/SelectField';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ensureCustomerLogin, repairReturn } from '../ensureCustomerLogin';
import { formatMoney } from '../money';
import { colors, space } from '../theme';
import {
  DEFAULT_DEVICE_CONDITION,
  type DeviceConditionInput,
  type DeviceEstimate,
  type RepairCatalog,
} from '../types';
import { Card, ErrorText, Field, LoadingBlock, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { ConditionFields } from './PhoneCheckScreen';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

const repairHeroArt = require('../assets/repair-iphone.jpg');

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

export function RepairScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer } = useAuth();
  const { store, accent } = useStore();
  const [catalog, setCatalog] = useState<RepairCatalog | null>(null);
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [colorId, setColorId] = useState('');
  const [simTypeId, setSimTypeId] = useState('');
  const [issueId, setIssueId] = useState('');
  const [issueDetail, setIssueDetail] = useState('');
  const [condition, setCondition] = useState<DeviceConditionInput>(DEFAULT_DEVICE_CONDITION);
  const [estimate, setEstimate] = useState<DeviceEstimate | null>(null);
  const [priceOk, setPriceOk] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    setForm(prev => ({
      ...prev,
      name: prev.name || customer.name || '',
      email: prev.email || customer.email || '',
      phone: prev.phone || customer.phone || '',
    }));
  }, [customer]);

  useEffect(() => {
    fetchRepairCatalog()
      .then(data => setCatalog(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load repair catalog'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setEstimate(null);
  }, [brandId, modelId, colorId, simTypeId, issueId, issueDetail, condition]);

  const model = useMemo(() => catalog?.models.find(entry => entry.id === modelId), [catalog, modelId]);
  const issue = useMemo(() => catalog?.issues.find(entry => entry.id === issueId), [catalog, issueId]);
  const appleReady = brandId === 'apple';

  const doEstimate = async () => {
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

  const runEstimate = async () => {
    if (!ensureCustomerLogin(customer, navigation, repairReturn())) return;
    if (!appleReady || !modelId || !colorId || !issueId) {
      setError('Select Apple model, colour and issue first.');
      return;
    }
    if (!priceOk) {
      setPriceModal(true);
      return;
    }
    await doEstimate();
  };

  const validate = () => {
    if (!appleReady || !modelId || !colorId || !simTypeId || !issueId) {
      return 'Complete brand, model, colour, SIM and issue.';
    }
    if (!estimate) return 'Get score & market worth before booking.';
    if (![form.name, form.phone, form.email, form.address, form.city].every(v => v.trim())) {
      return 'Fill name, phone, email, address and city.';
    }
    return '';
  };

  const submit = async () => {
    if (!ensureCustomerLogin(customer, navigation, repairReturn())) return;
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setConfirmModal(false);
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
      if (isValidWhatsAppNumber(store?.whatsappNumber)) {
        const message = [
          `*Repair booking: ${data.booking.bookingNumber}*`,
          `Store: ${store?.name || ''}`,
          `Model: ${model?.name || modelId}`,
          `Issue: ${issue?.name || issueId}`,
          estimate ? `Score: ${estimate.score}/100` : '',
          `Name: ${form.name}`,
          `Phone: ${form.phone}`,
          `City: ${form.city}`,
          `Address: ${form.address}`,
        ]
          .filter(Boolean)
          .join('\n');
        try {
          await openWhatsApp(store?.whatsappNumber, message);
        } catch {
          // Booking already saved even if WhatsApp fails to open.
        }
      }
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
        <ImageBackground source={repairHeroArt} style={styles.repairHero} imageStyle={styles.repairHeroImage}>
          <View style={styles.repairHeroShade} />
          <View style={styles.repairHeroCopy}>
            <View style={styles.repairKicker}><Icon name="construct-outline" size={15} color="#D7E7FF" /><Text style={styles.repairKickerText}>IPHONE DOORSTEP REPAIR</Text></View>
            <Text style={styles.repairTitle}>Doorstep iPhone repair</Text>
            <Text style={styles.repairSub}>Pick your model and colour. We come to your address, repair it on the spot, and leave once it works again.</Text>
            <View style={styles.repairPoints}>
              <View style={styles.repairPoint}><Icon name="shield-checkmark-outline" size={14} color="#BFE5FF" /><Text style={styles.repairPointText}>Exact model match</Text></View>
              <View style={styles.repairPoint}><Icon name="phone-portrait-outline" size={14} color="#BFE5FF" /><Text style={styles.repairPointText}>Official colours</Text></View>
              <View style={styles.repairPoint}><Icon name="call-outline" size={14} color="#BFE5FF" /><Text style={styles.repairPointText}>At your door</Text></View>
            </View>
            {isValidWhatsAppNumber(store?.whatsappNumber) ? (
              <Pressable style={styles.repairWhatsApp} onPress={() => void openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || 'RM Mobile Hub'}, I need iPhone repair support.`)}>
                <Icon name="logo-whatsapp" size={19} color="#FFFFFF" />
                <Text style={styles.repairWhatsAppText}>WhatsApp</Text>
              </Pressable>
            ) : null}
          </View>
        </ImageBackground>

        <Text style={styles.step}>1 · Device</Text>
        <SelectField
          label="Brand"
          placeholder="Select brand"
          value={brandId}
          options={BRANDS.map(brand => ({
            id: brand.id,
            label: brand.available ? brand.name : `${brand.name} (soon)`,
            disabled: !brand.available,
          }))}
          onChange={value => {
            setBrandId(value);
            setModelId('');
            setColorId('');
            setSimTypeId('');
            setIssueId('');
            setEstimate(null);
          }}
        />

        {appleReady ? (
          <SelectField
            label="Model"
            placeholder="Select iPhone model"
            value={modelId}
            options={(catalog?.models || []).map(entry => ({ id: entry.id, label: entry.name }))}
            onChange={value => {
              setModelId(value);
              setColorId('');
              setEstimate(null);
            }}
          />
        ) : null}

        {!!model ? (
          <SelectField
            label="Colour"
            placeholder="Select colour"
            value={colorId}
            options={model.colors.map(color => ({ id: color.id, label: color.name }))}
            onChange={setColorId}
          />
        ) : null}

        {colorId ? (
          <SelectField
            label="SIM"
            placeholder="Select SIM setup"
            value={simTypeId}
            options={(catalog?.simOptions || []).map(option => ({ id: option.id, label: option.name }))}
            onChange={setSimTypeId}
          />
        ) : null}

        {simTypeId ? (
          <>
            <SelectField
              label="Issue"
              placeholder="Select issue"
              value={issueId}
              options={(catalog?.issues || []).map(entry => ({ id: entry.id, label: entry.name }))}
              onChange={setIssueId}
            />
            {issueId ? (
              <Field
                label="Issue detail (optional)"
                value={issueDetail}
                onChangeText={value => setIssueDetail(value.slice(0, 300))}
              />
            ) : null}
          </>
        ) : null}

        {issueId ? (
          <>
            <Text style={styles.step}>6 · Condition & score</Text>
            <ConditionFields condition={condition} setCondition={setCondition} />
            <PrimaryButton
              label={busy ? 'Calculating…' : estimate ? 'Update score' : 'Get score & market worth'}
              onPress={runEstimate}
              disabled={busy}
              color={accent}
            />
            {estimate ? (
              <Card>
                <Text style={styles.score}>
                  {estimate.scoreLabel} · {estimate.score}/100
                </Text>
                <Text style={{ color: accent, fontWeight: '800', fontSize: 17 }}>
                  {formatMoney(estimate.marketValueMinPkr)} – {formatMoney(estimate.marketValueMaxPkr)}
                </Text>
                <Muted>{estimate.summary}</Muted>
              </Card>
            ) : null}
          </>
        ) : null}

        {estimate ? (
          <>
            <Text style={styles.step}>7 · Visit details</Text>
            <Field label="Name *" value={form.name} onChangeText={value => setForm({ ...form, name: value })} />
            <Field
              label="Phone *"
              value={form.phone}
              onChangeText={value => setForm({ ...form, phone: value })}
              keyboardType="phone-pad"
            />
            <Field
              label="Email *"
              value={form.email}
              onChangeText={value => setForm({ ...form, email: value })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field label="Address *" value={form.address} onChangeText={value => setForm({ ...form, address: value })} />
            <Field label="City *" value={form.city} onChangeText={value => setForm({ ...form, city: value })} />
            <Field
              label="Preferred date"
              value={form.preferredDate}
              onChangeText={value => setForm({ ...form, preferredDate: value })}
            />
            <Field
              label="Preferred time"
              value={form.preferredTime}
              onChangeText={value => setForm({ ...form, preferredTime: value })}
            />
            <Field label="Notes" value={form.notes} onChangeText={value => setForm({ ...form, notes: value })} />
            <ErrorText>{error}</ErrorText>
            <PrimaryButton
              label={busy ? 'Booking…' : 'Review & confirm booking'}
              onPress={() => {
                const problem = validate();
                if (problem) {
                  setError(problem);
                  return;
                }
                setError('');
                setConfirmModal(true);
              }}
              disabled={busy}
              color={accent}
            />
          </>
        ) : (
          <ErrorText>{error}</ErrorText>
        )}
      </ScrollView>

      <Modal visible={priceModal} transparent animationType="fade" onRequestClose={() => setPriceModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Price confirmed after inspection</Text>
            <Muted>
              Online score and market worth are indicative only. Final repair quote is confirmed after the technician
              inspects the device.
            </Muted>
            <PrimaryButton
              label="I understand — continue"
              color={accent}
              onPress={() => {
                setPriceOk(true);
                setPriceModal(false);
                void doEstimate();
              }}
            />
            <Pressable onPress={() => setPriceModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmModal} transparent animationType="fade" onRequestClose={() => setConfirmModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm repair booking?</Text>
            <Muted>
              {model?.name} · {issue?.name}
              {estimate ? `\nScore ${estimate.score}/100` : ''}
              {`\n${form.name} · ${form.city}`}
            </Muted>
            <PrimaryButton label={busy ? 'Saving…' : 'Confirm booking'} color={accent} onPress={() => void submit()} />
            <Pressable onPress={() => setConfirmModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Back</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
      <Muted>
        We saved {route.params.bookingNumber}. No payment is taken now — the store will contact you to confirm the visit
        and final quote after inspection.
      </Muted>
      <PrimaryButton label="Back home" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} color={accent} />
      <PrimaryButton
        label="Free phone check"
        onPress={() => navigation.navigate('Tabs', { screen: 'HealthCheck' })}
        color={accent}
      />
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, gap: 10, paddingBottom: 48 },
  repairHero: { minHeight: 330, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 8 },
  repairHeroImage: { resizeMode: 'cover' },
  repairHeroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 16, 34, 0.68)' },
  repairHeroCopy: { padding: 18, gap: 11 },
  repairKicker: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(218, 239, 255, 0.14)', borderWidth: 1, borderColor: 'rgba(150, 213, 255, 0.45)' },
  repairKickerText: { color: '#DCEBFA', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  repairTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 36, fontWeight: '900', maxWidth: 250 },
  repairSub: { color: '#D5E5F3', fontSize: 14, lineHeight: 21, maxWidth: 285 },
  repairPoints: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  repairPoint: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(219, 236, 252, 0.14)', borderWidth: 1, borderColor: 'rgba(203, 230, 255, 0.28)' },
  repairPointText: { color: '#E9F4FF', fontSize: 11, fontWeight: '700' },
  repairWhatsApp: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: '#25D366' },
  repairWhatsAppText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  step: { fontWeight: '800', color: colors.accentSoft, marginTop: 8, letterSpacing: 0.3 },
  label: { fontWeight: '700', color: colors.ink, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  score: { fontWeight: '800', fontSize: 16, color: colors.ink, marginBottom: 6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 20, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  modalCancel: { alignItems: 'center', paddingVertical: 8 },
  modalCancelText: { color: colors.accentSoft, fontWeight: '700' },
});
