import { GeminiBotResponse } from '../types';
import { apiFetch } from '../services/apiClient';
import { API_BASE_URL } from '../services/apiConfig';

type AssistantApiResponse = {
  intentType: 'INFO' | 'ISSUE';
  detectedIssue: string | null;
  aiResponse: string;
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
