import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PlacedOrder } from '../types';

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  Repairs: undefined;
  About: undefined;
};

export type AuthStackParamList = {
  Auth: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Product: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmed: { order: PlacedOrder };
  Repair: undefined;
  RepairCheck: { serviceId: string; serviceLabel: string; model: string };
  PhoneCheck: undefined;
  Contact: undefined;
  Account: undefined;
  RepairDone: { bookingNumber: string };
};
