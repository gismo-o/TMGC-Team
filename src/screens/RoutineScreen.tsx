import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, Moon, Plus, Sparkles, Sun } from 'lucide-react-native';
import { MainTabParamList, Product, RootStackParamList } from '../types';
import { useProducts } from '../context/ProductContext';
import { useUser } from '../context/UserContext';

type RoutineScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Routine'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: RoutineScreenNavigationProp;
};

type ConcernKey = 'standard' | 'acne' | 'sensitivity' | 'dryness' | 'spot' | 'redness' | 'custom';
type RoutineSlot = 'morning' | 'evening';

type DayPlan = {
  day: string;
  morning: Product[];
  evening: Product[];
};

const concernOptions: Array<{ key: ConcernKey; label: string; prompt: string }> = [
  { key: 'acne', label: 'Sivilce', prompt: 'Sivilce ve komedon görünümünü sakinleştirmeye odaklan.' },
  { key: 'sensitivity', label: 'Hassasiyet', prompt: 'Cildi yormayan, bariyer destekleyen ürünleri seç.' },
  { key: 'dryness', label: 'Kuruluk', prompt: 'Nem ve bariyer desteğini artır.' },
  { key: 'spot', label: 'Leke', prompt: 'Aydınlatıcı ve SPF odaklı rutin oluştur.' },
  { key: 'redness', label: 'Kızarıklık', prompt: 'Sakinleştirici ve düşük riskli ürünleri öne al.' },
];

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const slotCategories: Record<ConcernKey, Record<RoutineSlot, Product['category'][]>> = {
  standard: {
    morning: ['Temizleyici', 'Tonik', 'Serum', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Serum', 'Nemlendirici'],
  },
  acne: {
    morning: ['Temizleyici', 'Serum', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Serum', 'Nemlendirici'],
  },
  sensitivity: {
    morning: ['Temizleyici', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Nemlendirici', 'Maske'],
  },
  dryness: {
    morning: ['Tonik', 'Serum', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Tonik', 'Nemlendirici', 'Maske'],
  },
  spot: {
    morning: ['Serum', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Serum', 'Nemlendirici'],
  },
  redness: {
    morning: ['Temizleyici', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Nemlendirici', 'Maske'],
  },
  custom: {
    morning: ['Temizleyici', 'Serum', 'Nemlendirici', 'Güneş Kremi'],
    evening: ['Temizleyici', 'Serum', 'Nemlendirici'],
  },
};

const concernTerms: Record<ConcernKey, string[]> = {
  standard: [],
  acne: ['niacinamide', 'zinc', 'salicylic', 'bha', 'azelaic'],
  sensitivity: ['hyaluronic', 'centella', 'ceramide', 'panthenol', 'barrier'],
  dryness: ['hyaluronic', 'glycerin', 'ceramide', 'squalane', 'moisture'],
  spot: ['vitamin c', 'niacinamide', 'retinol', 'spf', 'acid'],
  redness: ['centella', 'panthenol', 'ceramide', 'cica', 'barrier'],
  custom: ['niacinamide', 'hyaluronic', 'glycerin', 'spf'],
};

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR');

const productText = (product: Product) =>
  normalize(`${product.name} ${product.brand} ${product.description} ${(product.activeIngredients || []).join(' ')}`);

const scoreProduct = (product: Product, concern: ConcernKey, slot: RoutineSlot, dayIndex: number) => {
  let score = 0;
  const text = productText(product);

  concernTerms[concern].forEach(term => {
    if (text.includes(term)) score += 3;
  });

  if (slot === 'morning' && product.timeOfDay === 'morning') score += 2;
  if (slot === 'evening' && product.timeOfDay === 'evening') score += 2;
  if (product.timeOfDay === 'both') score += 1;
  if (slot === 'morning' && product.category === 'Güneş Kremi') score += 4;
  if (slot === 'evening' && product.category === 'Güneş Kremi') score -= 5;
  if (concern === 'sensitivity' && product.category === 'Serum' && dayIndex % 2 === 1) score -= 2;
  if (concern === 'acne' && product.category === 'Serum' && dayIndex % 2 === 0) score += 2;
  if (concern === 'dryness' && product.category === 'Nemlendirici') score += 3;

  return score;
};

const selectRoutineProducts = (products: Product[], concern: ConcernKey, slot: RoutineSlot, dayIndex: number) => {
  const selectedIds = new Set<string>();

  return slotCategories[concern][slot]
    .map(category => {
      const candidates = products
        .filter(product => product.category === category && !selectedIds.has(product.id))
        .filter(product => product.timeOfDay === slot || product.timeOfDay === 'both' || product.category === 'Güneş Kremi');

      const selected = candidates.sort((a, b) => scoreProduct(b, concern, slot, dayIndex) - scoreProduct(a, concern, slot, dayIndex))[0];
      if (selected) selectedIds.add(selected.id);
      return selected;
    })
    .filter(Boolean) as Product[];
};

const buildWeekPlan = (products: Product[], concern: ConcernKey): DayPlan[] =>
  weekDays.map((day, index) => ({
    day,
    morning: selectRoutineProducts(products, concern, 'morning', index),
    evening: selectRoutineProducts(products, concern, 'evening', index),
  }));

const ProductRoutineRow = ({ product, onPress }: { product: Product; onPress: () => void }) => (
  <TouchableOpacity style={styles.productRow} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.productDot} />
    <View style={styles.productTextBlock}>
      <Text style={styles.productBrand} numberOfLines={1}>{product.brand}</Text>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
    </View>
    <Text style={styles.productCategory}>{product.category}</Text>
  </TouchableOpacity>
);

const RoutineBlock = ({
  title,
  slot,
  products,
  navigation,
}: {
  title: string;
  slot: RoutineSlot;
  products: Product[];
  navigation: RoutineScreenNavigationProp;
}) => (
  <View style={styles.routineBlock}>
    <View style={styles.routineBlockHeader}>
      {slot === 'morning' ? <Sun size={18} color="#8a6a20" /> : <Moon size={18} color="#426447" />}
      <Text style={styles.routineBlockTitle}>{title}</Text>
    </View>
    {products.length ? (
      products.map(product => (
        <ProductRoutineRow
          key={product.id}
          product={product}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        />
      ))
    ) : (
      <Text style={styles.emptyRoutineText}>Dolabında bu adım için uygun ürün yok.</Text>
    )}
  </View>
);

const ChatBubble = ({ from, children }: { from: 'ai' | 'user'; children: React.ReactNode }) => (
  <View style={[styles.chatBubble, from === 'user' && styles.chatBubbleUser]}>
    {from === 'ai' && (
      <View style={styles.chatAvatar}>
        <Sparkles size={14} color="#ffffff" />
      </View>
    )}
    <View style={[styles.chatMessage, from === 'user' && styles.chatMessageUser]}>
      {children}
    </View>
  </View>
);

export default function RoutineScreen({ navigation }: Props) {
  const { products } = useProducts();
  const { profile } = useUser();
  const [selectedConcern, setSelectedConcern] = useState<ConcernKey>('acne');
  const [customConcern, setCustomConcern] = useState('');
  const [followUpState, setFollowUpState] = useState<'active' | 'standard' | 'continued'>('active');

  const effectiveConcern: ConcernKey = followUpState === 'standard' ? 'standard' : selectedConcern;
  const weekPlan = useMemo(() => buildWeekPlan(products, effectiveConcern), [products, effectiveConcern]);
  const todayPlan = weekPlan[0];
  const selectedPrompt =
    followUpState === 'standard'
      ? 'Şikayet geçtiği için standart bakım rutinine dönüldü.'
      : selectedConcern === 'custom'
        ? customConcern || 'Yeni şikayetine göre dolabındaki en uygun ürünler seçiliyor.'
        : concernOptions.find(option => option.key === selectedConcern)?.prompt;
  const selectedConcernLabel =
    followUpState === 'standard'
      ? 'Şikayetim geçti, standart rutine dönelim.'
      : selectedConcern === 'custom'
        ? customConcern || 'Kendi şikayetimi yazacağım.'
        : concernOptions.find(option => option.key === selectedConcern)?.label || 'Standart rutin';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rutinim</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Sparkles size={22} color="#ffffff" />
            </View>
            <View style={styles.aiHeaderText}>
              <Text style={styles.aiTitle}>AI dolabına göre planladı</Text>
              <Text style={styles.aiSubtitle}>Cilt tipi: {profile.skinType} • Ürün kaynağı: Dolabım</Text>
            </View>
          </View>
          <Text style={styles.aiMessage}>{selectedPrompt}</Text>
        </View>

        <View style={styles.chatCard}>
          <ChatBubble from="ai">
            <Text style={styles.chatText}>Bugün cildinde seni rahatsız eden bir şikayet var mı?</Text>
          </ChatBubble>
          <ChatBubble from="user">
            <Text style={styles.chatTextUser}>{selectedConcernLabel}</Text>
          </ChatBubble>
          <ChatBubble from="ai">
            <Text style={styles.chatText}>
              Dolabındaki ürünlere göre bugünkü rutini ve 7 günlük planı oluşturdum. 7. gün sana otomatik olarak şikayetin geçti mi diye soracağım.
            </Text>
          </ChatBubble>

          <View style={styles.quickReplyGrid}>
            {concernOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.quickReply, selectedConcern === option.key && followUpState !== 'standard' && styles.quickReplyActive]}
                onPress={() => {
                  setSelectedConcern(option.key);
                  setFollowUpState('active');
                }}
              >
                <Text style={[styles.quickReplyText, selectedConcern === option.key && followUpState !== 'standard' && styles.quickReplyTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customConcernRow}>
            <TextInput
              value={customConcern}
              onChangeText={value => {
                setCustomConcern(value);
                if (value.trim()) {
                  setSelectedConcern('custom');
                  setFollowUpState('active');
                }
              }}
              placeholder="AI'a kendi cümlenle yaz"
              placeholderTextColor="#8b968f"
              style={styles.customConcernInput}
            />
            <TouchableOpacity
              style={styles.customConcernButton}
              onPress={() => {
                setSelectedConcern('custom');
                setFollowUpState('active');
              }}
            >
              <Plus size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugün kullan</Text>
          {todayPlan && (
            <View style={styles.todayGrid}>
              <RoutineBlock title="Sabah" slot="morning" products={todayPlan.morning} navigation={navigation} />
              <RoutineBlock title="Akşam" slot="evening" products={todayPlan.evening} navigation={navigation} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color="#426447" />
            <Text style={styles.sectionTitle}>7 Günlük Plan</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroller}>
            {weekPlan.map(dayPlan => (
              <View key={dayPlan.day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{dayPlan.day}</Text>
                <Text style={styles.slotLabel}>Sabah</Text>
                {dayPlan.morning.slice(0, 3).map(product => (
                  <Text key={`${dayPlan.day}-m-${product.id}`} style={styles.dayProduct} numberOfLines={1}>
                    {product.category}
                  </Text>
                ))}
                <Text style={styles.slotLabel}>Akşam</Text>
                {dayPlan.evening.slice(0, 3).map(product => (
                  <Text key={`${dayPlan.day}-e-${product.id}`} style={styles.dayProduct} numberOfLines={1}>
                    {product.category}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.followUpCard}>
          <Text style={styles.followUpTitle}>7. gün otomatik mesaj</Text>
          <Text style={styles.followUpText}>AI haftanın sonunda kontrol sorusunu kendi başlatır. Cevaba göre standart rutine döner veya hedefli planı günceller.</Text>
          <View style={styles.followUpActions}>
            <TouchableOpacity style={styles.followUpButton} onPress={() => setFollowUpState('standard')}>
              <Text style={styles.followUpButtonText}>Geçti varsay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followUpButtonSecondary} onPress={() => setFollowUpState('continued')}>
              <Text style={styles.followUpButtonSecondaryText}>Devam ediyor varsay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20,
    paddingBottom: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250,249,245,0.96)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#426447' },
  content: { padding: 20, paddingBottom: 120 },
  aiCard: { backgroundColor: '#e9efea', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#cfe0d2', marginBottom: 18 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiHeaderText: { flex: 1 },
  aiTitle: { fontSize: 17, fontWeight: '800', color: '#14351f' },
  aiSubtitle: { fontSize: 12, color: '#627168', marginTop: 2 },
  aiMessage: { color: '#314239', fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1b1c1c', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  chatCard: { backgroundColor: '#ffffff', borderRadius: 22, padding: 14, borderWidth: 1, borderColor: '#e3ebe5', marginBottom: 22 },
  chatBubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  chatBubbleUser: { justifyContent: 'flex-end' },
  chatAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  chatMessage: { maxWidth: '82%', backgroundColor: '#e9efea', borderRadius: 18, borderBottomLeftRadius: 6, paddingHorizontal: 13, paddingVertical: 10 },
  chatMessageUser: { backgroundColor: '#426447', borderBottomLeftRadius: 18, borderBottomRightRadius: 6 },
  chatText: { color: '#314239', fontSize: 13, lineHeight: 19, fontWeight: '600' },
  chatTextUser: { color: '#ffffff', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  quickReplyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  quickReply: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, backgroundColor: '#f0f1ec', borderWidth: 1, borderColor: '#d8e0da' },
  quickReplyActive: { backgroundColor: '#426447', borderColor: '#426447' },
  quickReplyText: { color: '#526159', fontSize: 12, fontWeight: '800' },
  quickReplyTextActive: { color: '#ffffff' },
  customConcernRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  customConcernInput: { flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d8e0da', paddingHorizontal: 14, color: '#1b1c1c', fontSize: 14, fontWeight: '600' },
  customConcernButton: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#426447', justifyContent: 'center', alignItems: 'center' },
  todayGrid: { gap: 12 },
  routineBlock: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#edf1ee' },
  routineBlockHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  routineBlockTitle: { color: '#14351f', fontSize: 16, fontWeight: '800' },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#f0f1ec' },
  productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#426447', marginRight: 10 },
  productTextBlock: { flex: 1 },
  productBrand: { fontSize: 11, color: '#6b765d', fontWeight: '900', textTransform: 'uppercase' },
  productName: { fontSize: 14, color: '#1b1c1c', fontWeight: '700', marginTop: 1 },
  productCategory: { fontSize: 11, color: '#426447', fontWeight: '800', marginLeft: 8 },
  emptyRoutineText: { color: '#707973', fontSize: 13 },
  weekScroller: { gap: 10, paddingBottom: 4 },
  dayCard: { width: 128, backgroundColor: '#ffffff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#e3ebe5' },
  dayTitle: { fontSize: 16, fontWeight: '900', color: '#426447', marginBottom: 10 },
  slotLabel: { fontSize: 11, fontWeight: '900', color: '#7a865f', marginTop: 6, marginBottom: 4, textTransform: 'uppercase' },
  dayProduct: { fontSize: 12, color: '#1b1c1c', fontWeight: '700', marginBottom: 3 },
  followUpCard: { backgroundColor: '#14351f', borderRadius: 22, padding: 18 },
  followUpTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  followUpText: { color: '#dce9df', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  followUpActions: { flexDirection: 'row', gap: 10 },
  followUpButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: '#426447', borderRadius: 15, paddingVertical: 12 },
  followUpButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '900' },
  followUpButtonSecondary: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: '#e9efea', borderRadius: 15, paddingVertical: 12 },
  followUpButtonSecondaryText: { color: '#426447', fontSize: 13, fontWeight: '900' },
});
