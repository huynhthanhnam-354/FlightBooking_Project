import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import AppIcon from './src/components/AppIcon';
import { AppIconName } from './src/theme/icons';

import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import WelcomeScreen  from './src/screens/WelcomeScreen';
import HomeScreen     from './src/screens/HomeScreen';
import SearchScreen   from './src/screens/SearchScreen';
import BookingScreen  from './src/screens/BookingScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import LoginScreen    from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EticketScreen from './src/screens/EticketScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS: Record<string, AppIconName> = {
  Home: 'home', Flights: 'airplane', Bookings: 'ticket', Profile: 'profile',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconName = TAB_ICONS[name] ?? 'home';
  return (
    <View style={styles.tabIcon}>
      <AppIcon name={iconName} size={22} color={focused ? '#0064D2' : '#9CA3AF'} />
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

function MainTabs() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0064D2',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}    options={{ title: t('tab_home') }} />
      <Tab.Screen name="Flights"  component={SearchScreen}  options={{ title: t('tab_flights') }} />
      <Tab.Screen name="Bookings" component={BookingScreen} options={{ title: t('tab_bookings') }} />
      <Tab.Screen name="Profile"  component={ProfileScreen} options={{ title: t('tab_profile') }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome"  component={WelcomeScreen} />
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Eticket" component={EticketScreen} />
        <Stack.Screen name="Main"     component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  tabBar:    { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', elevation: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  tabLabel:  { fontSize: 11, fontWeight: '500' },
  tabIcon:   { alignItems: 'center' },
  tabDot:    { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0064D2', marginTop: 2 },
});
