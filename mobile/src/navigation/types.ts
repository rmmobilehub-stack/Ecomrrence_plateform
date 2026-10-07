import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PlacedOrder } from '../types';

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined;
  Account: undefined;
  More: undefined;
};

export type AuthReturnTo = 'Account' | 'Checkout' | 'Repair' | 'PhoneCheck' | 'Cart' | 'Product';

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Auth: { returnTo?: AuthReturnTo; productId?: string } | undefined;
  Product: { productId: string };
  Checkout: undefined;
  OrderConfirmed: { order: PlacedOrder };
  Repair: undefined;
  PhoneCheck: undefined;
  Contact: undefined;
  RepairDone: { bookingNumber: string };
};
