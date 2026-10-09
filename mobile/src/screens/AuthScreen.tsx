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
import { colors } from '../theme';

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
                onPress={() => setMode('login')}
                style={[styles.tab, mode === 'login' && styles.tabActive]}>
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('register')}
                style={[styles.tab, mode === 'register' && styles.tabActive]}>
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Register</Text>
              </Pressable>
            </View>

            {mode === 'register' ? (
              <>
                <Field label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
                <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </>
            ) : null}

            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            {mode === 'register' ? (
              <Field
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            ) : null}

            <Pressable onPress={submit} style={styles.submit}>
              <Text style={styles.submitText}>{mode === 'login' ? 'Login' : 'Create account'}</Text>
            </Pressable>

            <Text style={styles.hint}>
              {mode === 'login' ? (
                <>
                  New here? Switch to <Text style={styles.hintStrong}>Register</Text>.
                </>
              ) : (
                <>
                  Already have an account? Switch to <Text style={styles.hintStrong}>Login</Text>.
                </>
              )}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 18, paddingBottom: 36 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
  },
  kicker: {
    color: colors.accentSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  lead: { color: colors.muted, marginTop: 8, marginBottom: 16, lineHeight: 22, fontSize: 15 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 28, 58, 0.85)',
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  tab: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: { color: colors.muted, fontWeight: '800' },
  tabTextActive: { color: '#FFFFFF' },
  field: { flex: 1, marginBottom: 12 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(5, 14, 36, 0.65)',
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 16,
  },
  submit: {
    marginTop: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { marginTop: 16, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  hintStrong: { fontWeight: '800', color: colors.accentSoft },
});
