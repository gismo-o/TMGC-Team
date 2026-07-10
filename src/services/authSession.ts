import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'skinshelf.authToken';
const AUTH_USER_ID_KEY = 'skinshelf.userId';

let cachedToken: string | null | undefined;
let cachedUserId: string | null | undefined;

export const saveAuthSession = async (token: string, userId: string) => {
  cachedToken = token;
  cachedUserId = userId;
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_USER_ID_KEY, userId],
  ]);
};

export const getAuthToken = async () => {
  if (cachedToken !== undefined) {
    return cachedToken;
  }

  cachedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  return cachedToken;
};

export const getAuthUserId = async () => {
  if (cachedUserId !== undefined) {
    return cachedUserId;
  }

  cachedUserId = await AsyncStorage.getItem(AUTH_USER_ID_KEY);
  return cachedUserId;
};

export const getCachedAuthUserId = () => cachedUserId ?? null;

export const clearAuthSession = async () => {
  cachedToken = null;
  cachedUserId = null;
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_ID_KEY]);
};
