import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { colors, space } from '../theme';
import { Chip, ErrorText, Field, Muted, PrimaryButton, ScreenWrap, Title } from '../ui';
import type { AuthReturnTo, RootStackParamList } from '../navigation/types';
import { continueAfterAuth } from '../navigation/continueAfterAuth';

export function AuthForm({
  onSuccess,
  compact,
}: {
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const { login, register } = useAuth();
  const { store, accent } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) throw new Error('Password and confirm password do not match');
        await register({ name, phone, email, password, confirmPassword });
      } else {
        await login(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ gap: 10 }}>
      {!compact && (
        <>
          <Muted>Sign in to {store?.name || 'the store'} so orders, phone checks and repairs stay with you.</Muted>
          <View style={styles.benefits}>
            <Text style={styles.benefit}>Order history — see what you bought</Text>
            <Text style={styles.benefit}>Repair status — follow doorstep bookings</Text>
            <Text style={styles.benefit}>Phone check — saved under your login</Text>
          </View>
        </>
      )}
      <View style={styles.tabs}>
        <Chip label="Login" selected={mode === 'login'} onPress={() => { setMode('login'); setError(''); }} />
        <Chip label="Register" selected={mode === 'register'} onPress={() => { setMode('register'); setError(''); }} />
      </View>
      {mode === 'register' && (
        <>
          <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="03XXXXXXXXX" keyboardType="phone-pad" />
        </>
      )}
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
        secureTextEntry
      />
      {mode === 'register' && (
        <Field
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
        />
      )}
      <ErrorText>{error}</ErrorText>
      <PrimaryButton
        label={saving ? 'Please wait…' : mode === 'login' ? 'Login & continue' : 'Create account'}
        onPress={submit}
        disabled={saving}
        color={accent}
      />
    </View>
  );
}

export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const { store } = useStore();

  return (
    <ScreenWrap>
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <Title>{store?.name || 'Account'}</Title>
        <AuthForm
          onSuccess={() => continueAfterAuth(navigation, route.params?.returnTo, route.params?.productId)}
        />
      </ScrollView>
    </ScreenWrap>
  );
}

export function goToAuth(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  returnTo: AuthReturnTo = 'Account',
  productId?: string,
) {
  navigation.navigate('Auth', { returnTo, productId });
}

const styles = StyleSheet.create({
  pad: { padding: space, paddingBottom: 40, gap: 12 },
  tabs: { flexDirection: 'row', gap: 8 },
  benefits: { gap: 6, marginBottom: 4 },
  benefit: { color: colors.ink, fontSize: 14 },
});
