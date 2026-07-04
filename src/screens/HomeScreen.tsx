import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  ImageSourcePropType,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList, Product } from '../types';
import { useProducts } from '../context/ProductContext';
import { Camera, Droplets, Wind, Sun, Leaf, Sparkles, User, ArrowDownUp, Trash2, Bell, Plus } from 'lucide-react-native';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type SortMode = 'category' | 'name' | 'expiryDate';
type ShelfAccent = { soft: string; strong: string; shadow: string };

const routineOrder: Product['category'][] = [
  'Temizleyici',
  'Tonik',
  'Serum',
  'Göz Kremi',
  'Nemlendirici',
  'Güneş Kremi',
  'Maske',
  'Diğer',
];

const categoryAccents: Record<Product['category'], ShelfAccent> = {
  Temizleyici: { soft: '#dfecea', strong: '#53766e', shadow: '#b7d0ca' },
  Tonik: { soft: '#e2edf5', strong: '#4d6f83', shadow: '#bbd2df' },
  Serum: { soft: '#eef0dc', strong: '#6c7648', shadow: '#d2d7ab' },
  'Göz Kremi': { soft: '#eee6f5', strong: '#725b86', shadow: '#d7c4e5' },
  Nemlendirici: { soft: '#e7f0e4', strong: '#55734b', shadow: '#c7dabb' },
  'Güneş Kremi': { soft: '#f8ecd2', strong: '#8a6a20', shadow: '#e8d09b' },
  Maske: { soft: '#f1e7df', strong: '#7c604b', shadow: '#dfc8b6' },
  Diğer: { soft: '#e9efea', strong: '#426447', shadow: '#c5d5c8' },
};

const productObjectAssets: Record<Product['category'], ImageSourcePropType> = {
  Temizleyici: require('../../assets/products/cleanser-pump.png'),
  Tonik: require('../../assets/products/toner-bottle.png'),
  Serum: require('../../assets/products/serum-bottle.png'),
  'Göz Kremi': require('../../assets/products/eye-cream-tube.png'),
  Nemlendirici: require('../../assets/products/moisturizer-jar.png'),
  'Güneş Kremi': require('../../assets/products/sunscreen-tube.png'),
  Maske: require('../../assets/products/mask-jar.png'),
  Diğer: require('../../assets/products/generic-bottle.png'),
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

const getCategoryIcon = (category: Product['category'], size = 22, color = '#426447') => {
  switch (category) {
    case 'Temizleyici':
      return <Wind size={size} color={color} />;
    case 'Tonik':
    case 'Serum':
      return <Droplets size={size} color={color} />;
    case 'Nemlendirici':
      return <Leaf size={size} color={color} />;
    case 'Güneş Kremi':
      return <Sun size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

const getRoutineIndex = (category: Product['category']) => {
  const index = routineOrder.indexOf(category);
  return index === -1 ? 99 : index;
};

const ProductFallbackShape = ({ category }: { category: Product['category'] }) => {
  const accent = categoryAccents[category];

  return (
    <View style={styles.fallbackObject}>
      <View style={[styles.fallbackCap, { backgroundColor: accent.strong }]} />
      <View style={[styles.fallbackBottle, { backgroundColor: accent.soft, borderColor: accent.strong }]}>
        <View style={[styles.fallbackLabel, { backgroundColor: accent.strong }]}>
          {getCategoryIcon(category, 15, '#ffffff')}
        </View>
      </View>
    </View>
  );
};

type ShelfProductProps = {
  product: Product;
  onDelete: () => void;
  onPress: () => void;
  onReorder: (productId: string, direction: -1 | 1, category: Product['category']) => void;
};

const ShelfProduct = ({ product, onDelete, onPress, onReorder }: ShelfProductProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const accent = categoryAccents[product.category];
  const expiring = isExpiringSoon(product.expiryDate);
  const expired = isExpired(product.expiryDate);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
        onPanResponderGrant: () => {
          setDragging(true);
        },
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 48) {
            onReorder(product.id, 1, product.category);
          } else if (gesture.dx < -48) {
            onReorder(product.id, -1, product.category);
          }

          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 80,
            useNativeDriver: false,
          }).start(() => setDragging(false));
        },
        onPanResponderTerminate: () => {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            tension: 80,
            useNativeDriver: false,
          }).start(() => setDragging(false));
        },
      }),
    [onReorder, pan, product.category, product.id]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.shelfProduct,
        dragging && styles.shelfProductDragging,
        { transform: pan.getTranslateTransform() },
      ]}
    >
      <TouchableOpacity style={styles.productObjectButton} onPress={onPress} activeOpacity={0.78}>
        <View style={[styles.productGlow, { backgroundColor: accent.shadow }]} />
        <View style={styles.productVisualStage}>
          <Image source={productObjectAssets[product.category]} style={styles.productPng} resizeMode="contain" />
        </View>

        <View style={styles.productShelfLabel}>
          <Text style={[styles.shelfBrand, { color: accent.strong }]} numberOfLines={1}>
            {product.brand}
          </Text>
          <Text style={styles.shelfName} numberOfLines={2}>
            {product.name}
          </Text>
          {(expiring || expired) && (
            <Text style={[styles.expiryText, expired && styles.expiredText]}>
              {expired ? 'Süresi Doldu' : `${getRemainingDays(product.expiryDate)} gün kaldı`}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.dragHint}>
        <ArrowDownUp size={13} color="#6c786f" />
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.7}>
        <Trash2 size={16} color="#BA1A1A" />
      </TouchableOpacity>
    </Animated.View>
  );
};

type ShelfSectionProps = {
  category: Product['category'];
  products: Product[];
  onDelete: (product: Product) => void;
  onOpen: (product: Product) => void;
  onReorder: (productId: string, direction: -1 | 1, category: Product['category']) => void;
};

const ShelfSection = ({ category, products, onDelete, onOpen, onReorder }: ShelfSectionProps) => {
  const accent = categoryAccents[category];

  return (
    <View style={styles.shelfSection}>
      <View style={styles.shelfSectionHeader}>
        <View style={[styles.shelfIcon, { backgroundColor: accent.soft }]}>
          {getCategoryIcon(category, 18, accent.strong)}
        </View>
        <Text style={styles.shelfTitle}>{category}</Text>
        <Text style={styles.shelfCount}>{products.length} ürün</Text>
      </View>

      <View style={[styles.shelfStage, { borderColor: accent.shadow }]}>
        <View style={styles.shelfBackShine} />
        <View style={styles.shelfProductRow}>
          {products.map(product => (
            <ShelfProduct
              key={product.id}
              product={product}
              onPress={() => onOpen(product)}
              onDelete={() => onDelete(product)}
              onReorder={onReorder}
            />
          ))}
        </View>
        <View style={[styles.shelfBoard, { backgroundColor: accent.strong }]}>
          <View style={styles.shelfBoardHighlight} />
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen({ navigation }: Props) {
  const { products, deleteProduct } = useProducts();
  const [sortBy, setSortBy] = useState<SortMode>('category');
  const [shelfOrder, setShelfOrder] = useState<string[]>([]);
  const [doorOpen, setDoorOpen] = useState(false);
  const doorProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const productIds = products.map(product => product.id);
    setShelfOrder(previousOrder => [
      ...previousOrder.filter(productId => productIds.includes(productId)),
      ...productIds.filter(productId => !previousOrder.includes(productId)),
    ]);
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDoorOpen(true);
      Animated.timing(doorProgress, {
        toValue: 1,
        duration: 850,
        useNativeDriver: false,
      }).start();
    }, 250);

    return () => clearTimeout(timer);
  }, [doorProgress]);

  const displayedProducts = useMemo(() => {
    const orderIndex = new Map(shelfOrder.map((productId, index) => [productId, index]));
    const productsToDisplay = [...products];

    if (sortBy === 'name') {
      return productsToDisplay.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    if (sortBy === 'expiryDate') {
      return productsToDisplay.sort((a, b) => {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
      });
    }

    return productsToDisplay.sort((a, b) => {
      const routineDiff = getRoutineIndex(a.category) - getRoutineIndex(b.category);
      if (routineDiff !== 0) return routineDiff;
      return (orderIndex.get(a.id) ?? 999) - (orderIndex.get(b.id) ?? 999);
    });
  }, [products, shelfOrder, sortBy]);

  const shelfGroups = useMemo(
    () =>
      routineOrder
        .map(category => ({
          category,
          products: displayedProducts.filter(product => product.category === category),
        }))
        .filter(group => group.products.length > 0),
    [displayedProducts]
  );

  const handleDoorToggle = () => {
    const nextOpenState = !doorOpen;
    setDoorOpen(nextOpenState);
    Animated.spring(doorProgress, {
      toValue: nextOpenState ? 1 : 0,
      friction: 8,
      tension: 72,
      useNativeDriver: false,
    }).start();
  };

  const handleShelfReorder = (productId: string, direction: -1 | 1, category: Product['category']) => {
    const visibleCategoryIds = displayedProducts
      .filter(product => product.category === category)
      .map(product => product.id);

    setShelfOrder(previousOrder => {
      const currentOrder = previousOrder.length ? [...previousOrder] : products.map(product => product.id);
      const localIndex = visibleCategoryIds.indexOf(productId);
      const targetLocalIndex = localIndex + direction;
      const targetId = visibleCategoryIds[targetLocalIndex];

      if (localIndex === -1 || !targetId) return currentOrder;

      const productIndex = currentOrder.indexOf(productId);
      const targetIndex = currentOrder.indexOf(targetId);

      if (productIndex === -1 || targetIndex === -1) return currentOrder;

      [currentOrder[productIndex], currentOrder[targetIndex]] = [currentOrder[targetIndex], currentOrder[productIndex]];
      return currentOrder;
    });
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
      if (confirmed) handleDeleteProduct(product.id);
      return;
    }

    Alert.alert(
      'Ürünü Sil',
      `${product.brand} - ${product.name} dolabınızdan kaldırılsın mı?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => handleDeleteProduct(product.id),
        },
      ]
    );
  };

  const leftDoorTranslate = doorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -780],
  });

  const rightDoorTranslate = doorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 780],
  });

  const doorOpacity = doorProgress.interpolate({
    inputRange: [0, 0.88, 1],
    outputRange: [1, 0.18, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <User size={20} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SkinShelf</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => {}}>
          <Bell size={24} color="#426447" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

        <View style={styles.cabinetHeaderRow}>
          <View>
            <Text style={styles.cabinetTitle}>Cilt Bakım Dolabı</Text>
            <Text style={styles.cabinetSubtitle}>Kullandığın ve beklettiğin tüm ürünler burada. Rutinim sekmesi bu dolaptan ürün seçer.</Text>
          </View>
          <TouchableOpacity style={styles.doorToggleButton} onPress={handleDoorToggle}>
            <Text style={styles.doorToggleText}>{doorOpen ? 'Kapat' : 'Aç'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cabinetShell}>
          <View style={styles.cabinetTopLip} />

          {products.length === 0 ? (
            <View style={styles.emptyCabinet}>
              <View style={styles.emptyShelfLine} />
              <View style={styles.emptyShelfLineShort} />
              <Text style={styles.emptyTitle}>Dolabınız Boş</Text>
              <Text style={styles.emptyText}>Ürün eklediğinizde AI rutininizi bu dolaptaki ürünlere göre oluşturur.</Text>
              <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')}>
                <Camera size={22} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.scanButtonText}>Kamerayı Aç / Ürün Tara</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.shelvesContainer}>
              {shelfGroups.map(group => (
                <ShelfSection
                  key={group.category}
                  category={group.category}
                  products={group.products}
                  onOpen={product => navigation.navigate('ProductDetail', { productId: product.id })}
                  onDelete={handleDelete}
                  onReorder={handleShelfReorder}
                />
              ))}
            </View>
          )}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.doorPanel,
              styles.leftDoor,
              {
                opacity: doorOpacity,
                transform: [{ translateX: leftDoorTranslate }],
              },
            ]}
          >
            <View style={styles.doorInset} />
            <View style={styles.doorHandleLeft} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.doorPanel,
              styles.rightDoor,
              {
                opacity: doorOpacity,
                transform: [{ translateX: rightDoorTranslate }],
              },
            ]}
          >
            <View style={styles.doorInset} />
            <View style={styles.doorHandleRight} />
          </Animated.View>
        </View>
      </ScrollView>

      {products.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner')}>
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(250, 249, 245, 0.96)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f1ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#426447' },
  scrollContent: { paddingBottom: 150 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f1ec',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  toggleButton: { flex: 1, paddingVertical: 12, borderRadius: 26, alignItems: 'center' },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: 12, fontWeight: '700', color: '#707973' },
  toggleTextActive: { color: '#426447' },
  sortContainer: { paddingHorizontal: 20, marginBottom: 14 },
  sortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sortLabel: { fontSize: 14, fontWeight: '700', color: '#426447', marginLeft: 6 },
  sortOptions: { paddingBottom: 4 },
  sortButton: {
    backgroundColor: '#f0f1ec',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sortButtonActive: { backgroundColor: '#426447' },
  sortButtonText: { fontSize: 12, fontWeight: '700', color: '#707973' },
  sortButtonTextActive: { color: '#ffffff' },
  aiStrip: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#e9efea',
    borderWidth: 1,
    borderColor: '#d7e3d9',
  },
  aiStripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiStripTitle: { fontSize: 15, fontWeight: '800', color: '#1b1c1c', marginLeft: 8 },
  routinePreviewRow: { gap: 8, alignItems: 'center' },
  routinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d8e0da',
  },
  routinePillIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#426447',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    fontWeight: '800',
    marginRight: 7,
  },
  routinePillText: { maxWidth: 110, color: '#404943', fontSize: 12, fontWeight: '700' },
  routineEmptyText: { color: '#707973', fontSize: 13 },
  cabinetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  cabinetTitle: { fontSize: 22, fontWeight: '800', color: '#14351f' },
  cabinetSubtitle: { fontSize: 12, color: '#627168', marginTop: 3, maxWidth: 520 },
  doorToggleButton: {
    backgroundColor: '#426447',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  doorToggleText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  cabinetShell: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#eef4ef',
    borderWidth: 1,
    borderColor: '#c7d9ca',
    overflow: 'hidden',
    minHeight: 410,
    shadowColor: '#21412a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  cabinetTopLip: {
    height: 16,
    backgroundColor: '#426447',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  shelvesContainer: { padding: 16, paddingBottom: 24 },
  shelfSection: { marginBottom: 22 },
  shelfSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  shelfIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shelfTitle: { fontSize: 16, fontWeight: '800', color: '#1b1c1c', flex: 1 },
  shelfCount: { fontSize: 12, color: '#65736a', fontWeight: '700' },
  shelfStage: {
    minHeight: 238,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#f8faf7',
    overflow: 'hidden',
    position: 'relative',
  },
  shelfBackShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  shelfProductRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 26,
    zIndex: 2,
  },
  shelfBoard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 18,
  },
  shelfBoardHighlight: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.34)',
  },
  shelfProduct: {
    width: 142,
    minHeight: 208,
    alignItems: 'center',
    position: 'relative',
  },
  shelfProductDragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 9,
  },
  productObjectButton: { width: '100%', alignItems: 'center' },
  productGlow: {
    position: 'absolute',
    top: 138,
    width: 112,
    height: 26,
    borderRadius: 43,
    opacity: 0.48,
  },
  productVisualStage: {
    width: 132,
    height: 158,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  productPng: {
    width: 132,
    height: 158,
  },
  productShelfLabel: {
    marginTop: 2,
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(225,232,227,0.74)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  shelfBrand: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 2 },
  shelfName: { fontSize: 12, fontWeight: '700', color: '#1b1c1c', lineHeight: 15 },
  dragHint: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryText: { fontSize: 10, fontWeight: '800', color: '#BA1A1A', marginTop: 3 },
  expiredText: { color: '#BA1A1A' },
  fallbackObject: { width: 58, height: 92, alignItems: 'center', justifyContent: 'flex-end' },
  fallbackCap: { width: 24, height: 12, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  fallbackBottle: {
    width: 48,
    height: 74,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorPanel: {
    position: 'absolute',
    top: 16,
    bottom: 0,
    width: '50%',
    backgroundColor: '#dce8df',
    borderColor: '#aac1ae',
    shadowColor: '#12351f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
  leftDoor: {
    left: 0,
    borderRightWidth: 1,
  },
  rightDoor: {
    right: 0,
    borderLeftWidth: 1,
  },
  doorInset: {
    position: 'absolute',
    top: 22,
    left: 18,
    right: 18,
    bottom: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(66,100,71,0.28)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  doorHandleLeft: {
    position: 'absolute',
    right: 16,
    top: '48%',
    width: 10,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#426447',
  },
  doorHandleRight: {
    position: 'absolute',
    left: 16,
    top: '48%',
    width: 10,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#426447',
  },
  emptyCabinet: {
    minHeight: 394,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyShelfLine: { width: '84%', height: 14, borderRadius: 10, backgroundColor: '#426447', opacity: 0.78, marginBottom: 38 },
  emptyShelfLineShort: { width: '58%', height: 12, borderRadius: 10, backgroundColor: '#abc3b0', marginBottom: 34 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#426447', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#707973', textAlign: 'center', marginBottom: 26, lineHeight: 21 },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#426447',
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
  },
  scanButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
