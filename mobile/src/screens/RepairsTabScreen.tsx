import { Pressable, ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenWrap } from '../ui';

export function RepairsTabScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Repairs'>, NativeStackNavigationProp<RootStackParamList>>
  >();

  return (
    <ScreenWrap style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Repairs</Text>
        <Text style={styles.body}>Doorstep iPhone repair and a free phone check. Tap a button to continue.</Text>
        <Pressable onPress={() => navigation.navigate('Repair')} style={styles.btn}>
          <Text style={styles.btnText}>Book a repair</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('PhoneCheck')} style={styles.ghost}>
          <Text style={styles.ghostText}>Free phone check</Text>
          <Text style={styles.arrowMuted}>→</Text>
        </Pressable>
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#050E24' },
  pad: { padding: 24, paddingBottom: 100, gap: 14 },
  title: { color: '#F7FBFF', fontSize: 28, fontWeight: '800', marginTop: 8 },
  body: { color: '#C5D5EC', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2F7BFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  arrow: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    backgroundColor: 'rgba(8, 28, 58, 0.55)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  ghostText: { color: '#EAF3FF', fontWeight: '700', fontSize: 15 },
  arrowMuted: { color: '#9CC7FF', fontSize: 16, fontWeight: '700' },
});
