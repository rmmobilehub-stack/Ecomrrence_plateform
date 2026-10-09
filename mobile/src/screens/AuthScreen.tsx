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
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ink = '#123247';
const muted = '#5A7A8F';
const line = '#D0E6F1';
const blue = '#2F6BFF';
const kicker = '#0284C7';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const submit = async () => {
    if (mode === 'register') {
      await register({ name, phone, email, password, confirmPassword });
      return;
    }
    await login(email, password);
  };

  return (
    <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.kicker}>{mode === 'login' ? 'WELCOME BACK' : 'JOIN NOW'}</Text>
          <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
          <Text style={styles.lead}>
            {mode === 'login'
              ? 'Use your email and password. Your session stays saved on this device.'
              : 'Register once — then Buy now, Phone Check and Repair stay linked to you.'}
          </Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}>
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => setMode('register')}>
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
            </Pressable>
          </View>

          {mode === 'register' && (
            <View style={styles.row}>
              <AuthField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
              <AuthField
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="03XXXXXXXXX"
                keyboardType="phone-pad"
              />
            </View>
          )}

          <AuthField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
            secureTextEntry
          />
          {mode === 'register' && (
            <AuthField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
            />
          )}

          <Pressable style={styles.submit} onPress={submit}>
            <Text style={styles.submitText}>{mode === 'login' ? 'Login & continue' : 'Create account'}</Text>
          </Pressable>

          {mode === 'login' ? (
            <Text style={styles.hint}>
              After login, open <Text style={styles.hintStrong}>My account</Text> anytime for personal order and repair
              history.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthField({
  label,
  ...rest
}: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#8AA4B5" style={styles.input} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7FCFF' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 18, paddingBottom: 36 },
  card: {
    backgroundColor: '#F8FCFE',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 183, 204, 0.38)',
    shadowColor: '#14384F',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  kicker: {
    color: kicker,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { color: ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  lead: { color: muted, marginTop: 8, marginBottom: 16, lineHeight: 22, fontSize: 15 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EAF6FB',
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: '#D7EBF5',
    marginBottom: 16,
  },
  tab: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabText: { color: '#4F7186', fontWeight: '800' },
  tabTextActive: { color: ink },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 12 },
  label: { color: muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    color: ink,
    fontSize: 16,
  },
  submit: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { marginTop: 16, color: muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  hintStrong: { fontWeight: '800', color: ink },
});
