import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { goToAuth } from './AuthScreen';
import { formatMoney } from '../money';
import { colors, space } from '../theme';
import { Card, Chip, Muted, PrimaryButton, RemoteImage, ScreenWrap, Title } from '../ui';
import type { RootStackParamList, TabParamList } from '../navigation/types';

export function CartScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Cart'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { items, update, remove, subtotal, count } = useCart();
  const { accent, currency } = useStore();
  const { customer } = useAuth();

  if (!items.length) {
    return (
      <ScreenWrap style={styles.pad}>
        <Title>Cart</Title>
        <Muted>Your cart is empty.</Muted>
        <View style={{ height: 16 }} />
        <PrimaryButton label="Browse products" onPress={() => navigation.navigate('Shop')} color={accent} />
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
              <Text style={styles.name}>{item.productName}</Text>
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
                <Text style={styles.qtyValue}>{item.qty}</Text>
                <Chip label="+" onPress={() => update(index, item.qty + 1)} />
                <Pressable onPress={() => remove(index)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
        <Text style={styles.total}>Subtotal {formatMoney(subtotal, currency)}</Text>
        <PrimaryButton
          label="Checkout"
          onPress={() => (customer ? navigation.navigate('Checkout') : goToAuth(navigation, 'Checkout'))}
          color={accent}
        />
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.line },
  name: { fontWeight: '700', color: colors.ink },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyValue: { fontWeight: '700', minWidth: 20, textAlign: 'center' },
  remove: { color: colors.danger, fontWeight: '600' },
  total: { fontSize: 18, fontWeight: '800', color: colors.ink },
});
