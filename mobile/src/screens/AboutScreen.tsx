import { RefreshScrollView as ScrollView } from '../components/PageRefresh';
import { Text } from '../components/AppText';
import {
  Alert,
  Platform,
  Image,
  ImageBackground,
  Linking,
  Pressable,

  StatusBar,
  StyleSheet,
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

        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator>
          <ImageBackground source={heroSource} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <View style={styles.kicker}>
                <Icon name="information-circle-outline" size={14} color="#7DD3FC" />
                <Text style={styles.kickerText}>ABOUT THE HUB</Text>
              </View>
              <Text style={styles.heroTitle}>{title}</Text>
              <View style={styles.points}>
                <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Shop')} style={styles.point}>
                  <Icon name="shield-checkmark-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Clear compatibility</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Cart')} style={styles.point}>
                  <Icon name="card-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Cash on delivery</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Contact')} style={styles.point}>
                  <Icon name="chatbubbles-outline" size={13} color="#BFE5FF" />
                  <Text style={styles.pointText}>Direct support</Text>
                </Pressable>
              </View>
            </View>
          </ImageBackground>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Connect with us</Text>

            <View style={styles.contactActions}>
            {phoneDisplay ? (
              <Pressable
                accessibilityRole="button"
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
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Call</Text>
                </View>
              </Pressable>
            ) : null}

            {email ? (
              <Pressable
                accessibilityRole="button"
                style={[styles.detailRow, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(5,14,36,0.45)' : '#F0F9FF' }]}
                onPress={() => void Linking.openURL(`mailto:${email}`)}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(77,163,255,0.16)' : '#E6F6FF' }]}>
                  <Icon name="mail-outline" size={18} color={colors.accentSoft} />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Email</Text>
                </View>
              </Pressable>
            ) : null}

            {address ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Get directions to store"
                onPress={() => Alert.alert('Directions to store', 'Allow Maps to use your current location to calculate directions? Maps may ask for location permission.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Continue', onPress: () => {
                    const destination = encodeURIComponent(address);
                    const url = Platform.OS === 'ios'
                      ? `https://maps.apple.com/?daddr=${destination}&dirflg=d`
                      : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
                    void Linking.openURL(url).catch(() => Alert.alert('Maps unavailable', 'Please try again or open your maps app.'));
                  } },
                ])}
                style={[styles.detailRow, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(5,14,36,0.45)' : '#F0F9FF' }]}>
                <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(77,163,255,0.16)' : '#E6F6FF' }]}>
                  <Icon name="location-outline" size={18} color={colors.accentSoft} />
                </View>
                <View style={styles.detailCopy}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Maps</Text>
                </View>
              </Pressable>
            ) : null}

            {hasWhatsApp ? (
              <Pressable
                accessibilityRole="button"
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
                </View>
              </Pressable>
            ) : null}

            </View>

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
  pad: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 104, gap: 16 },
  hero: {
    minHeight: 200,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: { resizeMode: 'cover' },
  heroShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 28, 42, 0.72)',
  },
  heroCopy: { position: 'relative', zIndex: 1, padding: 18, gap: 12 },
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
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 28 },
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
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 16,
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
  contactActions: { flexDirection: 'row', gap: 8 },
  detailRow: {
    flex: 1,
    minWidth: 0,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 2,
    paddingVertical: 10,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { alignItems: 'center' },
  detailLabel: { fontSize: 10, fontWeight: '700' },
  detailValue: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 0,
    paddingTop: 4,
  },
  socialIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btn: {
    marginTop: 'auto',
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
