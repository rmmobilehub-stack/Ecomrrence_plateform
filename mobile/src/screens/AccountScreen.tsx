import { RefreshScrollView as ScrollView } from '../components/PageRefresh';
import { Text } from '../components/AppText';
import {  StyleSheet, View, Switch} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { accountReturn, ensureCustomerLogin } from '../ensureCustomerLogin';
import type { RootStackParamList } from '../navigation/types';
import { Card, Muted, PrimaryButton, ScreenWrap, SecondaryButton, Title } from '../ui';

export function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { customer, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  return <ScreenWrap><ScrollView contentContainerStyle={styles.pad}>
    <Title>My profile</Title>
    <Card>
      <Title>{customer?.name || 'Welcome'}</Title>
      {customer ? <Muted>{customer.email}</Muted> : <Muted>Login to manage your account.</Muted>}
    </Card>
    <Card><View style={styles.row}>
      <Text style={[styles.label, { color: colors.ink }]}>Dark theme</Text>
      <Switch value={isDark} onValueChange={toggleTheme} accessibilityLabel="Dark theme" />
    </View><Muted>{isDark ? 'Dark' : 'Light'} appearance</Muted></Card>
    {customer ? <SecondaryButton label="Logout" onPress={() => void logout()} /> :
      <PrimaryButton label="Login / Register" onPress={() => ensureCustomerLogin(customer, navigation, accountReturn())} />}
  </ScrollView></ScreenWrap>;
}
const styles = StyleSheet.create({
  pad: { padding: 20, gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '700' },
});
