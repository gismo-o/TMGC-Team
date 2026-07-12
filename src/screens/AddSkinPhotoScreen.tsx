import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Info, Sparkles } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { analyzeSkinPhoto } from '../services/skinAnalysisApi';
import PhotoUploadCard from '../components/skin/PhotoUploadCard';
import { feelingOptions } from '../components/skin/skinLabels';
import { colors, fonts, gradients, radius, shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddSkinPhoto'>;
};

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.5,
  base64: true,
};

export default function AddSkinPhotoScreen({ navigation }: Props) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState('image/jpeg');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [usedNewProduct, setUsedNewProduct] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [infoAccepted, setInfoAccepted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const applyPickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64 ?? null);
    setPhotoMimeType(asset.mimeType ?? 'image/jpeg');
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Kamera izni gerekli',
        'Cilt fotoğrafı çekebilmek için kamera izni vermen gerekiyor. İstersen galeriden de fotoğraf seçebilirsin.'
      );
      return;
    }
    applyPickerResult(await ImagePicker.launchCameraAsync(pickerOptions));
  };

  const handlePickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Galeri izni gerekli',
        'Fotoğraf seçebilmek için galeri izni vermen gerekiyor. Ayarlardan izin verebilirsin.'
      );
      return;
    }
    applyPickerResult(await ImagePicker.launchImageLibraryAsync(pickerOptions));
  };

  const handleAnalyze = async () => {
    if (!photoBase64 || analyzing) return;

    setAnalyzing(true);
    try {
      const analysis = await analyzeSkinPhoto({
        imageBase64: photoBase64,
        imageMimeType: photoMimeType,
        skinFeeling: feeling ?? '',
        usedNewProduct: usedNewProduct === true,
        userNote: note.trim(),
      });
      navigation.replace('SkinAnalysisResult', { analysis });
    } catch (error) {
      console.error('Skin analysis error:', error);
      Alert.alert('Analiz yapılamadı', 'Bağlantı sorunu olabilir. Lütfen tekrar dene.');
    } finally {
      setAnalyzing(false);
    }
  };

  const canAnalyze = Boolean(photoBase64) && infoAccepted && !analyzing;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={21} color={colors.forest} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Fotoğraf</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <PhotoUploadCard
          photoUri={photoUri}
          onTakePhoto={handleTakePhoto}
          onPickFromGallery={handlePickFromGallery}
          onRetake={() => {
            setPhotoUri(null);
            setPhotoBase64(null);
          }}
        />

        {/* Güvenli bilgilendirme */}
        {!infoAccepted && (
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Info size={16} color={colors.sage} />
              <Text style={styles.infoTitle}>Başlamadan önce</Text>
            </View>
            <Text style={styles.infoText}>
              Shelly teşhis koymaz. Fotoğraflar yalnızca cilt görünümündeki değişimleri ve rutin etkilerini takip
              etmek için yorumlanır.
            </Text>
            <TouchableOpacity style={styles.infoButton} onPress={() => setInfoAccepted(true)} activeOpacity={0.8}>
              <Text style={styles.infoButtonText}>Anladım, devam et</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mini günlük formu */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Mini günlük</Text>

          <Text style={styles.formLabel}>Bugün cildin nasıl hissediyor?</Text>
          <View style={styles.chipRow}>
            {feelingOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.chip, feeling === option && styles.chipActive]}
                onPress={() => setFeeling(feeling === option ? null : option)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, feeling === option && styles.chipTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Son 24 saatte yeni ürün kullandın mı?</Text>
          <View style={styles.chipRow}>
            {[
              [true, 'Evet'],
              [false, 'Hayır'],
            ].map(([value, label]) => (
              <TouchableOpacity
                key={String(label)}
                style={[styles.chip, usedNewProduct === value && styles.chipActive]}
                onPress={() => setUsedNewProduct(usedNewProduct === value ? null : (value as boolean))}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, usedNewProduct === value && styles.chipTextActive]}>
                  {label as string}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Not ekle</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Bugün yanaklarım biraz kuru hissetti."
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={300}
          />
        </View>

        <TouchableOpacity onPress={handleAnalyze} disabled={!canAnalyze} activeOpacity={0.85}>
          <LinearGradient
            colors={canAnalyze ? gradients.forest : (['#B8BFB8', '#A7AFA7'] as const)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.analyzeButton}
          >
            {analyzing ? (
              <>
                <ActivityIndicator size="small" color={colors.onDark} />
                <Text style={styles.analyzeButtonText}>Shelly inceliyor...</Text>
              </>
            ) : (
              <>
                <Sparkles size={18} color={colors.onDark} />
                <Text style={styles.analyzeButtonText}>Analiz Et</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          Fotoğrafın analiz için güvenli şekilde Shelly'ye iletilir; sunucuda saklanmaz. Yalnızca analiz sonucu
          kaydedilir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 12;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: androidHeaderPadding,
    paddingBottom: 12,
    paddingHorizontal: 22,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.forest,
  },
  content: { paddingHorizontal: 22, paddingBottom: 40, gap: 15 },
  infoCard: {
    backgroundColor: colors.surfaceSage,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lineSage,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.forest,
  },
  infoText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    marginBottom: 13,
  },
  infoButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  infoButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: colors.onDark,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
  },
  formTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.ink,
    marginBottom: 13,
  },
  formLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.inkSoft,
    marginBottom: 9,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.inkSoft,
  },
  chipTextActive: { color: colors.onDark },
  noteInput: {
    minHeight: 74,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 16,
    borderRadius: radius.pill,
    ...shadows.card,
  },
  analyzeButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 14.5,
    color: colors.onDark,
  },
  privacyText: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
