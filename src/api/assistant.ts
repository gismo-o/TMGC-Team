import { GeminiBotResponse, Message } from '../types';
import { apiFetch } from '../services/apiClient';
import { API_BASE_URL } from '../services/apiConfig';

type AssistantApiResponse = {
  intentType: 'INFO' | 'ISSUE';
  detectedIssue: string | null;
  aiResponse: string;
};

type AssistantHistoryEntry = {
  id: number;
  prompt: string;
  intentType: 'INFO' | 'ISSUE';
  detectedIssue: string | null;
  aiResponse: string;
  createdAt: string;
};

export async function callAssistantAPI(userInput: string): Promise<GeminiBotResponse> {
  try {
    const response = await apiFetch<AssistantApiResponse>(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      body: { message: userInput },
    });

    return {
      intent_type: response.intentType,
      detected_issue: response.detectedIssue,
      ai_response: response.aiResponse,
    };
  } catch (error) {
    console.error('Assistant API Error:', error);
    return {
      intent_type: 'INFO',
      detected_issue: null,
      ai_response: 'Şu anda bağlantı kurulamıyor. Lütfen tekrar deneyin.',
    };
  }
}

/** Son sohbet geçmişini mesaj listesine dönüştürerek getirir (eskiden yeniye). */
export async function fetchAssistantHistory(): Promise<Message[]> {
  try {
    const entries = await apiFetch<AssistantHistoryEntry[]>(`${API_BASE_URL}/assistant/history`);

    return entries.flatMap<Message>(entry => [
      { id: `${entry.id}-user`, from: 'user', text: entry.prompt },
      { id: `${entry.id}-ai`, from: 'ai', text: entry.aiResponse },
    ]);
  } catch (error) {
    console.error('Assistant history error:', error);
    return [];
  }
}
