import { StyleSheet, Text, View } from 'react-native';

export function HomeGlyph({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.roof, { borderBottomColor: color }]} />
      <View style={[styles.house, { borderColor: color }]} />
    </View>
  );
}

export function ShopGlyph({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.bag, { borderColor: color }]}>
        <View style={[styles.handle, { borderColor: color }]} />
      </View>
    </View>
  );
}

export function RepairGlyph({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.wrenchHead, { borderColor: color }]} />
      <View style={[styles.wrenchBar, { backgroundColor: color }]} />
    </View>
  );
}

export function AboutGlyph({ color }: { color: string }) {
  return (
    <View style={[styles.info, { borderColor: color }]}>
      <Text style={[styles.infoText, { color }]}>i</Text>
    </View>
  );
}

export function BellGlyph({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.bell, { borderColor: color }]} />
      <View style={[styles.bellDot, { backgroundColor: color }]} />
    </View>
  );
}

export function UserGlyph({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.head, { borderColor: color }]} />
      <View style={[styles.shoulders, { borderColor: color }]} />
    </View>
  );
}

export function HeartGlyph({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 14, fontWeight: '700' }}>♡</Text>;
}

const styles = StyleSheet.create({
  box: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  house: { width: 12, height: 9, borderWidth: 1.7, borderTopWidth: 0, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 },
  bag: { width: 14, height: 13, borderWidth: 1.7, borderRadius: 3, marginTop: 4 },
  handle: {
    position: 'absolute',
    top: -6,
    left: 2,
    width: 8,
    height: 7,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  wrenchHead: { width: 8, height: 8, borderWidth: 1.8, borderRadius: 8, borderBottomWidth: 0, transform: [{ rotate: '-35deg' }] },
  wrenchBar: { width: 2, height: 10, borderRadius: 1, marginTop: -2, transform: [{ rotate: '-35deg' }] },
  info: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.6, alignItems: 'center', justifyContent: 'center' },
  infoText: { fontSize: 12, fontWeight: '800', lineHeight: 14 },
  bell: { width: 12, height: 12, borderWidth: 1.6, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  bellDot: { width: 4, height: 3, borderRadius: 2, marginTop: 1 },
  head: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.6, marginBottom: 1 },
  shoulders: { width: 14, height: 7, borderWidth: 1.6, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomWidth: 0 },
});
