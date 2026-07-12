import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { authService } from '../services/authService';
import { useUser } from '../context/UserContext';
import { useProducts } from '../context/ProductContext';
import { errorDev } from '../services/logger';
import { colors, fonts, radius, shadows } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignIn'>;
};

const BACKGROUND_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQQnHT9ZdUvZSeofbui3TKtAoCwdfWtYSN5_pv8ABzEIsTEVftdAnhiCwe74SN_Y1W9LftGh0ZlUzHT1a8YcAlFlMAYJCZeWvqH1s6WW9dTR2A4TpBMT3tjKXrRyvu6kZA5UJfG7sHqhWU5YzrwzXIhWM5G0dbUlc4snDk1Y7tlGNLR6kGm7qbrrBcHNQ_ZeSFTWGrKoUbumkyxTzN1X3pAQpNOhwLCMhZVSGEkfkoRrcZs60bUC7P1w';

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const { loadProfile, setAccount } = useUser();
  const { loadProducts } = useProducts();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      let onboarded = false;
      if (response.user?.id) {
        setAccount({
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
        });
        const [profileData] = await Promise.all([loadProfile(response.user.id), loadProducts()]);
        onboarded = Boolean(profileData?.isOnboarded);
      }

      if (onboarded) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Onboarding');
      }
    } catch (error) {
      errorDev('Login error:', error);
      Alert.alert('Hata', 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Şifre Sıfırlama',
      'Şifre sıfırlama e-postası için destek ekibiyle iletişime geçmen gerekiyor. Otomatik sıfırlama e-posta servisi prod ortamında ayrıca bağlanacak.'
    );
  };

  return (
    <ImageBackground source={{ uri: BACKGROUND_URI }} style={styles.background}>
      <LinearGradient
        colors={['rgba(251,250,246,0.72)', 'rgba(251,250,246,0.9)', 'rgba(251,250,246,0.98)']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft size={21} color={colors.forest} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.overline}>TEKRAR HOŞ GELDİN</Text>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>Rafın ve rutinin seni bekliyor.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
              <Mail size={19} color={focusedField === 'email' ? colors.sage : colors.inkMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor={colors.inkMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
              <Lock size={19} color={focusedField === 'password' ? colors.sage : colors.inkMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                secureTextEntry
                placeholderTextColor={colors.inkMuted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignIn} disabled={loading} activeOpacity={0.88}>
              <LinearGradient
                colors={['#1C4630', '#0F2919']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, loading && styles.disabledButton]}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
                {!loading && <ArrowRight size={17} color={colors.onDark} />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.replace('SignUp')} style={styles.footerLink}>
            <Text style={styles.footerText}>
              Hesabın yok mu? <Text style={styles.footerTextStrong}>Hesap Oluştur</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 26 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
    ...shadows.soft,
  },
  header: { marginBottom: 30 },
  overline: {
    fontFamily: fonts.sansExtraBold,
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 48,
    color: colors.forest,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.inkSoft,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.xxl,
    padding: 24,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.card,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: colors.sage,
    backgroundColor: colors.surface,
  },
  inputIcon: { marginRight: 11 },
  input: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20, paddingVertical: 2 },
  forgotPasswordText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.sage,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: radius.lg,
  },
  disabledButton: { opacity: 0.7 },
  primaryButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.onDark,
  },
  footerLink: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  footerText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.inkSoft,
  },
  footerTextStrong: {
    fontFamily: fonts.sansBold,
    color: colors.forest,
  },
});
