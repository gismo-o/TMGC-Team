
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList, Product } from '../types';
import { useProducts } from '../context/ProductContext';
import { Camera, Droplets, Wind, Sun, Leaf, Sparkles, AlertCircle, User, ArrowDownUp, Trash2, Bell, Plus } from 'lucide-react-native';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const getRemainingDays = (dateString?: string) => {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpiringSoon = (dateString?: string) => {
  const days = getRemainingDays(dateString);
  return days !== null && days <= 60 && days >= 0;
};

const isExpired = (dateString?: string) => {
  const days = getRemainingDays(dateString);
  return days !== null && days < 0;
};


const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Temizleyici': return <Wind size={24} color="#426447" />;
    case 'Tonik': return <Droplets size={24} color="#426447" />;
    case 'Serum': return <Droplets size={24} color="#426447" />;
    case 'Nemlendirici': return <Leaf size={24} color="#426447" />;
    case 'Güneş Kremi': return <Sun size={24} color="#426447" />;
    default: return <Sparkles size={24} color="#426447" />;
  }
};

const ProductListItem = ({ product, index, onPress, onDelete, showNumber = false }: any) => {
  const isExpiring = isExpiringSoon(product.expiryDate);
  const expired = isExpired(product.expiryDate);
  return (
    <View style={styles.routineItem}>
      {showNumber && (
        <View style={styles.routineNumber}>
          <Text style={styles.routineNumberText}>{index + 1}</Text>
        </View>
      )}
      <View style={styles.routineItemContent}>
        <TouchableOpacity style={styles.cardClickArea} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            {getCategoryIcon(product.category)}
          </View>
          <View style={styles.routineItemText}>
            <Text style={styles.productBrandText} numberOfLines={1}>{product.brand}</Text>
            <Text style={styles.productNameText} numberOfLines={1}>{product.name}</Text>
            {(isExpiring || expired) && (
               <Text style={[styles.expiryText, expired && styles.expiredText]}>
                 {expired ? 'Süresi Doldu' : `${getRemainingDays(product.expiryDate)} gün kaldı`}
               </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onDelete(); }} style={styles.deleteButton} activeOpacity={0.6}>
          <Trash2 size={20} color="#BA1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default function HomeScreen({ navigation }: Props) {
  const { products, updateProduct, deleteProduct } = useProducts();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'expiryDate'>('category');

  const filteredProducts = products.filter(p => p.timeOfDay === timeOfDay || p.timeOfDay === 'both');

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'expiryDate') {
      const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return dateA - dateB;
    }
    return 0;
  });

  const routineOrder = ['Temizleyici', 'Tonik', 'Serum', 'Göz Kremi', 'Nemlendirici', 'Güneş Kremi', 'Maske', 'Diğer'];
  const sortedRoutine = [...filteredProducts].sort((a, b) => {
    return routineOrder.indexOf(a.category) - routineOrder.indexOf(b.category);
  });

  const handleFavoriteToggle = async (product: Product) => {
    try {
      await updateProduct(product.id, { isFavorite: !product.isFavorite });
    } catch (error) {
      Alert.alert('Hata', 'Favori durumu güncellenemedi.');
    }
  };

  const handleDeleteProduct = async (userProductId: string) => {
    try {
      // Sprint 2 backend note: Delete the product from the persisted closet through the product API.
      await deleteProduct(userProductId);
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Hata', 'Ürün silinemedi.');
    }
  };

  const handleDelete = (product: Product) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const confirmed = window.confirm(`${product.brand} - ${product.name} dolabınızdan kaldırılsın mı?`);
      if (confirmed) {
        handleDeleteProduct(product.id);
      }
    } else {
      Alert.alert(
        'Ürünü Sil',
        `${product.brand} - ${product.name} dolabınızdan kaldırılsın mı?`,
        [
          { text: 'Vazgeç', style: 'cancel' },
          { 
            text: 'Sil', 
            style: 'destructive',
            onPress: () => handleDeleteProduct(product.id)
          }
        ]
      );
    }
  };

  const handleEdit = (product: Product) => {
    Alert.alert('Bilgi', 'Düzenleme ekranı yapım aşamasındadır.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
           <User size={20} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SkinShelf</Text>
        <TouchableOpacity onPress={() => {}}>
           <Bell size={24} color="#426447" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, timeOfDay === 'morning' && styles.toggleButtonActive]} 
            onPress={() => setTimeOfDay('morning')}
          >
            <Text style={[styles.toggleText, timeOfDay === 'morning' && styles.toggleTextActive]}>SABAH (AM)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, timeOfDay === 'evening' && styles.toggleButtonActive]} 
            onPress={() => setTimeOfDay('evening')}
          >
            <Text style={[styles.toggleText, timeOfDay === 'evening' && styles.toggleTextActive]}>AKŞAM (PM)</Text>
          </TouchableOpacity>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyImageContainer}>
               <Image 
                 source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxh_je3r9Elmpe-upqOCUu6Nq-2LMDPSIR0y8ZiXrcQ5g-8hr-JF4eKyt-t3grs3DG0NQzPIFGKrOT7W2oE3V3jftrISpmc7AsEa07tJRPIMfDefJ8rtkcOA9gENi1oUF6LJpyDnYXp2w1AnQp1rR07MAsYMgXqQOW5biiX3RDbUjYOw4tYiAWPc-A24w83sJxrjtz91HN3kAdCF9ASpgNP-yvLfsi6C5LhL7jJ15zNg2Na7vMttWf-w' }}
                 style={styles.emptyImage}
               />
            </View>
            <Text style={styles.emptyTitle}>Dolabınız Boş</Text>
            <Text style={styles.emptyText}>
              {timeOfDay === 'morning' ? 'Sabah rutininiz için henüz bir cilt bakım ürünü eklemediniz.' : 'Akşam rutininiz için henüz bir cilt bakım ürünü eklemediniz.'}
            </Text>
            <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')}>
              <Camera size={24} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.scanButtonText}>Kamerayı Aç / Ürün Tara</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            <View style={styles.sortContainer}>
              <View style={styles.sortHeader}>
                <ArrowDownUp size={16} color="#426447" />
                <Text style={styles.sortLabel}>Sırala:</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortOptions}>
                <TouchableOpacity 
                  style={[styles.sortButton, sortBy === 'category' && styles.sortButtonActive]}
                  onPress={() => setSortBy('category')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'category' && styles.sortButtonTextActive]}>Kategori</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>İsim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sortButton, sortBy === 'expiryDate' && styles.sortButtonActive]}
                  onPress={() => setSortBy('expiryDate')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'expiryDate' && styles.sortButtonTextActive]}>Son Kullanma</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.routineSection} pointerEvents="box-none">
              <View style={styles.routineHeader}>
                <Sparkles size={20} color="#426447" />
                <Text style={styles.routineTitle}>AI Rutin Sıralaması</Text>
              </View>
              <Text style={styles.routineSubtitle}>
                {timeOfDay === 'morning' ? 'Sabah' : 'Akşam'} rutininiz için ürünleri bu sırayla uygulayın:
              </Text>

              <View style={styles.routineList} pointerEvents="box-none">
                {sortBy === 'category' ? (
                  Object.keys(groupedProducts).sort((a, b) => {
                    const indexA = routineOrder.indexOf(a);
                    const indexB = routineOrder.indexOf(b);
                    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                  }).map(category => {
                    const productsInCategory = groupedProducts[category];
                    if (!productsInCategory || productsInCategory.length === 0) return null;
                    return (
                      <View key={category} style={styles.categoryGroup}>
                        <Text style={styles.categoryGroupTitle}>{category}</Text>
                        {productsInCategory.map((product, index) => (
                          <ProductListItem
                            key={product.id}
                            product={product}
                            index={index}
                            showNumber={false}
                            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                            onDelete={() => handleDelete(product)}
                          />
                        ))}
                      </View>
                    );
                  })
                ) : (
                  sortedProducts.map((product, index) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      index={index}
                      showNumber={true}
                      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                      onDelete={() => handleDelete(product)}
                    />
                  ))
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {filteredProducts.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner')}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 64, backgroundColor: 'rgba(250, 249, 245, 0.9)' },
  profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#426447' },
  scrollContent: { paddingBottom: 140 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f0f1ec', borderRadius: 30, padding: 4, marginHorizontal: 20, marginVertical: 16 },
  toggleButton: { flex: 1, paddingVertical: 12, borderRadius: 26, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#707973' },
  toggleTextActive: { color: '#426447' },
  emptyContainer: { alignItems: 'center', paddingHorizontal: 20, marginTop: 40 },
  emptyImageContainer: { width: 200, height: 200, backgroundColor: '#ffffff', borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  emptyImage: { width: 160, height: 160, resizeMode: 'contain' },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#426447', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#707973', textAlign: 'center', marginBottom: 40 },
  scanButton: { flexDirection: 'row', backgroundColor: '#426447', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 32, alignItems: 'center' },
  scanButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  productsContainer: { paddingHorizontal: 20 },
  categorySection: { marginBottom: 24 },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: '#404943', marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#cce8d0', paddingLeft: 8 },
  categoryList: { paddingBottom: 8 },
  productCard: { width: 140, backgroundColor: '#ffffff', borderRadius: 16, padding: 12, marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  alertBadge: { position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#ffdad6', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertText: { fontSize: 10, fontWeight: '600', color: '#BA1A1A' },
  productImageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#f0f1ec', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  productImage: { width: '80%', height: '80%', resizeMode: 'contain' },
  productBrand: { fontSize: 10, fontWeight: '700', color: '#426447', textTransform: 'uppercase', marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '500', color: '#1b1c1c' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f1ec' },
  actionButton: { padding: 4 },
  routineSection: { backgroundColor: '#f0f1ec', borderRadius: 16, padding: 20, marginBottom: 24 },
  routineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  routineTitle: { fontSize: 16, fontWeight: '600', color: '#1b1c1c', marginLeft: 8 },
  routineSubtitle: { fontSize: 14, color: '#707973', marginBottom: 16 },
  routineList: { gap: 12 },
  routineItem: { flexDirection: 'row', alignItems: 'center' },
  routineNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#cce8d0', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: '#f0f1ec' },
  routineNumberText: { fontSize: 14, fontWeight: '700', color: '#092011' },
  routineItemContent: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, position: 'relative', overflow: 'hidden' },
  cardClickArea: { flex: 1, flexDirection: 'row', padding: 12, alignItems: 'center', paddingRight: 60 },
  routineItemImage: { width: 40, height: 40, resizeMode: 'contain', marginRight: 12 },
  routineItemText: { flex: 1 },
  routineItemCategory: { fontSize: 10, color: '#426447', textTransform: 'uppercase', fontWeight: '600' },
  routineItemName: { fontSize: 14, fontWeight: '500', color: '#1b1c1c' },
  addButton: { flexDirection: 'row', backgroundColor: '#cce8d0', alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  addButtonText: { color: '#092011', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  sortContainer: { marginBottom: 20 },
  sortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sortLabel: { fontSize: 14, fontWeight: '600', color: '#426447', marginLeft: 6 },
  sortOptions: { paddingBottom: 4 },
  sortButton: { backgroundColor: '#f0f1ec', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  sortButtonActive: { backgroundColor: '#426447' },
  sortButtonText: { fontSize: 12, fontWeight: '600', color: '#707973' },
  sortButtonTextActive: { color: '#ffffff' },
  sortedListContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  sortedProductCard: { width: '48%', marginRight: 0, marginBottom: 16 },
  categoryGroup: { marginBottom: 16 },
  categoryGroupTitle: { fontSize: 16, fontWeight: '600', color: '#404943', marginBottom: 8, paddingLeft: 4 },
  expiryText: { fontSize: 10, fontWeight: '600', color: '#BA1A1A', marginTop: 2 },
  expiredText: { color: '#BA1A1A' },
  deleteButton: { position: 'absolute', right: 8, top: '50%', marginTop: -22, zIndex: 999, padding: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0f1ec', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  productBrandText: { fontSize: 14, fontWeight: '700', color: '#1b1c1c', marginBottom: 2 },
  productNameText: { fontSize: 14, color: '#404943' },
});
