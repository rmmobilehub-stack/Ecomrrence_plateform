import { useState, type ComponentProps } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { resumeAfterAuth } from '../ensureCustomerLogin';
import type { RootStackParamList } from '../navigation/types';

export function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const { login, register } = useAuth();
  const { colors, isDark } = useAppTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = () => resumeAfterAuth(navigation, route.params?.returnTo);

  const submit = async () => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({ name, phone, email, password, confirmPassword });
        setPassword('');
        setConfirmPassword('');
        setMode('login');
        setNotice(
          'Account created. Open the login link in your email to sign in — the app will open directly. Password login also works after that.',
        );
        return;
      }
      await login(email, password);
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <Text style={[styles.kicker, { color: colors.accentSoft }]}>
              {mode === 'login' ? 'WELCOME BACK' : 'JOIN NOW'}
            </Text>
            <Text style={[styles.title, { color: colors.ink }]}>
              {mode === 'login' ? 'Login' : 'Create account'}
            </Text>

            <View
              style={[
                styles.tabs,
                {
                  backgroundColor: isDark ? 'rgba(8, 28, 58, 0.85)' : '#F3FAFE',
                  borderColor: colors.line,
                },
              ]}>
              <Pressable
                onPress={() => {
                  setMode('login');
                  setError('');
                }}
                style={[styles.tab, mode === 'login' && { backgroundColor: colors.accent }]}>
                <Text style={[styles.tabText, { color: mode === 'login' ? '#FFFFFF' : colors.muted }]}>Login</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode('register');
                  setError('');
                  setNotice('');
                }}
                style={[styles.tab, mode === 'register' && { backgroundColor: colors.accent }]}>
                <Text style={[styles.tabText, { color: mode === 'register' ? '#FFFFFF' : colors.muted }]}>
                  Register
                </Text>
              </Pressable>
            </View>

            {mode === 'register' ? (
              <>
                <AuthField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
                <AuthField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </>
            ) : null}

            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AuthField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            {mode === 'register' ? (
              <AuthField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            ) : null}

            {notice ? <Text style={[styles.notice, { color: colors.success }]}>{notice}</Text> : null}
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              style={[styles.submit, { backgroundColor: colors.accent }, busy && styles.submitDisabled]}
              disabled={busy}>
              <Text style={styles.submitText}>
                {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
              </Text>
            </Pressable>

            <Pressable onPress={() => navigation.goBack()} style={styles.skip}>
              <Text style={[styles.skipText, { color: colors.accentSoft }]}>Continue browsing</Text>
            </Pressable>

            <Text style={[styles.hint, { color: colors.muted }]}>
              {mode === 'login' ? (
                <>
                  New here? Switch to <Text style={[styles.hintStrong, { color: colors.accentSoft }]}>Register</Text>.
                  After register, use the email login link so the app opens signed in.
                </>
              ) : (
                <>
                  Already have an account? Switch to{' '}
                  <Text style={[styles.hintStrong, { color: colors.accentSoft }]}>Login</Text>.
                </>
              )}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthField({ label, ...rest }: { label: string } & ComponentProps<typeof TextInput>) {
  const { colors, isDark } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            borderColor: colors.line,
            backgroundColor: isDark ? 'rgba(5, 14, 36, 0.65)' : '#FFFFFF',
            color: colors.ink,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 18, paddingBottom: 36 },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 12,
  },
  tab: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontWeight: '800' },
  field: { flex: 1, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  notice: { marginBottom: 10, fontWeight: '600', lineHeight: 20 },
  error: { marginBottom: 8, fontWeight: '600' },
  submit: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  skip: { marginTop: 14, alignItems: 'center' },
  skipText: { fontWeight: '700' },
  hint: { marginTop: 16, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  hintStrong: { fontWeight: '800' },
});
