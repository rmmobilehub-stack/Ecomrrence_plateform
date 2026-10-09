import { Image, Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../context/StoreContext';
import { resolveMediaUrl } from '../media';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';

const logoMark = require('../assets/rm-logo.png');

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

export function AboutScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'About'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store } = useStore();
  const aboutImage = resolveMediaUrl(store?.aboutImage || '');
  const title = store?.aboutTitle || `Complete accessories.\nOne trusted mobile hub.`;
  const body =
    store?.aboutDescription ||
    store?.description ||
    'Model-specific protection, chargers, cables and repair support — built for everyday iPhone use.';

  const socials = SOCIAL_META.map(meta => ({
    ...meta,
    href: store?.socialLinks?.[meta.key] || '',
  })).filter(entry => Boolean(entry.href));

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Image source={logoMark} style={styles.headerLogo} />
          <Text style={styles.brandName}>{store?.name || 'RM Mobile Hub'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}>
          <View style={styles.brandCard}>
            {aboutImage ? (
              <Image source={{ uri: aboutImage }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={styles.coverFallback}>
                <Image source={logoMark} style={styles.coverLogo} />
              </View>
            )}
            <View style={styles.brandCopy}>
              <Text style={styles.kicker}>ABOUT THE HUB</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>
          </View>

          <View style={styles.facts}>
            <View style={styles.fact}>
              <Text style={styles.factStrong}>Easy</Text>
              <Text style={styles.factMuted}>Simple checkout</Text>
            </View>
            <View style={styles.fact}>
              <Text style={styles.factStrong}>COD</Text>
              <Text style={styles.factMuted}>Pay on delivery</Text>
            </View>
            <View style={styles.fact}>
              <Text style={styles.factStrong}>{store?.whatsappNumber ? 'Direct' : 'Email'}</Text>
              <Text style={styles.factMuted}>Personal support</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What we help with</Text>
            <View style={styles.pillRow}>
              {['Accessories', 'Phone check', 'Doorstep repair', 'WhatsApp orders'].map(label => (
                <View key={label} style={styles.pill}>
                  <Text style={styles.pillText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Connect with us</Text>
            {socials.length ? (
              <View style={styles.socialRow}>
                {socials.map(entry => (
                  <Pressable
                    key={entry.key}
                    style={[styles.socialIcon, { borderColor: entry.tone }]}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${entry.label}`}
                    onPress={() => void Linking.openURL(entry.href)}>
                    <Icon name={entry.icon} size={21} color={entry.tone} />
                  </Pressable>
                ))}
                {isValidWhatsAppNumber(store?.whatsappNumber) ? (
                  <Pressable
                    style={[styles.socialIcon, styles.whatsappIcon]}
                    accessibilityRole="button"
                    accessibilityLabel="Chat with us on WhatsApp"
                    onPress={() =>
                      void openWhatsApp(
                        store?.whatsappNumber,
                        `Hello ${store?.name || ''}, I would like to know more about your products.`,
                      )
                    }>
                    <Icon name="logo-whatsapp" size={22} color="#25D366" />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text style={styles.emptySocial}>Social links will appear here once the store adds them.</Text>
            )}
            {!socials.length && isValidWhatsAppNumber(store?.whatsappNumber) ? (
              <Pressable
                style={[styles.socialIcon, styles.whatsappIcon]}
                accessibilityRole="button"
                accessibilityLabel="Chat with us on WhatsApp"
                onPress={() => void openWhatsApp(store?.whatsappNumber, `Hello ${store?.name || ''}, I would like to know more about your products.`)}>
                <Icon name="logo-whatsapp" size={22} color="#25D366" />
              </Pressable>
            ) : null}
          </View>

          <Pressable onPress={() => navigation.navigate('Shop')} style={styles.btn}>
            <Text style={styles.btnText}>Explore the collection →</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Contact')} style={styles.ghost}>
            <Text style={styles.ghostText}>Contact store</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Account')} style={styles.ghost}>
            <Text style={styles.ghostText}>My account</Text>
          </Pressable>
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
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 6,
  },
  headerLogo: { width: 42, height: 42, borderRadius: 13 },
  brandName: { color: '#F4F8FF', fontSize: 16, fontWeight: '800' },
  pad: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  brandCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 28, 56, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  cover: { width: '100%', height: 160 },
  coverFallback: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 123, 255, 0.12)',
  },
  coverLogo: { width: 72, height: 72, borderRadius: 20 },
  brandCopy: { padding: 16, gap: 8 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#F7FBFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  body: { color: '#C5D5EC', fontSize: 14, lineHeight: 21 },
  facts: { flexDirection: 'row', gap: 8 },
  fact: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
  },
  factStrong: { color: '#F7FBFF', fontWeight: '800', textAlign: 'center', fontSize: 14 },
  factMuted: { color: '#A8C0DA', fontSize: 11, textAlign: 'center', marginTop: 4 },
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(10, 28, 56, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.24)',
  },
  sectionTitle: { color: '#F7FBFF', fontWeight: '800', fontSize: 16 },
  sectionSub: { color: '#A8C0DA', fontSize: 13, lineHeight: 18, marginTop: -4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(47, 123, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  pillText: { color: '#D7E7FF', fontWeight: '700', fontSize: 12 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexWrap: 'wrap',
  },
  socialIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(5, 14, 36, 0.55)',
  },
  whatsappIcon: { borderColor: '#25D366', backgroundColor: 'rgba(37, 211, 102, 0.1)' },
  emptySocial: { color: '#A8C0DA', fontSize: 13, lineHeight: 19 },
  btn: {
    backgroundColor: '#2F7BFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  ghost: {
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  ghostText: { color: '#EAF3FF', fontWeight: '700' },
});
