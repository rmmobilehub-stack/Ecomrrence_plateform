import { RefreshScrollView as ScrollView } from '../components/PageRefresh';
import { Text } from '../components/AppText';
import {  StyleSheet} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../context/ThemeContext';
import { formatMoney } from '../money';
import { space } from '../theme';
import { Card, PrimaryButton, ScreenWrap, Title } from '../ui';
import { isValidWhatsAppNumber, openWhatsApp } from '../whatsapp';
import type { RootStackParamList } from '../navigation/types';

export function OrderConfirmedScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderConfirmed'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useAppTheme();
  const order = route.params.order;
  const money = (amount: number) => formatMoney(amount, order.currency || 'PKR');

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad}>
        <Title>Order received</Title>
        <Card>
          <Text style={[styles.row, { color: colors.ink }]}>Order {order.orderNumber}</Text>
          <Text style={[styles.row, { color: colors.ink }]}>Total {money(order.total)}</Text>
          {order.deliveryFee ? (
            <Text style={[styles.row, { color: colors.ink }]}>Delivery {money(order.deliveryFee)}</Text>
          ) : (
            <Text style={[styles.row, { color: colors.ink }]}>Delivery free</Text>
          )}
          <Text style={[styles.row, { color: colors.ink }]}>Status {order.status}</Text>
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
  row: { marginBottom: 6, fontSize: 15 },
});
