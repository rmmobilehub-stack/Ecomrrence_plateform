import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';

export function RepairCheckScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { serviceLabel, model } = useRoute<RouteProp<RootStackParamList, 'RepairCheck'>>().params;

  return (
    <SafeAreaView style={styles.page} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.body}>
        <Text style={styles.kicker}>AVAILABLE TODAY</Text>
        <Text style={styles.title}>We can take this repair.</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Service</Text>
          <Text style={styles.rowValue}>{serviceLabel}</Text>
          <Text style={[styles.rowLabel, { marginTop: 12 }]}>iPhone model</Text>
          <Text style={styles.rowValue}>{model}</Text>
        </View>
        <Text style={styles.note}>Clear pricing and a technician will confirm the visit time.</Text>
        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate('RepairDone', { bookingNumber: `RM-${Date.now().toString().slice(-6)}` })}>
          <Text style={styles.ctaText}>Book this repair</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={() => navigation.goBack()}>
          <Text style={styles.ghostText}>Change selection</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050E24' },
  body: { flex: 1, padding: 22, gap: 14 },
  kicker: { color: '#4DA3FF', fontWeight: '800', letterSpacing: 1.1, fontSize: 12, marginTop: 8 },
  title: { color: '#F7FBFF', fontSize: 28, fontWeight: '800' },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(90, 150, 220, 0.28)',
    backgroundColor: 'rgba(8, 24, 52, 0.85)',
    padding: 18,
  },
  rowLabel: { color: '#7A93B0', fontSize: 12, fontWeight: '700' },
  rowValue: { color: '#F4F8FF', fontSize: 18, fontWeight: '800', marginTop: 4 },
  note: { color: '#C5D5EC', lineHeight: 22 },
  cta: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#3B8CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  ghost: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(126, 200, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { color: '#EAF3FF', fontWeight: '700' },
});
