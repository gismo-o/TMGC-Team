
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Category, ProductDraft } from '../types';
import { ArrowLeft, Check, Sparkles, AlertCircle, AlertTriangle, Plus, X } from 'lucide-react-native';
import { useProducts } from '../context/ProductContext';
import { getProductVisualSource } from '../services/productVisualCatalog';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductReview'>;
  route: RouteProp<RootStackParamList, 'ProductReview'>;
};

const defaultProductData: ProductDraft = {
  name: 'Effaclar duo+',
  brand: 'La Roche-Posay',
  category: 'Serum' as Category,
  imageUrl: '',
  cutoutImageUrl: 'local:la-roche-effaclar-kplus',
  description: 'Niacinamide, Zinc PCA ve salisilik asit içeren hedefli bakım ürünü.',
  activeIngredients: ['Niacinamide', 'Zinc PCA', 'Salicylic Acid'],
  expiryDate: '2027-01',
  timeOfDay: 'both',
};

const categoryOptions: Category[] = ['Temizleyici', 'Tonik', 'Serum', 'Göz Kremi', 'Nemlendirici', 'Güneş Kremi', 'Maske', 'Diğer'];

export default function ProductReviewScreen({ navigation, route }: Props) {
  const { addProduct, updateProduct } = useProducts();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'both'>('morning');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductDraft>(route.params?.scannedProduct || defaultProductData);
  const [productImageFailed, setProductImageFailed] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{ hasConflict: boolean, severity: 'high' | 'warning' | 'synergy', message: string, conflictingProduct?: string } | null>(null);
  const [aiSuggestedTime, setAiSuggestedTime] = useState<'morning' | 'evening' | 'both' | null>(null);
  const [ingredientInput, setIngredientInput] = useState('');
  const editingProductId = route.params?.editingProductId;
  const activeIngredients = productData.activeIngredients || [];

  useEffect(() => {
    setProductImageFailed(false);
  }, [productData.cutoutImageUrl, productData.category]);

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

  const updateProductField = <K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIngredient = () => {
    const nextIngredient = ingredientInput.trim();
    if (!nextIngredient) return;

    updateProductField('activeIngredients', [...activeIngredients, nextIngredient]);
    setIngredientInput('');
  };

  const handleRemoveIngredient = (ingredientIndex: number) => {
    updateProductField(
      'activeIngredients',
      activeIngredients.filter((_, index) => index !== ingredientIndex)
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sprint 2 backend note: Persist only structured product data and routine time; do not store raw camera images.
      const productToSave = {
        ...productData,
        timeOfDay,
      };
      if (editingProductId) {
        await updateProduct(editingProductId, productToSave);
      } else {
        await addProduct(productToSave);
      }
      console.log('Product saved successfully');
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
        <Text style={styles.headerTitle}>{editingProductId ? 'Ürün Düzenle' : 'Ürün Ekle'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={getProductVisualSource(productData, productImageFailed)}
            style={styles.image} 
            resizeMode="contain"
            onError={() => setProductImageFailed(true)}
          />
          <View style={styles.aiBadge}>
            <Sparkles size={16} color="#ffffff" />
            <Text style={styles.aiBadgeText}>Yapay Zeka ile Tanındı</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.sourceNotice}>
            <Sparkles size={14} color="#426447" />
            <Text style={styles.sourceNoticeText}>Otomatik gelen bilgiler onaydan önce düzenlenebilir.</Text>
          </View>
          <View style={styles.detailRow}>
             <Text style={styles.label}>Marka</Text>
             <TextInput
               style={styles.inputValue}
               value={productData.brand}
               onChangeText={value => updateProductField('brand', value)}
               placeholder="Marka"
               placeholderTextColor="#9aa49d"
             />
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
             <Text style={styles.label}>Ürün Adı</Text>
             <TextInput
               style={styles.inputValue}
               value={productData.name}
               onChangeText={value => updateProductField('name', value)}
               placeholder="Ürün adı"
               placeholderTextColor="#9aa49d"
             />
          </View>
          <View style={styles.separator} />
          <View style={styles.categorySection}>
             <Text style={styles.label}>Kategori</Text>
             <View style={styles.categoryChips}>
               {categoryOptions.map(category => (
                 <TouchableOpacity
                   key={category}
                   style={[styles.categoryChip, productData.category === category && styles.categoryChipActive]}
                   onPress={() => updateProductField('category', category)}
                 >
                   <Text style={[styles.categoryChipText, productData.category === category && styles.categoryChipTextActive]}>
                     {category}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.ingredientSection}>
            <Text style={styles.label}>Öne Çıkan İçerikler</Text>
            <View style={styles.ingredientChips}>
              {activeIngredients.length ? (
                activeIngredients.map((ingredient, index) => (
                  <TouchableOpacity
                    key={`${ingredient}-${index}`}
                    style={styles.ingredientChip}
                    onPress={() => handleRemoveIngredient(index)}
                  >
                    <Text style={styles.ingredientChipText}>{ingredient}</Text>
                    <X size={12} color="#426447" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyIngredientsText}>İçerik eklenmedi.</Text>
              )}
            </View>
            <View style={styles.ingredientInputRow}>
              <TextInput
                style={styles.ingredientInput}
                value={ingredientInput}
                onChangeText={setIngredientInput}
                onSubmitEditing={handleAddIngredient}
                placeholder="İçerik ekle"
                placeholderTextColor="#9aa49d"
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addIngredientButton} onPress={handleAddIngredient}>
                <Plus size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
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
          <Text style={styles.saveButtonText}>{loading ? 'Kaydediliyor...' : editingProductId ? 'Değişiklikleri Kaydet' : 'Dolabıma Ekle'}</Text>
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
  content: { padding: 20, paddingBottom: 120 },
  imageContainer: { width: '100%', height: 250, backgroundColor: '#ffffff', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  image: { width: '60%', height: '80%', resizeMode: 'contain' },
  aiBadge: { position: 'absolute', bottom: -16, backgroundColor: '#426447', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  aiBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  detailsContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f0f1ec' },
  sourceNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9efea', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  sourceNoticeText: { flex: 1, marginLeft: 8, color: '#426447', fontSize: 12, fontWeight: '600' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 14, color: '#707973' },
  inputValue: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: '#FAF9F5', paddingHorizontal: 12, color: '#1b1c1c', fontSize: 15, fontWeight: '600', textAlign: 'right', marginLeft: 16 },
  separator: { height: 1, backgroundColor: '#f0f1ec' },
  categorySection: { paddingTop: 14 },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: '#FAF9F5', borderWidth: 1, borderColor: '#dbe2dd' },
  categoryChipActive: { backgroundColor: '#426447', borderColor: '#426447' },
  categoryChipText: { color: '#526159', fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: '#ffffff' },
  ingredientSection: { paddingTop: 14 },
  ingredientChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  ingredientChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: '#edf4ee', borderWidth: 1, borderColor: '#cce0d0', gap: 6 },
  ingredientChipText: { color: '#426447', fontSize: 12, fontWeight: '700' },
  emptyIngredientsText: { color: '#707973', fontSize: 13, marginTop: 2 },
  ingredientInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  ingredientInput: { flex: 1, minHeight: 42, borderRadius: 12, backgroundColor: '#FAF9F5', borderWidth: 1, borderColor: '#dbe2dd', paddingHorizontal: 12, color: '#1b1c1c', fontSize: 14, fontWeight: '600' },
  addIngredientButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center' },
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
