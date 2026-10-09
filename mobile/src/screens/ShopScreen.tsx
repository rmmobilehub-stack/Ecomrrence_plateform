import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProducts } from '../api';
import { SelectField } from '../components/SelectField';
import { useStore } from '../context/StoreContext';
import { HeaderActions } from '../components/HeaderActions';
import { resolveMediaUrl } from '../media';
import { formatMoney } from '../money';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import type { Category, Product } from '../types';

const logoMark = require('../assets/rm-logo.png');

export function ShopScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Shop'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { currency } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchProducts({
      search: search.trim() || undefined,
      categoryId: category || undefined,
      sortBy: sort,
    })
      .then(data => {
        if (cancelled) return;
        setProducts(data.products || []);
        setCategories(data.categories || []);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load products');
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, category, sort]);

  const categoryOptions = useMemo(
    () => [{ id: '', label: 'All categories' }, ...categories.map(entry => ({ id: entry.id, label: entry.name }))],
    [categories],
  );
  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'price-asc', label: 'Price: low to high' },
    { id: 'price-desc', label: 'Price: high to low' },
  ];

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={styles.brandName}>RM Mobile Hub</Text>
          </View>
          <HeaderActions onCart={() => navigation.navigate('Cart')} onAccount={() => navigation.navigate('Account')} />
        </View>

        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <View style={styles.collectionIntro}>
            <Text style={styles.kicker}>APPLE-COMPATIBLE ACCESSORIES</Text>
            <Text style={styles.title}>
              Chargers, cables{'\n'}and <Text style={styles.titleAccent}>more.</Text>
            </Text>
            <Text style={styles.sub}>Find the right power accessory for your everyday setup.</Text>
            <View style={styles.collectionSignals}>
              <Text style={styles.signal}>Cash on delivery</Text>
              <Text style={styles.signalDot}>•</Text>
              <Text style={styles.signal}>Clear compatibility</Text>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search chargers and accessories"
              placeholderTextColor="#7A93B0"
              style={styles.search}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.filters}>
            <View style={styles.filterHalf}>
              <SelectField
                label="Category"
                placeholder="All categories"
                value={category}
                options={categoryOptions}
                onChange={setCategory}
              />
            </View>
            <View style={styles.filterHalf}>
              <SelectField
                label="Sort"
                placeholder="Newest"
                value={sort}
                options={sortOptions}
                onChange={setSort}
              />
            </View>
          </View>

          {loading ? (
            <Text style={styles.emptyText}>Loading products…</Text>
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No accessories match your search.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map(product => {
                const sale = calculateProductPrice(product.price, product.discount);
                const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
                const thumb = resolveMediaUrl(product.thumbnail || product.images?.[0] || '');
                return (
                  <Pressable
                    key={product.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('Product', { productId: product.id })}>
                    {product.discount > 0 ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>-{product.discount}%</Text>
                      </View>
                    ) : null}
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="contain" />
                    ) : (
                      <View style={styles.thumb} />
                    )}
                    <Text style={styles.kickerSmall}>Collection pick</Text>
                    <Text style={styles.name} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatMoney(sale, currency)}</Text>
                      {compare > sale ? (
                        <View style={styles.compareRow}>
                          <Text style={styles.compareLabel}>Was</Text>
                          <View style={styles.compare}>
                            <Text style={styles.compareText}>{formatMoney(compare, currency)}</Text>
                            <View pointerEvents="none" style={styles.compareStrike} />
                          </View>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.viewBtn}>
                      <Text style={styles.viewText}>View product →</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
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
    marginBottom: 8,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 12 },
  brandName: { color: '#F4F8FF', fontSize: 16, fontWeight: '700' },
  pad: { paddingHorizontal: 16, paddingBottom: 110, gap: 12 },
  collectionIntro: { gap: 8, paddingTop: 6, paddingBottom: 4 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: '#F7FBFF', fontSize: 30, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5 },
  titleAccent: { color: '#4DA3FF' },
  sub: { color: '#C5D5EC', fontSize: 14, lineHeight: 21 },
  collectionSignals: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  signal: { color: '#8EC8FF', fontWeight: '700', fontSize: 11 },
  signalDot: { color: '#4DA3FF', fontSize: 12 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
    backgroundColor: 'rgba(8, 28, 58, 0.72)',
    paddingHorizontal: 12,
  },
  searchIcon: { color: '#4DA3FF', fontSize: 18, fontWeight: '700' },
  search: { flex: 1, minHeight: 46, color: '#F4F8FF', fontSize: 15 },
  filters: { flexDirection: 'row', gap: 10 },
  filterHalf: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    flexGrow: 1,
    maxWidth: '48%',
    borderRadius: 18,
    padding: 10,
    backgroundColor: 'rgba(10, 28, 56, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.22)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: '#2F7BFF',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  thumb: { width: '100%', height: 132, borderRadius: 12, backgroundColor: '#08182F' },
  kickerSmall: { color: '#4DA3FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4, marginTop: 8 },
  name: { color: '#F4F8FF', fontWeight: '700', fontSize: 14, marginTop: 4, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { color: '#8EC8FF', fontWeight: '800', fontSize: 13 },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compare: { position: 'relative', paddingVertical: 1 },
  compareText: { color: '#7596BE', fontSize: 11 },
  compareStrike: { position: 'absolute', left: 0, right: 0, top: 8, height: 2, borderRadius: 99, backgroundColor: '#5F86B6' },
  compareLabel: { color: '#6B86A8', fontSize: 10, fontWeight: '700' },
  viewBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(47, 123, 255, 0.18)' },
  viewText: { color: '#D7E7FF', fontWeight: '700', fontSize: 12 },
  empty: {
    marginTop: 12,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(126, 200, 255, 0.28)',
  },
  emptyText: { color: '#C5D5EC', textAlign: 'center', fontWeight: '600' },
});
