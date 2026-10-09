import type { CustomerProfile } from './types';
import type { AuthReturnTo, RootStackParamList } from './navigation/types';

type Nav = {
  navigate: (...args: any[]) => void;
  canGoBack: () => boolean;
  goBack: () => void;
};

/** If guest, open Auth with returnTo (same idea as web ensureCustomerLogin). */
export function ensureCustomerLogin(
  customer: CustomerProfile | null | undefined,
  navigation: Nav,
  returnTo: AuthReturnTo,
): boolean {
  if (customer) return true;
  navigation.navigate('Auth', { returnTo });
  return false;
}

export function resumeAfterAuth(navigation: Nav, returnTo?: AuthReturnTo) {
  if (!returnTo) {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs', { screen: 'Home' });
    return;
  }
  if (returnTo.type === 'tab') {
    navigation.navigate('Tabs', { screen: returnTo.screen });
    return;
  }
  switch (returnTo.name) {
    case 'Checkout':
      navigation.navigate('Checkout');
      break;
    case 'Repair':
      navigation.navigate('Repair');
      break;
    case 'Account':
      navigation.navigate('Account');
      break;
    case 'PhoneCheck':
      navigation.navigate('PhoneCheck');
      break;
    case 'RepairCheck':
      navigation.navigate('RepairCheck', returnTo.params as RootStackParamList['RepairCheck']);
      break;
    case 'Product':
      navigation.navigate('Product', returnTo.params as RootStackParamList['Product']);
      break;
    default:
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Tabs', { screen: 'Home' });
  }
}

export function checkoutReturn(): AuthReturnTo {
  return { type: 'screen', name: 'Checkout' };
}

export function repairReturn(): AuthReturnTo {
  return { type: 'screen', name: 'Repair' };
}

export function healthCheckReturn(): AuthReturnTo {
  return { type: 'tab', screen: 'HealthCheck' };
}

export function repairsTabReturn(): AuthReturnTo {
  return { type: 'tab', screen: 'Repairs' };
}

export function accountReturn(): AuthReturnTo {
  return { type: 'screen', name: 'Account' };
}
