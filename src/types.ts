
export type Category = 'Temizleyici' | 'Tonik' | 'Serum' | 'Göz Kremi' | 'Nemlendirici' | 'Güneş Kremi' | 'Maske' | 'Diğer';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  timeOfDay: 'morning' | 'evening' | 'both';
  imageUrl: string;
  cutoutImageUrl?: string;
  description: string;
  expiryDate?: string;
  activeIngredients?: string[];
  isFavorite?: boolean;
}

export type ProductDraft = Omit<Product, 'id'>;

export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  MainTabs: undefined; 
  Scanner: undefined;
  ProductReview: { scannedProduct?: ProductDraft; editingProductId?: string; source?: 'barcode' | 'manual' } | undefined;
  ProductDetail: { productId: string };
  Assistant: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Routine: undefined;
  Profile: undefined;
};

// ============ ASSISTANT / CHAT TYPES ============
export type Message = {
  id: string;
  from: 'user' | 'ai';
  text: string;
};

export type GeminiBotResponse = {
  intent_type: 'INFO' | 'ISSUE';
  detected_issue: string | null;
  ai_response: string;
};
