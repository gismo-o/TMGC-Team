import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ArrowRight, User, Baby, Activity, AlertOctagon, ArrowLeft } from 'lucide-react-native';
import { useUser } from '../context/UserContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SkinConditions'>;
};

export default function SkinConditionsScreen({ navigation }: Props) {
  const { profile, updateUserProfile } = useUser();
  const [gender, setGender] = useState<'Kadın' | 'Erkek' | 'Belirtmek İstemiyorum' | null>(profile.gender);
  const [isPregnant, setIsPregnant] = useState(profile.isPregnant);
  
  const [conditions, setConditions] = useState<string[]>(profile.conditions);
  const [allergens, setAllergens] = useState<string[]>(profile.allergens);
  const [loading, setLoading] = useState(false);

  const skinConditionsList = [
    { id: 'roza', name: 'Roza (Rozasea)' },
    { id: 'egzama', name: 'Egzama / Atopik Cilt' },
    { id: 'akne', name: 'Aktif Akne / Sivilce Problemi' },
    { id: 'leke', name: 'Hiperpigmentasyon (Leke Eğilimi)' },
  ];

  const allergensList = [
    { id: 'parfum', name: 'Parfüm / Esans hassasiyeti' },
    { id: 'alkol', name: 'Alkol hassasiyeti' },
  ];

  const toggleCondition = (id: string) => {
    setConditions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllergen = (id: string) => {
    setAllergens(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!gender) {
      Alert.alert('Bilgi', 'Lütfen cinsiyetinizi seçiniz.');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      updateUserProfile({
        gender,
        isPregnant: gender === 'Kadın' ? isPregnant : false,
        conditions,
        allergens,
        isOnboarded: true,
      });
      console.log('Profile completed:', { gender, isPregnant: gender === 'Kadın' ? isPregnant : false, conditions, allergens });
      
      const routes = navigation.getState()?.routes;
      const isFromProfile = routes && routes.some(r => r.name === 'MainTabs');

      if (isFromProfile) {
        // Profil düzenleme akışından geldiyse MainTabs'e geri dön
        navigation.navigate('MainTabs' as any);
      } else {
        // Kayıt akışından geldiyse stack'i temizle ve ana ekrana yönlendir
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as any }],
        });
      }
    } catch (error) {
      console.error('Error saving conditions:', error);
      Alert.alert('Hata', 'Bilgiler kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#426447" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Özel Durumlar ve Hassasiyetler</Text>
        <Text style={styles.subtitle}>Analizlerin daha doğru olması için cilt özelliklerinizi tamamlayın.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Gender Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cinsiyetiniz</Text>
          <View style={styles.genderRow}>
            {['Kadın', 'Erkek', 'Belirtmek İstemiyorum'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.genderButton,
                  gender === item && styles.selectedButton
                ]}
                onPress={() => {
                  setGender(item as any);
                  if (item !== 'Kadın') setIsPregnant(false);
                }}
              >
                <Text style={[styles.genderText, gender === item && styles.selectedText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pregnancy/Nursing - Conditional */}
        {gender === 'Kadın' && (
          <View style={styles.pregnantCard}>
            <View style={styles.pregnantInfo}>
              <Baby size={24} color="#426447" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pregnantTitle}>Hamilelik veya Emzirme Döneminde misiniz?</Text>
                <Text style={styles.pregnantDesc}>Bazı içerikler bu dönemde kullanıma uygun olmayabilir.</Text>
              </View>
            </View>
            <Switch
              value={isPregnant}
              onValueChange={setIsPregnant}
              trackColor={{ false: '#c0c9c1', true: '#426447' }}
              thumbColor={'#ffffff'}
            />
          </View>
        )}

        {/* Skin Conditions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#1b1c1c" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Cilt Hassasiyetleri ve Rahatsızlıkları</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Birden fazla seçim yapabilirsiniz</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                conditions.length === 0 && styles.selectedCard
              ]}
              onPress={() => setConditions([])}
            >
              <Text style={[
                styles.optionText,
                conditions.length === 0 && styles.selectedText
              ]}>Hiçbir hassasiyetim yok</Text>
            </TouchableOpacity>
            {skinConditionsList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  conditions.includes(item.id) && styles.selectedCard
                ]}
                onPress={() => toggleCondition(item.id)}
              >
                <Text style={[
                  styles.optionText,
                  conditions.includes(item.id) && styles.selectedText
                ]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergens / Blacklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertOctagon size={20} color="#1b1c1c" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Alerjenler / Kara Liste</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Hassas olduğunuz içerikleri seçin</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                allergens.length === 0 && styles.selectedCard
              ]}
              onPress={() => setAllergens([])}
            >
              <Text style={[
                styles.optionText,
                allergens.length === 0 && styles.selectedText
              ]}>Hiçbir alerjim yok</Text>
            </TouchableOpacity>
            {allergensList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  allergens.includes(item.id) && styles.selectedCard
                ]}
                onPress={() => toggleAllergen(item.id)}
              >
                <Text style={[
                  styles.optionText,
                  allergens.includes(item.id) && styles.selectedText
                ]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (!gender || loading) && styles.buttonDisabled]} 
          disabled={!gender || loading}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Profilimi Tamamla'}</Text>
          <ArrowRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf9f5' },
  header: { padding: 24, paddingTop: 40, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1b1c1c', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#707973', lineHeight: 22 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1b1c1c', marginBottom: 12 },
  sectionSubtitle: { fontSize: 14, color: '#707973', marginBottom: 16 },
  
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genderButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    backgroundColor: '#ffffff', 
    borderWidth: 1, 
    borderColor: '#c0c9c1' 
  },
  selectedButton: { backgroundColor: '#e9efea', borderColor: '#426447' },
  genderText: { fontSize: 14, color: '#707973', fontWeight: '500' },
  selectedText: { color: '#426447', fontWeight: '600' },

  pregnantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e9efea',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cce8d0',
    marginBottom: 32,
  },
  pregnantInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 },
  pregnantTitle: { fontSize: 16, fontWeight: '600', color: '#1b1c1c', marginBottom: 4 },
  pregnantDesc: { fontSize: 13, color: '#426447', lineHeight: 18 },

  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c0c9c1',
    width: '100%',
  },
  selectedCard: { backgroundColor: '#e9efea', borderColor: '#426447' },
  optionText: { fontSize: 15, color: '#1b1c1c', fontWeight: '500' },

  footer: { 
    padding: 24, 
    backgroundColor: 'rgba(250, 249, 245, 0.9)', 
    borderTopWidth: 1, 
    borderTopColor: '#f0f1ec',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: { 
    backgroundColor: '#426447', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: 16 
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
