import { useMemo, useState } from 'react';
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
import { filterCatalog, SHOP_CATEGORIES } from '../catalog';
import { formatMoney } from '../money';
import { BellGlyph, ShopGlyph, UserGlyph } from '../navigation/icons';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { calculateProductPrice, getReferencePrice } from '../pricing';

const logoMark = require('../assets/rm-logo.png');

export function ShopScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Shop'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const products = useMemo(() => filterCatalog(search, category, sort), [search, category, sort]);

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={logoMark} style={styles.logo} />
            <Text style={styles.brandName}>RM Mobile Hub</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate('Cart')} style={styles.iconBtn} accessibilityLabel="Cart">
              <ShopGlyph color="#D7E7FF" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Account')} style={styles.iconBtn} accessibilityLabel="Account">
              <UserGlyph color="#D7E7FF" />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Account')} style={styles.iconBtn} accessibilityLabel="Alerts">
              <BellGlyph color="#D7E7FF" />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text style={styles.kicker}>APPLE-COMPATIBLE ACCESSORIES</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              Chargers, cables{'\n'}and <Text style={styles.titleAccent}>more.</Text>
            </Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{products.length}</Text>
            </View>
          </View>
          <Text style={styles.sub}>Find the right power accessory for your everyday setup.</Text>

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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="All" selected={!category} onPress={() => setCategory('')} />
            {SHOP_CATEGORIES.map(entry => (
              <Chip
                key={entry.id}
                label={entry.name}
                selected={category === entry.id}
                onPress={() => setCategory(entry.id)}
              />
            ))}
          </ScrollView>

          <View style={styles.chips}>
            <Chip label="Newest" selected={sort === 'newest'} onPress={() => setSort('newest')} />
            <Chip label="Price ↑" selected={sort === 'price-asc'} onPress={() => setSort('price-asc')} />
            <Chip label="Price ↓" selected={sort === 'price-desc'} onPress={() => setSort('price-desc')} />
          </View>

          {products.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No accessories match your search.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map(product => {
                const sale = calculateProductPrice(product.price, product.discount);
                const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
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
                    <Image source={product.image} style={styles.thumb} resizeMode="contain" />
                    <Text style={styles.kickerSmall}>Collection pick</Text>
                    <Text style={styles.name} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatMoney(sale, 'PKR')}</Text>
                      {compare > sale ? <Text style={styles.compare}>{formatMoney(compare, 'PKR')}</Text> : null}
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

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
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
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150, 190, 255, 0.35)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: { paddingHorizontal: 16, paddingBottom: 110, gap: 12 },
  kicker: { color: '#4DA3FF', fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, color: '#F7FBFF', fontSize: 30, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5 },
  titleAccent: { color: '#4DA3FF' },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.35)',
    backgroundColor: 'rgba(47, 123, 255, 0.15)',
  },
  countText: { color: '#8EC8FF', fontWeight: '800', fontSize: 13 },
  sub: { color: '#C5D5EC', fontSize: 14, lineHeight: 21 },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.28)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
  },
  chipOn: { backgroundColor: '#2F7BFF', borderColor: '#2F7BFF' },
  chipText: { color: '#C5D5EC', fontWeight: '700', fontSize: 13 },
  chipTextOn: { color: '#FFFFFF' },
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
  compare: { color: '#6B86A8', textDecorationLine: 'line-through', fontSize: 11 },
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
