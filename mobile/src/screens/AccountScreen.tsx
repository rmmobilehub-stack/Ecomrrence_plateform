import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchCustomerHistory } from '../api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { accountReturn, ensureCustomerLogin } from '../ensureCustomerLogin';
import { formatMoney } from '../money';
import { colors, space } from '../theme';
import type { HistoryOrder, HistoryRepair } from '../types';
import { Card, ErrorText, LoadingBlock, Muted, PrimaryButton, ScreenWrap, SecondaryButton, Title } from '../ui';
import type { RootStackParamList } from '../navigation/types';

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function initials(name: string, email: string) {
  return (name || email || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
}

function statusColor(status: string) {
  if (status === 'cancelled') return colors.danger;
  if (status === 'delivered' || status === 'completed') return colors.success;
  return colors.accent;
}

export function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer, loading: authLoading, logout } = useAuth();
  const { store, accent, currency } = useStore();
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [repairs, setRepairs] = useState<HistoryRepair[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!customer) {
      setOrders([]);
      setRepairs([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchCustomerHistory()
      .then(data => {
        setOrders(data.orders || []);
        setRepairs(data.repairs || []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load history'))
      .finally(() => setLoading(false));
  }, [customer]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (authLoading) {
    return (
      <ScreenWrap>
        <LoadingBlock />
      </ScreenWrap>
    );
  }

  if (!customer) {
    return (
      <ScreenWrap style={styles.pad}>
        <Title>My account</Title>
        <Muted>Login to see orders and repair history — same account as the website.</Muted>
        <View style={{ height: 16 }} />
        <PrimaryButton
          label="Login / Register"
          onPress={() => ensureCustomerLogin(customer, navigation, accountReturn())}
          color={accent}
        />
        <View style={{ height: 10 }} />
        <SecondaryButton label="Continue shopping" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <ScrollView
        contentContainerStyle={styles.pad}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(customer.name, customer.email)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Muted>My account</Muted>
            <Title>{customer.name || 'Customer'}</Title>
            <Muted>
              {customer.email} · {store?.name || ''}
            </Muted>
          </View>
        </View>
        <SecondaryButton label="Logout" onPress={() => void logout()} />

        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <Muted>Orders</Muted>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statNum}>{repairs.length}</Text>
            <Muted>Repairs</Muted>
          </Card>
        </View>

        <ErrorText>{error}</ErrorText>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Order history</Text>
          <Text style={[styles.link, { color: accent }]} onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })}>
            Shop again
          </Text>
        </View>
        {orders.length === 0 ? (
          <Card>
            <Muted>No product orders yet. When you buy something, it will show here.</Muted>
            <View style={{ height: 10 }} />
            <PrimaryButton label="Browse products" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} color={accent} />
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.strong}>{order.orderNumber}</Text>
                <Muted>{formatDate(order.createdAt)}</Muted>
              </View>
              <Text style={styles.items}>
                {(order.items || []).map(item => `${item.qty}× ${item.productName}`).join(', ')}
              </Text>
              <View style={styles.row}>
                <Text style={{ color: statusColor(order.status), fontWeight: '700', textTransform: 'capitalize' }}>
                  {order.status}
                </Text>
                <Text style={styles.strong}>{formatMoney(order.total, currency)}</Text>
              </View>
            </Card>
          ))
        )}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Repair history</Text>
          <Text style={[styles.link, { color: accent }]} onPress={() => navigation.navigate('Repair')}>
            Book repair
          </Text>
        </View>
        {repairs.length === 0 ? (
          <Card>
            <Muted>No repair bookings yet.</Muted>
            <View style={{ height: 10 }} />
            <PrimaryButton label="Book a repair" onPress={() => navigation.navigate('Repair')} color={accent} />
          </Card>
        ) : (
          repairs.map(booking => (
            <Card key={booking.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.strong}>{booking.bookingNumber}</Text>
                <Muted>{formatDate(booking.createdAt)}</Muted>
              </View>
              <Text style={styles.items}>
                {booking.device?.modelName} · {booking.issue?.issueName}
              </Text>
              <View style={styles.row}>
                <Text style={{ color: statusColor(booking.status), fontWeight: '700', textTransform: 'capitalize' }}>
                  {booking.status}
                </Text>
                {booking.deviceEstimate ? (
                  <Text style={styles.strong}>Score {booking.deviceEstimate.score}/100</Text>
                ) : null}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'flex-start' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.ink },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  link: { fontWeight: '700', color: colors.accentSoft },
  card: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  strong: { fontWeight: '800', color: colors.ink },
  items: { color: colors.ink },
});
