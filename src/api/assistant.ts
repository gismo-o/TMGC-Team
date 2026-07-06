import { GeminiBotResponse } from '../types';

/**
 * Shelly AI Assistant API - Cilt bakım danışmanı
 * Backend'e geçişte: bu fonksiyonun içini istediğiniz API endpoint'iyle değiştirin
 * 
 * Expected backend response format:
 * {
 *   intent_type: 'INFO' | 'ISSUE',
 *   detected_issue: string | null,
 *   ai_response: string
 * }
 */
export async function callAssistantAPI(userInput: string): Promise<GeminiBotResponse> {
  try {
    // 🔄 DEVELOPMENT MOCK - Backend'e geçişte aşağıdaki kodu değiştirin
    const response = generateMockResponse(userInput);
    
    // Simulate API delay (backend'te gerçek delay olacak)
    await new Promise((resolve) => setTimeout(resolve, 800));

    return response;

    // 🚀 PRODUCTION - Backend bağlantısı (örnek):
    // const response = await fetch('https://api.skinshelf.com/assistant/chat', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${authToken}`,
    //   },
    //   body: JSON.stringify({ message: userInput }),
    // });
    //
    // if (!response.ok) throw new Error('API request failed');
    // return response.json();
  } catch (error) {
    console.error('Assistant API Error:', error);
    return {
      intent_type: 'INFO',
      detected_issue: null,
      ai_response: 'Şu anda bağlantı kurulamıyor. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Mock Gemini Response Generator
 * Backend'e geçişte silebilirsiniz
 */
function generateMockResponse(userInput: string): GeminiBotResponse {
  const lowerInput = userInput.toLowerCase();

  // ISSUE Detection
  if (lowerInput.includes('kızarıklık') || lowerInput.includes('tepki') || lowerInput.includes('kızardı')) {
    return {
      intent_type: 'ISSUE',
      detected_issue: 'Kızarıklık',
      ai_response:
        'Cildinizdeki kızarıklığı algıladım. Bu durum geçici bir hassasiyet veya irritasyon işareti olabilir. Hemen Shelly\'nin Güvenli Planını başlatarak agresif aktiflerden uzak durmanızı öneririm.',
    };
  }

  // INFO Detection - Product Analysis
  if (
    lowerInput.includes('bu iki ürün') ||
    lowerInput.includes('birlikte kullanılır') ||
    lowerInput.includes('içerik analizi')
  ) {
    return {
      intent_type: 'INFO',
      detected_issue: null,
      ai_response:
        'Evet, bu iki ürün birlikte güvenle kullanılabilir. İçeriklerinde uyumsuzluk yok ve etkileşimi pozitiftir. Sabah / akşam ayrı ayrı kullanabilirsiniz.',
    };
  }

  // Default INFO Response
  return {
    intent_type: 'INFO',
    detected_issue: null,
    ai_response:
      'Anladığım kadarıyla: ' +
      userInput +
      '. Rafındaki ürünlere göre önerim şudur: Rutininizi düzenli tutun ve herhangi bir sorun görürseniz hemen bana yazın.',
  };
}
