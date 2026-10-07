import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthReturnTo, RootStackParamList } from './types';

export function continueAfterAuth(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  returnTo?: AuthReturnTo,
  productId?: string,
) {
  if (returnTo === 'Checkout') {
    navigation.replace('Checkout');
    return;
  }
  if (returnTo === 'Repair') {
    navigation.replace('Repair');
    return;
  }
  if (returnTo === 'PhoneCheck') {
    navigation.replace('PhoneCheck');
    return;
  }
  if (returnTo === 'Product' && productId) {
    navigation.replace('Product', { productId });
    return;
  }
  if (returnTo === 'Cart') {
    navigation.navigate('Tabs', { screen: 'Cart' });
    return;
  }
  navigation.navigate('Tabs', { screen: 'Account' });
}
