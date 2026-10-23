import { RefreshScrollView as ScrollView } from '../components/PageRefresh';
import { Text } from '../components/AppText';
import { usePageEffect } from '../hooks/usePageEffect';
import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  ScrollView as NativeScrollView,
  AccessibilityInfo,
  Image,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useIsFocused, useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
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

type FeatureItem = {
  title: string;
  blurb: string;
  icon: string;
  target: HomeNavTarget;
};

type JourneyItem = {
  step: string;
  title: string;
  blurb: string;
  target: HomeNavTarget;
};

const VALUES: FeatureItem[] = [
  { title: 'Fast charging', blurb: 'Power that keeps up', icon: 'flash-outline', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Clear compatibility', blurb: 'Know what fits first', icon: 'shield-checkmark-outline', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Cash on delivery', blurb: 'Pay when it arrives', icon: 'bicycle-outline', target: { kind: 'tab', screen: 'Shop' } },
  { title: 'Direct support', blurb: 'Chat when you need help', icon: 'chatbubble-ellipses-outline', target: { kind: 'whatsapp' } },
  { title: 'Phone check', blurb: 'Score before you buy or sell', icon: 'heart-outline', target: { kind: 'tab', screen: 'HealthCheck' } },
  { title: 'Doorstep repair', blurb: 'We come to your address', icon: 'construct-outline', target: { kind: 'tab', screen: 'Repairs' } },
];

const JOURNEY: (JourneyItem & { icon: string })[] = [
  { step: '01', title: 'Choose', blurb: 'Browse accessories or start phone check / repair.', icon: 'flash-outline', target: { kind: 'tab', screen: 'Shop' } },
  { step: '02', title: 'Confirm', blurb: 'Checkout online or message us on WhatsApp.', icon: 'chatbubble-ellipses-outline', target: { kind: 'stack', screen: 'Cart' } },
  { step: '03', title: 'Receive', blurb: 'COD delivery, or doorstep repair at your address.', icon: 'bicycle-outline', target: { kind: 'tab', screen: 'Repairs' } },
];

const CHIP_WIDTH = 300;
const CHIP_GAP = 12;

function announcementChips(announcement?: string) {
  const parts = (announcement || 'Cash on delivery')
    .split(/[•·|]/)
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  return parts.length ? parts : ['Cash on delivery'];
}

function FeatureMarquee({
  items,
  colors,
  onPress,
}: {
  items: FeatureItem[];
  colors: ReturnType<typeof useAppTheme>['colors'];
  onPress: (target: HomeNavTarget) => void;
}) {
  const loop = useMemo(() => [...items, ...items, ...items], [items]);
  const scroll = useRef<ComponentRef<typeof NativeScrollView>>(null);
  const position = useRef(0);
  const pausedUntil = useRef(0);
  const interacting = useRef(false);
  const isFocused = useIsFocused();
  const segment = items.length * (CHIP_WIDTH + CHIP_GAP);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (!isFocused || reducedMotion || !segment) return;
    const timer = setInterval(() => {
      if (interacting.current || Date.now() < pausedUntil.current) return;
      position.current = (position.current + 1.4) % segment;
      scroll.current?.scrollTo({ x: position.current, animated: false });
    }, 32);
    return () => clearInterval(timer);
  }, [isFocused, reducedMotion, segment]);
  const pause = () => { pausedUntil.current = Date.now() + 5000; };

  return (
    <View style={styles.marqueeClip}>
      <NativeScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.marqueeTrack}
        scrollEventThrottle={16}
        onScroll={event => {
          if (interacting.current || Date.now() < pausedUntil.current) {
            position.current = Math.max(0, event.nativeEvent.contentOffset.x);
          }
        }}
        onTouchStart={() => { interacting.current = true; pause(); }}
        onTouchEnd={() => { interacting.current = false; pause(); }}
        onTouchCancel={() => { interacting.current = false; pause(); }}
        onScrollBeginDrag={() => { interacting.current = true; pause(); }}
        onScrollEndDrag={() => { interacting.current = false; pause(); }}
        onMomentumScrollBegin={() => { interacting.current = true; }}
        onMomentumScrollEnd={() => { interacting.current = false; pause(); }}
      >
        {loop.map((item, index) => (
          <Pressable
            key={`${item.title}-${index}`}
            onPress={() => onPress(item.target)}
            style={[
              styles.featureChip,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent }]}>
              <Icon name={item.icon as 'flash-outline'} size={16} color="#FFFFFF" />
            </View>
            <View style={styles.featureCopy}>
              <Text style={[styles.featureTitle, { color: colors.ink }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.featureBlurb, { color: colors.muted }]} numberOfLines={1}>
                {item.blurb}
              </Text>
            </View>
            <Text style={[styles.featureArrow, { color: colors.accentSoft }]}>→</Text>
          </Pressable>
        ))}
      </NativeScrollView>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store, currency } = useStore();
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Product[]>([]);

  usePageEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts({ sortBy: 'newest' })
      .then(data => { if (active) setFeatured((data.products || []).slice(0, 4)); })
      .catch(() => { if (active) setFeatured([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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

        {loading && <ActivityIndicator accessibilityLabel="Loading home" color={colors.accent} />}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator>
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
            <Text style={[styles.kicker, { color: colors.accentSoft }]}>POWER & PROTECTION</Text>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              Everything your iPhone needs,{' '}
              <Text style={[styles.accent, { color: colors.accentSoft }]}>in one place.</Text>
            </Text>
            <Text style={[styles.sectionSub, { color: colors.muted }]}>
              Accessories, phone check and doorstep repair — clear details and cash on delivery.
            </Text>
            <FeatureMarquee items={VALUES} colors={colors} onPress={openTarget} />
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
            <Text style={[styles.kicker, { color: colors.accentSoft }]}>HOW IT WORKS</Text>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              Shop, check or repair —{' '}
              <Text style={[styles.accent, { color: colors.accentSoft }]}>simple steps.</Text>
            </Text>
            <Text style={[styles.sectionSub, { color: colors.muted }]}>
              Pick what you need, confirm online or on WhatsApp, and get help at your door.
            </Text>
            <View style={styles.journeyStack}>
              {JOURNEY.map(item => (
                <Pressable
                  key={item.title}
                  onPress={() => openTarget(item.target)}
                  style={[
                    styles.journeyCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}>
                  <Text style={[styles.journeyWatermark, { color: colors.accent }]}>{item.step}</Text>
                  <View style={[styles.journeyIcon, { backgroundColor: colors.accent }]}>
                    <Icon name={item.icon as 'flash-outline'} size={18} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.journeyTitle, { color: colors.ink }]}>{item.title}</Text>
                  <Text style={[styles.journeyBlurb, { color: colors.muted }]}>{item.blurb}</Text>
                  <Text style={[styles.journeyGo, { color: colors.accentSoft }]}>Continue →</Text>
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
  sectionSub: { fontSize: 13, lineHeight: 19, marginTop: -2, marginBottom: 4 },
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
  marqueeClip: {
    marginHorizontal: -16,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  marqueeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CHIP_GAP,
    paddingHorizontal: 16,
  },
  featureChip: {
    width: CHIP_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: { flex: 1, minWidth: 0, gap: 3 },
  featureTitle: { fontWeight: '800', fontSize: 16 },
  featureBlurb: { fontSize: 13, fontWeight: '600' },
  featureArrow: { fontWeight: '800', fontSize: 16 },
  journeyStack: { gap: 12 },
  journeyCard: {
    position: 'relative',
    overflow: 'hidden',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  journeyWatermark: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 42,
    fontWeight: '900',
    opacity: 0.16,
  },
  journeyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyTitle: { fontWeight: '800', fontSize: 17 },
  journeyBlurb: { fontSize: 13, lineHeight: 18 },
  journeyGo: { marginTop: 2, fontWeight: '800', fontSize: 13 },
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
