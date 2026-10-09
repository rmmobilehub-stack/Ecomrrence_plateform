import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../context/StoreContext';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { ScreenWrap } from '../ui';

const logoMark = require('../assets/rm-logo.png');

export function AboutScreen() {
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'About'>, NativeStackNavigationProp<RootStackParamList>>
  >();
  const { store } = useStore();

  return (
    <ScreenWrap style={styles.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.pad}>
        <Image source={logoMark} style={styles.logo} />
        <Text style={styles.title}>{store?.aboutTitle || 'RM Mobile Hub'}</Text>
        <Text style={styles.body}>
          {store?.aboutDescription ||
            'Protective cases, fast chargers and dependable cables for every iPhone. Shop accessories, book a repair, or run a free phone check.'}
        </Text>
        <Pressable onPress={() => navigation.navigate('Contact')} style={styles.btn}>
          <Text style={styles.btnText}>Contact store</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Account')} style={styles.ghost}>
          <Text style={styles.ghostText}>My account</Text>
        </Pressable>
      </ScrollView>
    </ScreenWrap>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#050E24' },
  pad: { padding: 24, paddingBottom: 100, alignItems: 'center', gap: 14 },
  logo: { width: 88, height: 88, borderRadius: 24, marginTop: 12 },
  title: { color: '#F7FBFF', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  body: { color: '#C5D5EC', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  btn: {
    marginTop: 8,
    backgroundColor: '#2F7BFF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
  },
  btnText: { color: '#FFFFFF', fontWeight: '700' },
  ghost: {
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.45)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 22,
  },
  ghostText: { color: '#EAF3FF', fontWeight: '700' },
});
