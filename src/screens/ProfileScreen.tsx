
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { User, Settings, Shield, CircleHelp, LogOut, Sparkles } from 'lucide-react-native';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { useProducts } from '../context/ProductContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { profile } = useUser();
  const { products } = useProducts();
  const menuItems = [
    { icon: Settings, label: 'Hesap Ayarları' },
    { icon: Shield, label: 'Gizlilik ve Güvenlik' },
    { icon: CircleHelp, label: 'Yardım ve Destek' },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      console.log('Logged out successfully');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <User size={38} color="#426447" />
            </View>
          </View>
          <Text style={styles.name}>Gizem Koz</Text>
          <Text style={styles.email}>kozgizemm@gmail.com</Text>
          <View style={styles.skinTypeBadge}>
             <Text style={styles.skinTypeText}>{profile.skinType}</Text>
          </View>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Ürün</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Hazır</Text>
              <Text style={styles.statLabel}>Rutin</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Tam</Text>
              <Text style={styles.statLabel}>Profil</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Onboarding' as any)}
          >
            <View style={styles.menuIconBox}>
              <Sparkles size={20} color="#404943" />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Cilt Profilini Düzenle</Text>
            <View style={styles.inlineBadge}>
              <Text style={styles.inlineBadgeText}>{profile.skinType}</Text>
            </View>
          </TouchableOpacity>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
              >
                <View style={styles.menuIconBox}>
                  <Icon size={20} color="#404943" />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#BA1A1A" style={{ marginRight: 12 }} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { paddingTop: androidHeaderPadding, paddingBottom: 18, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#14351f' },
  content: { padding: 20, paddingBottom: 120 },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#14351f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 6,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#edf1ee',
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#ead7d6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#f7eeee', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 25, fontWeight: '900', color: '#1b1c1c', marginBottom: 4 },
  email: { fontSize: 14, color: '#707973', marginBottom: 14, fontWeight: '600' },
  skinTypeBadge: { backgroundColor: '#fff1f1', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 16, marginBottom: 18, borderWidth: 1, borderColor: '#ead7d6' },
  skinTypeText: { color: '#426447', fontSize: 12, fontWeight: '900' },
  profileStats: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf7',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#edf1ee',
    paddingVertical: 13,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#14351f', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#68746b', fontSize: 11, fontWeight: '800', marginTop: 3 },
  statDivider: { width: 1, height: 28, backgroundColor: '#e1e8e2' },
  menuContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 8, marginBottom: 28, borderWidth: 1, borderColor: '#edf1ee' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f1ec' },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { fontSize: 16, color: '#1b1c1c', fontWeight: '800' },
  inlineBadge: { backgroundColor: '#e9efea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  inlineBadgeText: { color: '#426447', fontSize: 12, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#ffdad6', borderRadius: 18 },
  logoutText: { color: '#BA1A1A', fontSize: 16, fontWeight: '900' }
});
