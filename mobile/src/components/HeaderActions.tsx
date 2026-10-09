import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BellGlyph, ShopGlyph } from '../navigation/icons';

type HeaderActionsProps = {
  onCart: () => void;
  onAccount: () => void;
};

/** Keep customer-only actions out of the storefront header until a user is signed in. */
export function HeaderActions({ onCart, onAccount }: HeaderActionsProps) {
  const { customer, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!customer) return null;

  const openAccount = () => {
    setMenuOpen(false);
    onAccount();
  };

  return (
    <>
      <View style={styles.actions}>
        <Pressable onPress={onCart} style={styles.iconButton} accessibilityLabel="Cart">
          <ShopGlyph color="#D7E7FF" />
        </Pressable>
        <Pressable onPress={() => setNotificationsOpen(true)} style={styles.iconButton} accessibilityLabel="Notifications">
          <BellGlyph color="#D7E7FF" />
        </Pressable>
        <Pressable onPress={() => setMenuOpen(true)} style={styles.iconButton} accessibilityLabel="Account menu">
          <Icon name="ellipsis-horizontal" size={22} color="#D7E7FF" />
        </Pressable>
      </View>

      <Modal visible={notificationsOpen} transparent animationType="fade" onRequestClose={() => setNotificationsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setNotificationsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.body}>You are all caught up. Order and repair updates will appear here.</Text>
            <Text style={styles.close}>Tap outside to close</Text>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>{customer.name || 'My account'}</Text>
            <Pressable style={styles.menuItem} onPress={openAccount}>
              <Icon name="person-outline" size={19} color="#D7E7FF" />
              <Text style={styles.menuText}>Profile & orders</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={openAccount}>
              <Icon name="receipt-outline" size={19} color="#D7E7FF" />
              <Text style={styles.menuText}>My orders & repairs</Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.logoutItem]}
              onPress={async () => {
                setMenuOpen(false);
                await logout();
              }}>
              <Icon name="log-out-outline" size={19} color="#FFB4A8" />
              <Text style={styles.logoutText}>Logout</Text>
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
    borderColor: 'rgba(150, 190, 255, 0.35)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 78, paddingRight: 16, backgroundColor: 'rgba(1, 8, 21, 0.36)' },
  sheet: {
    width: 230,
    padding: 14,
    gap: 6,
    borderRadius: 18,
    backgroundColor: '#0A1C38',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.32)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: { color: '#F7FBFF', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  body: { color: '#C5D5EC', lineHeight: 19, fontSize: 13 },
  close: { color: '#7EA6CF', fontSize: 12, marginTop: 8 },
  menuItem: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  menuText: { color: '#EAF3FF', fontWeight: '700', fontSize: 14 },
  logoutItem: { marginTop: 3, borderTopWidth: 1, borderTopColor: 'rgba(126, 200, 255, 0.18)', paddingTop: 9 },
  logoutText: { color: '#FFB4A8', fontWeight: '700', fontSize: 14 },
});
