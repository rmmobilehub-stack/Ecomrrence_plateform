import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PlacedOrder } from '../types';

export type TabParamList = {
  Home: undefined;
  Shop: undefined;
  HealthCheck: undefined;
  Repairs: undefined;
  About: undefined;
};

/** Where to send the user after login/register (mirrors web returnTo). */
export type AuthReturnTo =
  | { type: 'tab'; screen: keyof TabParamList }
  | { type: 'screen'; name: keyof RootStackParamList; params?: object };

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
  Auth: { returnTo?: AuthReturnTo } | undefined;
};
