import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AccountScreen } from '../screens/AccountScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrderConfirmedScreen } from '../screens/OrderConfirmedScreen';
import { PhoneCheckScreen } from '../screens/PhoneCheckScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { RepairCheckScreen } from '../screens/RepairCheckScreen';
import { RepairDoneScreen, RepairScreen } from '../screens/RepairScreen';
import { RepairsTabScreen } from '../screens/RepairsTabScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { colors } from '../theme';
import { AboutGlyph, HealthCheckGlyph, HomeGlyph, RepairGlyph, ShopGlyph } from './icons';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabActive = colors.tabActive;
const tabInactive = colors.tabInactive;

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.tabLabelWrap}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      <View style={[styles.tabUnderline, focused && styles.tabUnderlineActive]} />
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        tabBarBackground: () => <View style={styles.tabBg} />,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
          tabBarIcon: ({ color }) => <HomeGlyph color={color} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Shop" focused={focused} />,
          tabBarIcon: ({ color }) => <ShopGlyph color={color} />,
        }}
      />
      <Tab.Screen
        name="HealthCheck"
        component={PhoneCheckScreen}
        options={{
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: 'Health check',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerFab, focused && styles.centerFabActive]}>
              <HealthCheckGlyph color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Repairs"
        component={RepairsTabScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Repairs" focused={focused} />,
          tabBarIcon: ({ color }) => <RepairGlyph color={color} />,
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="About" focused={focused} />,
          tabBarIcon: ({ color }) => <AboutGlyph color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack({ storeName }: { storeName?: string }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen
        name="OrderConfirmed"
        component={OrderConfirmedScreen}
        options={{ title: 'Confirmed', headerBackVisible: false }}
      />
      <Stack.Screen name="Repair" component={RepairScreen} options={{ title: 'Repair' }} />
      <Stack.Screen name="RepairCheck" component={RepairCheckScreen} options={{ title: 'Availability' }} />
      <Stack.Screen
        name="RepairDone"
        component={RepairDoneScreen}
        options={{ title: 'Booked', headerBackVisible: false }}
      />
      <Stack.Screen name="PhoneCheck" component={PhoneCheckScreen} options={{ title: 'Phone check' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: storeName || 'Contact' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: 'Login', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { store, loading: storeLoading } = useStore();
  const { loading: authLoading } = useAuth();

  // Guest can browse; splash only while session restore + store bootstrap.
  const booting = authLoading || storeLoading;

  if (booting) {
    return (
      <View style={styles.splash}>
        <Image source={require('../assets/rm-mark.png')} style={styles.splashMark} resizeMode="contain" />
        <ActivityIndicator color={colors.accentSoft} size="large" style={styles.splashLoader} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bg,
          card: colors.card,
          primary: colors.accent,
          text: colors.ink,
          border: colors.line,
        },
      }}>
      <AppStack storeName={store?.name} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  splashMark: { width: 260, height: 180 },
  splashLoader: { marginTop: 36 },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 74,
    borderRadius: 28,
    borderTopWidth: 0,
    backgroundColor: colors.tabBar,
    elevation: 16,
    paddingTop: 8,
    paddingBottom: 10,
    overflow: 'visible',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.tabBar,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(77, 163, 255, 0.35)',
  },
  tabLabelWrap: { alignItems: 'center', gap: 3, marginTop: 3 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: tabInactive },
  tabLabelActive: { color: tabActive },
  tabUnderline: { width: 0, height: 2, borderRadius: 99, backgroundColor: tabActive },
  tabUnderlineActive: { width: 18 },
  centerFab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fab,
    borderWidth: 3,
    borderColor: '#EAF3FF',
    shadowColor: colors.fab,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  centerFabActive: {
    backgroundColor: colors.fabActive,
    shadowOpacity: 0.65,
  },
});
