import Icon from 'react-native-vector-icons/Ionicons';

const TAB = 24;
const FAB = 26;
const HEADER = 22;

/** Home — house */
export function HomeGlyph({ color }: { color: string }) {
  return <Icon name="home-outline" size={TAB} color={color} />;
}

/** Shop — shopping bag */
export function ShopGlyph({ color }: { color: string }) {
  return <Icon name="bag-handle-outline" size={TAB} color={color} />;
}

/** Repairs — tools / wrench */
export function RepairGlyph({ color }: { color: string }) {
  return <Icon name="construct-outline" size={TAB} color={color} />;
}

/** About — info */
export function AboutGlyph({ color }: { color: string }) {
  return <Icon name="information-circle-outline" size={TAB} color={color} />;
}

export function BellGlyph({ color }: { color: string }) {
  return <Icon name="notifications-outline" size={HEADER} color={color} />;
}

export function UserGlyph({ color }: { color: string }) {
  return <Icon name="person-outline" size={HEADER} color={color} />;
}

export function HeartGlyph({ color }: { color: string }) {
  return <Icon name="heart-outline" size={HEADER} color={color} />;
}

/** Center FAB — trading / breakdown chart */
export function HealthCheckGlyph({ color = '#FFFFFF' }: { color?: string }) {
  return <Icon name="stats-chart" size={FAB} color={color} />;
}
