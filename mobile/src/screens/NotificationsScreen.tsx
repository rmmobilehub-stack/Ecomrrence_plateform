import { RefreshScrollView as ScrollView } from '../components/PageRefresh';
import {  StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { Card, Muted, ScreenWrap, Title } from '../ui';

export function NotificationsScreen() {
  const { colors } = useAppTheme();
  return <ScreenWrap><ScrollView contentContainerStyle={styles.pad}>
    <Card><View style={styles.empty}>
      <Icon name="notifications-outline" size={44} color={colors.accentSoft} />
      <Title>You're all caught up</Title>
      <Muted>No notifications yet.</Muted>
    </View></Card>
  </ScrollView></ScreenWrap>;
}
const styles = StyleSheet.create({ pad: { padding: 20, gap: 16 }, empty: { alignItems: 'center', gap: 12, paddingVertical: 32 } });
