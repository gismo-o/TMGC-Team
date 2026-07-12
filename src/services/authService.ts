import { API_AUTH_URL } from './apiConfig';
import { apiFetch } from './apiClient';
import { clearAuthSession, getAuthToken, getCachedAuthUserId, saveAuthSession } from './authSession';
import { errorDev } from './logger';

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

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterPayload = LoginCredentials & {
  firstName: string;
  lastName?: string;
};

// Giriş yapan aktif kullanıcının ID'sini bellekte tutacak değişken
let activeUserId: string | null = getCachedAuthUserId();

const requestAuth = async (path: string, body: unknown): Promise<AuthResponse> => {
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
  login: async (credentials: LoginCredentials) => {
    try {
      return await requestAuth('/login', credentials);
    } catch (error) {
      errorDev('authService.login hatası:', error);
      throw error;
    }
  },

  // Kayıt İşlemi
  register: async (data: RegisterPayload) => {
    try {
      return await requestAuth('/register', data);
    } catch (error) {
      errorDev('authService.register hatası:', error);
      throw error;
    }
  },

  // Kayıtlı token varsa /auth/me ile oturumu doğrular ve kullanıcıyı döner
  restoreSession: async (): Promise<AuthUser | null> => {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const user = await apiFetch<AuthUser>(`${API_AUTH_URL}/me`);
      if (!user?.id) return null;

      activeUserId = String(user.id);
      await saveAuthSession(token, activeUserId);
      return { ...user, id: activeUserId };
    } catch {
      // Token süresi dolmuş veya geçersiz; sessizce temizle
      await clearAuthSession();
      activeUserId = null;
      return null;
    }
  },

  // Oturumu Kapatma İşlemi
  logout: async () => {
    activeUserId = null; // Belleği temizler
    await clearAuthSession();
    return true;
  },

  deleteAccount: async () => {
    await apiFetch<void>(`${API_AUTH_URL}/me`, {
      method: 'DELETE',
    });
    activeUserId = null;
    await clearAuthSession();
    return true;
  }
};
