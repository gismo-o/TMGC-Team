
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Droplets, Wind, Sun, Leaf, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { userService } from '../services/userService';
import { useUser } from '../context/UserContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SkinType'>;
};

const skinTypes = [
  { id: 'normal', name: 'Normal', icon: Sun, desc: 'Dengeli, ne çok yağlı ne çok kuru.' },
  { id: 'dry', name: 'Kuru', icon: Wind, desc: 'Gergin, pul pul dökülmeye meyilli.' },
  { id: 'oily', name: 'Yağlı', icon: Droplets, desc: 'Parlamaya meyilli, gözenekleri belirgin.' },
  { id: 'combination', name: 'Karma', icon: Leaf, desc: 'T bölgesi yağlı, yanaklar normal/kuru.' },
];

export default function SkinTypeScreen({ navigation }: Props) {
  const { profile, updateUserProfile } = useUser();
  const [selected, setSelected] = useState(() => {
    const currentType = skinTypes.find(t => `${t.name} Cilt` === profile.skinType);
    return currentType ? currentType.id : '';
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      // TODO: Replace 'current-user-id' with actual logged in user id
      await userService.updateSkinType('current-user-id', selected);
      
      const selectedType = skinTypes.find(t => t.id === selected);
      if (selectedType) {
         updateUserProfile({ skinType: `${selectedType.name} Cilt` });
      }

      console.log('Skin type updated successfully');
      navigation.navigate('SkinConditions' as any);
    } catch (error) {
      console.error('Skin type update error:', error);
      Alert.alert('Hata', 'Cilt tipi güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#426447" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Cilt Tipiniz Nedir?</Text>
          <Text style={styles.subtitle}>Size en uygun ürün önerileri için cilt tipinizi seçin.</Text>
        </View>
        <ScrollView contentContainerStyle={styles.list}>
          {skinTypes.map(type => {
            const Icon = type.icon;
            const isSelected = selected === type.id;
            return (
              <TouchableOpacity 
                key={type.id} 
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(type.id)}
              >
                <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                  <Icon size={24} color={isSelected ? '#426447' : '#707973'} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{type.name}</Text>
                  <Text style={styles.cardDesc}>{type.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity 
          style={[styles.button, (!selected || loading) && styles.buttonDisabled]} 
          disabled={!selected || loading}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Kaydet ve İlerle'}</Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 30 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#1b1c1c', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#404943' },
  list: { paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, alignItems: 'center' },
  cardSelected: { borderColor: '#426447', backgroundColor: '#e9efea' },
  iconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconWrapperSelected: { backgroundColor: '#cce8d0' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1b1c1c', marginBottom: 4 },
  cardTitleSelected: { color: '#426447' },
  cardDesc: { fontSize: 14, color: '#404943' },
  button: { flexDirection: 'row', backgroundColor: '#426447', paddingVertical: 16, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 }
});
