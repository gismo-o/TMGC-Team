import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bot, Calendar, CheckCircle2, MessageCircle, Moon, Send, Sparkles, Sun, X } from 'lucide-react-native';
import { MainTabParamList, Product, RootStackParamList } from '../types';
import { useProducts } from '../context/ProductContext';
import { useUser } from '../context/UserContext';
import { buildWeekPlan, RoutineSlot } from '../services/routinePlanner';
import { getRoutineReview } from '../services/shellyInsights';

type RoutineScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Routine'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: RoutineScreenNavigationProp;
};

const defaultTabBarStyle = {
  backgroundColor: '#FAF9F5',
  borderTopWidth: 1,
  borderTopColor: '#e9efea',
  elevation: 12,
  shadowColor: '#14351f',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  height: 68,
  paddingBottom: 10,
  paddingTop: 9,
};

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
  note,
  navigation,
}: {
  title: string;
  slot: RoutineSlot;
  products: Product[];
  note: string;
  navigation: RoutineScreenNavigationProp;
}) => (
  <View style={styles.routineBlock}>
    <View style={styles.routineBlockHeader}>
      <View style={styles.routineTitleWrap}>
        {slot === 'morning' ? <Sun size={19} color="#8a6a20" /> : <Moon size={19} color="#426447" />}
        <Text style={styles.routineBlockTitle}>{title}</Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillText}>{slot === 'morning' ? 'SPF kontrolü' : 'Aktifler ayrıldı'}</Text>
      </View>
    </View>
    <View style={styles.routineNote}>
      <CheckCircle2 size={15} color="#426447" />
      <Text style={styles.routineNoteText}>{note}</Text>
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

export default function RoutineScreen({ navigation }: Props) {
  const { products } = useProducts();
  const { profile } = useUser();
  const [isWeekPlanVisible, setIsWeekPlanVisible] = useState(false);

  const weekPlan = useMemo(() => buildWeekPlan(products, 'standard'), [products]);
  const todayPlan = weekPlan[0];
  const routineReview = useMemo(
    () => getRoutineReview(todayPlan?.morning || [], todayPlan?.evening || []),
    [todayPlan]
  );

  useEffect(() => {
    const tabNavigation = navigation as any;

    tabNavigation.setOptions({
      tabBarStyle: isWeekPlanVisible ? { display: 'none' } : defaultTabBarStyle,
    });

    return () => {
      tabNavigation.setOptions({ tabBarStyle: defaultTabBarStyle });
    };
  }, [isWeekPlanVisible, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Rutinim</Text>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('Assistant')} activeOpacity={0.75}>
          <Bot size={22} color="#426447" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Sparkles size={20} color="#ffffff" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryTitle}>Shelly’nin Yorumu</Text>
              <Text style={styles.summarySubtitle}>Cilt tipi: {profile.skinType} • Kaynak: Dolabım</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            {routineReview.morningNote} {routineReview.eveningNote}
          </Text>
        </View>

        <TouchableOpacity style={styles.assistantComposer} onPress={() => navigation.navigate('Assistant')} activeOpacity={0.8}>
          <View style={styles.composerIcon}>
            <MessageCircle size={21} color="#426447" />
          </View>
          <View style={styles.composerTextBlock}>
            <Text style={styles.composerLabel}>Shelly’ye Sor</Text>
            <Text style={styles.composerPlaceholder} numberOfLines={1}>Bugün cildimde bir değişiklik var...</Text>
          </View>
          <View style={styles.composerSend}>
            <Send size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {todayPlan && (
          <View>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Bugün kullan</Text>
              <TouchableOpacity style={styles.weekInlineButton} onPress={() => setIsWeekPlanVisible(true)} activeOpacity={0.78}>
                <Calendar size={16} color="#426447" />
                <Text style={styles.weekInlineButtonText}>Haftalık plan</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.todaySection}>
              <RoutineBlock
                title="Sabah rutini"
                slot="morning"
                products={todayPlan.morning}
                note={routineReview.morningNote}
                navigation={navigation}
              />
              <RoutineBlock
                title="Akşam rutini"
                slot="evening"
                products={todayPlan.evening}
                note={routineReview.eveningNote}
                navigation={navigation}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={isWeekPlanVisible} animationType="slide" onRequestClose={() => setIsWeekPlanVisible(false)}>
        <View style={styles.modalBackdrop}>
          <SafeAreaView style={styles.weekPanel}>
            <View style={styles.weekPanelHeader}>
              <View style={styles.weekPanelTitleBlock}>
                <Text style={styles.weekPanelTitle}>Haftalık Plan</Text>
                <Text style={styles.weekPanelSubtitle}>Shelly dolabındaki ürünlere göre sabah ve akşam rutinini dengeli planlar.</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsWeekPlanVisible(false)} activeOpacity={0.75}>
                <X size={21} color="#426447" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.weekList}>
              {weekPlan.map(dayPlan => (
                <View key={dayPlan.day} style={styles.dayCard}>
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayTitle}>{dayPlan.day}</Text>
                    <View style={styles.focusPill}>
                      <Text style={styles.focusPillText}>{dayPlan.focus}</Text>
                    </View>
                  </View>
                  <View style={styles.daySlot}>
                    <Sun size={16} color="#8a6a20" />
                    <Text style={styles.slotLabel}>Sabah</Text>
                  </View>
                  {dayPlan.morning.slice(0, 4).map(product => (
                    <Text key={`${dayPlan.day}-m-${product.id}`} style={styles.dayProduct} numberOfLines={1}>
                      {product.category} • {product.name}
                    </Text>
                  ))}
                  <View style={styles.daySlot}>
                    <Moon size={16} color="#426447" />
                    <Text style={styles.slotLabel}>Akşam</Text>
                  </View>
                  {dayPlan.evening.slice(0, 4).map(product => (
                    <Text key={`${dayPlan.day}-e-${product.id}`} style={styles.dayProduct} numberOfLines={1}>
                      {product.category} • {product.name}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    paddingTop: androidHeaderPadding,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,249,245,0.96)',
  },
  headerSpacer: { width: 42 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: '900', color: '#426447' },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: '#f6ecec',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ecd4d3',
    marginBottom: 18,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTextBlock: { flex: 1 },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: '#14351f' },
  summarySubtitle: { fontSize: 12, color: '#627168', marginTop: 2, fontWeight: '700' },
  summaryText: { color: '#314239', fontSize: 14, lineHeight: 20, fontWeight: '600' },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayTitle: { color: '#14351f', fontSize: 19, fontWeight: '900' },
  weekInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#e9efea',
    borderWidth: 1,
    borderColor: '#d4e2d6',
  },
  weekInlineButtonText: { color: '#426447', fontSize: 12, fontWeight: '900' },
  todaySection: { gap: 13, marginBottom: 18 },
  routineBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#edf1ee',
  },
  routineBlockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 },
  routineTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  routineBlockTitle: { color: '#14351f', fontSize: 17, fontWeight: '900' },
  statusPill: { backgroundColor: '#e9efea', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#d4e2d6' },
  statusPillText: { color: '#426447', fontSize: 11, fontWeight: '900' },
  routineNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: '#f6f7f3',
    borderRadius: 15,
    padding: 10,
    marginBottom: 4,
  },
  routineNoteText: { flex: 1, color: '#435248', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f1ec',
  },
  productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#426447', marginRight: 10 },
  productTextBlock: { flex: 1 },
  productBrand: { fontSize: 11, color: '#6b765d', fontWeight: '900', textTransform: 'uppercase' },
  productName: { fontSize: 14, color: '#1b1c1c', fontWeight: '800', marginTop: 1 },
  productCategory: { fontSize: 11, color: '#426447', fontWeight: '900', marginLeft: 8 },
  emptyRoutineText: { color: '#707973', fontSize: 13, fontWeight: '600' },
  assistantComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 12,
    borderWidth: 2,
    borderColor: '#ecd4d3',
    marginBottom: 18,
    shadowColor: '#8f6f6e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  composerIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#f7eeee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  composerTextBlock: { flex: 1 },
  composerLabel: { color: '#426447', fontSize: 12, fontWeight: '900', marginBottom: 2 },
  composerPlaceholder: { color: '#8b968f', fontSize: 15, fontWeight: '800' },
  composerSend: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  weekPanel: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 18 : 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  weekPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  weekPanelTitleBlock: { flex: 1, paddingRight: 4 },
  weekPanelTitle: { color: '#14351f', fontSize: 22, fontWeight: '900' },
  weekPanelSubtitle: { color: '#68746b', fontSize: 13, fontWeight: '700', marginTop: 3, lineHeight: 18 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e9efea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekList: { gap: 12, paddingBottom: 8 },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e3ebe5',
  },
  dayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 },
  dayTitle: { fontSize: 17, fontWeight: '900', color: '#426447' },
  focusPill: { flexShrink: 1, backgroundColor: '#fff4f2', borderRadius: 13, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#ecd4d3' },
  focusPillText: { color: '#8a4f4d', fontSize: 11, fontWeight: '900' },
  daySlot: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6, marginBottom: 5 },
  slotLabel: { fontSize: 12, fontWeight: '900', color: '#6b765d', textTransform: 'uppercase' },
  dayProduct: { fontSize: 13, color: '#1b1c1c', fontWeight: '700', marginBottom: 4 },
});
