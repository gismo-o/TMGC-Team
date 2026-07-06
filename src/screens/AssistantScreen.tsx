import React, { useState, useRef, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Switch,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Send, Sparkles, Bot, Shield, RotateCcw } from 'lucide-react-native';
import { RootStackParamList, Message, GeminiBotResponse } from '../types';
import { useUser } from '../context/UserContext';
import { callAssistantAPI } from '../api/assistant';

type AssistantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Assistant'>;

type Props = {
  navigation: AssistantScreenNavigationProp;
};

const QUICK_ACTIONS = [
  { label: 'Rutinimi kontrol et', prompt: 'Bugünkü rutinim ağır mı?' },
  { label: 'Yeni ürün ekledim', prompt: 'Yeni eklediğim ürün rutinime uygun mu?' },
  { label: 'Cildim tepki verdi', prompt: 'Cildim kızardı ve tepki verdi' },
  { label: 'İçerik analizi yap', prompt: 'Bu iki ürün birlikte kullanılır mı?' },
];

const QUICK_PROMPTS = ['Bu ürün rutinime uygun mu?', 'Bugünkü rutinim ağır mı?', 'Cildim tepki verdi'];

// ============ CHAT BUBBLE COMPONENT ============
const ChatBubble = ({ from, text }: { from: 'user' | 'ai'; text: string }) => (
  <View style={[styles.chatRow, from === 'user' && styles.chatRowUser]}>
    {from === 'ai' && (
      <View style={styles.chatAvatar}>
        <Bot size={15} color="#ffffff" />
      </View>
    )}
    <View style={[styles.chatBubble, from === 'user' && styles.chatBubbleUser]}>
      <Text style={from === 'ai' ? styles.chatText : styles.chatTextUser}>{text}</Text>
    </View>
  </View>
);

// ============ MAIN COMPONENT ============
export default function AssistantScreen({ navigation }: Props) {
  const { activeIssue, setActiveIssue } = useUser();

  // STATE
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<GeminiBotResponse | null>(null);
  
  // REFS
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  // ============ HANDLERS ============
  const handleSendMessage = async (event?: any) => {
    // 🛑 CRITICAL WEB SAFETY: Stop web native click & submit side-effects entirely
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setIsLoading(true);
    try {
      // Call Assistant API
      const response = await callAssistantAPI(trimmed);
      setLastResponse(response);

      // Add AI message
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: response.ai_response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: 'Şu anda bağlantı kurulamıyor. Lütfen tekrar deneyin.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsLoading(true);
    try {
      const response = await callAssistantAPI(prompt);
      setLastResponse(response);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: response.ai_response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error in quick action:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: 'Şu anda bağlantı kurulamıyor. Lütfen tekrar deneyin.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSafePlan = (value: boolean) => {
    if (!lastResponse?.detected_issue) return;

    if (value) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setActiveIssue(lastResponse.detected_issue);

      Alert.alert(
        '✅ Güvenli Mod Aktif',
        `"${lastResponse.detected_issue}" nedeniyle Güvenli Mod başlatıldı. Rutinim ekranında ürün filtreleri ve koruma bantları aktif oldu.`,
        [{ text: 'Tamam' }]
      );
    } else {
      setActiveIssue(null);
      Alert.alert(
        '🌟 Güvenli Mod Kapatıldı',
        'Normal mod\'a geri döndünüz. Tüm ürünler tekrar görünür.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputValue('');
    setLastResponse(null);
  };

  // CONDITIONAL FLAGS
  const hasMessages = messages.length > 0;
  const showSafePlanButton = lastResponse?.intent_type === 'ISSUE' && lastResponse?.detected_issue && !isLoading;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ========== HEADER ========== */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={22} color="#426447" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shelly</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ========== MAIN CONTENT (SCROLLABLE) ========== */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 🟢 INITIAL STATE: Hero Card + Action Grid (messages.length === 0) */}
        {!hasMessages && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Sparkles size={24} color="#ffffff" />
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>Shelly bugün neyi kontrol etsin?</Text>
                <Text style={styles.heroText}>
                  Shelly, cilt bakım rafındaki ürünleri tanır; rutinini, içerikleri ve cilt değişimlerini birlikte takip eder.
                </Text>
              </View>
            </View>

            <View style={styles.actionGrid}>
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action.prompt)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.actionTitle}>{action.label}</Text>
                  <Text style={styles.actionSubtitle}>{action.prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* 🟡 CHAT STATE: Message Bubbles (messages.length > 0) */}
        {hasMessages && (
          <View style={styles.chatContainer}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} from={msg.from} text={msg.text} />
            ))}

            {isLoading && (
              <View style={styles.chatRow}>
                <View style={styles.chatAvatar}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
                <View style={styles.chatBubble}>
                  <Text style={styles.chatText}>Düşünüyorum...</Text>
                </View>
              </View>
            )}

            {/* 🔴 ISSUE SAFE PLAN TOGGLE */}
            {showSafePlanButton && (
              <View style={styles.safePlanToggleContainer}>
                <View style={styles.safePlanToggleContent}>
                  <View style={styles.safePlanToggleLeft}>
                    <Shield size={18} color="#c4423c" />
                    <View style={styles.safePlanToggleText}>
                      <Text style={styles.safePlanToggleTitle}>Cilt Bariyerini Koru</Text>
                      <Text style={styles.safePlanToggleSubtitle}>Güvenli Mod</Text>
                    </View>
                  </View>
                  <Switch
                    value={activeIssue === lastResponse?.detected_issue}
                    onValueChange={handleToggleSafePlan}
                    trackColor={{ false: '#e9efea', true: '#c4423c' }}
                    thumbColor={activeIssue === lastResponse?.detected_issue ? '#ffffff' : '#bbb'}
                    ios_backgroundColor="#e9efea"
                  />
                </View>
              </View>
            )}

            {/* RESET BUTTON */}
            <TouchableOpacity style={styles.resetButton} onPress={handleResetChat} activeOpacity={0.75}>
              <RotateCcw size={16} color="#426447" />
              <Text style={styles.resetButtonText}>🔄 Yeni sohbet başlat</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ========== FIXED BOTTOM INPUT AREA ========== */}
      {/* ⚠️ PURE VIEW MANTIĞI: HTML form tetiklememesi için asla 'form' tagına dönüşmeyecek salt View yapısı */}
      <View style={styles.inputContainer}>
        {/* Quick Prompts (sadece mesaj yokken görünür) */}
        {!hasMessages && (
          <View style={styles.quickPromptsRow}>
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.quickPromptButton}
                onPress={() => handleQuickAction(prompt)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            ref={textInputRef}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={(e) => {
              // 🛑 WEB SAFETY: Sayfa submit/F5 reload davranışını engeller
              if (e && typeof e.preventDefault === 'function') e.preventDefault();
              handleSendMessage();
            }}
            placeholder="Ürün, rutin veya cilt değişimini yaz"
            placeholderTextColor="#8b968f"
            style={styles.input}
            multiline={false} // 🛑 MULTILINE TRUE OLDUĞUNDA ENTER TUŞU SAFARI/CHROME'DA SUBMIT TETIKLEYEBILIR, FALSE YAPILDI
            maxLength={500}
            editable={!isLoading}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (isLoading || !inputValue.trim()) && styles.sendButtonDisabled]}
            onPress={(e) => handleSendMessage(e)} // Click event'i yakalayıp preventDefault'a paslar
            disabled={isLoading || !inputValue.trim()}
            activeOpacity={0.75}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============ STYLES ============
const androidHeaderPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 14 : 20;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  header: {
    paddingTop: androidHeaderPadding,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,249,245,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: '#e9efea',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef3ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#14351f',
    fontSize: 23,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 42,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
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
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: '#14351f',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  heroText: {
    color: '#526159',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 6,
  },
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
  actionTitle: {
    color: '#14351f',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  actionSubtitle: {
    color: '#68746b',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  chatContainer: {
    paddingBottom: 16,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatBubble: {
    maxWidth: '84%',
    backgroundColor: '#f7eeee',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  chatBubbleUser: {
    backgroundColor: '#426447',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  chatText: {
    color: '#314239',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  chatTextUser: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  safePlanToggleContainer: {
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff7f7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ead7d6',
  },
  safePlanToggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  safePlanToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  safePlanToggleText: {
    flex: 1,
  },
  safePlanToggleTitle: {
    color: '#14351f',
    fontSize: 14,
    fontWeight: '900',
  },
  safePlanToggleSubtitle: {
    color: '#8a6100',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  resetButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#426447',
    fontSize: 13,
    fontWeight: '900',
  },
  inputContainer: {
    backgroundColor: '#FAF9F5',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 1,
    borderTopColor: '#e9efea',
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickPromptButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#ead7d6',
  },
  quickPromptText: {
    color: '#426447',
    fontSize: 12,
    fontWeight: '900',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fffafa',
    borderWidth: 1,
    borderColor: '#ead7d6',
    paddingHorizontal: 14,
    color: '#1b1c1c',
    fontSize: 14,
    fontWeight: '700',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#426447',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bbb',
  },
});