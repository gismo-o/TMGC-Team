import React, { useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Bot, CalendarCheck, Check, Moon, RotateCcw, Send, Sparkles, Sun } from 'lucide-react-native';
import { Product, RootStackParamList } from '../types';
import { useProducts } from '../context/ProductContext';
import {
  buildWeekPlan,
  ConcernKey,
  detectConcern,
  getConcernLabel,
  getConcernPrompt,
  RoutineSlot,
} from '../services/routinePlanner';
import { getRoutineReview } from '../services/shellyInsights';

type AssistantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Assistant'>;

type Props = {
  navigation: AssistantScreenNavigationProp;
};

type PlanMode = 'idle' | 'standard' | 'pending' | 'approved' | 'continued';
type PlanDuration = '3' | '7';

const quickActions = [
  { label: 'Rutinimi kontrol et', prompt: 'Bugünkü rutinim ağır mı?' },
  { label: 'Yeni ürün ekledim', prompt: 'Yeni eklediğim ürün rutinime uygun mu?' },
  { label: 'Cildim tepki verdi', prompt: 'Cildim neden tepki vermiş olabilir?' },
  { label: 'İçerik analizi yap', prompt: 'Bu iki ürün birlikte kullanılır mı?' },
];

const ProductStep = ({ product, onPress }: { product: Product; onPress: () => void }) => (
  <TouchableOpacity style={styles.productStep} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.productDot} />
    <View style={styles.productTextBlock}>
      <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
    </View>
  </TouchableOpacity>
);

const RoutinePreview = ({
  title,
  slot,
  products,
  navigation,
}: {
  title: string;
  slot: RoutineSlot;
  products: Product[];
  navigation: AssistantScreenNavigationProp;
}) => (
  <View style={styles.previewBlock}>
    <View style={styles.previewHeader}>
      {slot === 'morning' ? <Sun size={17} color="#8a6a20" /> : <Moon size={17} color="#426447" />}
      <Text style={styles.previewTitle}>{title}</Text>
    </View>
    {products.length ? (
      products.map(product => (
        <ProductStep
          key={product.id}
          product={product}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        />
      ))
    ) : (
      <Text style={styles.emptyText}>Dolabında bu adım için uygun ürün yok.</Text>
    )}
  </View>
);

const ChatBubble = ({ from, children }: { from: 'ai' | 'user'; children: React.ReactNode }) => (
  <View style={[styles.chatRow, from === 'user' && styles.chatRowUser]}>
    {from === 'ai' && (
      <View style={styles.chatAvatar}>
        <Bot size={15} color="#ffffff" />
      </View>
    )}
    <View style={[styles.chatBubble, from === 'user' && styles.chatBubbleUser]}>
      {children}
    </View>
  </View>
);

export default function AssistantScreen({ navigation }: Props) {
  const { products } = useProducts();
  const [complaint, setComplaint] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState('');
  const [detectedConcern, setDetectedConcern] = useState<ConcernKey>('standard');
  const [planMode, setPlanMode] = useState<PlanMode>('idle');
  const [duration, setDuration] = useState<PlanDuration>('7');

  const effectiveConcern = planMode === 'standard' ? 'standard' : detectedConcern;
  const weekPlan = useMemo(() => buildWeekPlan(products, effectiveConcern), [products, effectiveConcern]);
  const todayPlan = weekPlan[0];
  const routineReview = useMemo(
    () => getRoutineReview(todayPlan?.morning || [], todayPlan?.evening || []),
    [todayPlan]
  );
  const concernLabel = getConcernLabel(detectedConcern, submittedComplaint);
  const concernPrompt = getConcernPrompt(detectedConcern, submittedComplaint);

  const submitComplaint = () => {
    const trimmed = complaint.trim();
    if (!trimmed) return;

    submitComplaintText(trimmed);
  };

  const submitComplaintText = (trimmed: string) => {
    const nextConcern = detectConcern(trimmed);
    setSubmittedComplaint(trimmed);
    setDetectedConcern(nextConcern);
    setPlanMode('pending');
    setComplaint(trimmed);
  };

  const resetFlow = () => {
    setComplaint('');
    setSubmittedComplaint('');
    setDetectedConcern('standard');
    setPlanMode('idle');
    setDuration('7');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={22} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shelly</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Sparkles size={24} color="#ffffff" />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Shelly bugün neyi kontrol etsin?</Text>
            <Text style={styles.heroText}>Shelly, cilt bakım rafındaki ürünleri tanır; rutinini, içerikleri ve cilt değişimlerini birlikte takip eder.</Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          {quickActions.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.actionCard}
              onPress={() => submitComplaintText(item.prompt)}
              activeOpacity={0.78}
            >
              <Text style={styles.actionTitle}>{item.label}</Text>
              <Text style={styles.actionSubtitle}>{item.prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chatCard}>
          <ChatBubble from="ai">
            <Text style={styles.chatText}>Rafındaki ürünleri ve bugünkü planı kontrol ettim. {routineReview.morningNote} Ürün veya cilt değişimi yazarsan planı buna göre daraltabilirim.</Text>
          </ChatBubble>

          {submittedComplaint ? (
            <ChatBubble from="user">
              <Text style={styles.chatTextUser}>{submittedComplaint}</Text>
            </ChatBubble>
          ) : null}

          {planMode === 'pending' && (
            <ChatBubble from="ai">
              <Text style={styles.chatText}>
                {concernLabel} sinyalini algıladım. {routineReview.riskNote} Günlük rutinini geçici olarak buna göre güncellememi ister misin?
              </Text>
            </ChatBubble>
          )}

          {(planMode === 'approved' || planMode === 'continued') && (
            <ChatBubble from="ai">
              <Text style={styles.chatText}>
                Onaylandı. {duration} günlük bakım planını rafındaki ürünlerle hazırladım. {concernPrompt} Retinol ve peeling aynı geceye alınmaz; aktif içerik günleri haftaya yayılır.
              </Text>
            </ChatBubble>
          )}

          {planMode === 'standard' && (
            <ChatBubble from="ai">
              <Text style={styles.chatText}>Günlük rutini koruyorum. Cildinde değişiklik olursa Shelly’ye yeniden yazabilirsin.</Text>
            </ChatBubble>
          )}

          <View style={styles.inputRow}>
            <TextInput
              value={complaint}
              onChangeText={setComplaint}
              placeholder="Ürün, rutin veya cilt değişimini yaz"
              placeholderTextColor="#8b968f"
              style={styles.input}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={submitComplaint} activeOpacity={0.78}>
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {planMode === 'idle' && (
            <View style={styles.quickPromptRow}>
              {['Bu ürün rutinime uygun mu?', 'Bugünkü rutinim ağır mı?', 'Hangi ürünü azaltmalıyım?'].map(item => (
                <TouchableOpacity key={item} style={styles.quickPrompt} onPress={() => submitComplaintText(item)} activeOpacity={0.75}>
                  <Text style={styles.quickPromptText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {planMode === 'pending' && (
          <View style={styles.decisionCard}>
            <Text style={styles.decisionTitle}>Shelly’nin Yorumu</Text>
            <Text style={styles.decisionText}>Bu öneri günlük rutinin yerine geçici bir bakım planı kullanır.</Text>
            <View style={styles.durationRow}>
              {(['3', '7'] as PlanDuration[]).map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.durationButton, duration === item && styles.durationButtonActive]}
                  onPress={() => setDuration(item)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.durationText, duration === item && styles.durationTextActive]}>{item} gün</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setPlanMode('approved')} activeOpacity={0.78}>
              <Check size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Shelly’nin planını uygula</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setPlanMode('standard')} activeOpacity={0.78}>
              <Text style={styles.secondaryButtonText}>Günlük rutin kalsın</Text>
            </TouchableOpacity>
          </View>
        )}

        {(planMode === 'approved' || planMode === 'continued') && todayPlan && (
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <CalendarCheck size={20} color="#426447" />
              <View>
                <Text style={styles.planTitle}>Shelly’nin bugünkü planı</Text>
                <Text style={styles.planSubtitle}>{concernLabel} • {duration} günlük plan</Text>
              </View>
            </View>
            <RoutinePreview title="Sabah" slot="morning" products={todayPlan.morning} navigation={navigation} />
            <RoutinePreview title="Akşam" slot="evening" products={todayPlan.evening} navigation={navigation} />
          </View>
        )}

        {(planMode === 'approved' || planMode === 'continued') && (
          <View style={styles.followUpCard}>
            <Text style={styles.followUpTitle}>{duration}. gün kontrolü</Text>
            <Text style={styles.followUpText}>Süre sonunda kendisi sorar: şikayetin geçti mi? Cevaba göre günlük rutine döner veya planı devam ettirir.</Text>
            <View style={styles.followUpActions}>
              <TouchableOpacity style={styles.followUpButton} onPress={() => setPlanMode('standard')} activeOpacity={0.78}>
                <Text style={styles.followUpButtonText}>Şikayet geçti</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.followUpButtonSecondary} onPress={() => setPlanMode('continued')} activeOpacity={0.78}>
                <Text style={styles.followUpButtonSecondaryText}>Devam ediyor</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {planMode !== 'idle' && (
          <TouchableOpacity style={styles.resetButton} onPress={resetFlow} activeOpacity={0.75}>
            <RotateCcw size={16} color="#426447" />
            <Text style={styles.resetText}>Yeni şikayet gir</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    paddingTop: androidHeaderPadding,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,249,245,0.96)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', color: '#14351f', fontSize: 23, fontWeight: '900' },
  headerSpacer: { width: 42 },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: '#f6ecec',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecd4d3',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },
  heroTextBlock: { flex: 1 },
  heroTitle: { color: '#14351f', fontSize: 18, fontWeight: '900' },
  heroText: { color: '#526159', fontSize: 13, lineHeight: 18, fontWeight: '700', marginTop: 4 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#e3ebe5',
    minHeight: 92,
    justifyContent: 'space-between',
  },
  actionTitle: { color: '#14351f', fontSize: 14, fontWeight: '900', lineHeight: 18 },
  actionSubtitle: { color: '#68746b', fontSize: 11, lineHeight: 15, fontWeight: '700', marginTop: 8 },
  chatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3ebe5',
    marginBottom: 16,
  },
  chatRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  chatRowUser: { justifyContent: 'flex-end' },
  chatAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  chatBubble: { maxWidth: '84%', backgroundColor: '#f7eeee', borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 13, paddingVertical: 10 },
  chatBubbleUser: { backgroundColor: '#426447', borderBottomLeftRadius: 18, borderBottomRightRadius: 6 },
  chatText: { color: '#314239', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  chatTextUser: { color: '#ffffff', fontSize: 13, lineHeight: 19, fontWeight: '800' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 4 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 96,
    borderRadius: 16,
    backgroundColor: '#fffafa',
    borderWidth: 1,
    borderColor: '#ead7d6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1b1c1c',
    fontSize: 14,
    fontWeight: '700',
  },
  sendButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center' },
  quickPromptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  quickPrompt: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#ead7d6',
  },
  quickPromptText: { color: '#426447', fontSize: 12, fontWeight: '900' },
  decisionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#e3ebe5',
    marginBottom: 16,
  },
  decisionTitle: { color: '#14351f', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  decisionText: { color: '#68746b', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 13 },
  durationRow: { flexDirection: 'row', gap: 10, marginBottom: 13 },
  durationButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 11,
    backgroundColor: '#f0f1ec',
    borderWidth: 1,
    borderColor: '#dde4de',
  },
  durationButtonActive: { backgroundColor: '#426447', borderColor: '#426447' },
  durationText: { color: '#526159', fontSize: 13, fontWeight: '900' },
  durationTextActive: { color: '#ffffff' },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#426447',
    borderRadius: 16,
    paddingVertical: 13,
    marginBottom: 9,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', borderRadius: 16, paddingVertical: 13, backgroundColor: '#e9efea' },
  secondaryButtonText: { color: '#426447', fontSize: 14, fontWeight: '900' },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#e3ebe5',
    marginBottom: 16,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 },
  planTitle: { color: '#14351f', fontSize: 17, fontWeight: '900' },
  planSubtitle: { color: '#68746b', fontSize: 12, fontWeight: '700', marginTop: 2 },
  previewBlock: { backgroundColor: '#f8faf7', borderRadius: 18, padding: 13, marginTop: 10 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 },
  previewTitle: { color: '#14351f', fontSize: 15, fontWeight: '900' },
  productStep: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf1ee', paddingVertical: 9 },
  productDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#426447', marginRight: 9 },
  productTextBlock: { flex: 1 },
  productBrand: { color: '#6b765d', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  productName: { color: '#1b1c1c', fontSize: 13, fontWeight: '800', marginTop: 1 },
  emptyText: { color: '#707973', fontSize: 13, fontWeight: '700' },
  followUpCard: { backgroundColor: '#14351f', borderRadius: 22, padding: 17, marginBottom: 14 },
  followUpTitle: { color: '#ffffff', fontSize: 17, fontWeight: '900', marginBottom: 7 },
  followUpText: { color: '#dce9df', fontSize: 13, lineHeight: 18, fontWeight: '700', marginBottom: 13 },
  followUpActions: { flexDirection: 'row', gap: 10 },
  followUpButton: { flex: 1, alignItems: 'center', backgroundColor: '#426447', borderRadius: 15, paddingVertical: 12 },
  followUpButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  followUpButtonSecondary: { flex: 1, alignItems: 'center', backgroundColor: '#e9efea', borderRadius: 15, paddingVertical: 12 },
  followUpButtonSecondaryText: { color: '#426447', fontSize: 13, fontWeight: '900' },
  resetButton: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 7, paddingVertical: 10, paddingHorizontal: 14 },
  resetText: { color: '#426447', fontSize: 13, fontWeight: '900' },
});
