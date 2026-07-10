import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_PORT = '8080';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getConfiguredAuthUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  return configuredUrl ? trimTrailingSlash(configuredUrl) : undefined;
};

const getHostFromHostUri = (hostUri?: string) => {
  if (!hostUri) {
    return undefined;
  }

  const withoutProtocol = hostUri.replace(/^[a-zA-Z]+:\/\//, '');
  const hostWithPort = withoutProtocol.split('/')[0];
  return hostWithPort.split(':')[0] || undefined;
};

const getExpoDevHost = () => {
  const constants = Constants as typeof Constants & {
    manifest?: {
      debuggerHost?: string;
      hostUri?: string;
    };
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };

  return getHostFromHostUri(
    Constants.expoConfig?.hostUri ??
      constants.manifest2?.extra?.expoClient?.hostUri ??
      constants.manifest?.debuggerHost ??
      constants.manifest?.hostUri
  );
};

const getWebHost = () => {
  const location = (globalThis as { location?: { hostname?: string } }).location;
  return location?.hostname || undefined;
};

const getDevelopmentBackendHost = () => {
  return getWebHost() ?? getExpoDevHost() ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
};

const buildAuthUrl = () => `http://${getDevelopmentBackendHost()}:${BACKEND_PORT}/api/auth`;

export const API_AUTH_URL = getConfiguredAuthUrl() ?? buildAuthUrl();
export const API_BASE_URL = API_AUTH_URL.endsWith('/auth') ? API_AUTH_URL.replace(/\/auth$/, '') : API_AUTH_URL;
export const API_PROFILES_URL = API_AUTH_URL.endsWith('/auth')
  ? API_AUTH_URL.replace(/\/auth$/, '/profiles')
  : `${API_AUTH_URL}/profiles`;
export const API_PRODUCTS_URL = `${API_BASE_URL}/products`;
