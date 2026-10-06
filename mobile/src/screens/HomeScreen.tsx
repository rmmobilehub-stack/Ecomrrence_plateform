import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProducts } from '../api';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { colors, space } from '../theme';
import type { Product } from '../types';
import { Card, Chip, ErrorText, LoadingBlock, Muted, PrimaryButton, RemoteImage, ScreenWrap, Subtitle, Title } from '../ui';
import { useEffect, useState } from 'react';
import type { RootStackParamList, TabParamList } from '../navigation/types';

export function HomeScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store, loading, error, accent, currency, reload } = useStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts({ sortBy: 'newest' })
      .then(data => setProducts((data.products || []).slice(0, 8)))
      .catch(() => undefined);
  }, []);

  if (loading) {
    return (
      <ScreenWrap>
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  if (error || !store) {
    return (
      <ScreenWrap style={styles.pad}>
        <Title>Store unavailable</Title>
        <ErrorText>{error || 'Store not found'}</ErrorText>
        <View style={{ height: 12 }} />
        <PrimaryButton label="Retry" onPress={reload} color={accent} />
      </ScreenWrap>
    );
  }

  const chips = (store.announcement || 'Cash on delivery')
    .split(/[•·|]/)
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  const ads = (store.ads || []).filter(ad => ad.isActive && ad.type === 'image').slice(0, 4);

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>{store.name}</Title>
        <Subtitle>{store.heroTitle || store.description || 'Shop the collection'}</Subtitle>
        <View style={styles.row}>
          {chips.map(chip => (
            <Chip key={chip} label={chip} selected />
          ))}
        </View>
        <PrimaryButton
          label={store.heroCtaLabel || 'Shop collection'}
          onPress={() => navigation.navigate('Shop')}
          color={accent}
        />
        <View style={{ height: 10 }} />
        <Pressable onPress={() => navigation.navigate('PhoneCheck')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Free phone check</Text>
        </Pressable>

        {ads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Now on</Text>
            {ads.map(ad => (
              <Card key={ad.id} style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
                <RemoteImage uri={ad.mediaUrl} style={styles.banner} />
                {!!ad.title && <Text style={styles.adTitle}>{ad.title}</Text>}
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          {products.map(product => {
            const sale = calculateProductPrice(product.price, product.discount);
            const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
            return (
              <Pressable key={product.id} onPress={() => navigation.navigate('Product', { productId: product.id })}>
                <Card style={styles.productRow}>
                  <RemoteImage uri={product.thumbnail || product.images?.[0]} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={{ color: accent, fontWeight: '700' }}>{formatMoney(sale, currency)}</Text>
                    {compare > sale ? <Muted>{formatMoney(compare, currency)}</Muted> : null}
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>

        {(store.aboutTitle || store.aboutDescription) && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{store.aboutTitle || 'About'}</Text>
            {!!store.aboutDescription && <Subtitle>{store.aboutDescription}</Subtitle>}
          </Card>
        )}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  linkBtn: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: colors.ink, fontWeight: '700' },
  section: { marginTop: 18, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  banner: { width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  adTitle: { padding: 12, fontWeight: '600', color: colors.ink },
  productRow: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.line },
  productName: { fontWeight: '700', color: colors.ink, marginBottom: 4 },
});
