import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createWhatsAppOrder, fetchProduct } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { checkoutReturn, ensureCustomerLogin } from '../ensureCustomerLogin';
import { resolveMediaUrl } from '../media';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { colors, space } from '../theme';
import type { Product } from '../types';
import { ErrorText, LoadingBlock, ScreenWrap } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

export function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer } = useAuth();
  const { buyNow } = useCart();
  const { store, currency } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [imageIndex, setImageIndex] = useState(0);
  const [buying, setBuying] = useState(false);
  const [waBusy, setWaBusy] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setChoices({});
    setQty(1);
    setImageIndex(0);
    setImagePreviewOpen(false);
    fetchProduct(route.params.productId)
      .then(data => setProduct(data.product))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load product'))
      .finally(() => setLoading(false));
  }, [route.params.productId]);

  const images = useMemo(() => {
    if (!product) return [] as string[];
    const list = [product.thumbnail, ...(product.images || [])].map(resolveMediaUrl).filter(Boolean);
    return Array.from(new Set(list));
  }, [product]);

  const variantModifier = useMemo(() => {
    if (!product) return 0;
    return (product.variants || []).reduce(
      (sum, variant) => sum + (choices[variant.name] ? Number(variant.priceModifier || 0) : 0),
      0,
    );
  }, [product, choices]);

  const price = product ? calculateProductPrice(product.price, product.discount, variantModifier) : 0;
  const originalPrice = product ? product.price + variantModifier : 0;
  const reference =
    product && product.discount > 0
      ? originalPrice
      : product
        ? getReferencePrice(price, product.comparePrice, 0)
        : 0;
  const missingOptions = (product?.variants || []).filter(variant => !choices[variant.name]).map(v => v.name);
  const outOfStock = (product?.stock ?? 0) < 1;
  const invalid = missingOptions.length > 0;
  const unavailable = outOfStock || invalid;
  const disabledMessage = outOfStock
    ? 'This product is currently out of stock.'
    : missingOptions.length
      ? `Select ${missingOptions.join(' and ')} to continue.`
      : '';

  if (loading) {
    return (
      <ScreenWrap style={styles.wrap}>
        <StatusBar barStyle="light-content" />
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  if (!product) {
    return (
      <ScreenWrap style={styles.pad}>
        <Text style={styles.missing}>{error || 'Product not found.'}</Text>
      </ScreenWrap>
    );
  }

  const thumbUri = images[imageIndex] || resolveMediaUrl(product.thumbnail || '');
  const cartItem = {
    productId: product.id,
    productName: product.name,
    thumbnail: resolveMediaUrl(product.thumbnail || product.images?.[0] || ''),
    price,
    originalPrice,
    qty,
    selectedVariants: choices,
  };

  const startCheckout = async () => {
    if (unavailable || buying) return;
    if (!ensureCustomerLogin(customer, navigation, checkoutReturn())) return;
    setBuying(true);
    buyNow(cartItem);
    navigation.navigate('Checkout');
    setBuying(false);
  };

  const startWhatsApp = async () => {
    if (unavailable || waBusy || !isValidWhatsAppNumber(store?.whatsappNumber)) return;
    if (!ensureCustomerLogin(customer, navigation, { type: 'screen', name: 'Product', params: { productId: product.id } })) {
      return;
    }
    setWaBusy(true);
    setError('');
    try {
      const data = await createWhatsAppOrder({
        productId: product.id,
        qty,
        selectedVariants: choices,
      });
      const itemChoices = Object.entries(choices)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');
      const message = [
        `*WhatsApp order request: ${data.order.orderNumber}*`,
        `*Store:* ${store?.name || ''}`,
        '',
        `Product: ${product.name}`,
        `Quantity: ${qty}`,
        `Price: ${formatMoney(data.order.total, currency)}`,
        itemChoices ? `Options: ${itemChoices}` : '',
        '',
        'Please share your name, phone number and delivery address to confirm this order.',
      ]
        .filter(Boolean)
        .join('\n');
      await openWhatsApp(store?.whatsappNumber, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start WhatsApp order');
    } finally {
      setWaBusy(false);
    }
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
          {outOfStock ? (
            <View style={[styles.badge, styles.stockBadge]}>
              <Text style={styles.badgeText}>Out of stock</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.stockBadgeOk]}>
              <Text style={styles.badgeText}>Available</Text>
            </View>
          )}
          {thumbUri ? (
            <Pressable
              onPress={() => setImagePreviewOpen(true)}
              style={styles.hero}
              accessibilityRole="button"
              accessibilityLabel="Open product image">
              <Image source={{ uri: thumbUri }} style={styles.hero} resizeMode="contain" />
              <View style={styles.zoomHint}><Text style={styles.zoomHintText}>Tap to view</Text></View>
            </Pressable>
          ) : (
            <View style={[styles.hero, styles.heroEmpty]} />
          )}
        </View>

        {images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {images.map((uri, index) => (
              <Pressable key={uri} onPress={() => { setImageIndex(index); setImagePreviewOpen(false); }} style={[styles.thumb, index === imageIndex && styles.thumbOn]}>
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="contain" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <Text style={styles.kicker}>COLLECTION PICK</Text>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoney(price, currency)}</Text>
          {reference > price ? (
            <View style={styles.originalPrice}>
              <Text style={styles.originalLabel}>Original</Text>
              <View style={styles.compare}>
                <Text style={styles.compareText}>{formatMoney(reference, currency)}</Text>
                <View pointerEvents="none" style={styles.compareStrike} />
              </View>
            </View>
          ) : null}
        </View>
        <Text style={styles.desc}>{product.description}</Text>
        <View style={styles.facts}>
          {product.sku ? <Text style={styles.meta}>SKU · {product.sku}</Text> : null}
          <Text style={[styles.availability, outOfStock ? styles.unavailable : styles.available]}>
            {outOfStock ? 'Out of stock' : 'Available to order'}
          </Text>
        </View>

        {product.tags?.length ? (
          <View style={styles.tags}>
            {product.tags.map(tag => <Text key={tag} style={styles.tag}>{tag}</Text>)}
          </View>
        ) : null}

        {(product.variants || []).map(variant => (
          <View key={variant.name} style={[styles.variantBlock, !choices[variant.name] && styles.variantPending]}>
            <Text style={styles.label}>{variant.name}{!choices[variant.name] ? ' · required' : ''}</Text>
            <View style={styles.row}>
              {variant.options.map(option => (
                <Pressable
                  key={option}
                  onPress={() => setChoices(prev => ({ ...prev, [variant.name]: option }))}
                  style={[styles.option, choices[variant.name] === option && styles.optionOn]}>
                  <Text style={[styles.optionText, choices[variant.name] === option && styles.optionTextOn]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.qtyRow}>
          <Pressable
            onPress={() => setQty(value => Math.max(1, value - 1))}
            style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            onPress={() => setQty(value => Math.min(Math.max(1, product.stock || 1), value + 1))}
            style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        {disabledMessage ? <Text style={styles.warn}>{disabledMessage}</Text> : null}
        <ErrorText>{error}</ErrorText>

        <Pressable
          style={[styles.primary, (unavailable || buying) && styles.disabled]}
          disabled={unavailable || buying}
          onPress={() => void startCheckout()}>
          <Text style={styles.primaryText}>
            {outOfStock ? 'Out of stock' : buying ? 'Please wait…' : 'Buy now'}
          </Text>
        </Pressable>

        {isValidWhatsAppNumber(store?.whatsappNumber) ? (
          <>
            <Pressable
              style={[styles.whatsapp, unavailable && styles.disabled]}
              disabled={unavailable || waBusy}
              onPress={() => void startWhatsApp()}>
              <Text style={styles.whatsappText}>{waBusy ? 'Preparing…' : 'Order via WhatsApp'}</Text>
            </Pressable>
            <Text style={styles.note}>WhatsApp requests are saved as pending orders before the chat opens.</Text>
          </>
        ) : null}

        {product.customProperties?.length ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Product details</Text>
            {product.customProperties.map((property, index) => (
              <View key={`${property.key}-${index}`} style={styles.detailRow}>
                <Text style={styles.detailKey}>{property.key}</Text>
                <Text style={styles.detailValue}>{property.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.assurance}>
          <View style={styles.assuranceItem}>
            <Text style={styles.assuranceTitle}>Cash on delivery</Text>
            <Text style={styles.assuranceText}>Pay when your order arrives.</Text>
          </View>
          <View style={styles.assuranceItem}>
            <Text style={styles.assuranceTitle}>Direct support</Text>
            <Text style={styles.assuranceText}>We confirm compatibility before dispatch.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={imagePreviewOpen} transparent animationType="fade" onRequestClose={() => setImagePreviewOpen(false)}>
        <Pressable style={styles.previewBackdrop} onPress={() => setImagePreviewOpen(false)}>
          <Pressable style={styles.previewCard} onPress={event => event.stopPropagation()}>
            <Pressable style={styles.previewClose} onPress={() => setImagePreviewOpen(false)} accessibilityLabel="Close product image">
              <Text style={styles.previewCloseText}>Close</Text>
            </Pressable>
            {thumbUri ? <Image source={{ uri: thumbUri }} style={styles.previewImage} resizeMode="contain" /> : null}
          </Pressable>
        </Pressable>
      </Modal>

    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#050E24' },
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  missing: { color: '#C5D5EC' },
  heroBox: {
    aspectRatio: 1,
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
  stockBadge: { left: undefined, right: 12, backgroundColor: '#B42318' },
  stockBadgeOk: { left: undefined, right: 12, backgroundColor: 'rgba(47, 123, 255, 0.85)' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  hero: { width: '100%', height: '100%' },
  heroEmpty: { backgroundColor: '#08182F' },
  zoomHint: { position: 'absolute', right: 10, bottom: 10, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(4, 17, 36, 0.7)' },
  zoomHintText: { color: '#EAF3FF', fontSize: 11, fontWeight: '700' },
  thumbs: { gap: 8 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.25)',
    overflow: 'hidden',
    backgroundColor: '#08182F',
  },
  thumbOn: { borderColor: '#4DA3FF' },
  thumbImg: { width: '100%', height: '100%' },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#F7FBFF', fontSize: 26, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  price: { color: '#8EC8FF', fontSize: 22, fontWeight: '800' },
  originalPrice: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  originalLabel: { color: '#7A93B0', fontSize: 12, fontWeight: '700' },
  compare: { position: 'relative', paddingVertical: 1 },
  compareText: { color: '#7596BE', fontSize: 15 },
  compareStrike: { position: 'absolute', left: 0, right: 0, top: 11, height: 2, borderRadius: 99, backgroundColor: '#5F86B6' },
  desc: { color: '#C5D5EC', lineHeight: 22, fontSize: 15 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  meta: { color: '#7A93B0', fontSize: 12 },
  availability: { fontSize: 12, fontWeight: '800' },
  available: { color: '#5DE0B2' },
  unavailable: { color: '#FFB4A8' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { color: '#A8CBEA', fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(77, 163, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(126, 200, 255, 0.2)' },
  variantBlock: { gap: 8, padding: 10, borderRadius: 14 },
  variantPending: { borderWidth: 1, borderColor: 'rgba(77, 163, 255, 0.3)', backgroundColor: 'rgba(77, 163, 255, 0.06)' },
  label: { color: '#F4F8FF', fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
  },
  optionOn: { backgroundColor: '#2F7BFF', borderColor: '#2F7BFF' },
  optionText: { color: '#C5D5EC', fontWeight: '700', fontSize: 13 },
  optionTextOn: { color: '#fff' },
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
  warn: { color: '#FFB4A8', fontSize: 13, fontWeight: '600' },
  primary: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#2F7BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  whatsapp: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  note: { color: '#A8C0DA', fontSize: 12, lineHeight: 18 },
  detailsCard: { gap: 8, padding: 14, borderRadius: 16, backgroundColor: 'rgba(10, 28, 56, 0.72)', borderWidth: 1, borderColor: 'rgba(126, 200, 255, 0.2)' },
  detailsTitle: { color: '#F7FBFF', fontSize: 16, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(126, 200, 255, 0.12)' },
  detailKey: { color: '#7A93B0', fontSize: 13 },
  detailValue: { color: '#EAF3FF', fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  assurance: { gap: 8 },
  assuranceItem: { padding: 13, borderRadius: 14, backgroundColor: 'rgba(47, 123, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(126, 200, 255, 0.2)' },
  assuranceTitle: { color: '#EAF3FF', fontSize: 13, fontWeight: '800' },
  assuranceText: { color: '#A8C0DA', fontSize: 12, marginTop: 3 },
  previewBackdrop: { flex: 1, padding: 18, justifyContent: 'center', backgroundColor: 'rgba(2, 8, 22, 0.94)' },
  previewCard: { width: '100%', aspectRatio: 0.82, maxHeight: '82%', borderRadius: 20, overflow: 'hidden', backgroundColor: '#08182F', borderWidth: 1, borderColor: 'rgba(126, 200, 255, 0.3)' },
  previewImage: { width: '100%', height: '100%' },
  previewClose: { position: 'absolute', top: 12, right: 12, zIndex: 2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(2, 8, 22, 0.72)' },
  previewCloseText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.45 },
});
