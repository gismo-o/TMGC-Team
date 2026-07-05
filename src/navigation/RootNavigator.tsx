import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Home, User } from 'lucide-react-native';

import { RootStackParamList, MainTabParamList } from '../types';

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

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#426447',
        tabBarInactiveTintColor: '#707973',
        tabBarStyle: {
          backgroundColor: '#FAF9F5',
          borderTopWidth: 1,
          borderTopColor: '#e9efea',
          elevation: 12,
          shadowColor: '#14351f',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 14,
          height: 68,
          paddingBottom: 10,
          paddingTop: 9,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 8,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Dolabım',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Routine"
        component={RoutineScreen}
        options={{
          tabBarLabel: 'Rutinim',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF9F5' } }}
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
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
