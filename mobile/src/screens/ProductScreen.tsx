import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createWhatsAppOrder, fetchProduct } from '../api';
import { SelectField } from '../components/SelectField';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAppTheme } from '../context/ThemeContext';
import { resolveMediaUrl } from '../media';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { space } from '../theme';
import type { Product } from '../types';
import { ErrorText, LoadingBlock, ScreenWrap } from '../ui';
import type { RootStackParamList } from '../navigation/types';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

export function ProductScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { buyNow } = useCart();
  const { store, currency } = useStore();
  const { colors, isDark } = useAppTheme();
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

  const unitPrice = product ? calculateProductPrice(product.price, product.discount, variantModifier) : 0;
  const originalPrice = product ? product.price + variantModifier : 0;
  const unitReference =
    product && product.discount > 0
      ? originalPrice
      : product
        ? getReferencePrice(unitPrice, product.comparePrice, 0)
        : 0;
  const price = unitPrice * qty;
  const reference = unitReference * qty;
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
      <ScreenWrap>
        <StatusBar barStyle={colors.statusBar} />
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  if (!product) {
    return (
      <ScreenWrap style={styles.pad}>
        <StatusBar barStyle={colors.statusBar} />
        <Text style={{ color: colors.muted }}>{error || 'Product not found.'}</Text>
      </ScreenWrap>
    );
  }

  const thumbUri = images[imageIndex] || resolveMediaUrl(product.thumbnail || '');
  const cartItem = {
    productId: product.id,
    productName: product.name,
    thumbnail: resolveMediaUrl(product.thumbnail || product.images?.[0] || ''),
    price: unitPrice,
    originalPrice,
    qty,
    selectedVariants: choices,
  };

  const startCheckout = () => {
    if (unavailable || buying) return;
    setBuying(true);
    buyNow(cartItem);
    navigation.navigate('Checkout');
    setBuying(false);
  };

  const startWhatsApp = async () => {
    if (unavailable || waBusy || !isValidWhatsAppNumber(store?.whatsappNumber)) return;
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

  const surface = isDark ? 'rgba(10, 28, 56, 0.88)' : colors.card;
  const softFill = isDark ? 'rgba(77, 163, 255, 0.1)' : '#F3FAFE';
  const softBorder = isDark ? 'rgba(126, 200, 255, 0.22)' : colors.line;

  return (
    <ScreenWrap>
      <StatusBar barStyle={colors.statusBar} />
      <ScrollView contentContainerStyle={styles.pad}>
        <View style={[styles.heroBox, { backgroundColor: surface, borderColor: softBorder }]}>
          {product.discount > 0 ? (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>-{product.discount}%</Text>
            </View>
          ) : null}
          {outOfStock ? (
            <View style={[styles.badge, styles.stockBadge, { backgroundColor: colors.danger }]}>
              <Text style={styles.badgeText}>Out of stock</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.stockBadgeOk, { backgroundColor: colors.accent }]}>
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
              <View style={[styles.zoomHint, { backgroundColor: isDark ? 'rgba(4, 17, 36, 0.7)' : 'rgba(18, 56, 78, 0.55)' }]}>
                <Text style={styles.zoomHintText}>Tap to view</Text>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.hero, { backgroundColor: isDark ? '#08182F' : '#E8F4FB' }]} />
          )}
        </View>

        {images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {images.map((uri, index) => (
              <Pressable
                key={uri}
                onPress={() => {
                  setImageIndex(index);
                  setImagePreviewOpen(false);
                }}
                style={[
                  styles.thumb,
                  {
                    borderColor: index === imageIndex ? colors.accentSoft : softBorder,
                    backgroundColor: isDark ? '#08182F' : colors.card,
                  },
                ]}>
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="contain" />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <Text style={[styles.kicker, { color: colors.accentSoft }]}>COLLECTION PICK</Text>
        <Text style={[styles.title, { color: colors.ink }]}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.accentSoft }]}>{formatMoney(price, currency)}</Text>
          {reference > price ? (
            <View style={styles.originalPrice}>
              <Text style={[styles.originalLabel, { color: colors.muted }]}>Original</Text>
              <View style={styles.compare}>
                <Text style={[styles.compareText, { color: colors.muted }]}>{formatMoney(reference, currency)}</Text>
                <View pointerEvents="none" style={[styles.compareStrike, { backgroundColor: colors.muted }]} />
              </View>
            </View>
          ) : null}
        </View>
        <View style={styles.facts}>
          {product.sku ? <Text style={[styles.meta, { color: colors.muted }]}>SKU · {product.sku}</Text> : null}
          <Text style={[styles.availability, { color: outOfStock ? colors.danger : colors.success }]}>
            {outOfStock ? 'Out of stock' : 'Available to order'}
          </Text>
        </View>

        {product.tags?.length ? (
          <View style={styles.tags}>
            {product.tags.map(tag => (
              <Text
                key={tag}
                style={[
                  styles.tag,
                  { color: colors.muted, backgroundColor: softFill, borderColor: softBorder },
                ]}>
                {tag}
              </Text>
            ))}
          </View>
        ) : null}

        {(product.variants || []).map(variant => (
          <View
            key={variant.name}
            style={[
              styles.variantBlock,
              !choices[variant.name] && {
                borderWidth: 1,
                borderColor: isDark ? 'rgba(77, 163, 255, 0.35)' : colors.accentSoft,
                backgroundColor: isDark ? 'rgba(77, 163, 255, 0.06)' : '#FFFFFF',
              },
            ]}>
            <SelectField
              label={`${variant.name}${!choices[variant.name] ? ' · required' : ''}`}
              placeholder={`Choose ${variant.name}`}
              value={choices[variant.name] || ''}
              options={variant.options.map(option => ({ id: option, label: option }))}
              onChange={option => setChoices(prev => ({ ...prev, [variant.name]: option }))}
            />
          </View>
        ))}

        <View style={styles.qtyRow}>
          <Pressable
            onPress={() => setQty(value => Math.max(1, value - 1))}
            style={[styles.qtyBtn, { borderColor: softBorder, backgroundColor: colors.card }]}>
            <Text style={[styles.qtyBtnText, { color: colors.ink }]}>−</Text>
          </Pressable>
          <Text style={[styles.qty, { color: colors.ink }]}>{qty}</Text>
          <Pressable
            onPress={() => setQty(value => Math.min(Math.max(1, product.stock || 1), value + 1))}
            style={[styles.qtyBtn, { borderColor: softBorder, backgroundColor: colors.card }]}>
            <Text style={[styles.qtyBtnText, { color: colors.ink }]}>+</Text>
          </Pressable>
        </View>

        {disabledMessage ? <Text style={[styles.warn, { color: colors.danger }]}>{disabledMessage}</Text> : null}
        <ErrorText>{error}</ErrorText>

        <Pressable
          style={[styles.primary, { backgroundColor: colors.accent }, (unavailable || buying) && styles.disabled]}
          disabled={unavailable || buying}
          onPress={() => void startCheckout()}>
          <Text style={styles.primaryText}>
            {outOfStock ? 'Out of stock' : buying ? 'Please wait…' : 'Buy now'}
          </Text>
        </Pressable>

        {isValidWhatsAppNumber(store?.whatsappNumber) ? (
          <Pressable
            style={[styles.whatsapp, { backgroundColor: colors.whatsapp }, unavailable && styles.disabled]}
            disabled={unavailable || waBusy}
            onPress={() => void startWhatsApp()}>
            <Text style={styles.whatsappText}>{waBusy ? 'Preparing…' : 'Order via WhatsApp'}</Text>
          </Pressable>
        ) : null}

        {product.customProperties?.length ? (
          <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: softBorder }]}>
            <Text style={[styles.detailsTitle, { color: colors.ink }]}>Product details</Text>
            {product.customProperties.map((property, index) => (
              <View
                key={`${property.key}-${index}`}
                style={[styles.detailRow, { borderTopColor: softBorder }]}>
                <Text style={[styles.detailKey, { color: colors.muted }]}>{property.key}</Text>
                <Text style={[styles.detailValue, { color: colors.ink }]}>{property.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.assurance}>
          <View style={[styles.assuranceItem, { backgroundColor: softFill, borderColor: softBorder }]}>
            <Text style={[styles.assuranceTitle, { color: colors.ink }]}>Cash on delivery</Text>
          </View>
          <View style={[styles.assuranceItem, { backgroundColor: softFill, borderColor: softBorder }]}>
            <Text style={[styles.assuranceTitle, { color: colors.ink }]}>Direct support</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={imagePreviewOpen} transparent animationType="fade" onRequestClose={() => setImagePreviewOpen(false)}>
        <Pressable style={styles.previewBackdrop} onPress={() => setImagePreviewOpen(false)}>
          <Pressable
            style={[styles.previewCard, { backgroundColor: colors.card, borderColor: softBorder }]}
            onPress={event => event.stopPropagation()}>
            <Pressable
              style={[styles.previewClose, { backgroundColor: isDark ? 'rgba(2, 8, 22, 0.72)' : 'rgba(18, 56, 78, 0.75)' }]}
              onPress={() => setImagePreviewOpen(false)}
              accessibilityLabel="Close product image">
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
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  heroBox: {
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stockBadge: { left: undefined, right: 12 },
  stockBadgeOk: { left: undefined, right: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  hero: { width: '100%', height: '100%' },
  zoomHint: { position: 'absolute', right: 10, bottom: 10, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  zoomHintText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  thumbs: { gap: 8 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  price: { fontSize: 22, fontWeight: '800' },
  originalPrice: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  originalLabel: { fontSize: 12, fontWeight: '700' },
  compare: { position: 'relative', paddingVertical: 1 },
  compareText: { fontSize: 15 },
  compareStrike: { position: 'absolute', left: 0, right: 0, top: 11, height: 2, borderRadius: 99 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  meta: { fontSize: 12 },
  availability: { fontSize: 12, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tag: { fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  variantBlock: { gap: 8, padding: 10, borderRadius: 14 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '700' },
  qty: { fontSize: 18, fontWeight: '800', minWidth: 24, textAlign: 'center' },
  warn: { fontSize: 13, fontWeight: '600' },
  primary: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  whatsapp: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  detailsCard: { gap: 8, padding: 14, borderRadius: 16, borderWidth: 1 },
  detailsTitle: { fontSize: 16, fontWeight: '800' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 8, borderTopWidth: 1 },
  detailKey: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  assurance: { gap: 8 },
  assuranceItem: { padding: 13, borderRadius: 14, borderWidth: 1 },
  assuranceTitle: { fontSize: 13, fontWeight: '800' },
  previewBackdrop: { flex: 1, padding: 18, justifyContent: 'center', backgroundColor: 'rgba(2, 8, 22, 0.72)' },
  previewCard: { width: '100%', aspectRatio: 0.82, maxHeight: '82%', borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  previewImage: { width: '100%', height: '100%' },
  previewClose: { position: 'absolute', top: 12, right: 12, zIndex: 2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  previewCloseText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.45 },
});
