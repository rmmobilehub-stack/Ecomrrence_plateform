import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchCoupon, placeOrder } from '../api';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { checkoutReturn, ensureCustomerLogin } from '../ensureCustomerLogin';
import { formatMoney } from '../money';
import { useAppTheme } from '../context/ThemeContext';
import { calculateDeliveryFee } from '../pricing';
import { space } from '../theme';
import type { Coupon } from '../types';
import { Card, ErrorText, Field, Muted, PrimaryButton, ScreenWrap, SecondaryButton, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { emailValidationMessage, phoneValidationMessage } from '../validation';

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer, loading: authLoading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { store, accent, currency } = useStore();
  const { colors } = useAppTheme();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (authLoading) return;
    if (!customer) {
      ensureCustomerLogin(customer, navigation, checkoutReturn());
    }
  }, [authLoading, customer, navigation]);

  useEffect(() => {
    if (!customer) return;
    setForm(prev => ({
      ...prev,
      name: prev.name || customer.name || '',
      email: prev.email || customer.email || '',
      phone: prev.phone || customer.phone || '',
    }));
  }, [customer]);

  const productDiscount = useMemo(
    () => items.reduce((total, item) => total + (Math.max(item.price, item.originalPrice ?? item.price) - item.price) * item.qty, 0),
    [items],
  );
  const discount =
    coupon && subtotal >= coupon.minOrderAmount
      ? Math.min(coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value, subtotal)
      : 0;
  const amountAfterCoupon = subtotal - discount;
  const deliveryFee = calculateDeliveryFee(store?.deliveryFee, store?.freeDeliveryThreshold, amountAfterCoupon);
  const total = amountAfterCoupon + deliveryFee;
  const money = (amount: number) => formatMoney(amount, store?.currency || currency);
  const phoneError = phoneValidationMessage(form.phone, true);
  const emailError = emailValidationMessage(form.email);
  const requiredComplete =
    [form.name, form.address, form.city, form.country].every(value => value.trim().length > 0) &&
    !phoneError &&
    !emailError;

  const applyCoupon = async () => {
    setCouponError('');
    setCoupon(null);
    try {
      const data = await fetchCoupon(couponInput.trim());
      if (subtotal < data.discount.minOrderAmount) {
        setCouponError(`This code requires a ${money(data.discount.minOrderAmount)} minimum order.`);
        return;
      }
      setCoupon(data.discount);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Could not apply coupon');
    }
  };

  const submit = async () => {
    if (!items.length) return;
    if (form.name.trim().length < 2) {
      setError('Enter your full name');
      return;
    }
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (emailError) {
      setError(emailError);
      return;
    }
    if (!requiredComplete) {
      setError('Complete the required delivery details first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await placeOrder({
        customer: form,
        items,
        couponCode: coupon?.code,
      });
      clear();
      navigation.replace('OrderConfirmed', {
        order: {
          ...data.order,
          whatsappNumber: data.whatsappNumber,
          storeName: data.storeName,
          currency: data.currency || currency,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setSaving(false);
    }
  };

  if (!items.length) {
    return (
      <ScreenWrap style={styles.pad}>
        <Title>Checkout</Title>
        <Muted>Your cart is empty.</Muted>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Title>Checkout</Title>
          <Field label="Full name *" value={form.name} onChangeText={value => setField('name', value)} />
          <Field
            label="Phone *"
            value={form.phone}
            onChangeText={value => setField('phone', value)}
            keyboardType="phone-pad"
          />
          <Field
            label="Email *"
            value={form.email}
            onChangeText={value => setField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field label="Address *" value={form.address} onChangeText={value => setField('address', value)} />
          <Field label="City *" value={form.city} onChangeText={value => setField('city', value)} />
          <Field label="Country *" value={form.country} onChangeText={value => setField('country', value)} />
          <Field label="Order notes" value={form.notes} onChangeText={value => setField('notes', value)} multiline />
          <Card>
            <Text style={[styles.summaryTitle, { color: colors.ink }]}>Your order</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.ink }]}>
                  {item.productName} × {item.qty}
                </Text>
                <Text style={{ color: colors.ink }}>{money(item.price * item.qty)}</Text>
              </View>
            ))}
            <Field label="Coupon code" value={couponInput} onChangeText={value => setCouponInput(value.toUpperCase())} />
            <SecondaryButton label="Apply coupon" onPress={applyCoupon} disabled={saving} />
            <ErrorText>{couponError}</ErrorText>
            {productDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.ink }}>Product discount</Text>
                <Text style={{ color: colors.success }}>−{money(productDiscount)}</Text>
              </View>
            )}
            {coupon ? (
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.ink }}>Coupon {coupon.code}</Text>
                <Text style={{ color: colors.success }}>−{money(discount)}</Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.ink }}>Delivery</Text>
              <Text style={{ color: colors.ink }}>{deliveryFee === 0 ? 'Free' : money(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.total, { color: colors.ink }]}>Total</Text>
              <Text style={[styles.total, { color: colors.ink }]}>{money(total)}</Text>
            </View>
          </Card>
          <ErrorText>{error}</ErrorText>
          <PrimaryButton
            label={saving ? 'Confirming…' : requiredComplete ? 'Confirm order' : 'Fill required fields'}
            onPress={submit}
            disabled={!requiredComplete || saving}
            color={accent}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 48, gap: 4 },
  summaryTitle: { fontWeight: '800', fontSize: 16, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { flex: 1, paddingRight: 8 },
  total: { fontWeight: '800', fontSize: 16 },
});
