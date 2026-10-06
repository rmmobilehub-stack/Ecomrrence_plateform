import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { OrderConfirmedScreen } from '../screens/OrderConfirmedScreen';
import { PhoneCheckScreen } from '../screens/PhoneCheckScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { RepairDoneScreen, RepairScreen } from '../screens/RepairScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: focused ? colors.ink : colors.muted }}>{label}</Text>
  );
}

function Tabs() {
  const { count } = useCart();
  const { accent } = useStore();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.muted,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Shop" focused={focused} /> }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: ({ focused }) => <TabIcon label="Cart" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="More" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { store } = useStore();
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.card, primary: colors.ink, text: colors.ink, border: colors.line },
      }}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Product' }} />
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
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: store?.name || 'Contact' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
