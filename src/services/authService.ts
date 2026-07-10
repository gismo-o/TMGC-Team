import { API_AUTH_URL } from './apiConfig';
import { clearAuthSession, getCachedAuthUserId, saveAuthSession } from './authSession';

type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

// Giriş yapan aktif kullanıcının ID'sini bellekte tutacak değişken
let activeUserId: string | null = getCachedAuthUserId();

const requestAuth = async (path: string, body: unknown): Promise<AuthResponse> => {
  console.log('İstek atılan adres:', `${API_AUTH_URL}${path}`);

  const response = await fetch(`${API_AUTH_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  const responseData = responseText ? JSON.parse(responseText) : undefined;

  if (!response.ok) {
    throw new Error(responseData?.message || responseText || 'Kimlik doğrulama isteği başarısız.');
  }

  activeUserId = String(responseData.user.id);
  await saveAuthSession(responseData.token, activeUserId);
  console.log('Oturum açan kullanıcı ID\'si belleğe kaydedildi:', activeUserId);

  return {
    token: responseData.token,
    user: {
      ...responseData.user,
      id: String(responseData.user.id),
    },
  };
};

export const authService = {
  // Bellekteki aktif kullanıcı ID'sini dış dünyaya açan metot
  getUserId: () => {
    return activeUserId;
  },

  // Giriş İşlemi
  login: async (credentials: any) => {
    try {
      return await requestAuth('/login', credentials);
    } catch (error) {
      console.error('authService.login hatası:', error);
      throw error;
    }
  },

  // Kayıt İşlemi
  register: async (data: any) => {
    try {
      return await requestAuth('/register', data);
    } catch (error) {
      console.error('authService.register hatası:', error);
      throw error;
    }
  },

  // Oturumu Kapatma İşlemi
  logout: async () => {
    activeUserId = null; // Belleği temizler
    await clearAuthSession();
    console.log('Oturum kapatıldı, bellek sıfırlandı.');
    return true;
  }
};
