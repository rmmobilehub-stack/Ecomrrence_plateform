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
import { useAppTheme } from '../context/ThemeContext';
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

type HomeNavTarget =
  | { kind: 'tab'; screen: keyof TabParamList }
  | { kind: 'stack'; screen: 'Contact' | 'Cart' }
  | { kind: 'whatsapp' };

const VALUES: { title: string; target: HomeNavTarget }[] = [
  { title: 'Fast charging', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Compatibility', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Cash on delivery', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Direct support', target: { kind: 'whatsapp' } },
];

const JOURNEY: { title: string; target: HomeNavTarget }[] = [
  { title: 'Choose', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Confirm', target: { kind: 'stack', screen: 'Cart' } },
  { title: 'Receive', target: { kind: 'tab', screen: 'About' } },
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
  const { colors, isDark } = useAppTheme();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts({ sortBy: 'newest' })
      .then(data => setFeatured((data.products || []).slice(0, 6)))
      .catch(() => setFeatured([]));
  }, []);

  const chips = useMemo(() => announcementChips(store?.announcement), [store?.announcement]);
  const heroTitle = store?.heroTitle || 'Protection and power for every iPhone.';
  const ctaLabel = store?.heroCtaLabel || 'Shop accessories';
  const aboutTitle = store?.aboutTitle || `Meet ${store?.name || 'RM Mobile Hub'}.`;

  const openTarget = (target: HomeNavTarget) => {
    if (target.kind === 'tab') {
      navigation.navigate(target.screen);
      return;
    }
    if (target.kind === 'stack') {
      navigation.navigate(target.screen);
      return;
    }
    if (isValidWhatsAppNumber(store?.whatsappNumber)) {
      void openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || 'RM Mobile Hub'}, I need help.`);
      return;
    }
    navigation.navigate('Contact');
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={[styles.brandName, { color: colors.ink }]}>{store?.name || 'RM Mobile Hub'}</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.headline} numberOfLines={3}>
                {heroTitle}
              </Text>
              <Pressable onPress={() => navigation.navigate('Shop')} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>{ctaLabel}</Text>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
              <View style={styles.heroBtnRow}>
                <Pressable onPress={() => navigation.navigate('HealthCheck')} style={styles.secondaryBtn}>
                  <HeartGlyph color="#7EC8FF" />
                  <Text style={styles.secondaryText}>Phone check</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Repairs')} style={styles.secondaryBtn}>
                  <Icon name="construct-outline" size={16} color="#7EC8FF" />
                  <Text style={styles.secondaryText}>Repairs</Text>
                </Pressable>
              </View>
              <View style={styles.trustRow}>
                <Text style={styles.trustItem}>COD</Text>
                <Text style={styles.trustDot}>•</Text>
                <Text style={styles.trustItem}>Compatibility</Text>
                <Text style={styles.trustDot}>•</Text>
                <Text style={styles.trustItem}>Support</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: colors.ink }]}>
                  Featured <Text style={[styles.accent, { color: colors.accentSoft }]}>essentials</Text>
                </Text>
              </View>
              <Pressable onPress={() => navigation.navigate('Shop')}>
                <Text style={[styles.link, { color: colors.accentSoft }]}>View all →</Text>
              </Pressable>
            </View>
            {featured.length === 0 ? (
              <Text style={[styles.empty, { color: colors.muted }]}>No products yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
                {featured.map(product => {
                  const sale = calculateProductPrice(product.price, product.discount);
                  const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
                  const thumb = resolveMediaUrl(product.thumbnail || product.images?.[0] || '');
                  return (
                    <Pressable
                      key={product.id}
                      style={[
                        styles.productCard,
                        { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      ]}
                      onPress={() => navigation.navigate('Product', { productId: product.id })}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.productThumb} resizeMode="contain" />
                      ) : (
                        <View style={[styles.productThumb, { backgroundColor: isDark ? '#08182F' : '#E6F6FF' }]} />
                      )}
                      <Text style={[styles.productName, { color: colors.ink }]} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={[styles.productPrice, { color: colors.accentSoft }]}>{formatMoney(sale, currency)}</Text>
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

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              Why shop <Text style={[styles.accent, { color: colors.accentSoft }]}>here</Text>
            </Text>
            <View style={styles.valuesGrid}>
              {VALUES.map(item => (
                <Pressable
                  key={item.title}
                  onPress={() => openTarget(item.target)}
                  style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.valueTitle, { color: colors.ink }]}>{item.title}</Text>
                  <Text style={[styles.cardArrow, { color: colors.accentSoft }]}>→</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.section,
              styles.aboutCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Text style={[styles.kicker, { color: colors.accentSoft }]}>About {store?.name || 'RM Mobile Hub'}</Text>
            <Text style={[styles.aboutTitle, { color: colors.ink }]} numberOfLines={2}>
              {aboutTitle}
            </Text>
            <View style={styles.aboutActions}>
              <Pressable
                onPress={() => navigation.navigate('About')}
                style={[styles.ghostBtn, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.ghostText, { color: colors.ink }]}>Learn more →</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Repairs')}
                style={[styles.ghostBtn, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.ghostText, { color: colors.ink }]}>Repairs →</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              How it <Text style={[styles.accent, { color: colors.accentSoft }]}>works</Text>
            </Text>
            <View style={styles.valuesGrid}>
              {JOURNEY.map(item => (
                <Pressable
                  key={item.title}
                  onPress={() => openTarget(item.target)}
                  style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.valueTitle, { color: colors.ink }]}>{item.title}</Text>
                  <Text style={[styles.cardArrow, { color: colors.accentSoft }]}>→</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.section,
              styles.ctaCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              Shop or <Text style={[styles.accent, { color: colors.accentSoft }]}>book a repair</Text>
            </Text>
            <View style={styles.ctaRow}>
              <Pressable
                onPress={() => navigation.navigate('Shop')}
                style={[styles.primaryBtn, { backgroundColor: colors.accent }]}>
                <Text style={styles.primaryText}>Shop</Text>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Repairs')}
                style={[
                  styles.secondaryBtn,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: isDark ? 'rgba(8, 28, 58, 0.55)' : '#F0F9FF',
                  },
                ]}>
                <Text style={[styles.secondaryText, { color: colors.ink }]}>Repairs</Text>
                <Text style={[styles.arrowMuted, { color: colors.accentSoft }]}>→</Text>
              </Pressable>
              {isValidWhatsAppNumber(store?.whatsappNumber) ? (
                <Pressable
                  style={styles.ctaWhatsApp}
                  accessibilityRole="button"
                  accessibilityLabel="Chat on WhatsApp"
                  onPress={() =>
                    void openWhatsApp(
                      store?.whatsappNumber,
                      `Hello ${store?.name || 'RM Mobile Hub'}, I need help.`,
                    )
                  }>
                  <Icon name="logo-whatsapp" size={22} color="#FFFFFF" />
                </Pressable>
              ) : null}
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
    minHeight: 320,
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
  headline: { color: '#F7FBFF', fontSize: 26, fontWeight: '800', lineHeight: 32, letterSpacing: -0.5 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#2F7BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginTop: 2,
  },
  primaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  arrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  arrowMuted: { color: '#9CC7FF', fontSize: 16, fontWeight: '700' },
  heroBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  secondaryText: { color: '#EAF3FF', fontWeight: '700', fontSize: 13 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 },
  trustItem: { color: '#A8C0DA', fontSize: 12, fontWeight: '600' },
  trustDot: { color: '#4DA3FF' },
  section: { paddingHorizontal: 16, paddingTop: 22, gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: '#F7FBFF', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  aboutTitle: { color: '#F7FBFF', fontSize: 17, fontWeight: '800', lineHeight: 23 },
  accent: { color: '#4DA3FF' },
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
  productCompareStrike: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 8,
    height: 2,
    borderRadius: 99,
    backgroundColor: '#5F86B6',
  },
  productWas: { color: '#6B86A8', fontSize: 10, fontWeight: '700' },
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valueCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueTitle: { fontWeight: '800', fontSize: 14, flex: 1 },
  cardArrow: { fontWeight: '700', fontSize: 16 },
  aboutCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  aboutActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  ghostBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  ghostText: { fontWeight: '700', fontSize: 13 },
  ctaCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  ctaWhatsApp: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
});
