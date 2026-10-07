import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PlacedOrder } from '../types';

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined;
  Account: undefined;
  More: undefined;
};

export type AuthStackParamList = {
  Auth: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Product: { productId: string };
  Checkout: undefined;
  OrderConfirmed: { order: PlacedOrder };
  Repair: undefined;
  PhoneCheck: undefined;
  Contact: undefined;
  RepairDone: { bookingNumber: string };
};
