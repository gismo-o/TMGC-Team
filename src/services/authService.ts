import { supabase } from './supabaseClient';

// .env dosyasındaki EXPO_PUBLIC_API_URL değerini okur
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; 

// Giriş yapan aktif kullanıcının ID'sini bellekte tutacak değişken
let activeUserId: number | null = null;

export const authService = {
  // Bellekteki aktif kullanıcı ID'sini dış dünyaya açan metot
  getUserId: () => {
    return activeUserId;
  },

  // Giriş İşlemi
  login: async (credentials: any) => {
    try {
      console.log('İstek atılan adres:', `${API_BASE_URL}/login`);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Giriş yapılamadı.');
      }

      const user = await response.json();
      
      // Giriş yapan kullanıcının veritabanı ID'sini belleğe alıyoruz
      activeUserId = user.id;
      console.log('Oturum açan kullanıcı ID\'si belleğe kaydedildi:', activeUserId);

      return user;
    } catch (error) {
      console.error('authService.login hatası:', error);
      throw error;
    }
  },

  // Kayıt İşlemi
  register: async (data: any) => {
    try {
      console.log('İstek atılan adres:', `${API_BASE_URL}/register`);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Kayıt işlemi başarısız.');
      }

      const responseData = await response.json();
      
      // Yeni kayıt olan kullanıcının veritabanı ID'sini belleğe alıyoruz
      activeUserId = responseData.id;
      console.log('Kayıt olan kullanıcı ID\'si belleğe kaydedildi:', activeUserId);

      return responseData;
    } catch (error) {
      console.error('authService.register hatası:', error);
      throw error;
    }
  },

  // Oturumu Kapatma İşlemi
  logout: async () => {
    activeUserId = null; // Belleği temizler
    console.log('Oturum kapatıldı, bellek sıfırlandı.');
    return Promise.resolve(true);
  }
};