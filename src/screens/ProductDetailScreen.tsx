import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Sparkles, Droplets, Wind, Sun, Leaf, Edit2, Lightbulb, CheckCircle2, ThumbsDown, ThumbsUp, X } from 'lucide-react-native';
import { useProducts } from '../context/ProductContext';
import { getProductVisualSource } from '../services/productVisualCatalog';
import { getProductShellyComment, getProductStatus } from '../services/shellyInsights';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Temizleyici': return <Wind size={48} color="#426447" />;
    case 'Tonik': return <Droplets size={48} color="#426447" />;
    case 'Serum': return <Droplets size={48} color="#426447" />;
    case 'Nemlendirici': return <Leaf size={48} color="#426447" />;
    case 'Güneş Kremi': return <Sun size={48} color="#426447" />;
    default: return <Sparkles size={48} color="#426447" />;
  }
};

const getRemainingDays = (dateString?: string) => {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpired = (dateString?: string) => {
  const days = getRemainingDays(dateString);
  return days !== null && days < 0;
};

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { products } = useProducts();
  const [imageFailed, setImageFailed] = useState(false);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const product = products.find(p => p.id === route.params.productId);

  if (!product) {
    return (
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
        <View style={styles.sheet}>
          <Text style={styles.name}>Ürün bulunamadı.</Text>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    const { id, ...productDraft } = product;
    navigation.navigate('ProductReview', { scannedProduct: productDraft, editingProductId: id });
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs');
  };

  const remainingDays = getRemainingDays(product.expiryDate);
  const expired = isExpired(product.expiryDate);

  const displayedIngredients = product.activeIngredients?.length ? product.activeIngredients : ['İçerik bilgisi bekleniyor'];
  const productDescription = product.description || 'Bu ürün için açıklama bilgisi henüz eklenmedi.';

  const shellyComment = getProductShellyComment(product);
  const productStatus = getProductStatus(product);
  const usageLabel = product.timeOfDay === 'morning' ? 'Sabah' : product.timeOfDay === 'evening' ? 'Akşam' : 'Sabah / Akşam';

  return (
    <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        {/* Modal Handle */}
        <View style={styles.handle} />
        
        {/* Header & Edit Button */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity style={styles.editIconButton} onPress={handleClose}>
            <X size={20} color="#707973" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editIconButton} onPress={handleEdit}>
            <Edit2 size={20} color="#707973" />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Icon & Title */}
          <View style={styles.topSection}>
            <View style={styles.visualStage}>
              <View style={styles.iconWrapper}>
                {getCategoryIcon(product.category)}
              </View>
              <Image
                source={getProductVisualSource(product, imageFailed)}
                style={styles.productImage}
                resizeMode="contain"
                onError={() => setImageFailed(true)}
              />
            </View>

            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{productStatus.label}</Text>
              </View>
              <View style={styles.usageBadge}>
                <Text style={styles.usageBadgeText}>{usageLabel}</Text>
              </View>
            </View>
            
            {(remainingDays !== null || expired) && (
              <View style={[styles.expiryBadge, expired && styles.expiredBadge]}>
                <Text style={[styles.expiryText, expired && styles.expiredText]}>
                  {expired ? 'Süresi Doldu' : `${remainingDays} gün kaldı`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Kategori</Text>
              <Text style={styles.infoValue}>{product.category}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Kullanım</Text>
              <Text style={styles.infoValue}>{usageLabel}</Text>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öne Çıkan İçerikler</Text>
            <View style={styles.ingredientsContainer}>
              {displayedIngredients.map((ing, idx) => (
                <View key={idx} style={styles.ingredientBadge}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ürün Hakkında</Text>
            <Text style={styles.bodyText}>{productDescription}</Text>
          </View>

          {/* Shelly Comment */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Lightbulb size={20} color="#8a6100" style={{ marginRight: 8 }} />
              <Text style={styles.aiCardTitle}>Shelly’nin Yorumu</Text>
            </View>
            <Text style={styles.aiCardText}>{shellyComment}</Text>
          </View>

          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <CheckCircle2 size={18} color="#426447" />
              <Text style={styles.feedbackTitle}>Kullanım geri bildirimi</Text>
            </View>
            <Text style={styles.feedbackText}>Shelly zamanla ürünün cildindeki etkisini bu kayıtlardan öğrenir.</Text>
            <View style={styles.feedbackActions}>
              <TouchableOpacity
                style={[styles.feedbackButton, feedback === 'good' && styles.feedbackButtonActive]}
                onPress={() => setFeedback('good')}
                activeOpacity={0.78}
              >
                <ThumbsUp size={16} color={feedback === 'good' ? '#ffffff' : '#426447'} />
                <Text style={[styles.feedbackButtonText, feedback === 'good' && styles.feedbackButtonTextActive]}>İyi geldi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackButton, feedback === 'bad' && styles.feedbackButtonDanger]}
                onPress={() => setFeedback('bad')}
                activeOpacity={0.78}
              >
                <ThumbsDown size={16} color={feedback === 'bad' ? '#ffffff' : '#BA1A1A'} />
                <Text style={[styles.feedbackButtonTextDanger, feedback === 'bad' && styles.feedbackButtonTextActive]}>Kötü geldi</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FAF9F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c0c9c1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  editIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f1ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  visualStage: {
    width: 176,
    height: 176,
    borderRadius: 38,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#edf1ee',
    shadowColor: '#14351f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  iconWrapper: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#e9efea',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.22,
  },
  productImage: {
    width: 132,
    height: 154,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#426447',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1b1c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statusBadge: { backgroundColor: '#fff4f2', borderWidth: 1, borderColor: '#ecd4d3', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6 },
  statusBadgeText: { color: '#8a4f4d', fontSize: 12, fontWeight: '900' },
  usageBadge: { backgroundColor: '#e9efea', borderWidth: 1, borderColor: '#d4e2d6', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6 },
  usageBadgeText: { color: '#426447', fontSize: 12, fontWeight: '900' },
  expiryBadge: {
    backgroundColor: '#ffdad6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiredBadge: {
    backgroundColor: '#BA1A1A',
  },
  expiryText: {
    color: '#BA1A1A',
    fontWeight: '700',
    fontSize: 12,
  },
  expiredText: {
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#edf1ee',
  },
  infoLabel: { color: '#68746b', fontSize: 11, fontWeight: '800', marginBottom: 5 },
  infoValue: { color: '#14351f', fontSize: 14, fontWeight: '900' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b1c1c',
    marginBottom: 12,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientBadge: {
    backgroundColor: '#e9efea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ingredientText: {
    color: '#426447',
    fontSize: 14,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 15,
    color: '#404943',
    lineHeight: 22,
  },
  aiCard: {
    backgroundColor: '#fefce8',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#854d0e',
  },
  aiCardText: {
    fontSize: 15,
    color: '#713f12',
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#edf1ee',
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  feedbackTitle: { color: '#14351f', fontSize: 16, fontWeight: '900' },
  feedbackText: { color: '#68746b', fontSize: 13, lineHeight: 18, fontWeight: '700', marginBottom: 12 },
  feedbackActions: { flexDirection: 'row', gap: 10 },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    borderRadius: 15,
    paddingVertical: 12,
    backgroundColor: '#f6f7f3',
    borderWidth: 1,
    borderColor: '#dbe2dd',
  },
  feedbackButtonActive: { backgroundColor: '#426447', borderColor: '#426447' },
  feedbackButtonDanger: { backgroundColor: '#BA1A1A', borderColor: '#BA1A1A' },
  feedbackButtonText: { color: '#426447', fontSize: 13, fontWeight: '900' },
  feedbackButtonTextDanger: { color: '#BA1A1A', fontSize: 13, fontWeight: '900' },
  feedbackButtonTextActive: { color: '#ffffff' },
});
