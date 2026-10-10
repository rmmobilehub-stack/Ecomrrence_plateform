import {
  Image,
  ImageBackground,
  Linking,
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
import Icon from 'react-native-vector-icons/Ionicons';
import { HeaderActions } from '../components/HeaderActions';
import { useStore } from '../context/StoreContext';
import { useAppTheme } from '../context/ThemeContext';
import { resolveMediaUrl } from '../media';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { isValidWhatsAppNumber, normalizeWhatsAppNumber, openWhatsApp } from '../whatsapp';

const logoMark = require('../assets/rm-logo.png');
const aboutHeroFallback = require('../assets/about-hub-hero.png');

const SOCIAL_META: {
  key: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter' | 'website';
  label: string;
  icon: string;
  tone: string;
}[] = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', tone: '#E1306C' },
  { key: 'facebook', label: 'Facebook', icon: 'logo-facebook', tone: '#1877F2' },
  { key: 'tiktok', label: 'TikTok', icon: 'logo-tiktok', tone: '#69C9D0' },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube', tone: '#FF0033' },
  { key: 'twitter', label: 'X / Twitter', icon: 'logo-twitter', tone: '#8B98A5' },
  { key: 'website', label: 'Website', icon: 'globe-outline', tone: '#4DA3FF' },
];

function formatPhoneDisplay(value?: string) {
  const digits = normalizeWhatsAppNumber(value);
  if (!digits) return '';
  if (digits.startsWith('92') && digits.length >= 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return value?.trim() || digits;
}

export function AboutScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'About'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store } = useStore();
  const { colors, isDark } = useAppTheme();
  const aboutImage = resolveMediaUrl(store?.aboutImage || '');
  const title = store?.aboutTitle || 'Complete accessories. One trusted mobile hub.';
  const body =
    store?.aboutDescription ||
    store?.description ||
    'Model-specific protection, chargers, cables and repair support — built for everyday iPhone use.';

  const phone = store?.contactPhone?.trim() || store?.whatsappNumber?.trim() || '';
  const email = store?.contactEmail?.trim() || '';
  const address = store?.contactAddress?.trim() || '';
  const phoneDisplay = formatPhoneDisplay(phone);
  const hasWhatsApp = isValidWhatsAppNumber(store?.whatsappNumber);

  const socials = SOCIAL_META.map(meta => ({
    ...meta,
    href: store?.socialLinks?.[meta.key] || '',
  })).filter(entry => Boolean(entry.href));

  const heroSource = aboutImage ? { uri: aboutImage } : aboutHeroFallback;

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={colors.statusBar} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={logoMark} style={styles.headerLogo} />
            <Text style={[styles.brandName, { color: colors.ink }]}>{store?.name || 'RM Mobile Hub'}</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <ImageBackground source={heroSource} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <View style={styles.kicker}>
                <Icon name="information-circle-outline" size={14} color="#7DD3FC" />
                <Text style={styles.kickerText}>ABOUT THE HUB</Text>
              </View>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSub}>{body}</Text>
              <View style={styles.points}>
                <View style={styles.point}>
                  <Icon name="shield-checkmark-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Clear compatibility</Text>
                </View>
                <View style={styles.point}>
                  <Icon name="card-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Cash on delivery</Text>
                </View>
                <View style={styles.point}>
                  <Icon name="chatbubbles-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Direct support</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.facts}>
            {[
              { strong: 'Easy', muted: 'Simple checkout' },
              { strong: 'COD', muted: 'Pay on delivery' },
              { strong: phone ? 'Direct' : 'Email', muted: 'Personal support' },
            ].map(item => (
              <View
                key={item.strong}
                style={[styles.fact, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.factStrong, { color: colors.ink }]}>{item.strong}</Text>
                <Text style={[styles.factMuted, { color: colors.muted }]}>{item.muted}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>What we help with</Text>
            <View style={styles.pillRow}>
              {['Accessories', 'Phone check', 'Doorstep repair', 'WhatsApp orders'].map(label => (
                <View
                  key={label}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isDark ? 'rgba(47, 123, 255, 0.14)' : '#E6F6FF',
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  <Text style={[styles.pillText, { color: colors.ink }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Connect with us</Text>
            <Text style={[styles.sectionHint, { color: colors.muted }]}>
              Reach {store?.name || 'RM Mobile Hub'} for accessories, phone check or doorstep repair.
            </Text>

            {phoneDisplay ? (
              <Pressable
                style={[styles.detailRow, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(5,14,36,0.45)' : '#F0F9FF' }]}
                onPress={() => {
                  const digits = normalizeWhatsAppNumber(phone);
                  if (digits) {
                    void Linking.openURL(`tel:+${digits}`);
                    return;
                  }
                  void Linking.openURL(`tel:${phone}`);
                }}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(77,163,255,0.16)' : '#E6F6FF' }]}>
                  <Icon name="call-outline" size={18} color={colors.accentSoft} />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Phone</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{phoneDisplay}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.accentSoft} />
              </Pressable>
            ) : null}

            {email ? (
              <Pressable
                style={[styles.detailRow, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(5,14,36,0.45)' : '#F0F9FF' }]}
                onPress={() => void Linking.openURL(`mailto:${email}`)}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(77,163,255,0.16)' : '#E6F6FF' }]}>
                  <Icon name="mail-outline" size={18} color={colors.accentSoft} />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Email</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{email}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.accentSoft} />
              </Pressable>
            ) : null}

            {address ? (
              <View
                style={[styles.detailRow, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(5,14,36,0.45)' : '#F0F9FF' }]}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(77,163,255,0.16)' : '#E6F6FF' }]}>
                  <Icon name="location-outline" size={18} color={colors.accentSoft} />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Address</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>{address}</Text>
                </View>
              </View>
            ) : null}

            {hasWhatsApp ? (
              <Pressable
                style={[styles.detailRow, { borderColor: '#25D366', backgroundColor: isDark ? 'rgba(37,211,102,0.1)' : '#E8FFF1' }]}
                onPress={() =>
                  void openWhatsApp(
                    store?.whatsappNumber,
                    `Hello ${store?.name || 'RM Mobile Hub'}, I would like to know more.`,
                  )
                }>
                <View style={[styles.detailIcon, { backgroundColor: 'rgba(37,211,102,0.16)' }]}>
                  <Icon name="logo-whatsapp" size={20} color="#25D366" />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>WhatsApp</Text>
                  <Text style={[styles.detailValue, { color: colors.ink }]}>
                    {formatPhoneDisplay(store?.whatsappNumber)}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={18} color="#25D366" />
              </Pressable>
            ) : null}

            {!phoneDisplay && !email && !address && !hasWhatsApp && !socials.length ? (
              <Text style={[styles.sectionHint, { color: colors.muted }]}>
                Contact details will appear here once the store admin saves them.
              </Text>
            ) : null}

            {socials.length ? (
              <View style={styles.socialRow}>
                {socials.map(entry => (
                  <Pressable
                    key={entry.key}
                    style={[styles.socialIcon, { borderColor: entry.tone, backgroundColor: colors.bg }]}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${entry.label}`}
                    onPress={() => void Linking.openURL(entry.href)}>
                    <Icon name={entry.icon} size={21} color={entry.tone} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <Pressable onPress={() => navigation.navigate('Shop')} style={[styles.btn, { backgroundColor: colors.accent }]}>
            <Text style={styles.btnText}>Explore the collection →</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Contact')}
            style={[styles.ghost, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.ghostText, { color: colors.ink }]}>Contact store</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Account')}
            style={[styles.ghost, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.ghostText, { color: colors.ink }]}>My account</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 6,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  headerLogo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { fontSize: 16, fontWeight: '800' },
  pad: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  hero: {
    minHeight: 250,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { resizeMode: 'cover' },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 28, 42, 0.72)',
  },
  heroCopy: { position: 'relative', zIndex: 1, padding: 18, gap: 8 },
  kicker: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.35)',
  },
  kickerText: { color: '#7DD3FC', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heroSub: { color: 'rgba(236, 248, 255, 0.92)', fontSize: 13, lineHeight: 19 },
  points: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 165, 233, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.28)',
  },
  pointText: { color: '#E8F7FF', fontSize: 11, fontWeight: '700' },
  facts: { flexDirection: 'row', gap: 8 },
  fact: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  factStrong: { fontWeight: '800', textAlign: 'center', fontSize: 14 },
  factMuted: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
  },
  sectionTitle: { fontWeight: '800', fontSize: 16 },
  sectionHint: { fontSize: 13, lineHeight: 18, marginTop: -4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  pillText: { fontWeight: '700', fontSize: 12 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  detailValue: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  socialIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  ghost: {
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  ghostText: { fontWeight: '700' },
});
