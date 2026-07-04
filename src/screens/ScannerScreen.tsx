import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Camera, X, Image as ImageIcon, Barcode, ScanLine } from 'lucide-react-native';
import { productService } from '../services/productService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scanner'>;
};

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
        console.log('Fotoğraf geçici hafızada, Vision AI\'a gönderiliyor');
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
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeTab === 'barcode' ? 'Barkod Tara' : 'Ürün Tara'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          
          {isScanning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Yapay Zeka Analiz Ediyor...</Text>
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
        >
          <Barcode size={20} color={activeTab === 'barcode' ? '#000000' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'barcode' && styles.activeTabText]}>Barkod Tara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'photo' && styles.activeTab]}
          onPress={() => !isScanning && setActiveTab('photo')}
        >
          <Camera size={20} color={activeTab === 'photo' ? '#000000' : '#ffffff'} />
          <Text style={[styles.tabText, activeTab === 'photo' && styles.activeTabText]}>Fotoğraf Çek</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.galleryButton} onPress={() => {}}>
          <ImageIcon size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, isScanning && styles.captureButtonDisabled]} 
          onPress={handleScan}
          disabled={isScanning}
        >
          <View style={styles.captureInner}>
             {activeTab === 'barcode' && <ScanLine size={32} color="#000000" />}
          </View>
        </TouchableOpacity>
        
        <View style={{ width: 48 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  scannerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: '80%', aspectRatio: 3/4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#ffffff', borderWidth: 0 },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 24 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 24 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 24 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 24 },
  instruction: { color: '#ffffff', fontSize: 14, textAlign: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, borderRadius: 16 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  loadingText: { color: '#ffffff', marginTop: 12, fontSize: 16, fontWeight: '600' },
  tabsContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeTab: { backgroundColor: '#ffffff' },
  tabText: { color: '#ffffff', marginLeft: 8, fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#000000' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 40, paddingTop: 10 },
  galleryButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#ffffff' },
  captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  captureButtonDisabled: { opacity: 0.5 }
});
