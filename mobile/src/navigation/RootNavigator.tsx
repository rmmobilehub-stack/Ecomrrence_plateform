import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import { RepairDoneScreen, RepairScreen } from '../screens/RepairScreen';
import { RepairsTabScreen } from '../screens/RepairsTabScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { colors } from '../theme';
import { AboutGlyph, HomeGlyph, RepairGlyph, ShopGlyph } from './icons';
import type { AuthStackParamList, RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const tabActive = '#8EC8FF';
const tabInactive = '#6B86A8';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>;
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

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7FCFF' } }}>
      <AuthStackNav.Screen name="Auth" component={AuthScreen} />
    </AuthStackNav.Navigator>
  );
}

function AppStack({ storeName }: { storeName?: string }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
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
      <Stack.Screen
        name="RepairDone"
        component={RepairDoneScreen}
        options={{ title: 'Booked', headerBackVisible: false }}
      />
      <Stack.Screen name="PhoneCheck" component={PhoneCheckScreen} options={{ title: 'Phone check' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ title: storeName || 'Contact' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { store } = useStore();
  const { customer, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050E24' }}>
        <ActivityIndicator color="#4DA3FF" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: customer ? '#050E24' : '#F7FCFF',
          card: colors.card,
          primary: colors.ink,
          text: colors.ink,
          border: colors.line,
        },
      }}>
      {customer ? <AppStack storeName={store?.name} /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 72,
    borderRadius: 28,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#071A33',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(90, 140, 210, 0.28)',
  },
  tabLabel: { fontSize: 11, fontWeight: '600', color: tabInactive, marginTop: 2 },
  tabLabelActive: { color: tabActive },
});
