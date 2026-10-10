import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageStyle,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from './context/ThemeContext';
import { colors, radius, space } from './theme';
import { resolveMediaUrl } from './media';

export function ScreenWrap({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors: theme } = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors: theme } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }, style]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  const { colors: theme } = useAppTheme();
  return <Text style={[styles.title, { color: theme.ink }]}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  const { colors: theme } = useAppTheme();
  return <Text style={[styles.subtitle, { color: theme.muted }]}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  const { colors: theme } = useAppTheme();
  return <Text style={[styles.muted, { color: theme.muted }]}>{children}</Text>;
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  color,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryBtn, { backgroundColor: color || colors.accent }, disabled && styles.disabled]}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.secondaryBtn, disabled && styles.disabled]}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  ...rest
}: { label: string } & TextInputProps) {
  const { colors: theme } = useAppTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          { backgroundColor: theme.card, borderColor: theme.line, color: theme.ink },
        ]}
        {...rest}
      />
    </View>
  );
}

export function RemoteImage({
  uri,
  style,
}: {
  uri?: string;
  style?: StyleProp<ImageStyle>;
}) {
  const src = resolveMediaUrl(uri);
  if (!src) {
    return <View style={[styles.imageFallback, style]}><Text style={styles.muted}>No image</Text></View>;
  }
  return <Image source={{ uri: src }} style={style} resizeMode="cover" />;
}

export function LoadingBlock() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <Muted>Loading…</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: space,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 6, lineHeight: 22 },
  muted: { color: colors.muted, fontSize: 13 },
  error: { color: colors.danger, marginTop: 8, fontSize: 13 },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  secondaryBtnText: { color: colors.ink, fontWeight: '600' },
  disabled: { opacity: 0.45 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  chipTextSelected: { color: '#fff' },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: colors.muted, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  imageFallback: {
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { padding: 32, alignItems: 'center', gap: 10 },
});
