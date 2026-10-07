import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { AuthReturnTo, RootStackParamList } from './types';

export function useAuthGate(returnTo: AuthReturnTo, productId?: string) {
  const { customer, loading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!loading && !customer) {
      navigation.replace('Auth', { returnTo, productId });
    }
  }, [customer, loading, navigation, productId, returnTo]);

  return { customer, loading, ready: !loading && Boolean(customer) };
}
