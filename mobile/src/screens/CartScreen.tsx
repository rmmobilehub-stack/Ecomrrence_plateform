import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { checkoutReturn, ensureCustomerLogin } from '../ensureCustomerLogin';
import { useAppTheme } from '../context/ThemeContext';
import { formatMoney } from '../money';
import { space } from '../theme';
import { Card, Chip, Muted, PrimaryButton, RemoteImage, ScreenWrap, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer } = useAuth();
  const { items, update, remove, subtotal, count } = useCart();
  const { accent, currency } = useStore();
  const { colors } = useAppTheme();

  if (!items.length) {
    return (
      <ScreenWrap style={styles.pad}>
        <Title>Cart</Title>
        <Muted>Your cart is empty.</Muted>
        <View style={{ height: 16 }} />
        <PrimaryButton label="Browse products" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} color={accent} />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Cart ({count})</Title>
        {items.map((item, index) => (
          <Card key={`${item.productId}-${index}`} style={styles.row}>
            <RemoteImage uri={item.thumbnail} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.ink }]}>{item.productName}</Text>
              {Object.entries(item.selectedVariants).map(([key, value]) => (
                <Muted key={key}>
                  {key}: {value}
                </Muted>
              ))}
              <Text style={{ color: accent, fontWeight: '700', marginTop: 4 }}>
                {formatMoney(item.price * item.qty, currency)}
              </Text>
              <View style={styles.qty}>
                <Chip label="−" onPress={() => update(index, item.qty - 1)} />
                <Text style={[styles.qtyValue, { color: colors.ink }]}>{item.qty}</Text>
                <Chip label="+" onPress={() => update(index, item.qty + 1)} />
                <Pressable onPress={() => remove(index)}>
                  <Text style={[styles.remove, { color: colors.danger }]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
        <Text style={[styles.total, { color: colors.ink }]}>Subtotal {formatMoney(subtotal, currency)}</Text>
        <PrimaryButton
          label="Checkout"
          onPress={() => {
            if (!ensureCustomerLogin(customer, navigation, checkoutReturn())) return;
            navigation.navigate('Checkout');
          }}
          color={accent}
        />
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#D9EAF5' },
  name: { fontWeight: '700' },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyValue: { fontWeight: '700', minWidth: 20, textAlign: 'center' },
  remove: { fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '800' },
});
