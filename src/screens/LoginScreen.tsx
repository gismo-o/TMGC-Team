
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  return (
    <ImageBackground 
      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQQnHT9ZdUvZSeofbui3TKtAoCwdfWtYSN5_pv8ABzEIsTEVftdAnhiCwe74SN_Y1W9LftGh0ZlUzHT1a8YcAlFlMAYJCZeWvqH1s6WW9dTR2A4TpBMT3tjKXrRyvu6kZA5UJfG7sHqhWU5YzrwzXIhWM5G0dbUlc4snDk1Y7tlGNLR6kGm7qbrrBcHNQ_ZeSFTWGrKoUbumkyxTzN1X3pAQpNOhwLCMhZVSGEkfkoRrcZs60bUC7P1w' }} 
      style={styles.background}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>SkinShelf</Text>
            <Text style={styles.subtitle}>Cilt bakım rutininizi düzenleyin, takip edin ve mükemmelleştirin.</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
            </TouchableOpacity>
          </View>
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
  header: { marginTop: 60, alignItems: 'center' },
  title: { fontSize: 48, fontWeight: '700', color: '#426447', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#404943', textAlign: 'center' },
  buttonContainer: { backgroundColor: 'rgba(250, 249, 245, 0.9)', borderRadius: 16, padding: 24, marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  primaryButton: { backgroundColor: '#426447', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c0c9c1', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#426447', fontSize: 16, fontWeight: '600' }
});
