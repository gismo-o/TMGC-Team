
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Category, ProductDraft } from '../types';
import { ArrowLeft, Check, Sparkles, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useProducts } from '../context/ProductContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductReview'>;
  route: RouteProp<RootStackParamList, 'ProductReview'>;
};

const defaultProductData: ProductDraft = {
  name: 'Niacinamide 10% + Zinc 1%',
  brand: 'The Ordinary',
  category: 'Serum' as Category,
  imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
  description: 'Leke görünümünü azaltan ve sebum dengeleyen serum.',
  activeIngredients: ['Niacinamide', 'Zinc PCA'],
  expiryDate: '2027-01',
  timeOfDay: 'both',
};

export default function ProductReviewScreen({ navigation, route }: Props) {
  const { addProduct } = useProducts();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'both'>('morning');
  const [loading, setLoading] = useState(false);
  const [productData] = useState<ProductDraft>(route.params?.scannedProduct || defaultProductData);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{ hasConflict: boolean, severity: 'high' | 'warning' | 'synergy', message: string, conflictingProduct?: string } | null>(null);
  const [aiSuggestedTime, setAiSuggestedTime] = useState<'morning' | 'evening' | 'both' | null>(null);

  useEffect(() => {
    // Simulate fetching data from backend
    const fetchAiAnalysis = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setAiAnalysis("Bu ürün içerdiği Niacinamide sayesinde cilt bariyerini güçlendirir ve sebum dengesini sağlar. Çinko ile birleştiğinde sivilce oluşumunu engellemeye yardımcı olur.");
      
      const simulatedConflictData: any = {
        hasConflict: true,
        severity: 'synergy',
        message: 'Hyalüronik Asit içeren ürünleriniz ile mükemmel uyum! Birlikte kullanıldığında cilt bariyerini ekstra destekler ve nem oranını artırır.',
      };
      setConflictData(simulatedConflictData);

      const suggestedTime: 'morning' | 'evening' | 'both' = 'both';
      setAiSuggestedTime(suggestedTime);
      setTimeOfDay(productData.timeOfDay || suggestedTime);
    };

    fetchAiAnalysis();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sprint 2 backend note: Persist only structured product data and routine time; do not store raw camera images.
      const productToSave = {
        ...productData,
        timeOfDay,
        imageUrl: '', // Fotoğraf kaydedilmez
      };
      await addProduct(productToSave);
      console.log('Product added successfully');
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: productData.imageUrl }} 
            style={styles.image} 
          />
          <View style={styles.aiBadge}>
            <Sparkles size={16} color="#ffffff" />
            <Text style={styles.aiBadgeText}>Yapay Zeka ile Tanındı</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
             <Text style={styles.label}>Marka</Text>
             <Text style={styles.value}>{productData.brand}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
             <Text style={styles.label}>Ürün Adı</Text>
             <Text style={styles.value}>{productData.name}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
             <Text style={styles.label}>Kategori</Text>
             <Text style={styles.value}>{productData.category}</Text>
          </View>
        </View>

        <View style={styles.aiAnalysisCard}>
          <View style={styles.aiAnalysisHeader}>
            <Sparkles size={20} color="#426447" />
            <Text style={styles.aiAnalysisTitle}>Yapay Zeka İçerik Analizi</Text>
          </View>
          {aiAnalysis ? (
            <Text style={styles.aiAnalysisText}>{aiAnalysis}</Text>
          ) : (
            <Text style={styles.aiAnalysisLoadingText}>Analiz hazırlanıyor...</Text>
          )}
        </View>

        {conflictData && (
          <View style={[
            styles.conflictCard,
            conflictData.severity === 'high' && styles.conflictHigh,
            conflictData.severity === 'warning' && styles.conflictWarning,
            conflictData.severity === 'synergy' && styles.conflictSynergy,
          ]}>
            <View style={styles.conflictHeader}>
              {conflictData.severity === 'high' && <AlertCircle size={20} color="#BA1A1A" />}
              {conflictData.severity === 'warning' && <AlertTriangle size={20} color="#856006" />}
              {conflictData.severity === 'synergy' && <Sparkles size={20} color="#006D3B" />}
              <Text style={[
                styles.conflictTitle,
                conflictData.severity === 'high' && { color: '#BA1A1A' },
                conflictData.severity === 'warning' && { color: '#856006' },
                conflictData.severity === 'synergy' && { color: '#006D3B' },
              ]}>
                {conflictData.severity === 'high' && 'Dikkat: Çakışma Riski'}
                {conflictData.severity === 'warning' && 'Kullanım Önerisi'}
                {conflictData.severity === 'synergy' && 'Mükemmel Uyum'}
              </Text>
            </View>
            <Text style={[
                styles.conflictMessage,
                conflictData.severity === 'high' && { color: '#410002' },
                conflictData.severity === 'warning' && { color: '#2b1c00' },
                conflictData.severity === 'synergy' && { color: '#00210e' },
            ]}>{conflictData.message}</Text>
          </View>
        )}

        <View style={styles.routineSection}>
          <View style={styles.routineTitleContainer}>
            <Text style={styles.routineTitle}>Rutin Zamanı</Text>
            {aiSuggestedTime && (
              <View style={styles.aiSuggestionBadge}>
                <Sparkles size={12} color="#006D3B" />
                <Text style={styles.aiSuggestionText}>Yapay zeka tarafından cildiniz ve ürün içeriği için otomatik önerildi</Text>
              </View>
            )}
          </View>
          <View style={styles.routineButtons}>
            <TouchableOpacity 
              style={[styles.timeButton, timeOfDay === 'morning' && styles.timeButtonActive]}
              onPress={() => setTimeOfDay('morning')}
            >
              <Text style={[styles.timeText, timeOfDay === 'morning' && styles.timeTextActive]}>Sabah</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeButton, timeOfDay === 'evening' && styles.timeButtonActive]}
              onPress={() => setTimeOfDay('evening')}
            >
              <Text style={[styles.timeText, timeOfDay === 'evening' && styles.timeTextActive]}>Akşam</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeButton, timeOfDay === 'both' && styles.timeButtonActive]}
              onPress={() => setTimeOfDay('both')}
            >
              <Text style={[styles.timeText, timeOfDay === 'both' && styles.timeTextActive]}>İkisi de</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Check size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>{loading ? 'Ekleniyor...' : 'Dolabıma Ekle'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1b1c1c' },
  content: { padding: 20 },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#ffffff', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  image: { width: '60%', height: '80%', resizeMode: 'contain' },
  aiBadge: { position: 'absolute', bottom: -16, backgroundColor: '#426447', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  aiBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  detailsContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f0f1ec' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 14, color: '#707973' },
  value: { fontSize: 16, fontWeight: '600', color: '#1b1c1c', flex: 1, textAlign: 'right', marginLeft: 16 },
  separator: { height: 1, backgroundColor: '#f0f1ec' },
  aiAnalysisCard: { backgroundColor: '#e9efea', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#cce8d0' },
  aiAnalysisHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiAnalysisTitle: { fontSize: 16, fontWeight: '700', color: '#426447', marginLeft: 8 },
  aiAnalysisText: { fontSize: 14, color: '#1b1c1c', lineHeight: 22 },
  aiAnalysisLoadingText: { fontSize: 14, color: '#707973', fontStyle: 'italic' },
  conflictCard: { padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  conflictHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  conflictTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8 },
  conflictMessage: { fontSize: 14, lineHeight: 20 },
  conflictHigh: { backgroundColor: '#FFDAD6', borderColor: '#FFB4AB' },
  conflictWarning: { backgroundColor: '#FFEFD7', borderColor: '#F8BD49' },
  conflictSynergy: { backgroundColor: '#C4EED0', borderColor: '#6DD58C' },
  routineSection: { marginBottom: 40 },
  routineTitleContainer: { marginBottom: 16 },
  routineTitle: { fontSize: 16, fontWeight: '600', color: '#1b1c1c' },
  aiSuggestionBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  aiSuggestionText: { fontSize: 11, color: '#006D3B', marginLeft: 4, fontWeight: '500', flex: 1 },
  routineButtons: { flexDirection: 'row', gap: 12 },
  timeButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#c0c9c1', alignItems: 'center' },
  timeButtonActive: { backgroundColor: '#e9efea', borderColor: '#426447' },
  timeText: { fontSize: 14, fontWeight: '600', color: '#707973' },
  timeTextActive: { color: '#426447' },
  footer: { padding: 20, backgroundColor: 'rgba(250, 249, 245, 0.9)', borderTopWidth: 1, borderTopColor: '#f0f1ec' },
  saveButton: { flexDirection: 'row', backgroundColor: '#426447', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { opacity: 0.7 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' }
});
