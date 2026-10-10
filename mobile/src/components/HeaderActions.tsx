import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { BellGlyph, ShopGlyph } from '../navigation/icons';

type HeaderActionsProps = {
  onCart: () => void;
  onAccount: () => void;
};

export function HeaderActions({ onCart, onAccount }: HeaderActionsProps) {
  const { customer, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const openAccount = () => {
    setMenuOpen(false);
    onAccount();
  };

  const iconBtn = {
    borderColor: colors.headerBtnBorder,
    backgroundColor: colors.headerBtnBg,
  };

  // Guest: only theme toggle in the upper nav.
  if (!customer) {
    return (
      <View style={styles.actions}>
        <Pressable
          onPress={toggleTheme}
          style={[styles.iconButton, iconBtn]}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
          <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.headerIcon} />
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={styles.actions}>
        <Pressable onPress={onCart} style={[styles.iconButton, iconBtn]} accessibilityLabel="Cart">
          <ShopGlyph color={colors.headerIcon} />
        </Pressable>
        <Pressable
          onPress={() => setNotificationsOpen(true)}
          style={[styles.iconButton, iconBtn]}
          accessibilityLabel="Notifications">
          <BellGlyph color={colors.headerIcon} />
        </Pressable>
        <Pressable
          onPress={() => setMenuOpen(true)}
          style={[styles.iconButton, iconBtn]}
          accessibilityLabel="Account menu">
          <Icon name="ellipsis-horizontal" size={22} color={colors.headerIcon} />
        </Pressable>
      </View>

      <Modal visible={notificationsOpen} transparent animationType="fade" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setNotificationsOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.sheetBg, borderColor: colors.cardBorder }]}
            onPress={() => undefined}>
            <Text style={[styles.title, { color: colors.ink }]}>Notifications</Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              You are all caught up. Order and repair updates will appear here.
            </Text>
            <Text style={[styles.close, { color: colors.muted }]}>Tap outside to close</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.sheetBg, borderColor: colors.cardBorder }]}
            onPress={() => undefined}>
            <Text style={[styles.title, { color: colors.ink }]}>{customer.name || 'My account'}</Text>
            <Pressable style={styles.menuItem} onPress={openAccount}>
              <Icon name="person-outline" size={19} color={colors.ink} />
              <Text style={[styles.menuText, { color: colors.ink }]}>Profile & orders</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={openAccount}>
              <Icon name="receipt-outline" size={19} color={colors.ink} />
              <Text style={[styles.menuText, { color: colors.ink }]}>My orders & repairs</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                toggleTheme();
              }}
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={19} color={colors.accentSoft} />
              <Text style={[styles.menuText, { color: colors.ink }]}>
                {isDark ? 'Light theme' : 'Dark theme'}
              </Text>
              <View style={[styles.themeSwatch, { backgroundColor: isDark ? '#7DD3FC' : '#0A2140' }]} />
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.logoutItem, { borderTopColor: colors.line }]}
              onPress={async () => {
                setMenuOpen(false);
                await logout();
              }}>
              <Icon name="log-out-outline" size={19} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 78,
    paddingRight: 16,
    backgroundColor: 'rgba(1, 8, 21, 0.36)',
  },
  sheet: {
    width: 246,
    padding: 14,
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  body: { lineHeight: 19, fontSize: 13 },
  close: { fontSize: 12, marginTop: 8 },
  menuItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  menuText: { fontWeight: '700', fontSize: 14, flex: 1 },
  themeSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  logoutItem: { marginTop: 3, borderTopWidth: 1, paddingTop: 9 },
  logoutText: { fontWeight: '700', fontSize: 14 },
});
