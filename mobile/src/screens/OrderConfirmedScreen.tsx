import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatMoney } from '../money';
import { colors, space } from '../theme';
import { Card, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';
import type { RootStackParamList } from '../navigation/types';

export function OrderConfirmedScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderConfirmed'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const order = route.params.order;
  const money = (amount: number) => formatMoney(amount, order.currency || 'PKR');

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Order received</Title>
        <Muted>
          {order.storeName || 'Store'} confirmed {order.orderNumber}. Pay cash on delivery.
        </Muted>
        <Card>
          <Text style={styles.row}>Order {order.orderNumber}</Text>
          <Text style={styles.row}>Total {money(order.total)}</Text>
          {order.deliveryFee ? <Text style={styles.row}>Delivery {money(order.deliveryFee)}</Text> : <Text style={styles.row}>Delivery free</Text>}
          <Text style={styles.row}>Status {order.status}</Text>
        </Card>
        {isValidWhatsAppNumber(order.whatsappNumber) && (
          <PrimaryButton
            label="Message store on WhatsApp"
            color={colors.whatsapp}
            onPress={() =>
              openWhatsApp(
                order.whatsappNumber,
                `Hello ${order.storeName || ''}, I placed order ${order.orderNumber}.`,
              ).catch(() => undefined)
            }
          />
        )}
        <PrimaryButton label="Continue shopping" onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  pad: { padding: space, gap: 14 },
  row: { color: colors.ink, marginBottom: 6, fontSize: 15 },
});
