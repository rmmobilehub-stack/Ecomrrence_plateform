import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { BellGlyph, ShopGlyph } from '../navigation/icons';
import type { RootStackParamList } from '../navigation/types';

type HeaderActionsProps = { onCart: () => void; onAccount: () => void };
export function HeaderActions({ onCart, onAccount }: HeaderActionsProps) {
  const { colors } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const button = [styles.button, { borderColor: colors.headerBtnBorder, backgroundColor: colors.headerBtnBg }];
  return <View style={styles.actions}>
    <Pressable onPress={onCart} style={button} accessibilityRole="button" accessibilityLabel="Cart"><ShopGlyph color={colors.headerIcon} /></Pressable>
    <Pressable onPress={() => navigation.navigate('Notifications')} style={button} accessibilityRole="button" accessibilityLabel="Notifications"><BellGlyph color={colors.headerIcon} /></Pressable>
    <Pressable onPress={onAccount} style={button} accessibilityRole="button" accessibilityLabel="My profile"><Icon name="person-circle-outline" size={25} color={colors.headerIcon} /></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  button: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
