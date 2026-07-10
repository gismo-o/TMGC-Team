import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Home, User } from 'lucide-react-native';

import { RootStackParamList, MainTabParamList } from '../types';
import { colors, fonts, tabBarStyle } from '../theme';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { useProducts } from '../context/ProductContext';

import LoginScreen from '../screens/LoginScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import RoutineScreen from '../screens/RoutineScreen';
import AssistantScreen from '../screens/AssistantScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProductReviewScreen from '../screens/ProductReviewScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.sage,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle,
        tabBarLabelStyle: {
          fontFamily: fonts.sansBold,
          fontSize: 11,
          letterSpacing: 0.4,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Dolabım',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tab.Screen
        name="Routine"
        component={RoutineScreen}
        options={{
          tabBarLabel: 'Rutinim',
          tabBarIcon: ({ color, focused }) => <Calendar color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => <User color={color} size={focused ? 23 : 21} strokeWidth={focused ? 2.4 : 2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { loadProfile, setAccount } = useUser();
  const { loadProducts } = useProducts();
  const [bootState, setBootState] = useState<'checking' | 'authenticated' | 'anonymous'>('checking');

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const user = await authService.restoreSession();
        if (!user) {
          if (!cancelled) setBootState('anonymous');
          return;
        }

        setAccount({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
        await Promise.all([loadProfile(user.id), loadProducts()]);
        if (!cancelled) setBootState('authenticated');
      } catch {
        if (!cancelled) setBootState('anonymous');
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (bootState === 'checking') {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashBrand}>SkinShelf</Text>
        <ActivityIndicator size="small" color={colors.sage} style={{ marginTop: 18 }} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={bootState === 'authenticated' ? 'MainTabs' : 'Login'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="ProductReview"
          component={ProductReviewScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Assistant" component={AssistantScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashBrand: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.forest,
  },
});
