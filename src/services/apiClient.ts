import { getAuthToken } from './authSession';

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

export const apiFetch = async <T>(url: string, options: ApiFetchOptions = {}): Promise<T> => {
  const token = await getAuthToken();
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const parsed = await parseResponse<any>(response);
  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed?.message ? parsed.message : parsed || 'API isteği başarısız.';
    throw new Error(String(message));
  }

  return parsed as T;
};
