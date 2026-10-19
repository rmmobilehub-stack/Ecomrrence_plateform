import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from './AppText';
import { useAppTheme } from '../context/ThemeContext';
import { formatMoney } from '../money';
import type { DeviceEstimate } from '../types';
import { PrimaryButton, SecondaryButton } from '../ui';

type Props = { estimate: DeviceEstimate; modelName?: string; onShop: () => void; onRepair: () => void };
export function PhoneScoreCard({ estimate, modelName, onShop, onRepair }: Props) {
  const { colors } = useAppTheme();
  const score = Math.max(0, Math.min(100, Number(estimate.score) || 0));
  return <View accessibilityLiveRegion="polite" style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
    <View style={styles.heading}>
      <View style={[styles.reportIcon, { backgroundColor: colors.bg }]}>
        <Icon name="pulse-outline" size={23} color={colors.accentSoft} />
      </View>
      <View style={styles.copy}><Text style={[styles.title, { color: colors.ink }]}>Your phone report</Text>
        {modelName ? <Text style={[styles.subtitle, { color: colors.muted }]}>{modelName}</Text> : null}</View>
    </View>
    <View style={[styles.scorePanel, { backgroundColor: colors.bg }]}>
      <Text style={[styles.subtitle, { color: colors.muted }]}>PHONE HEALTH</Text>
      <Text style={[styles.score, { color: colors.accentSoft }]}>{score}<Text style={[styles.unit, { color: colors.muted }]}> / 100</Text></Text>
      <Text style={[styles.status, { color: colors.ink }]}>{estimate.scoreLabel}</Text>
      <View style={[styles.track, { backgroundColor: colors.cardBorder }]} accessibilityRole="progressbar" accessibilityLabel="Phone health score" accessibilityValue={{ min: 0, max: 100, now: score }}>
        <View style={[styles.fill, { width: `${score}%`, backgroundColor: colors.accentSoft }]} />
      </View>
    </View>
    <View style={[styles.valuePanel, { borderColor: colors.cardBorder }]}>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Estimated market worth</Text>
      <View style={styles.priceRange}>
        <View style={styles.priceColumn}>
          <Text style={[styles.caption, { color: colors.muted }]}>From</Text>
          <Text style={[styles.value, { color: colors.ink }]}>{formatMoney(estimate.marketValueMinPkr)}</Text>
        </View>
        <View style={[styles.priceDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.priceColumn}>
          <Text style={[styles.caption, { color: colors.muted }]}>Up to</Text>
          <Text style={[styles.value, { color: colors.ink }]}>{formatMoney(estimate.marketValueMaxPkr)}</Text>
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.muted }]}>Based on the condition details you provided.</Text>
    </View>
    {[
      { title: 'Condition insights', items: estimate.suggestions, icon: 'checkmark-circle-outline' },
      { title: 'Buying advice', items: estimate.buySuggestions, icon: 'bulb-outline' },
    ].filter(section => section.items?.length).map(section => <View key={section.title} style={[styles.section, { borderTopColor: colors.cardBorder }]}>
      <Text style={[styles.sectionTitle, { color: colors.ink }]}>{section.title}</Text>
      {section.items?.map((item, index) => <View key={`${index}-${item}`} style={styles.insight}>
        <Icon name={section.icon} size={18} color={colors.accentSoft} />
        <Text style={[styles.insightText, { color: colors.muted }]}>{item}</Text>
      </View>)}
    </View>)}
    <View style={styles.actions}>
      <PrimaryButton label="Shop accessories" onPress={onShop} color={colors.accent} />
      <SecondaryButton label="Book a repair" onPress={onRepair} />
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  title: { fontSize: 19, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  scorePanel: { alignItems: 'center', padding: 20, borderRadius: 16, gap: 8 },
  score: { fontSize: 52, lineHeight: 62, fontWeight: '800' },
  unit: { fontSize: 17, fontWeight: '600' },
  status: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  track: { height: 7, borderRadius: 4, width: '100%', overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 4 },
  valuePanel: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  priceRange: { flexDirection: 'row', alignItems: 'stretch', gap: 12, paddingVertical: 4 },
  priceColumn: { flex: 1, gap: 4, minWidth: 0 },
  priceDivider: { width: 1 },
  value: { fontSize: 18, lineHeight: 26, fontWeight: '800' },
  caption: { fontSize: 12, lineHeight: 18 },
  section: { gap: 12, borderTopWidth: 1, paddingTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  insight: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  insightText: { flex: 1, fontSize: 13, lineHeight: 20 },
  actions: { gap: 10 },
});
