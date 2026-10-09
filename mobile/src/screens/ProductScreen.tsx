import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCatalogProduct } from '../catalog';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { colors, space } from '../theme';
import { ScreenWrap } from '../ui';
import type { RootStackParamList } from '../navigation/types';

export function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { add, buyNow } = useCart();
  const product = getCatalogProduct(route.params.productId);
  const [qty, setQty] = useState(1);

  const price = product ? calculateProductPrice(product.price, product.discount) : 0;
  const reference = product ? getReferencePrice(product.price, product.comparePrice, product.discount) : 0;
  const thumbUri = useMemo(() => (product ? Image.resolveAssetSource(product.image).uri : ''), [product]);

  if (!product) {
    return (
      <ScreenWrap style={styles.pad}>
        <Text style={styles.missing}>Product not found.</Text>
      </ScreenWrap>
    );
  }

  const cartItem = {
    productId: product.id,
    productName: product.name,
    thumbnail: thumbUri,
    price,
    originalPrice: product.price,
    qty,
    selectedVariants: {},
  };

  return (
    <ScreenWrap style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.pad}>
        <View style={styles.heroBox}>
          {product.discount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>-{product.discount}%</Text>
            </View>
          ) : null}
          <Image source={product.image} style={styles.hero} resizeMode="contain" />
        </View>
        <Text style={styles.kicker}>COLLECTION PICK</Text>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoney(price, 'PKR')}</Text>
          {reference > price ? <Text style={styles.compare}>{formatMoney(reference, 'PKR')}</Text> : null}
        </View>
        <Text style={styles.desc}>{product.description}</Text>
        <View style={styles.qtyRow}>
          <Pressable onPress={() => setQty(value => Math.max(1, value - 1))} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable onPress={() => setQty(value => value + 1)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.primary}
          onPress={() => {
            buyNow(cartItem);
            navigation.navigate('Checkout');
          }}>
          <Text style={styles.primaryText}>Buy now</Text>
        </Pressable>
        <Pressable
          style={styles.ghost}
          onPress={() => {
            add(cartItem);
            navigation.navigate('Cart');
          }}>
          <Text style={styles.ghostText}>Add to cart</Text>
        </Pressable>
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#050E24' },
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  missing: { color: '#C5D5EC' },
  heroBox: {
    borderRadius: 20,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: '#2F7BFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  hero: { width: '100%', height: 280 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#F7FBFF', fontSize: 26, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: '#8EC8FF', fontSize: 22, fontWeight: '800' },
  compare: { color: '#6B86A8', textDecorationLine: 'line-through', fontSize: 15 },
  desc: { color: '#C5D5EC', lineHeight: 22, fontSize: 15 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#F4F8FF', fontSize: 20, fontWeight: '700' },
  qty: { color: '#F4F8FF', fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  primary: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#2F7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  ghost: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: '#EAF3FF', fontWeight: '800', fontSize: 16 },
});
