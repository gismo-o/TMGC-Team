import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { useProducts } from '../context/ProductContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loadProfile } = useUser();
  const { loadProducts } = useProducts();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.user?.id) {
        await loadProfile(response.user.id);
        await loadProducts();
      }
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    Alert.alert('Bilgi', 'Şifre sıfırlama linki e-posta adresinize gönderilecektir.');
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQQnHT9ZdUvZSeofbui3TKtAoCwdfWtYSN5_pv8ABzEIsTEVftdAnhiCwe74SN_Y1W9LftGh0ZlUzHT1a8YcAlFlMAYJCZeWvqH1s6WW9dTR2A4TpBMT3tjKXrRyvu6kZA5UJfG7sHqhWU5YzrwzXIhWM5G0dbUlc4snDk1Y7tlGNLR6kGm7qbrrBcHNQ_ZeSFTWGrKoUbumkyxTzN1X3pAQpNOhwLCMhZVSGEkfkoRrcZs60bUC7P1w' }} 
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#426447" />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>SkinShelf hesabınıza giriş yapın.</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#707973" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="E-posta" 
                placeholderTextColor="#707973" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#707973" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Şifre" 
                secureTextEntry 
                placeholderTextColor="#707973" 
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
            <Text style={styles.footerText}>Hesabınız yok mu? Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(250, 249, 245, 0.8)' },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(250, 249, 245, 0.5)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  header: { marginBottom: 30 },
  title: { fontSize: 36, fontWeight: '700', color: '#426447', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#404943' },
  formContainer: { backgroundColor: 'rgba(250, 249, 245, 0.9)', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: '#c0c9c1', borderRadius: 8, marginBottom: 16, paddingHorizontal: 12, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#1b1c1c', fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#426447', fontSize: 14 },
  primaryButton: { backgroundColor: '#426447', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footerText: { textAlign: 'center', color: '#426447', fontSize: 14 }
});