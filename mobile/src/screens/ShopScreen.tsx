import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProducts } from '../api';
import { useStore } from '../context/StoreContext';
import { formatMoney } from '../money';
import { calculateProductPrice, getReferencePrice } from '../pricing';
import { colors, space } from '../theme';
import type { Category, Product } from '../types';
import { Card, Chip, ErrorText, LoadingBlock, Muted, RemoteImage, ScreenWrap, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';

export function ShopScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { accent, currency } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchProducts({ search, categoryId: category, sortBy: sort })
        .then(data => {
          setProducts(data.products || []);
          setCategories(data.categories || []);
          setError('');
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Could not load products'))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Shop</Title>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search chargers and accessories"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" selected={!category} onPress={() => setCategory('')} />
          {categories.map(entry => (
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
        <Muted>{products.length} products</Muted>
        <ErrorText>{error}</ErrorText>
        {loading ? <LoadingBlock /> : null}
        {products.map(product => {
          const sale = calculateProductPrice(product.price, product.discount);
          const compare = getReferencePrice(product.price, product.comparePrice, product.discount);
          return (
            <Pressable key={product.id} onPress={() => navigation.navigate('Product', { productId: product.id })}>
              <Card style={styles.row}>
                <RemoteImage uri={product.thumbnail || product.images?.[0]} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{product.name}</Text>
                  <Text style={{ color: accent, fontWeight: '700' }}>{formatMoney(sale, currency)}</Text>
                  {compare > sale ? <Muted>{formatMoney(compare, currency)}</Muted> : null}
                  {product.stock < 1 ? <Text style={styles.sold}>Sold out</Text> : null}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 10 },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: 12, backgroundColor: colors.line },
  name: { fontWeight: '700', color: colors.ink, marginBottom: 4 },
  sold: { color: colors.danger, marginTop: 4, fontWeight: '600' },
});
