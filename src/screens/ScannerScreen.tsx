import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Camera, X, Image as ImageIcon, Barcode, ScanLine, Sparkles } from 'lucide-react-native';
import { productService } from '../services/productService';
import { fonts, radius } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scanner'>;
};

const GOLD = '#D8C39A';

export default function ScannerScreen({ navigation }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'barcode' | 'photo'>('barcode');

  const handleScan = async () => {
    setIsScanning(true);
    try {
      let result;
      if (activeTab === 'barcode') {
        const demoBarcode = '3337875863377'; // La Roche-Posay Effaclar Duo+ sample from Open Beauty Facts.
        result = await productService.scanProduct({ barcode: demoBarcode });
      } else {
        // Sprint 2 backend note: Send the photo to Vision AI without storing raw camera images.
        result = await productService.scanProduct({ imageData: 'demo-photo' });
      }

      setTimeout(() => {
        setIsScanning(false);
        navigation.replace('ProductReview', { scannedProduct: result });
      }, 1500);
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Hata', 'Ürün taranamadı.');
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <X size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab === 'barcode' ? 'Barkod Tara' : 'Ürün Tara'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {isScanning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={GOLD} />
              <View style={styles.loadingBadge}>
                <Sparkles size={14} color={GOLD} />
                <Text style={styles.loadingText}>Yapay Zeka Analiz Ediyor...</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.instruction}>
              {activeTab === 'barcode' ? 'Barkodu çerçevenin içine hizalayın' : 'Kozmetik ürününü çerçevenin içine yerleştirin'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'barcode' && styles.activeTab]}
          onPress={() => !isScanning && setActiveTab('barcode')}
          activeOpacity={0.8}
        >
          <Barcode size={19} color={activeTab === 'barcode' ? '#10130F' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'barcode' && styles.activeTabText]}>Barkod Tara</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'photo' && styles.activeTab]}
          onPress={() => !isScanning && setActiveTab('photo')}
          activeOpacity={0.8}
        >
          <Camera size={19} color={activeTab === 'photo' ? '#10130F' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'photo' && styles.activeTabText]}>Fotoğraf Çek</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.galleryButton} onPress={() => {}} activeOpacity={0.8}>
          <ImageIcon size={22} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
          onPress={handleScan}
          disabled={isScanning}
          activeOpacity={0.85}
        >
          <View style={styles.captureInner}>
            {activeTab === 'barcode' && <ScanLine size={30} color="#10130F" />}
          </View>
        </TouchableOpacity>

        <View style={{ width: 50 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0C0F0C' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    color: '#ffffff',
    fontSize: 21,
  },
  scannerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: {
    width: '80%',
    aspectRatio: 3 / 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: { position: 'absolute', width: 42, height: 42, borderColor: GOLD, borderWidth: 0 },
  topLeft: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.xl },
  topRight: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.xl },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.xl },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: radius.xl },
  instruction: {
    fontFamily: fonts.sansSemiBold,
    color: '#ffffff',
    fontSize: 13.5,
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(216,195,154,0.35)',
  },
  loadingText: {
    fontFamily: fonts.sansBold,
    color: '#ffffff',
    fontSize: 13.5,
  },
  tabsContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 12 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  activeTab: { backgroundColor: GOLD, borderColor: GOLD },
  tabText: {
    fontFamily: fonts.sansBold,
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 13.5,
  },
  activeTabText: { color: '#10130F' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 40, paddingTop: 10 },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(216,195,154,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: GOLD,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F4EBDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: { opacity: 0.5 },
});
