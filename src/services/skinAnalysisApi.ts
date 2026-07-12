import { SkinAnalysis, SkinLogEntry, SkinWeeklySummary } from '../types';
import { apiFetch } from './apiClient';
import { API_BASE_URL } from './apiConfig';

export type SkinAnalysisPayload = {
  imageBase64: string;
  imageMimeType: string;
  skinFeeling: string;
  usedNewProduct: boolean;
  userNote: string;
};

/** Fotoğrafı ve günlük formunu backend'e gönderir; Shelly analizini döndürür. */
export const analyzeSkinPhoto = async (payload: SkinAnalysisPayload): Promise<SkinAnalysis> => {
  return apiFetch<SkinAnalysis>(`${API_BASE_URL}/skin-logs/analyze`, {
    method: 'POST',
    body: payload,
  });
};

export const fetchSkinLogs = async (): Promise<SkinLogEntry[]> => {
  return apiFetch<SkinLogEntry[]>(`${API_BASE_URL}/skin-logs`);
};

export const fetchWeeklySkinSummary = async (): Promise<SkinWeeklySummary> => {
  return apiFetch<SkinWeeklySummary>(`${API_BASE_URL}/skin-logs/summary/weekly`);
};

export const deleteSkinLog = async (logId: number): Promise<void> => {
  await apiFetch<void>(`${API_BASE_URL}/skin-logs/${logId}`, { method: 'DELETE' });
};

export const parseSkinLogAnalysis = (log: SkinLogEntry): SkinAnalysis | null => {
  if (!log.analysisJson) return null;
  try {
    const parsed = JSON.parse(log.analysisJson) as SkinAnalysis;
    return { ...parsed, logId: log.id, createdAt: log.createdAt };
  } catch {
    return null;
  }
};
