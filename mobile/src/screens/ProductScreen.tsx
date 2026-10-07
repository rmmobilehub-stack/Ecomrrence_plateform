import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createWhatsAppOrder, fetchProduct } from '../api';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { colors, space } from '../theme';
import type { Product } from '../types';
import {
  Card,
  Chip,
  ErrorText,
  LoadingBlock,
  Muted,
  PrimaryButton,
  RemoteImage,
  ScreenWrap,
  SecondaryButton,
  Title,
} from '../ui';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';
import type { RootStackParamList } from '../navigation/types';

export function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { add, buyNow } = useCart();
  const { store, accent, currency } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchProduct(route.params.productId)
      .then(data => setProduct(data.product))
      .catch(err => setError(err instanceof Error ? err.message : 'Product not found'));
  }, [route.params.productId]);

  const variantModifier = useMemo(
    () => (product?.variants ?? []).reduce((sum, variant) => sum + (choices[variant.name] ? Number(variant.priceModifier || 0) : 0), 0),
    [choices, product],
  );
  const price = product ? calculateProductPrice(product.price, product.discount, variantModifier) : 0;
  const originalPrice = product ? product.price + variantModifier : 0;
  const reference = product
    ? product.discount > 0
      ? originalPrice
      : getReferencePrice(price, product.comparePrice, 0)
    : 0;
  const invalid = (product?.variants ?? []).some(variant => !choices[variant.name]);
  const unavailable = !product || product.stock < 1 || invalid;

  const cartItem = product
    ? {
        productId: product.id,
        productName: product.name,
        thumbnail: product.thumbnail || product.images?.[0] || '',
        price,
        originalPrice,
        qty,
        selectedVariants: choices,
      }
    : null;

  const onAdd = () => {
    if (!cartItem || unavailable) return;
    add(cartItem);
    navigation.navigate('Tabs', { screen: 'Cart' });
  };
  const onBuy = () => {
    if (!cartItem || unavailable) return;
    buyNow(cartItem);
    navigation.navigate('Checkout');
  };
  const onWhatsApp = async () => {
    if (!cartItem || unavailable || !store) return;
    setBusy(true);
    setError('');
    try {
      const data = await createWhatsAppOrder({
        productId: product!.id,
        qty,
        selectedVariants: choices,
      });
      const itemChoices = Object.entries(choices)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');
      const message = [
        `*WhatsApp order request: ${data.order.orderNumber}*`,
        `*Store:* ${store.name}`,
        '',
        `Product: ${product!.name}`,
        `Quantity: ${qty}`,
        `Price: ${formatMoney(data.order.total, currency)}`,
        itemChoices ? `Options: ${itemChoices}` : '',
        '',
        'Please share your name, phone number and delivery address to confirm this order.',
      ]
        .filter(Boolean)
        .join('\n');
      await openWhatsApp(store.whatsappNumber, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start WhatsApp order');
    } finally {
      setBusy(false);
    }
  };

  if (!product && !error) {
    return (
      <ScreenWrap>
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  if (!product) {
    return (
      <ScreenWrap style={styles.pad}>
        <ErrorText>{error}</ErrorText>
      </ScreenWrap>
    );
  }

  const gallery = [product.thumbnail, ...(product.images || [])].filter(Boolean);

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <RemoteImage uri={gallery[0]} style={styles.hero} />
        <Title>{product.name}</Title>
        <Text style={[styles.price, { color: accent }]}>{formatMoney(price, currency)}</Text>
        {reference > price ? <Muted>{formatMoney(reference, currency)}</Muted> : null}
        {product.discount > 0 ? <Text style={styles.sale}>-{product.discount}%</Text> : null}
        {!!product.description && <Text style={styles.desc}>{product.description}</Text>}
        {(product.variants ?? []).map(variant => (
          <View key={variant.name} style={{ gap: 8 }}>
            <Text style={styles.label}>{variant.name}</Text>
            <View style={styles.row}>
              {variant.options.map(option => (
                <Chip
                  key={option}
                  label={option}
                  selected={choices[variant.name] === option}
                  onPress={() => setChoices(current => ({ ...current, [variant.name]: option }))}
                />
              ))}
            </View>
          </View>
        ))}
        <View style={styles.qtyRow}>
          <Chip label="−" onPress={() => setQty(value => Math.max(1, value - 1))} />
          <Text style={styles.qty}>{qty}</Text>
          <Chip label="+" onPress={() => setQty(value => Math.min(product.stock || 1, value + 1))} />
          <Muted>{product.stock} in stock</Muted>
        </View>
        <ErrorText>{error || (unavailable && product.stock < 1 ? 'Out of stock' : invalid ? 'Choose all options' : '')}</ErrorText>
        <PrimaryButton label="Buy now" onPress={onBuy} disabled={unavailable} color={accent} />
        <SecondaryButton label="Add to cart" onPress={onAdd} disabled={unavailable} />
        {isValidWhatsAppNumber(store?.whatsappNumber) && (
          <PrimaryButton
            label={busy ? 'Opening WhatsApp…' : 'Order on WhatsApp'}
            onPress={onWhatsApp}
            disabled={unavailable || busy}
            color={colors.whatsapp}
          />
        )}
        {gallery.length > 1 && (
          <Card>
            <Text style={styles.label}>Gallery</Text>
            <ScrollView horizontal>
              {gallery.slice(1).map(uri => (
                <RemoteImage key={uri} uri={uri} style={styles.gallery} />
              ))}
            </ScrollView>
          </Card>
        )}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  hero: { width: '100%', height: 280, borderRadius: 18, backgroundColor: colors.line },
  price: { fontSize: 22, fontWeight: '800' },
  sale: { color: colors.success, fontWeight: '700' },
  desc: { color: colors.ink, lineHeight: 22 },
  label: { fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qty: { fontSize: 18, fontWeight: '700', color: colors.ink, minWidth: 24, textAlign: 'center' },
  gallery: { width: 120, height: 120, borderRadius: 12, marginRight: 8, backgroundColor: colors.line },
});
