import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  PanResponder,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
import { User, ArrowDownUp, Bell, Plus, ScanLine } from 'lucide-react-native';
import { getProductVisualSource } from '../services/productVisualCatalog';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type SortMode = 'category' | 'name' | 'expiryDate';

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

const getRoutineIndex = (category: Product['category']) => {
  const index = routineOrder.indexOf(category);
  return index === -1 ? 99 : index;
};

const buildShelfRows = (products: Product[]) => {
  const firstRowCount = products.length > 6 ? 4 : 3;
  const secondRowCount = products.length > 7 ? 3 : 2;

  return [
    products.slice(0, firstRowCount),
    products.slice(firstRowCount, firstRowCount + secondRowCount),
    products.slice(firstRowCount + secondRowCount),
  ];
};

type ShelfProductProps = {
  product: Product;
  onDelete: () => void;
  onPress: () => void;
  onReorder: (productId: string, direction: -1 | 1) => void;
};

const ShelfProduct = ({ product, onDelete, onPress, onReorder }: ShelfProductProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const expiring = isExpiringSoon(product.expiryDate);
  const expired = isExpired(product.expiryDate);
  const productImageSource = getProductVisualSource(product, imageFailed);

  useEffect(() => {
    setImageFailed(false);
  }, [product.cutoutImageUrl]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10,
        onPanResponderGrant: () => {
          setDragging(true);
        },
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 52) {
            onReorder(product.id, 1);
          } else if (gesture.dx < -52) {
            onReorder(product.id, -1);
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
    [onReorder, pan, product.id]
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
      <TouchableOpacity
        style={styles.productTapArea}
        onPress={onPress}
        onLongPress={onDelete}
        activeOpacity={0.82}
      >
        <View style={styles.productShadow} />
        <Image
          source={productImageSource}
          style={styles.productPhoto}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
        />
        {(expiring || expired) && (
          <View style={styles.expiryBadge}>
            <Text style={styles.expiryBadgeText}>
              {expired ? 'SKT' : `${getRemainingDays(product.expiryDate)}g`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.productShelfName} numberOfLines={1}>
        {product.brand}
      </Text>
      <Text style={styles.productShelfType} numberOfLines={2}>
        {product.name}
      </Text>
    </Animated.View>
  );
};

type CabinetShelfRowProps = {
  products: Product[];
  index: number;
  onDelete: (product: Product) => void;
  onOpen: (product: Product) => void;
  onReorder: (productId: string, direction: -1 | 1) => void;
};

const CabinetShelfRow = ({ products, index, onDelete, onOpen, onReorder }: CabinetShelfRowProps) => (
  <View style={styles.referenceShelfSlot}>
    <View style={styles.referenceProductsRow}>
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
    <View style={styles.referenceShelfBoard}>
      <View style={styles.referenceShelfHighlight} />
    </View>
    {products.length === 0 && (
      <View style={[styles.emptyShelfHint, index === 1 && styles.emptyShelfHintShort]} />
    )}
  </View>
);

export default function HomeScreen({ navigation }: Props) {
  const { products, deleteProduct } = useProducts();
  const [sortBy, setSortBy] = useState<SortMode>('category');
  const [shelfOrder, setShelfOrder] = useState<string[]>([]);
  const [doorOpen, setDoorOpen] = useState(true);
  const doorProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const productIds = products.map(product => product.id);
    setShelfOrder(previousOrder => [
      ...previousOrder.filter(productId => productIds.includes(productId)),
      ...productIds.filter(productId => !previousOrder.includes(productId)),
    ]);
  }, [products]);

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

  const shelfRows = useMemo(() => buildShelfRows(displayedProducts), [displayedProducts]);
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

  const handleShelfReorder = (productId: string, direction: -1 | 1) => {
    const visibleIds = displayedProducts.map(product => product.id);

    setShelfOrder(previousOrder => {
      const currentOrder = previousOrder.length ? [...previousOrder] : products.map(product => product.id);
      const localIndex = visibleIds.indexOf(productId);
      const targetLocalIndex = localIndex + direction;
      const targetId = visibleIds[targetLocalIndex];

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
    outputRange: [0, -168],
  });

  const rightDoorTranslate = doorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 168],
  });

  const doorOpacity = doorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 0.34],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <User size={21} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SkinShelf</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Alert.alert(
            'Biliyor musun?',
            'Retinol ve peeling gibi güçlü aktifleri aynı gece kullanmamak cildi daha az yorabilir. Shelly haftalık plan hazırlarken bu bilgiyi dikkate alır.'
          )}
        >
          <Bell size={24} color="#426447" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.sortContainer}>
          <View style={styles.sortHeader}>
            <ArrowDownUp size={16} color="#426447" />
            <Text style={styles.sortLabel}>Dolap düzeni</Text>
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
          <View style={styles.cabinetTitleLine}>
            <View>
              <Text style={styles.cabinetTitle}>Cilt Bakım Dolabı</Text>
              <Text style={styles.cabinetSubtitle}>
                Cilt bakım ürünlerini dijital rafında sakla, içeriklerini ve rutin uyumunu Shelly ile kontrol et.
              </Text>
            </View>
            <TouchableOpacity style={styles.doorToggleButton} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.78}>
              <Plus size={16} color="#ffffff" />
              <Text style={styles.doorToggleText}>Ürün Ekle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cabinetMetaRow}>
            <View style={styles.cabinetMetaPill}>
              <Text style={styles.cabinetMetaText}>{products.length} ürün</Text>
            </View>
          </View>
        </View>

        <View style={styles.cabinetShell}>
          <View style={styles.cabinetTopLip} />
          <View style={styles.backGlowTop} />
          <View style={styles.backGlowBottom} />
          <View style={styles.leftWallShadow} />
          <View style={styles.rightWallShadow} />

          {products.length === 0 ? (
            <View style={styles.emptyCabinet}>
              <View style={styles.emptyShelfLine} />
              <View style={styles.emptyShelfLineShort} />
              <Text style={styles.emptyTitle}>Ürünlerini rafa ekle</Text>
              <Text style={styles.emptyText}>İlk ürününü barkodla ya da manuel ekle. Shelly cildinle uyumunu ve rutinindeki yerini takip etsin.</Text>
              <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')}>
                <ScanLine size={22} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.scanButtonText}>Barkod Okut / Ürün Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.referenceShelvesContainer}>
              {shelfRows.map((rowProducts, index) => (
                <CabinetShelfRow
                  key={`shelf-${index}`}
                  index={index}
                  products={rowProducts}
                  onOpen={product => navigation.navigate('ProductDetail', { productId: product.id })}
                  onDelete={handleDelete}
                  onReorder={handleShelfReorder}
                />
              ))}
            </View>
          )}

          <Animated.View
            style={[
              styles.doorPanel,
              styles.leftDoor,
              {
                opacity: doorOpacity,
                transform: [{ translateX: leftDoorTranslate }],
              },
            ]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleDoorToggle} activeOpacity={0.9} />
            <View style={styles.doorInset} />
            <View style={styles.doorHandleLeft} />
          </Animated.View>
          <Animated.View
            style={[
              styles.doorPanel,
              styles.rightDoor,
              {
                opacity: doorOpacity,
                transform: [{ translateX: rightDoorTranslate }],
              },
            ]}
          >
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleDoorToggle} activeOpacity={0.9} />
            <View style={styles.doorInset} />
            <View style={styles.doorHandleRight} />
          </Animated.View>
        </View>

      </ScrollView>

      {products.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Scanner')}>
          <Plus size={25} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 12;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: androidHeaderPadding,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(250, 249, 245, 0.98)',
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0f1ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 25, fontWeight: '800', color: '#426447' },
  scrollContent: { paddingBottom: 150 },
  sortContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 18,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#edf1ee',
    padding: 12,
  },
  sortHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sortLabel: { fontSize: 14, fontWeight: '800', color: '#426447', marginLeft: 6 },
  sortOptions: { paddingBottom: 4 },
  sortButton: {
    backgroundColor: '#f0f1ec',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8e2',
  },
  sortButtonActive: { backgroundColor: '#426447', borderColor: '#426447' },
  sortButtonText: { fontSize: 12, fontWeight: '800', color: '#707973' },
  sortButtonTextActive: { color: '#ffffff' },
  cabinetHeaderRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  cabinetTitleLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cabinetTitle: { fontSize: 24, fontWeight: '900', color: '#14351f' },
  cabinetSubtitle: { fontSize: 13, color: '#627168', marginTop: 5, lineHeight: 18, maxWidth: 260 },
  doorToggleButton: {
    minWidth: 102,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: '#14351f',
    shadowColor: '#14351f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  doorToggleText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  cabinetMetaRow: { flexDirection: 'row', gap: 8, marginTop: 11 },
  cabinetMetaPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: '#426447' },
  cabinetMetaText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  cabinetShell: {
    marginHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#f8f9f5',
    borderWidth: 1,
    borderColor: '#d9e0d9',
    overflow: 'hidden',
    minHeight: 820,
    position: 'relative',
    shadowColor: '#21412a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 5,
  },
  cabinetTopLip: {
    height: 22,
    backgroundColor: '#fdfdfb',
    borderBottomWidth: 1,
    borderBottomColor: '#dde2dd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  backGlowTop: {
    position: 'absolute',
    top: 22,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  backGlowBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 170,
    backgroundColor: 'rgba(215,218,212,0.36)',
  },
  leftWallShadow: {
    position: 'absolute',
    top: 22,
    bottom: 0,
    left: 0,
    width: 28,
    backgroundColor: 'rgba(42,49,43,0.06)',
  },
  rightWallShadow: {
    position: 'absolute',
    top: 22,
    bottom: 0,
    right: 0,
    width: 28,
    backgroundColor: 'rgba(42,49,43,0.06)',
  },
  referenceShelvesContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 22,
    gap: 14,
  },
  referenceShelfSlot: {
    minHeight: 226,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  referenceProductsRow: {
    minHeight: 198,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 13,
    zIndex: 2,
  },
  referenceShelfBoard: {
    height: 18,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e6e1',
    shadowColor: '#31372f',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 3,
  },
  referenceShelfHighlight: {
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  emptyShelfHint: {
    position: 'absolute',
    bottom: 52,
    alignSelf: 'center',
    width: '54%',
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(196,207,197,0.42)',
  },
  emptyShelfHintShort: { width: '38%' },
  shelfProduct: {
    width: 112,
    height: 198,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  shelfProductDragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 9,
  },
  productTapArea: {
    width: 112,
    height: 158,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  productShadow: {
    position: 'absolute',
    bottom: 2,
    width: 82,
    height: 14,
    borderRadius: 50,
    backgroundColor: 'rgba(82,91,83,0.16)',
  },
  productPhoto: {
    width: 110,
    height: 170,
  },
  productShelfName: {
    maxWidth: 102,
    minHeight: 16,
    marginTop: 2,
    color: '#435248',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  productShelfType: {
    width: 106,
    minHeight: 27,
    color: '#17251b',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  expiryBadge: {
    position: 'absolute',
    top: 8,
    right: 2,
    minWidth: 30,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#BA1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expiryBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  doorPanel: {
    position: 'absolute',
    top: 22,
    bottom: 0,
    width: '50%',
    backgroundColor: '#e8eee9',
    borderColor: '#bdcabe',
    shadowColor: '#12351f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 7,
    zIndex: 8,
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
    top: 24,
    left: 18,
    right: 18,
    bottom: 32,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(66,100,71,0.28)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  doorHandleLeft: {
    position: 'absolute',
    right: 14,
    top: '48%',
    width: 9,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#426447',
  },
  doorHandleRight: {
    position: 'absolute',
    left: 14,
    top: '48%',
    width: 9,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#426447',
  },
  emptyCabinet: {
    minHeight: 710,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyShelfLine: { width: '84%', height: 14, borderRadius: 10, backgroundColor: '#ffffff', marginBottom: 38 },
  emptyShelfLineShort: { width: '58%', height: 12, borderRadius: 10, backgroundColor: '#d8ded8', marginBottom: 34 },
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
