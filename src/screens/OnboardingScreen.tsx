import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ArrowRight, Camera, Check, PenLine, Sparkles } from 'lucide-react-native';
import { ProductDraft, RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';
import { useRoute } from '@react-navigation/native';
// KRAVAT IMPORT: authService import edildi
import { authService } from '../services/authService'; 

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const ageRanges = ['13-17', '18-24', '25-34', '35+'];
const experienceLevels = ['Yeni başlıyorum', 'Birkaç ürün kullanıyorum', 'Aktif içerikleri biliyorum', 'Rutinim detaylı'];
const skinFeelOptions = ['Hep kuru / gergin', 'T bölgem yağlı, yanaklarım daha kuru', 'Genel olarak yağlı', 'Normal / dengeli', 'Emin değilim'];
const postWashOptions = ['Gerginlik ve kuruluk oluyor', 'Hızlıca yağlanıyor', 'Bazı bölgeler yağlı, bazı bölgeler kuru', 'Pek değişmiyor', 'Emin değilim'];
const productFitOptions = ['Evet, ürünlerimi analiz et', 'Önce cildimi tanımak istiyorum', 'Sadece rutinimi düzenlemek istiyorum'];
const mainGoals = ['Ürünlerim bana uygun mu?', 'Sivilce / komedon görünümü', 'Leke / renk eşitsizliği', 'Kızarıklık / hassasiyet', 'Kuruluk / bariyer desteği', 'Yağlanma kontrolü', 'Daha düzenli rutin'];
const sensitivityOptions = ['Evet, sık sık kızarır/yanar', 'Bazen', 'Hayır, genelde dayanıklı', 'Emin değilim'];
const reactionOptions = ['Evet', 'Hayır', 'Emin değilim'];
const routineOptions = ['Temizleyici', 'Nemlendirici', 'Güneş kremi', 'Serum', 'Tonik', 'Peeling / asit', 'Retinol / retinal', 'Akne ürünü', 'Hiçbir şey kullanmıyorum'];
const activeOptions = ['Retinol / retinal', 'AHA / BHA asit', 'Salisilik asit', 'C vitamini', 'Benzoil peroksit', 'Niacinamide', 'Reçeteli akne ürünü', 'Emin değilim'];
const trackingOptions = ['Uyku', 'Stres', 'Regl dönemi', 'Su tüketimi', 'Beslenme', 'Makyaj kullanımı', 'Güneşe maruz kalma', 'Şimdilik istemiyorum'];
const reminderOptions = ['Sabah rutinim için', 'Akşam rutinim için', 'Ürün kullanım takibi için', 'Haftalık cilt özeti için', 'Bildirim istemiyorum'];

const manualProductDraft: ProductDraft = {
  name: '',
  brand: '',
  category: 'Diğer',
  timeOfDay: 'both',
  imageUrl: '',
  description: '',
  activeIngredients: [],
};

const inferSkinType = (skinFeel: string, postWashFeel: string) => {
  const combined = `${skinFeel} ${postWashFeel}`.toLocaleLowerCase('tr-TR');

  if (combined.includes('t bölgem') || combined.includes('bazı bölgeler')) return 'Karma Cilt';
  if (combined.includes('kuru') || combined.includes('gergin')) return 'Kuru Cilt';
  if (combined.includes('yağlı') || combined.includes('yağlanıyor')) return 'Yağlı Cilt';
  if (combined.includes('normal') || combined.includes('değişmiyor')) return 'Normal Cilt';
  return 'Karma Cilt';
};

const OptionButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={[styles.optionButton, selected && styles.optionButtonSelected]} onPress={onPress} activeOpacity={0.76}>
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    {selected && <Check size={16} color="#426447" />}
  </TouchableOpacity>
);

export default function OnboardingScreen({ navigation }: Props) {
  const { profile, updateUserProfile } = useUser();
  const route = useRoute<any>();
  
  // YÖNLENDİRME KORUMASI: Önce route parametresine, bulamazsa aktif oturum belleğine bakar
  const userId = route.params?.userId || authService.getUserId(); 

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [ageRange, setAgeRange] = useState(profile.ageRange || '');
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || '');
  const [skinFeel, setSkinFeel] = useState(profile.skinFeel || '');
  const [postWashFeel, setPostWashFeel] = useState(profile.postWashFeel || '');
  const [productFitIntent, setProductFitIntent] = useState(profile.productFitIntent || '');
  const [mainGoal, setMainGoal] = useState(profile.mainGoal || '');
  const [sensitivityLevel, setSensitivityLevel] = useState(profile.sensitivityLevel || '');
  const [reactionHistory, setReactionHistory] = useState(profile.reactionHistory || '');
  const [currentRoutine, setCurrentRoutine] = useState<string[]>(profile.currentRoutine || []);
  const [recentActives, setRecentActives] = useState<string[]>(profile.recentActives || []);
  const [trackingPreferences, setTrackingPreferences] = useState<string[]>(profile.trackingPreferences || []);
  const [reminderPreferences, setReminderPreferences] = useState<string[]>(profile.reminderPreferences || []);

  const inferredSkinType = useMemo(() => inferSkinType(skinFeel, postWashFeel), [skinFeel, postWashFeel]);
  const isLastStep = step === 6;

  const toggleList = (value: string, selected: string[], setSelected: (next: string[]) => void, exclusive?: string[]) => {
    if (exclusive?.includes(value)) {
      setSelected(selected.includes(value) ? [] : [value]);
      return;
    }

    const withoutExclusive = selected.filter(item => !exclusive?.includes(item));
    setSelected(withoutExclusive.includes(value) ? withoutExclusive.filter(item => item !== value) : [...withoutExclusive, value]);
  };

  // Veritabanına kaydetme metodu
  const saveProfile = async () => {
    // EĞER KULLANICI ID BULUNAMAZSA İŞLEMİ İPTAL EDER
    if (!userId) {
      console.warn('Oturum açmış kullanıcı ID bilgisi bulunamadı!');
      alert('Lütfen önce giriş yapın.');
      return;
    }

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; 
    const PROFILES_API_URL = API_BASE_URL ? API_BASE_URL.replace('/auth', '/profiles') : '';

    const profileData = {
      userId: userId, // DÜZELTİLDİ: Yukarıda güvenle okuduğumuz yerel değişken bağlandı
      nickname: displayName.trim() || 'SkinShelf kullanıcısı',
      ageRange: ageRange,
      experience: experienceLevel,
      sensitivity: sensitivityLevel,
      skinTypeGuess: inferredSkinType,
      concerns: [mainGoal], 
      lifestyleFactors: trackingPreferences,
      notifPref: reminderPreferences.join(', ') 
    };

    try {
      console.log('Profil verileri Spring Boot\'a kaydediliyor...', profileData);
      const response = await fetch(`${PROFILES_API_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profil sunucuya kaydedilemedi.');
      }

      const result = await response.json();
      console.log('Profil başarıyla veritabanına kaydedildi:', result);
    } catch (error) {
      console.error('Cilt profili kaydedilirken hata oluştu:', error);
    }

    // Yerel cihaz hafızasını/state'ini güncellemeye devam ediyoruz
    updateUserProfile({
      displayName: displayName.trim() || 'SkinShelf kullanıcısı',
      ageRange,
      experienceLevel,
      skinFeel,
      postWashFeel,
      skinType: inferredSkinType,
      productFitIntent,
      mainGoal,
      sensitivityLevel,
      reactionHistory,
      currentRoutine,
      recentActives,
      trackingPreferences,
      reminderPreferences,
      isOnboarded: true,
    });
  };

  // Yönlendirme buton metotları
  const completeToMain = async () => {
    await saveProfile();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const completeToScanner = async () => {
    await saveProfile();
    navigation.navigate('Scanner');
  };

  const completeToManualProduct = async () => {
    await saveProfile();
    navigation.navigate('ProductReview', { scannedProduct: manualProductDraft });
  };

  const canContinue = () => {
    if (step === 0) return displayName.trim().length > 1 && ageRange && experienceLevel;
    if (step === 1) return skinFeel && postWashFeel;
    if (step === 2) return productFitIntent && mainGoal;
    if (step === 3) return sensitivityLevel && reactionHistory;
    return true;
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <>
          <Text style={styles.stepTitle}>Seni tanıyalım</Text>
          <Text style={styles.stepText}>Shelly önerilerini sana hitap şekline ve bakım deneyimine göre ayarlar.</Text>
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Sana nasıl hitap edelim?</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Örn. Ceren"
              placeholderTextColor="#8b968f"
              style={styles.textInput}
            />
          </View>
          <Text style={styles.groupTitle}>Yaş aralığın</Text>
          {ageRanges.map(item => <OptionButton key={item} label={item} selected={ageRange === item} onPress={() => setAgeRange(item)} />)}
          <Text style={styles.groupTitle}>Cilt bakım deneyimin</Text>
          {experienceLevels.map(item => <OptionButton key={item} label={item} selected={experienceLevel === item} onPress={() => setExperienceLevel(item)} />)}
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Text style={styles.stepTitle}>Cilt hissin nasıl?</Text>
          <Text style={styles.stepText}>Cilt tipini etiketlerden değil, gün içindeki hislerinden tahmin ediyoruz.</Text>
          <Text style={styles.groupTitle}>Gün içinde genelde</Text>
          {skinFeelOptions.map(item => <OptionButton key={item} label={item} selected={skinFeel === item} onPress={() => setSkinFeel(item)} />)}
          <Text style={styles.groupTitle}>Yüzünü yıkadıktan 30 dakika sonra</Text>
          {postWashOptions.map(item => <OptionButton key={item} label={item} selected={postWashFeel === item} onPress={() => setPostWashFeel(item)} />)}
          {skinFeel && postWashFeel && (
            <View style={styles.shellyNote}>
              <Sparkles size={18} color="#426447" />
              <Text style={styles.shellyNoteText}>Shelly tahmini: {inferredSkinType}</Text>
            </View>
          )}
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={styles.stepTitle}>Cildinle anlaşamayan ürünleri bulmak ister misin?</Text>
          <Text style={styles.stepText}>SkinShelf’in ana odağı rafındaki ürünlerin cildinle uyumunu anlamana yardımcı olmak.</Text>
          {productFitOptions.map(item => <OptionButton key={item} label={item} selected={productFitIntent === item} onPress={() => setProductFitIntent(item)} />)}
          <Text style={styles.groupTitle}>Şu an en çok neye odaklanalım?</Text>
          {mainGoals.map(item => <OptionButton key={item} label={item} selected={mainGoal === item} onPress={() => setMainGoal(item)} />)}
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <Text style={styles.stepTitle}>Cildin kolay tepki verir mi?</Text>
          <Text style={styles.stepText}>Bu bilgi Shelly’nin daha dikkatli ve sade öneriler yapmasına yardımcı olur.</Text>
          <Text style={styles.groupTitle}>Ürünlere tepkin</Text>
          {sensitivityOptions.map(item => <OptionButton key={item} label={item} selected={sensitivityLevel === item} onPress={() => setSensitivityLevel(item)} />)}
          <Text style={styles.groupTitle}>Daha önce bir ürün yakma, kızarma veya sivilce yaptı mı?</Text>
          {reactionOptions.map(item => <OptionButton key={item} label={item} selected={reactionHistory === item} onPress={() => setReactionHistory(item)} />)}
        </>
      );
    }

    if (step === 4) {
      return (
        <>
          <Text style={styles.stepTitle}>Şu an rafında neler var?</Text>
          <Text style={styles.stepText}>İstersen sonra ürünleri barkodla juga ekleyebilirsin. Bu adım sadece başlangıç tahmini için.</Text>
          {routineOptions.map(item => (
            <OptionButton
              key={item}
              label={item}
              selected={currentRoutine.includes(item)}
              onPress={() => toggleList(item, currentRoutine, setCurrentRoutine, ['Hiçbir şey kullanmıyorum'])}
            />
          ))}
          <Text style={styles.groupTitle}>Son 1 ayda kullandığın aktifler</Text>
          {activeOptions.map(item => (
            <OptionButton
              key={item}
              label={item}
              selected={recentActives.includes(item)}
              onPress={() => toggleList(item, recentActives, setRecentActives, ['Emin değilim'])}
            />
          ))}
          {recentActives.includes('Reçeteli akne ürünü') && (
            <Text style={styles.warningText}>Reçeteli ürünlerle ilgili değişiklik yapmadan dermatoloğuna danışmanı öneririz.</Text>
          )}
        </>
      );
    }

    if (step === 5) {
      return (
        <>
          <Text style={styles.stepTitle}>Shelly neleri takip etsin?</Text>
          <Text style={styles.stepText}>Bu adım zorunlu değil. İstersen sadece rutin hatırlatmasıyla başlayabilirsin.</Text>
          <Text style={styles.groupTitle}>Cilt değişimini etkileyebilecek şeyler</Text>
          {trackingOptions.map(item => (
            <OptionButton
              key={item}
              label={item}
              selected={trackingPreferences.includes(item)}
              onPress={() => toggleList(item, trackingPreferences, setTrackingPreferences, ['Şimdilik istemiyorum'])}
            />
          ))}
          <Text style={styles.groupTitle}>Hatırlatma tercihin</Text>
          {reminderOptions.map(item => (
            <OptionButton
              key={item}
              label={item}
              selected={reminderPreferences.includes(item)}
              onPress={() => toggleList(item, reminderPreferences, setReminderPreferences, ['Bildirim istemiyorum'])}
            />
          ))}
        </>
      );
    }

    return (
      <View style={styles.readyCard}>
        <View style={styles.readyIcon}>
          <Sparkles size={32} color="#ffffff" />
        </View>
        <Text style={styles.readyTitle}>Hazırsın!</Text>
        <Text style={styles.readyText}>
          Şimdi ürünlerini SkinShelf rafına ekleyebilir, Shelly’den cildinle uyumlarını analiz etmesini isteyebilirsin.
        </Text>
        <TouchableOpacity style={styles.primaryAction} onPress={completeToScanner} activeOpacity={0.78}>
          <Camera size={19} color="#ffffff" />
          <Text style={styles.primaryActionText}>Barkodla ürün ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={completeToManualProduct} activeOpacity={0.78}>
          <PenLine size={18} color="#426447" />
          <Text style={styles.secondaryActionText}>Manuel ürün ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textAction} onPress={completeToMain} activeOpacity={0.75}>
          <Text style={styles.textActionText}>Sonra yap</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step > 0 ? setStep(step - 1) : navigation.goBack())}
            activeOpacity={0.75}
          >
            <ArrowLeft size={22} color="#426447" />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / 7) * 100}%` }]} />
          </View>
          <Text style={styles.stepCounter}>{step + 1}/7</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View style={styles.brandCard}>
              <Text style={styles.brandTitle}>SkinShelf’e hoş geldin</Text>
              <Text style={styles.brandText}>Shelly ürünlerini ve rutin uyumunu takip etmeye burada başlar.</Text>
            </View>
          )}
          {renderStep()}
        </ScrollView>

        {!isLastStep && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.nextButton, !canContinue() && styles.nextButtonDisabled]}
              disabled={!canContinue()}
              onPress={() => setStep(step + 1)}
              activeOpacity={0.78}
            >
              <Text style={styles.nextButtonText}>Devam Et</Text>
              <ArrowRight size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  keyboardView: { flex: 1 },
  header: {
    paddingTop: androidHeaderPadding,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: { flex: 1, height: 8, borderRadius: 10, backgroundColor: '#e9efea', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10, backgroundColor: '#426447' },
  stepCounter: { color: '#68746b', fontSize: 12, fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  brandCard: {
    backgroundColor: '#f6ecec',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ecd4d3',
    padding: 17,
    marginBottom: 20,
  },
  brandTitle: { color: '#14351f', fontSize: 18, fontWeight: '900' },
  brandText: { color: '#526159', fontSize: 14, fontWeight: '700', marginTop: 5 },
  stepTitle: { color: '#14351f', fontSize: 28, fontWeight: '900', lineHeight: 33, marginBottom: 8 },
  stepText: { color: '#526159', fontSize: 15, lineHeight: 22, fontWeight: '700', marginBottom: 18 },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#edf1ee',
    padding: 14,
    marginBottom: 18,
  },
  inputLabel: { color: '#426447', fontSize: 12, fontWeight: '900', marginBottom: 8 },
  textInput: { minHeight: 46, color: '#1b1c1c', fontSize: 18, fontWeight: '800' },
  groupTitle: { color: '#14351f', fontSize: 15, fontWeight: '900', marginTop: 10, marginBottom: 10 },
  optionButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e1e8e2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 9,
  },
  optionButtonSelected: { backgroundColor: '#fff7f7', borderColor: '#ead7d6' },
  optionText: { flex: 1, color: '#1b1c1c', fontSize: 14, fontWeight: '800', lineHeight: 19, marginRight: 10 },
  optionTextSelected: { color: '#426447' },
  shellyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e9efea',
    borderRadius: 17,
    padding: 13,
    marginTop: 10,
  },
  shellyNoteText: { color: '#426447', fontSize: 14, fontWeight: '900' },
  warningText: {
    color: '#8a6100',
    backgroundColor: '#fff4d7',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 8,
  },
  readyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#edf1ee',
    alignItems: 'center',
    shadowColor: '#14351f',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  readyIcon: { width: 72, height: 72, borderRadius: 28, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  readyTitle: { color: '#14351f', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  readyText: { color: '#526159', fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  primaryAction: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#426447',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 10,
  },
  primaryActionText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  secondaryAction: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6ecec',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ecd4d3',
  },
  secondaryActionText: { color: '#426447', fontSize: 15, fontWeight: '900' },
  textAction: { paddingVertical: 12, paddingHorizontal: 16 },
  textActionText: { color: '#68746b', fontSize: 14, fontWeight: '900' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(250,249,245,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#edf1ee',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#426447',
    borderRadius: 18,
    paddingVertical: 15,
  },
  nextButtonDisabled: { opacity: 0.45 },
  nextButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
});