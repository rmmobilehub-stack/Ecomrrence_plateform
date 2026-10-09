import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProducts } from '../api';
import { useStore } from '../context/StoreContext';
import { HeaderActions } from '../components/HeaderActions';
import { resolveMediaUrl } from '../media';
import { formatMoney } from '../money';
import { HeartGlyph } from '../navigation/icons';
import Icon from 'react-native-vector-icons/Ionicons';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import type { Product } from '../types';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

const heroArt = require('../assets/home-hero.jpg');
const logoMark = require('../assets/rm-logo.png');

const VALUES = [
  { id: '01', title: 'Fast charging', body: 'Everyday power accessories.' },
  { id: '02', title: 'Clear compatibility', body: 'Pick with confidence.' },
  { id: '03', title: 'Cash on delivery', body: 'Pay when it arrives.' },
  { id: '04', title: 'Direct support', body: 'Chat & WhatsApp help.' },
];

const JOURNEY = [
  { id: '01', title: 'Choose', body: 'Find the right accessory.' },
  { id: '02', title: 'Confirm', body: 'Checkout or WhatsApp.' },
  { id: '03', title: 'Receive', body: 'Pay on delivery.' },
];

function announcementChips(announcement?: string) {
  const parts = (announcement || 'Cash on delivery')
    .split(/[•·|]/)
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  return parts.length ? parts : ['Cash on delivery'];
}

export function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store, currency } = useStore();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts({ sortBy: 'newest' })
      .then(data => setFeatured((data.products || []).slice(0, 6)))
      .catch(() => setFeatured([]));
  }, []);

  const chips = useMemo(() => announcementChips(store?.announcement), [store?.announcement]);
  const heroTitle = store?.heroTitle || 'Protection and power for every iPhone.';
  const heroDesc =
    store?.description || 'Protective cases, fast chargers and dependable cables for your Apple setup.';
  const ctaLabel = store?.heroCtaLabel || 'Shop mobile accessories';
  const aboutTitle = store?.aboutTitle || `Meet ${store?.name || 'RM Mobile Hub'}.`;
  const aboutBody =
    store?.aboutDescription ||
    store?.description ||
    'Model-specific protection, chargers and cables — with repair and phone check in one hub.';

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={styles.brandName}>{store?.name || 'RM Mobile Hub'}</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <ImageBackground source={heroArt} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <View style={styles.chipRow}>
                {chips.map(chip => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.headline}>{heroTitle}</Text>
              <Text style={styles.sub}>{heroDesc}</Text>
              <View style={styles.heroActionRow}>
                <Pressable onPress={() => navigation.navigate('Shop')} style={styles.primaryBtn}>
                  <Text style={styles.primaryText}>{ctaLabel}</Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
                {isValidWhatsAppNumber(store?.whatsappNumber) ? (
                  <Pressable
                    style={styles.heroWhatsApp}
                    accessibilityRole="button"
                    accessibilityLabel="Chat with us on WhatsApp"
                    onPress={() => void openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || 'RM Mobile Hub'}, I need help with an accessory.`)}>
                    <Icon name="logo-whatsapp" size={23} color="#FFFFFF" />
                  </Pressable>
                ) : null}
              </View>
              <Pressable onPress={() => navigation.navigate('HealthCheck')} style={styles.secondaryBtn}>
                <HeartGlyph color="#7EC8FF" />
                <Text style={styles.secondaryText}>Free phone check</Text>
                <Text style={styles.arrowMuted}>→</Text>
              </Pressable>
              <View style={styles.trustRow}>
                <Text style={styles.trustItem}>Cash on delivery</Text>
                <Text style={styles.trustDot}>•</Text>
                <Text style={styles.trustItem}>Clear compatibility</Text>
                <Text style={styles.trustDot}>•</Text>
                <Text style={styles.trustItem}>Direct support</Text>
              </View>
            </View>
          </ImageBackground>

          {/* Featured */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  Featured charging <Text style={styles.accent}>essentials</Text>
                </Text>
                <Text style={styles.sectionSub}>Fast chargers, durable cables and magnetic accessories.</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Shop')}>
                <Text style={styles.link}>View all →</Text>
              </Pressable>
            </View>
            {featured.length === 0 ? (
              <Text style={styles.empty}>Products load from the same store backend as the website.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                {featured.map(product => {
                  const sale = calculateProductPrice(product.price, product.discount);
                  const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
                  const thumb = resolveMediaUrl(product.thumbnail || product.images?.[0] || '');
                  return (
                    <Pressable
                      key={product.id}
                      style={styles.productCard}
                      onPress={() => navigation.navigate('Product', { productId: product.id })}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.productThumb} resizeMode="contain" />
                      ) : (
                        <View style={styles.productThumb} />
                      )}
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>{formatMoney(sale, currency)}</Text>
                      {compare > sale ? (
                        <View style={styles.productCompareRow}>
                          <Text style={styles.productWas}>Was</Text>
                          <View style={styles.productCompare}>
                            <Text style={styles.productCompareText}>{formatMoney(compare, currency)}</Text>
                            <View pointerEvents="none" style={styles.productCompareStrike} />
                          </View>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Values — compact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Everything your iPhone needs, <Text style={styles.accent}>in one place.</Text>
            </Text>
            <View style={styles.valuesGrid}>
              {VALUES.map(item => (
                <View key={item.id} style={styles.valueCard}>
                  <Text style={styles.valueIndex}>{item.id}</Text>
                  <Text style={styles.valueTitle}>{item.title}</Text>
                  <Text style={styles.valueBody}>{item.body}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About — compact */}
          <View style={[styles.section, styles.aboutCard]}>
            <Text style={styles.kicker}>About {store?.name || 'RM Mobile Hub'}</Text>
            <Text style={styles.aboutTitle}>{aboutTitle}</Text>
            <Text style={styles.sectionSub} numberOfLines={3}>
              {aboutBody}
            </Text>
            <View style={styles.factRow}>
              <View style={styles.fact}>
                <Text style={styles.factStrong}>Easy</Text>
                <Text style={styles.factMuted}>Checkout</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factStrong}>COD</Text>
                <Text style={styles.factMuted}>On delivery</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factStrong}>Direct</Text>
                <Text style={styles.factMuted}>Support</Text>
              </View>
            </View>
            <Pressable onPress={() => navigation.navigate('About')} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>Learn more →</Text>
            </Pressable>
          </View>

          {/* Journey — compact row */}
          <View style={styles.section}>
            <Text style={styles.kicker}>How it works</Text>
            <View style={styles.journeyRow}>
              {JOURNEY.map(step => (
                <View key={step.id} style={styles.journeyPill}>
                  <Text style={styles.journeyIndex}>{step.id}</Text>
                  <Text style={styles.journeyTitle}>{step.title}</Text>
                  <Text style={styles.journeyBody}>{step.body}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bottom CTA */}
          <View style={[styles.section, styles.ctaCard]}>
            <Text style={styles.sectionTitle}>
              Shop accessories or <Text style={styles.accent}>book a repair</Text>
            </Text>
            <View style={styles.ctaRow}>
              <Pressable onPress={() => navigation.navigate('Shop')} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Shop</Text>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Repairs')} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Repairs</Text>
                <Text style={styles.arrowMuted}>→</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050E24' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 4,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 44, height: 44, borderRadius: 14 },
  brandName: { color: '#F4F8FF', fontSize: 17, fontWeight: '800' },
  scroll: { paddingBottom: 120 },
  hero: {
    minHeight: 360,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { resizeMode: 'cover' },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 14, 36, 0.55)',
  },
  heroCopy: { padding: 20, gap: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(47, 123, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.35)',
  },
  chipText: { color: '#D7E7FF', fontSize: 11, fontWeight: '700' },
  headline: { color: '#F7FBFF', fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5 },
  sub: { color: '#C5D5EC', fontSize: 14, lineHeight: 21 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2F7BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginTop: 4,
  },
  heroActionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  heroWhatsApp: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  arrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  secondaryText: { color: '#EAF3FF', fontWeight: '700', fontSize: 14 },
  arrowMuted: { color: '#9CC7FF', fontSize: 16, fontWeight: '700' },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 },
  trustItem: { color: '#A8C0DA', fontSize: 12, fontWeight: '600' },
  trustDot: { color: '#4DA3FF' },
  section: { paddingHorizontal: 16, paddingTop: 22, gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: '#F7FBFF', fontSize: 22, fontWeight: '800', lineHeight: 28 },
  aboutTitle: { color: '#F7FBFF', fontSize: 18, fontWeight: '800', lineHeight: 24 },
  accent: { color: '#4DA3FF' },
  sectionSub: { color: '#C5D5EC', fontSize: 13, lineHeight: 19 },
  link: { color: '#8EC8FF', fontWeight: '700', marginTop: 4 },
  empty: { color: '#A8C0DA', fontSize: 13 },
  featuredRow: { gap: 12, paddingRight: 8 },
  productCard: {
    width: 160,
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
  },
  productThumb: { width: '100%', height: 110, borderRadius: 12, backgroundColor: '#08182F' },
  productName: { color: '#F4F8FF', fontWeight: '700', fontSize: 13, marginTop: 8, minHeight: 34 },
  productPrice: { color: '#8EC8FF', fontWeight: '800', fontSize: 13, marginTop: 4 },
  productCompareRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  productCompare: { position: 'relative', paddingVertical: 1 },
  productCompareText: { color: '#7596BE', fontSize: 11 },
  productCompareStrike: { position: 'absolute', left: 0, right: 0, top: 8, height: 2, borderRadius: 99, backgroundColor: '#5F86B6' },
  productWas: { color: '#6B86A8', fontSize: 10, fontWeight: '700' },
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valueCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
    gap: 4,
  },
  valueIndex: { color: '#4DA3FF', fontWeight: '800', fontSize: 11 },
  valueTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 14 },
  valueBody: { color: '#A8C0DA', fontSize: 11, lineHeight: 15 },
  aboutCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 28, 56, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.25)',
  },
  factRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  fact: { flex: 1 },
  factStrong: { color: '#F7FBFF', fontWeight: '800', fontSize: 13 },
  factMuted: { color: '#A8C0DA', fontSize: 11, marginTop: 2 },
  ghostBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.4)',
  },
  ghostText: { color: '#EAF3FF', fontWeight: '700' },
  journeyRow: { flexDirection: 'row', gap: 8 },
  journeyPill: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
    gap: 4,
  },
  journeyIndex: { color: '#4DA3FF', fontWeight: '800', fontSize: 12 },
  journeyTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 14 },
  journeyBody: { color: '#A8C0DA', fontSize: 11, lineHeight: 15 },
  ctaCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(47, 123, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
});
