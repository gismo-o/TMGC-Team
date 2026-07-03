
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { User, Settings, Shield, CircleHelp, LogOut, Sparkles } from 'lucide-react-native';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { profile } = useUser();
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
          <View style={styles.avatar}>
            <User size={40} color="#426447" />
          </View>
          <Text style={styles.name}>Gizem Koz</Text>
          <Text style={styles.email}>kozgizemm@gmail.com</Text>
          <View style={styles.skinTypeBadge}>
             <Text style={styles.skinTypeText}>{profile.skinType}</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('SkinType' as any)}
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
              <TouchableOpacity key={index} style={styles.menuItem}>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1b1c1c' },
  content: { padding: 20 },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e9efea', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#1b1c1c', marginBottom: 4 },
  email: { fontSize: 14, color: '#707973', marginBottom: 16 },
  skinTypeBadge: { backgroundColor: '#426447', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  skinTypeText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  menuContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 8, marginBottom: 32, borderWidth: 1, borderColor: '#f0f1ec' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f1ec' },
  menuIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { fontSize: 16, color: '#1b1c1c', fontWeight: '500' },
  inlineBadge: { backgroundColor: '#e9efea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  inlineBadgeText: { color: '#426447', fontSize: 12, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#ffdad6', borderRadius: 16 },
  logoutText: { color: '#BA1A1A', fontSize: 16, fontWeight: '600' }
});
