
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const introAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const subtitleCopy = 'Ürünlerini ekle, Shelly uyumunu takip etsin.';

  useEffect(() => {
    let typewriterTimer: ReturnType<typeof setInterval> | undefined;
    const typewriterDelay = setTimeout(() => {
      let index = 0;
      typewriterTimer = setInterval(() => {
        index += 1;
        setTypedSubtitle(subtitleCopy.slice(0, index));

        if (index >= subtitleCopy.length && typewriterTimer) {
          clearInterval(typewriterTimer);
        }
      }, 28);
    }, 420);

    Animated.stagger(160, [
      Animated.timing(introAnim, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 460,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      clearTimeout(typewriterDelay);
      if (typewriterTimer) clearInterval(typewriterTimer);
    };
  }, [buttonAnim, introAnim]);

  const introTranslateY = introAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });

  return (
    <ImageBackground 
      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQQnHT9ZdUvZSeofbui3TKtAoCwdfWtYSN5_pv8ABzEIsTEVftdAnhiCwe74SN_Y1W9LftGh0ZlUzHT1a8YcAlFlMAYJCZeWvqH1s6WW9dTR2A4TpBMT3tjKXrRyvu6kZA5UJfG7sHqhWU5YzrwzXIhWM5G0dbUlc4snDk1Y7tlGNLR6kGm7qbrrBcHNQ_ZeSFTWGrKoUbumkyxTzN1X3pAQpNOhwLCMhZVSGEkfkoRrcZs60bUC7P1w' }} 
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.header,
              {
                opacity: introAnim,
                transform: [{ translateY: introTranslateY }],
              },
            ]}
          >
            <Text style={styles.title}>SkinShelf</Text>
            <Text style={styles.subtitle}>
              {typedSubtitle}
              {typedSubtitle.length < subtitleCopy.length && <Text style={styles.cursor}>|</Text>}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [{ translateY: buttonTranslateY }],
              },
            ]}
          >
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(250, 249, 245, 0.8)' },
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'space-between', padding: 20 },
  header: { marginTop: 150, alignItems: 'center' },
  title: { fontSize: 48, fontWeight: '800', color: '#14351f', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#404943', textAlign: 'center', lineHeight: 25, fontWeight: '600' },
  cursor: { color: '#426447', fontWeight: '800' },
  buttonContainer: { backgroundColor: 'rgba(250, 249, 245, 0.92)', borderRadius: 18, padding: 22, marginBottom: 40, shadowColor: '#14351f', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)' },
  primaryButton: { backgroundColor: '#426447', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c0c9c1', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#426447', fontSize: 16, fontWeight: '600' }
});
